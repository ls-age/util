'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = runStep;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function runStep(name, step, inset = '') {
  process.stdout.write(`-  ${ name }`);

  function clear() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }

  return step.then(res => {
    clear();
    process.stdout.write(`${ inset }${ _chalk2.default.green('✔︎') }${ _chalk2.default.bold(name) }\n`);
    return res;
  }).catch(err => {
    clear();
    process.stdout.write(`${ inset }${ _chalk2.default.red('✖') } ${ _chalk2.default.bold(name) }\n`);
    throw err;
  });
}