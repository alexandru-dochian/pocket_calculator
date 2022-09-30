import Config from "../configurationn/Config.js";
import Evaluator from "./Evaluator.js";

export default class Calculator {
  constructor() {
    // javascript state
    this.state = {
      expression: [],
      history: [],
    };

    // DOM
    this.dom = {
      calculatorScreenContent: document.getElementById("screen"),
      historyList: document.getElementById("historyList"),
    };

    // Set listeners
    let keys = Array.from(document.getElementsByClassName("key"));

    keys.map((key) => {
      key.addEventListener("click", (e) => this.handleKeyEvent(e));
    });
  }

  handleKeyEvent = (e) => {
    const keyType = e.target.className.split(" ")[1];
    const id = e.target.id;
    const content = e.target.innerText;

    if (keyType == Config.KEY_CLASS.CONTROL) {
      this.handleControlKey(id);
    } else {
      this.state.expression.push({ keyType, content, id });
    }
    this.updateDOM();
  };

  handleControlKey = (keyIdentifier) => {
    if (keyIdentifier == "clear") {
      this.handleClearScreen();
    } else if (keyIdentifier == "backspace") {
      this.handleBackSpace();
    } else if (keyIdentifier == "equal") {
      this.handleEqual();
    } else {
      throw new Error(
        `Invalid keyIdentifier=[${keyIdentifier}] found in a key of control class!`
      );
    }
  };

  handleClearScreen = () => {
    this.state.expression = [];
  };

  handleBackSpace = () => {
    this.state.expression.pop();
  };

  handleEqual = () => {
    try {
      const { expression: oldExpression } = this.state;
      const newExpression = new Evaluator(oldExpression).evaluate();
      this.state.expression = newExpression;
      this.saveHistory(oldExpression, newExpression);
    } catch (error) {
      alert("Could not evaluate your expression! (~_~)");
    }
  };

  saveHistory = (oldExpression, newExpression) => {
    if (oldExpression.length == 0) {
      return;
    }

    const oldExpressionString = this.fromExpressionToString(oldExpression);
    const newExpressionString = this.fromExpressionToString(newExpression);

    if (oldExpressionString == newExpressionString) {
      return;
    }

    const historyData = {
      old: {
        expression: [...oldExpression],
        expressionString: oldExpressionString,
      },
      new: {
        expression: [...newExpression],
        expressionString: newExpressionString,
      },
    };
    this.state.history.push(historyData);
  };

  handleChangeFromHistory = (expression) => {
    this.state.expression = this.state.expression.concat([...expression]);
    this.updateDOM();
  };

  updateDOM = () => {
    // Calculator
    const { expression, history } = this.state;
    const expressionString = this.fromExpressionToString(expression);
    this.dom.calculatorScreenContent.innerText = expressionString;

    // History
    while (history.length != 0) {
      const historyData = history.pop();

      // History expression
      const expressionDiv = document.createElement("div");
      expressionDiv.appendChild(
        document.createTextNode(historyData["old"]["expressionString"])
      );
      expressionDiv.className = "historyExpression";
      expressionDiv.addEventListener("click", () => {
        this.handleChangeFromHistory(historyData["old"]["expression"]);
      });

      // History result
      const resultDiv = document.createElement("div");
      resultDiv.appendChild(
        document.createTextNode(historyData["new"]["expressionString"])
      );
      resultDiv.className = "historyResult";
      resultDiv.addEventListener("click", () => {
        this.handleChangeFromHistory(historyData["new"]["expression"]);
      });

      const historyDomItem = document.createElement("div");
      historyDomItem.appendChild(expressionDiv);
      historyDomItem.appendChild(resultDiv);

      this.dom.historyList.appendChild(historyDomItem);
    }
  };

  fromExpressionToString = (expression) => {
    return expression
      .map((item) => {
        if (item["keyType"] == Config.KEY_CLASS.FUNCTION) {
          return item["content"] + "(";
        } else {
          return item["content"];
        }
      })
      .join("");
  };
}
