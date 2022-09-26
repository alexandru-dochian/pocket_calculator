import Config from "../configurationn/Config.js";
import Evaluator from "./Evaluator.js";

export default class Calculator {
  constructor() {
    // javascript state
    this.state = {
      history: [],
      expression: [],
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

  updateDOM = () => {
    const { expression } = this.state;
    const expressionString = this.fromExpressionToString(expression);
    this.dom.calculatorScreenContent.innerText = expressionString;
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
    const { expression: oldExpression } = this.state;
    const newExpression = new Evaluator(oldExpression).evaluate();
    this.state.expression = newExpression;

    this.saveHistory(oldExpression, newExpression);
  };

  saveHistory = (oldExpression, newExpression) => {
    const oldExpressionString = this.fromExpressionToString(oldExpression);
    const newExpressionString = this.fromExpressionToString(newExpression);

    if (
      oldExpression.length == 0 ||
      oldExpressionString == newExpressionString
    ) {
      return;
    }

    this.state.history.push({
      oldExpression,
      newExpression,
    });

    const historyItem = document.createElement("div");

    const expressionDiv = document.createElement("div");
    expressionDiv.appendChild(document.createTextNode(oldExpressionString));
    expressionDiv.className = "historyExpression";

    const resultDiv = document.createElement("div");
    resultDiv.appendChild(document.createTextNode(newExpressionString));
    resultDiv.className = "historyResult";

    historyItem.appendChild(expressionDiv);
    historyItem.appendChild(resultDiv);

    this.dom.historyList.appendChild(historyItem);
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
