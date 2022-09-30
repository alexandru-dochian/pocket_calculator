import AppError from "./utils/AppError.js";
import ErrorDefinition from "./utils/ErrorDefinition.js";

export default class ImpossibleToCompute extends AppError {
  constructor() {
    super(ErrorDefinition.IMPOSSIBLE_TO_COMPUTE);
  }
}
