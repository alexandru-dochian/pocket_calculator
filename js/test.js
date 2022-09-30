import Config from "./configurationn/Config.js";
import Evaluator from "./components/Evaluator.js";
import FailedTest from "./errors/FailedTest.js";
import Calculator from "./components/Calculator.js";

const tests = [
  () => {
    const expression = [
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "34.4",
      },
      {
        keyType: Config.KEY_CLASS.OPERATOR,
        content: "+",
        id: "addition",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "34.4",
      },
    ];

    const expressionString = Calculator.fromExpressionToString(
      new Evaluator(expression).evaluate()
    );
    fail(68.8, parseFloat(expressionString));
  },
  () => {
    const expression = [
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

    const expressionString = Calculator.fromExpressionToString(
      new Evaluator(expression).evaluate()
    );
    fail(14.0, parseFloat(expressionString));
  },
  () => {
    const expression = [
      {
        keyType: Config.KEY_CLASS.FUNCTION,
        content: "sin",
        id: "sin",
      },
      {
        keyType: Config.KEY_CLASS.CONSTANT,
        content: "pi",
        id: "pi",
      },
      {
        keyType: Config.KEY_CLASS.OPERATOR,
        content: "/",
        id: "division",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "2",
      },
      {
        keyType: Config.KEY_CLASS.CLOSE,
        content: ")",
        id: "close",
      },
    ];

    const expressionString = Calculator.fromExpressionToString(
      new Evaluator(expression).evaluate()
    );
    fail(1.0, parseFloat(expressionString));
  },
  () => {
    const expression = [
      {
        keyType: Config.KEY_CLASS.CONSTANT,
        content: "Infinity",
        id: "infinity",
      },
      {
        keyType: Config.KEY_CLASS.OPERATOR,
        content: "*",
        id: "multiplication",
      },
      {
        keyType: Config.KEY_CLASS.NUMBER,
        content: "3",
      },
    ];

    const expressionString = Calculator.fromExpressionToString(
      new Evaluator(expression).evaluate()
    );
    fail(Infinity, parseFloat(expressionString));
  },
  () => {
    const regexExpectedMatches = [
      { expected: true, number: "1" },
      { expected: true, number: "1.1" },
      { expected: true, number: "12.12" },
      { expected: true, number: "-12.12" },
      { expected: true, number: "2e-5" },
      { expected: true, number: "2e5" },
      { expected: true, number: "2.2e5" },
      { expected: true, number: "-22.22e5" },
      { expected: true, number: "22.22e-5" },
      { expected: false, number: "--1" },
      { expected: false, number: "1." },
      { expected: false, number: "." },
      { expected: false, number: ".1" },
      { expected: false, number: "2.1." },
      { expected: false, number: ".2.1" },
      { expected: false, number: "2.1.2" },
      { expected: false, number: "+4.1" },
      { expected: false, number: "4.1e" },
      { expected: false, number: "4.1e+5" },
      { expected: false, number: "4.1e*5" },
      { expected: false, number: "4.1e-5.2" },
      { expected: false, number: "4.1e-5.2" },
    ];

    regexExpectedMatches.forEach((regexExpectedMatch) => {
      fail(
        regexExpectedMatch["expected"],
        Evaluator.matchNumber(regexExpectedMatch["number"])
      );
    });
  },
];

const fail = (expected, actual) => {
  if (expected != actual) {
    throw new FailedTest(expected, actual);
  }
};

const runTests = () => {
  const verbose = false;
  const number_of_tests = tests.length;

  tests.forEach((test, test_index) => {
    let result = "Success!";
    let errorMessage = "";
    try {
      test();
    } catch (error) {
      errorMessage = error.message;
      result = "Failed!";
      if (verbose) {
        console.log(error);
      }
    } finally {
      console.log(
        `Test ${test_index + 1}/${number_of_tests} ${result} ${errorMessage}`
      );
    }
  });
};

runTests();
