class Calculator {
  constructor() {
    let keys = Array.from(document.getElementsByClassName("key"));

    keys.map((key) => {
      key.addEventListener("click", (e) => this.handleKeyEvent(e));
    });

    this.calculatorScreenContent = document.getElementById(
      "calculatorScreenContent"
    );

    this.state = {
      history: [],
      screen: [],
    };
  }

  handleKeyEvent = (e) => {
    const keyType = e.target.id;
    const content = e.target.innerText;

    if (keyType == "clear") {
      this.handleClearScreen();
    } else if (keyType == "backspace") {
      this.handleBackSpace();
    } else if (keyType == "equal") {
      this.handleEqual();
    } else {
      console.log("keyType", keyType);
      console.log("content", content);
      this.state.screen.push({ keyType, content });
      this.calculatorScreenContent.innerText += e.target.innerText;
    }
  };

  handleClearScreen = () => {
    this.calculatorScreenContent.innerText = "";
  };

  handleBackSpace = () => {
    if (this.calculatorScreenContent.innerText) {
      this.calculatorScreenContent.innerText =
        this.calculatorScreenContent.innerText.slice(0, -1);
    }
  };

  handleEqual = () => {
    try {
      this.calculatorScreenContent.innerText = eval(
        this.calculatorScreenContent.innerText
      );
    } catch {
      this.calculatorScreenContent.innerText = "Error";
    }
  };

  // Tests ////////////////////////////////////////////////////////////////////
  tests = [
    () => {
      console.log("Success!");
    },
    () => {
      console.log("Success!");
    },
    () => {
      console.log("Success!");
    },
    () => {
      console.log("Success!");
    },
  ];

  runTests = () => {
    const number_of_tests = this.tests.length;

    this.tests.forEach((test, test_number) => {
      let result = "Success!";
      try {
        console.log(`Starting Test ${test_number}/${number_of_tests}...`);
        test();
      } catch (error) {
        result = "Failed!";
      } finally {
        console.log(`Test ${test_number}/${number_of_tests} ${result}`);
      }
    });
  };
}

const calculator = new Calculator();
calculator.runTests();
