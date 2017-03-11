'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class AppError extends Error {

  constructor(message, details) {
    super(message);

    this.details = details;
  }

  get detailsString() {
    return JSON.stringify(this.details, null, '  ');
  }

}
exports.default = AppError;