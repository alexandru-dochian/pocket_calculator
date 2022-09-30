export default class Config {
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
    infinity: Infinity,
    minusInfinity: -Infinity,
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
    division: (x, y) => x / y,
  };
}
