import Config from "../configurationn/Config.js";
import InvalidExpression from "../errors/InvalidExpression.js";
import ImpossibleToCompute from "../errors/ImpossibleToCompute.js";
import UnexpectedError from "../errors/UnexpectedError.js";

export default class Evaluator {
  static MIN_VALUE_THRESHOLD = 1e-15;
  static MAX_VALUE_THRESHOLD = 1e15;

  static matchNumber(numberString) {
    const regex = /-?[0-9]+(.[0-9]+)?(e(-)?[0-9]+)?/g;
    const matchingResult = numberString.match(regex);
    return (
      matchingResult !== null &&
      matchingResult.length == 1 &&
      matchingResult[0].length === numberString.length
    );
  }

  constructor(expression) {
    this.expression = expression;
    this.currentIndex = 0;
    this.currentItem = undefined;
    this.explorationPolicy = {};
    this.valuesStack = [];
    this.operatorsStack = [];
    this.result = undefined;
  }

  evaluate() {
    if (this.currentIndex == this.expression.length) {
      return this.finishEvaluation();
    }

    this.currentItem = this.expression[this.currentIndex];

    switch (this.currentItem["keyType"]) {
      case Config.KEY_CLASS.CONSTANT:
        this.handleConstant();
        break;

      case Config.KEY_CLASS.OPEN:
      case Config.KEY_CLASS.FUNCTION:
        this.handleFunctionOrOpen();
        break;

      case Config.KEY_CLASS.CLOSE:
        this.handleClose();
        break;

      case Config.KEY_CLASS.OPERATOR:
        this.handleOperator();
        break;

      case Config.KEY_CLASS.NUMBER:
        this.handleNumber();
        break;
      default:
        throw new UnexpectedError();
    }

    this.currentIndex++;
    return this.evaluate();
  }

  handleOperator() {
    while (
      this.operatorsStack.length > 0 &&
      this.hasPrecedence(
        this.currentItem["id"],
        this.operatorsStack[this.operatorsStack.length - 1]["id"]
      )
    ) {
      this.applyOperator();
    }
    this.operatorsStack.push(this.currentItem);
  }

  handleConstant() {
    this.valuesStack.push(Config.CONSTANTS[this.currentItem["id"]]);
  }

  handleFunctionOrOpen() {
    this.operatorsStack.push(this.currentItem);
  }

  handleClose() {
    while (
      ![Config.KEY_CLASS.OPEN, Config.KEY_CLASS.FUNCTION].includes(
        this.operatorsStack[this.operatorsStack.length - 1]["keyType"]
      )
    ) {
      this.applyOperator();
    }

    this.applyFunction();
  }

  handleNumber() {
    let stringBuffer = "";

    while (
      this.currentIndex < this.expression.length &&
      [Config.KEY_CLASS.NUMBER, Config.KEY_CLASS.DECIMAL_POINT].includes(
        this.expression[this.currentIndex]["keyType"]
      )
    ) {
      stringBuffer += this.expression[this.currentIndex++]["content"];
    }

    if (!Evaluator.matchNumber(stringBuffer)) {
      throw new InvalidExpression();
    }

    this.currentIndex--;
    this.valuesStack.push(
      this.checkAndAdjustComputedValue(parseFloat(stringBuffer))
    );
  }

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

  finishEvaluation() {
    while (this.operatorsStack.length > 0) {
      this.applyOperator();
    }

    if (this.operatorsStack.length != 0 || this.valuesStack.length != 1) {
      throw new InvalidExpression();
    }
    const resultValue = this.valuesStack.pop();

    if (resultValue === Config.CONSTANTS.infinity) {
      return [
        {
          keyType: Config.KEY_CLASS.CONSTANT,
          content: resultValue,
          id: "infinity",
        },
      ];
    } else {
      return [{ keyType: Config.KEY_CLASS.NUMBER, content: resultValue }];
    }
  }

  applyOperator() {
    const lastOperatorOnStack = this.operatorsStack.pop();
    const secondOperand = this.valuesStack.pop();
    const firstOperand = this.valuesStack.pop();
    const binaryOperator = Config.OPERATORS[lastOperatorOnStack["id"]];

    this.addValueOnStack(binaryOperator(firstOperand, secondOperand));
  }

  applyFunction() {
    const removedElementFromStack = this.operatorsStack.pop();
    if (removedElementFromStack["keyType"] == Config.KEY_CLASS.FUNCTION) {
      const unaryFunction = Config.FUNCTIONS[removedElementFromStack["id"]];
      this.addValueOnStack(unaryFunction(this.valuesStack.pop()));
    }
  }

  addValueOnStack(computedValue) {
    this.valuesStack.push(this.checkAndAdjustComputedValue(computedValue));
  }

  checkAndAdjustComputedValue(computedValue) {
    if (isNaN(computedValue)) {
      throw new ImpossibleToCompute();
    }

    if (computedValue > Evaluator.MAX_VALUE_THRESHOLD) {
      return Config.CONSTANTS.infinity;
    }

    if (computedValue < Evaluator.MIN_VALUE_THRESHOLD) {
      return 0;
    }

    return computedValue;
  }
}
