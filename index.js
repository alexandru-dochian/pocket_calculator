class Config {
  static KEY_CLASS = {
    CONTROL: "control",
    CONSTANT: "constant",
    NUMBER: "number",
    FUNCTION: "function",
    OPERATOR: "operator",
    DECIMAL_POINT: "decimalPoint",
    OPEN: "open",
    CLOSE: "close",
  };

  static CONSTANTS = {
    pi: Math.PI,
  };

  static FUNCTIONS = {
    sin: (x) => Math.sin(x),
    cos: (x) => Math.cos(x),
    tg: (x) => Math.tan(x),
    ctg: (x) => 1 / Math.tan(x),
  };

  static OPERATORS = {
    addition: (x, y) => x + y,
    subtraction: (x, y) => x - y,
    multiplication: (x, y) => x * y,
    division: (x, y) => {
      if (y == 0) {
        throw Error("Division by 0");
      }
      return parseFloat(x / y);
    },
  };
}

class Calculator {
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

class Evaluator {
  constructor(expression) {
    this.expression = expression;
  }

  evaluate = () => {
    let valuesStack = [];
    let operatorsStack = [];

    for (let index = 0; index < this.expression.length; index++) {
      const currentItem = this.expression[index];

      // CONSTANT
      if (currentItem["keyType"] == Config.KEY_CLASS.CONSTANT) {
        valuesStack.push(Config.CONSTANTS[currentItem["id"]]);
      }

      // TODO: check a.b.c.d....
      // NUMBER
      if (currentItem["keyType"] == Config.KEY_CLASS.NUMBER) {
        let stringBuffer = "";

        while (
          index < this.expression.length &&
          this.expression[index]["keyType"] == Config.KEY_CLASS.NUMBER
        ) {
          stringBuffer += this.expression[index++]["content"];
        }

        if (
          index < this.expression.length &&
          this.expression[index]["keyType"] == Config.KEY_CLASS.DECIMAL_POINT
        ) {
          stringBuffer += this.expression[index++]["content"];
          while (
            index < this.expression.length &&
            this.expression[index]["keyType"] == Config.KEY_CLASS.NUMBER
          ) {
            stringBuffer += this.expression[index++]["content"];
          }
        }

        index--;
        valuesStack.push(parseFloat(stringBuffer));
      }

      // FUNCTION or OPEN
      if (
        currentItem["keyType"] == Config.KEY_CLASS.OPEN ||
        currentItem["keyType"] == Config.KEY_CLASS.FUNCTION
      ) {
        operatorsStack.push(currentItem);
      }

      // CLOSE
      if (currentItem["keyType"] == Config.KEY_CLASS.CLOSE) {
        while (
          ![Config.KEY_CLASS.OPEN, Config.KEY_CLASS.FUNCTION].includes(
            operatorsStack[operatorsStack.length - 1]["keyType"]
          )
        ) {
          const lastOperatorOnStack = operatorsStack.pop();
          const secondOperand = valuesStack.pop();
          const firstOperand = valuesStack.pop();

          const operatorFunction = Config.OPERATORS[lastOperatorOnStack["id"]];
          valuesStack.push(operatorFunction(firstOperand, secondOperand));
        }

        const removedElementFromStack = operatorsStack.pop();
        if (removedElementFromStack["keyType"] == Config.KEY_CLASS.FUNCTION) {
          const chosen_function =
            Config.FUNCTIONS[removedElementFromStack["id"]];
          valuesStack.push(chosen_function(valuesStack.pop()));
        }
      }

      // OPERATOR
      // TODO: refactor has precedence
      if (currentItem["keyType"] == Config.KEY_CLASS.OPERATOR) {
        while (
          operatorsStack.length > 0 &&
          this.hasPrecedence(
            currentItem["id"],
            operatorsStack[operatorsStack.length - 1]["id"]
          )
        ) {
          const lastOperatorOnStack = operatorsStack.pop();
          const secondOperand = valuesStack.pop();
          const firstOperand = valuesStack.pop();

          console.log("lastOperatorOnStack", lastOperatorOnStack);
          const operatorFunction = Config.OPERATORS[lastOperatorOnStack["id"]];
          valuesStack.push(operatorFunction(firstOperand, secondOperand));
        }

        operatorsStack.push(currentItem);
      }
    }

    while (operatorsStack.length > 0) {
      const lastOperatorOnStack = operatorsStack.pop();
      const secondOperand = valuesStack.pop();
      const firstOperand = valuesStack.pop();

      const operatorFunction = Config.OPERATORS[lastOperatorOnStack["id"]];
      valuesStack.push(operatorFunction(firstOperand, secondOperand));
    }

    return valuesStack.pop();
  };

  hasPrecedence = (newOperator, existingOperatorOnStack) => {
    // TODO: add logic for FUNCTION
    if (
      [Config.KEY_CLASS.OPEN, Config.KEY_CLASS.CLOSE].includes(
        existingOperatorOnStack
      )
    ) {
      return false;
    }

    if (Object.keys(Config.FUNCTIONS).includes(existingOperatorOnStack)) {
      return false;
    }

    const lower_priority_operators = [
      Config.OPERATORS.addition.name,
      Config.OPERATORS.subtraction.name,
    ];
    const higher_priority_operators = [
      Config.OPERATORS.multiplication.name,
      Config.OPERATORS.division.name,
    ];

    if (
      higher_priority_operators.includes(newOperator) &&
      lower_priority_operators.includes(existingOperatorOnStack)
    ) {
      return false;
    }

    return true;
  };
}

class FailedTest extends Error {
  constructor(expected, actual) {
    super(`Expected=[${expected}] is different from Actual=[${actual}]`);
  }
}

tests = [
  () => {
    expression = [
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "3",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "4",
      },
      {
        keyType: Config.KEY_CLASS.DECIMAL_POINT,
        content: ".",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "4",
      },
      {
        keyType: Config.KEY_CLASS.OPERATOR,
        content: "+",
        id: "addition",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "3",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "4",
      },
      {
        keyType: Config.KEY_CLASS.DECIMAL_POINT,
        content: ".",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "4",
      },
    ];

    const expected = 68.8;
    const actual = new Evaluator(expression).evaluate();

    if (expected != actual) {
      throw new FailedTest(expected, actual);
    }
  },
  () => {
    expression = [
      {
        keyType: Config.KEY_CLASS.OPEN,
        content: "(",
        id: "open",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "3",
      },
      {
        keyType: Config.KEY_CLASS.OPERATOR,
        content: "+",
        id: "addition",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "4",
      },
      {
        keyType: Config.KEY_CLASS.CLOSE,
        content: ")",
        id: "close",
      },
      {
        keyType: Config.KEY_CLASS.OPERATOR,
        content: "*",
        id: "multiplication",
      },
      {
        keyType: Config.KEY_CLASS.OPEN,
        content: "(",
        id: "open",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "3",
      },
      {
        keyType: Config.KEY_CLASS.OPERATOR,
        content: "-",
        id: "subtraction",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "1",
      },
      {
        keyType: Config.KEY_CLASS.CLOSE,
        content: ")",
        id: "close",
      },
    ];

    const expected = 14.0;
    const actual = new Evaluator(expression).evaluate();

    if (expected != actual) {
      throw new FailedTest(expected, actual);
    }
  },
  () => {},
  () => {},
];

runTests = () => {
  const number_of_tests = tests.length;

  tests.forEach((test, test_index) => {
    let result = "Success!";
    let exception = "";
    try {
      test();
    } catch (error) {
      console.log("Error", error);
      exception = error;
      result = "Failed!";
    } finally {
      console.log(
        `Test ${test_index + 1}/${number_of_tests} ${result} ${exception}`
      );
    }
  });
};
