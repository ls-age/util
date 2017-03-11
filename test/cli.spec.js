import { spawn } from 'child_process';
import expect from 'unexpected';

function runCli(args, callback) {
  const child = spawn('node', ['./out/cli.js'].concat(...args));
  let data = '';
  let error = null;

  child.stderr.on('data', d => (data += d));
  child.on('error', e => (error = e));

  child.on('close', code => {
    callback(error, data, code);
  });
}

describe('cli', function() {

  it('cannot be run without a command', function(cb) {
    runCli([], (err, data, code) => {
      expect(err, 'to equal', null);
      expect(code, 'to equal', 1);
      cb();
    });
  });

});
