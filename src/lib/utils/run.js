import spawn from './spawn';
import RunError from '../error/RunError';
import runStep from './runStep';

export default function run(command, options) {
  return runStep(command, spawn(command, options)
    .then(child => {
      return new Promise((resolve, reject) => {
        let output = '';

        child.stdout.on('data', d => (output += d.toString()));
        child.stderr.on('data', d => (output += d.toString()));

        child.on('error', err => reject(err));
        child.on('close', code => {
          if (code === 0) {
            resolve(output);
          } else {
            reject(new RunError(command, code, { output }));
          }
        });
      });
    })
  );
}
