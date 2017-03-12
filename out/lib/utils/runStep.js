'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = runStep;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _cliSpinners = require('cli-spinners');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function runStep(name, step) {
  let frame = -1;

  function clear() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }

  function render() {
    if (frame !== -1) {
      clear();
    }

    frame++;
    if (frame === _cliSpinners.dots.frames.length) {
      frame = 0;
    }

    process.stdout.write(`${ _chalk2.default.cyan(_cliSpinners.dots.frames[frame]) } ${ name }`);
  }

  const interval = setInterval(render, _cliSpinners.dots.interval);

  function end(sign) {
    clearInterval(interval);

    if (frame !== -1) {
      clear();
    }

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