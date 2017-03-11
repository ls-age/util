import colors from 'chalk';

let inStep = 0;

export default function runStep(name, step) {
  const inset = '  '.repeat(inStep);
  inStep++;

  process.stdout.write(`${inset}-  ${name}`);

  function clear() {
    inStep--;
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
