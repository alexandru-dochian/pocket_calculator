import ErrorDefinition from "./utils/ErrorDefinition.js";
import AppError from "./utils/AppError.js";

export default class DivisionByZero extends AppError {
  constructor() {
    super(ErrorDefinition.DIVISION_BY_0);
  }
}
