'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = run;

var _spawn = require('./spawn');

var _spawn2 = _interopRequireDefault(_spawn);

var _RunError = require('../error/RunError');

var _RunError2 = _interopRequireDefault(_RunError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function run(command, options) {
  return (0, _spawn2.default)(command, options).then(child => new Promise((resolve, reject) => {
    let output = '';

    child.stdout.on('data', d => output += d.toString());
    child.stderr.on('data', d => output += d.toString());

    child.on('error', err => reject(err));
    child.on('close', code => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new _RunError2.default(command, code, { output }));
      }
    });
  }));
}