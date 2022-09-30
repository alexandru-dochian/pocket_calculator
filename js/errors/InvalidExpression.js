import AppError from "./utils/AppError.js";
import ErrorDefinition from "./utils/ErrorDefinition.js";

export default class InvalidExpression extends AppError {
  constructor() {
    super(ErrorDefinition.INVALID_EXPRESSION);
  }
}
