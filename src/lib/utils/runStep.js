import colors from 'chalk';
import { dots as spinner } from 'cli-spinners';

export default function runStep(name, step) {
  let frame = -1;

  function render() {
    frame++;
    if (frame === spinner.frames.length) {
      frame = 0;
    }
    process.stdout.write(`${spinner.frames[frame]} ${name}`);
  }

  const interval = setInterval(render, spinner.interval);

  function end(sign) {
    clearInterval(interval);
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
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
