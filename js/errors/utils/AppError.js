export default class AppError extends Error {
  constructor(error_definition, ...args) {
    super(
      error_definition.replace(/{([0-9]+)}/g, (match, index) =>
        typeof args[index] === "undefined" ? match : args[index]
      )
    );
  }
}
