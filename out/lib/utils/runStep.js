'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = runStep;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function runStep(name, step) {
  process.stdout.write(`- ${ name }`);

  function end(sign) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(`${ _chalk2.default.green(sign) }${ _chalk2.default.bold(name) }\n`);
  }

  return step.then(res => {
    end('✔︎');
    return res;
  }).catch(err => {
    end('✖');
    throw err;
  });
}