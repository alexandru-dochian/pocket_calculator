export default class FailedTest extends Error {
  constructor(expected, actual) {
    super(`Expected=[${expected}] is different from Actual=[${actual}]`);
  }
}
