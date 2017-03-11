import colors from 'chalk';
import { dots as spinner } from 'cli-spinners';

export default function runStep(name, step) {
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
    if (frame === spinner.frames.length) {
      frame = 0;
    }

    process.stdout.write(`${colors.cyan(spinner.frames[frame])} ${name}`);
  }

  const interval = setInterval(render, spinner.interval);

  function end(sign) {
    clearInterval(interval);

    if (frame !== -1) {
      clear();
    }

    process.stdout.write(`${colors.green(sign)}${colors.bold(name)}\n`);
  }

  return step
    .then(res => {
      end('✔︎');
      return res;
    })
    .catch(err => {
      end('✖');
      throw err;
    });
}
