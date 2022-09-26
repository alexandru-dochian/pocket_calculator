import Config from "../configurationn/Config.js";

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
      history: document.getElementById("history"),
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
    const domContent = this.fromStateToDom();
    this.dom.calculatorScreenContent.innerText = domContent;
  };

  fromStateToDom = () => {
    const { expression } = this.state;
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
    const { expression } = this.state;
    const result = new Evaluator(expression).evaluate();
    this.state.expression = [
      { keyType: Config.KEY_CLASS.NUMBER, content: result },
    ];
  };
}
