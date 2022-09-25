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
      calculatorScreenContent: document.getElementById("screen"),
    };

    // Set listeners
    let keys = Array.from(document.getElementsByClassName("key"));

    keys.map((key) => {
      key.addEventListener("click", (e) => this.handleKeyEvent(e));
    });
  }

  handleKeyEvent = (e) => {
    const keyType = e.target.className.split(" ")[1];
    const content = e.target.innerText;

    if (keyType == "clear") {
      this.handleClearScreen();
    } else if (keyType == "backspace") {
      this.handleBackSpace();
    } else if (keyType == "equal") {
      this.handleEqual();
    } else {
      this.state.expression.push({ keyType, content });
    }
    this.updateDOM();
  };

  updateDOM = () => {
    const domContent = this.fromStateToDom();
    this.dom.calculatorScreenContent.innerText = domContent;
  };

  fromStateToDom = () => {
    const { expression } = this.state;
    return expression.map((item) => item["content"]).join("");
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
    this.state.expression = [{ keyType: "number", content: result }];
  };
}

class Evaluator {
  static TYPES = {
    NUMBER: "number",
    FUNCTION: "function",
    OPERATOR: "operator",
    DECIMAL_POINT: "decimalPoint",
    OPEN: "open",
    CLOSE: "close",
  };

  constructor(expression) {
    this.expression = expression;
  }

  evaluate = () => {
    let valuesStack = [];
    let operatorsStack = [];

    for (let index = 0; index < this.expression.length; index++) {
      const currentItem = this.expression[index];

      // NUMBER
      if (currentItem["keyType"] == Evaluator.TYPES.NUMBER) {
        let stringBuffer = "";

        while (
          index < this.expression.length &&
          this.expression[index]["keyType"] == Evaluator.TYPES.NUMBER
        ) {
          stringBuffer += this.expression[index++]["content"];
        }

        if (
          index < this.expression.length &&
          this.expression[index]["keyType"] == Evaluator.TYPES.DECIMAL_POINT
        ) {
          stringBuffer += this.expression[index++]["content"];
          while (
            index < this.expression.length &&
            this.expression[index]["keyType"] == Evaluator.TYPES.NUMBER
          ) {
            stringBuffer += this.expression[index++]["content"];
          }
        }

        index--;
        valuesStack.push(parseFloat(stringBuffer));
      }

      // FUNCTION or OPEN
      if (
        currentItem["keyType"] == Evaluator.TYPES.OPEN ||
        currentItem["keyType"] == Evaluator.TYPES.FUNCTION
      ) {
        operatorsStack.push(currentItem);
      }

      // CLOSE (TODO: CHECK ERROR HERE?)
      if (currentItem["keyType"] == Evaluator.TYPES.CLOSE) {
        const test = [];
        while (
          ![Evaluator.TYPES.OPEN, Evaluator.TYPES.FUNCTION].includes(
            operatorsStack[operatorsStack.length - 1]["keyType"]
          )
        ) {
          const secondOperand = valuesStack.pop();
          const firstOperand = valuesStack.pop();
          const lastOperatorOnStack = operatorsStack.pop()["content"];

          const newValue = this.applyOperator(
            lastOperatorOnStack,
            secondOperand,
            firstOperand
          );

          valuesStack.push(newValue);
        }
        // TODO: for function => apply function
        operatorsStack.pop();
      }

      // OPERATOR
      if (currentItem["keyType"] == Evaluator.TYPES.OPERATOR) {
        while (
          operatorsStack.length > 0 &&
          this.hasPrecedence(
            currentItem["content"],
            operatorsStack[operatorsStack.length - 1]["content"]
          )
        ) {
          const lastOperatorOnStack = operatorsStack.pop()["content"];
          const secondOperand = valuesStack.pop();
          const firstOperand = valuesStack.pop();

          const newValue = this.applyOperator(
            lastOperatorOnStack,
            secondOperand,
            firstOperand
          );
          valuesStack.push(newValue);
        }

        operatorsStack.push(currentItem);
      }
    }

    while (operatorsStack.length > 0) {
      valuesStack.push(
        this.applyOperator(
          operatorsStack.pop()["content"],
          valuesStack.pop(),
          valuesStack.pop()
        )
      );
    }

    return valuesStack.pop();
  };

  hasPrecedence = (op1, op2) => {
    // TODO: add logic for FUNCTION
    if (op2 == "(" || op2 == ")") {
      return false;
    }
    if ((op1 == "*" || op1 == "/") && (op2 == "+" || op2 == "-")) {
      return false;
    } else {
      return true;
    }
  };

  applyOperator = (operator, secondOperand, firstOperand) => {
    switch (operator) {
      case "+":
        return firstOperand + secondOperand;
      case "-":
        return firstOperand - secondOperand;
      case "*":
        return firstOperand * secondOperand;
      case "/":
        if (secondOperand == 0) {
          throw Error("Division by 0");
        }
        return parseFloat(firstNumber / secondOperand, 10);
    }
    return 0;
  };
}

tests = [
  () => {
    expression = [
      {
        keyType: Evaluator.TYPES.NUMBER,
        content: "3",
      },
      {
        keyType: Evaluator.TYPES.NUMBER,
        content: "4",
      },
      {
        keyType: Evaluator.TYPES.DECIMAL_POINT,
        content: ".",
      },
      {
        keyType: Evaluator.TYPES.NUMBER,
        content: "4",
      },
      {
        keyType: Evaluator.TYPES.OPERATOR,
        content: "+",
      },
      {
        keyType: Evaluator.TYPES.NUMBER,
        content: "3",
      },
      {
        keyType: Evaluator.TYPES.NUMBER,
        content: "4",
      },
      {
        keyType: Evaluator.TYPES.DECIMAL_POINT,
        content: ".",
      },
      {
        keyType: Evaluator.TYPES.NUMBER,
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
        keyType: Evaluator.TYPES.OPEN,
        content: "(",
      },
      {
        keyType: Evaluator.TYPES.NUMBER,
        content: "3",
      },
      {
        keyType: Evaluator.TYPES.OPERATOR,
        content: "+",
      },
      {
        keyType: Evaluator.TYPES.NUMBER,
        content: "4",
      },
      {
        keyType: Evaluator.TYPES.CLOSE,
        content: ")",
      },
      {
        keyType: Evaluator.TYPES.OPERATOR,
        content: "*",
      },
      {
        keyType: Evaluator.TYPES.OPEN,
        content: "(",
      },
      {
        keyType: Evaluator.TYPES.NUMBER,
        content: "3",
      },
      {
        keyType: Evaluator.TYPES.OPERATOR,
        content: "-",
      },
      {
        keyType: Evaluator.TYPES.NUMBER,
        content: "1",
      },
      {
        keyType: Evaluator.TYPES.CLOSE,
        content: ")",
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

class FailedTest extends Error {
  constructor(expected, actual) {
    super(`Expected=[${expected}] is different from Actual=[${actual}]`);
  }
}

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
