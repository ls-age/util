import { spawn as _spawn } from 'child_process';
import which from 'which';

export default function spawn(command, options) {
  let args = command;

  if (!(args instanceof Array)) {
    args = command.split(' ');
  }

  const name = args.shift();

  return new Promise((resolve, reject) => {
    which(name, (wErr, path) => {
      if (wErr) {
        reject(wErr);
      } else {
        resolve(_spawn(path, args, options));
      }
    });
  });
}
