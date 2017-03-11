'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = spawn;

var _child_process = require('child_process');

var _which = require('which');

var _which2 = _interopRequireDefault(_which);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function spawn(command, options) {
  let args = command;

  if (!(args instanceof Array)) {
    args = command.split(' ');
  }

  const name = args.shift();

  return new Promise((resolve, reject) => {
    (0, _which2.default)(name, (wErr, path) => {
      if (wErr) {
        reject(wErr);
      } else {
        resolve((0, _child_process.spawn)(path, args, options));
      }
    });
  });
}