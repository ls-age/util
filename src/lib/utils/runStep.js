import colors from 'chalk';

export default function runStep(name, step) {
  process.stdout.write(`- ${name}`);

  function end(sign) {
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
