import colors from 'chalk';

export default function runStep(name, step, inset = '') {
  process.stdout.write(`-  ${name}`);

  function clear() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }

  return step
    .then(res => {
      clear();
      process.stdout.write(`${inset}${colors.green('✔︎')}${colors.bold(name)}\n`);
      return res;
    })
    .catch(err => {
      clear();
      process.stdout.write(`${inset}${colors.red('✖')} ${colors.bold(name)}\n`);
      throw err;
    });
}
