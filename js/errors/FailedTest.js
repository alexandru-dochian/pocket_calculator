import AppError from "./utils/AppError.js";
import ErrorDefinition from "./utils/ErrorDefinition.js";

export default class FailedTest extends AppError {
  constructor(expected, actual) {
    super(ErrorDefinition.FAILED_TEST, expected, actual);
  }
}
