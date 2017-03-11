'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _AppError = require('./AppError');

var _AppError2 = _interopRequireDefault(_AppError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RunError extends _AppError2.default {

  constructor(command, code, details) {
    super(`Command failed: "${ command }" (${ code })`, details);

    this.command = command;
  }

  get detailsString() {
    return `Output:
${ this.details.output }`;
  }

}
exports.default = RunError;