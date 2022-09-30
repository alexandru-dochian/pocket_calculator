import AppError from "./utils/AppError.js";
import ErrorDefinition from "./utils/ErrorDefinition.js";

export default class UnexpectedError extends AppError {
  constructor() {
    super(ErrorDefinition.UNEXPECTED_ERROR);
  }
}
