import Config from "../configurationn/Config.js";

export default class Evaluator {
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

      // NUMBER
      if (currentItem["keyType"] == Config.KEY_CLASS.NUMBER) {
        // NUMBER from previous evaluation
        if (currentItem["content"].toString().length != 1) {
          valuesStack.push(currentItem["content"]);
          continue;
        }

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

    return this.toExpression(valuesStack.pop());
  };

  toExpression = (result) => {
    if (result == undefined) {
      return [];
    }
    return [{ keyType: Config.KEY_CLASS.NUMBER, content: result }];
  };

  hasPrecedence = (newOperator, existingOperatorOnStack) => {
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
