import Config from "./configurationn/Config.js";
import Evaluator from "./components/Evaluator.js";
import FailedTest from "./errors/FailedTest.js";

const tests = [
  () => {
    const expression = [
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
    const actual = new Evaluator(expression).evaluate()[0]["content"];

    if (expected != actual) {
      throw new FailedTest(expected, actual);
    }
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

    const expected = 14.0;
    const actual = new Evaluator(expression).evaluate()[0]["content"];

    if (expected != actual) {
      throw new FailedTest(expected, actual);
    }
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

    const expected = 1.0;
    const actual = new Evaluator(expression).evaluate()[0]["content"];

    if (expected != actual) {
      throw new FailedTest(expected, actual);
    }
  },
];

const runTests = () => {
  const number_of_tests = tests.length;

  tests.forEach((test, test_index) => {
    let result = "Success!";
    let exception = "";
    try {
      test();
    } catch (error) {
      exception = error;
      result = "Failed!";
    } finally {
      console.log(
        `Test ${test_index + 1}/${number_of_tests} ${result} ${exception}`
      );
    }
  });
};

runTests();
