import { readdir, stat } from 'fs';
import { join } from 'path';
import yargs from 'yargs';
import colors from 'chalk';
import tildify from 'tildify';
import UsageError from './lib/error/UsageError';
import AppError from './lib/error/AppError';

import { options as releaseOptions } from './commands/release';

export default class Util {

  constructor(options = {}) {
    this.options = options;
  }

  launch(command) {
    return this.getEnvironment(this.options.cwd)
      .then(env => {
        this.environment = env;
        this.options = Object.assign({}, env.config, this.options);

        if (process.cwd() !== env.cwd) {
          console.log('Changing CWD to', tildify(env.cwd));
          process.chdir(env.cwd);
        }
      })
      .then(() => this.runCommand(command));
  }

  runCommand(commandName) {
    return require(join(__dirname, 'commands', commandName)).run(this.options, this.environment);
  }

  getEnvironment(cwd = process.cwd()) {
    function findPackage(dir, cb) {
      readdir(dir, (err, files) => {
        if (err) {
          cb(err);
        } else {
          const pkgs = files.filter(name => name === 'package.json');

          if (pkgs.length === 1) {
            cb(null, {
              cwd: dir,
              packagePath: join(dir, 'package.json'),
            });
          } else {
            const nextDir = join(dir, '../');
            if (nextDir === '/') {
              cb(new Error('No package.json file found'));
            } else {
              findPackage(nextDir, cb);
            }
          }
        }
      });
    }

    return new Promise((resolve, reject) => {
      findPackage(cwd, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    })
      .then(result => new Promise((resolve, reject) => {
        try {
          resolve(Object.assign(result, { package: require(result.packagePath) }));
        } catch (e) {
          reject(e);
        }
      }))
      .then(pkgResult => new Promise((resolve, reject) => {
        const result = pkgResult;
        result.config = pkgResult.package.lsage || {};

        const configFilePath = join(pkgResult.cwd, 'lsage.json');
        stat(configFilePath, err => {
          if (!err) {
            try {
              result.config = Object.assign(result.config, require(configFilePath));
              resolve(result);
            } catch (e) {
              reject(e);
            }
          } else {
            resolve(result);
          }
        });
      }));
  }

  static launch(args) {
    const optionsParser = yargs(args)
      .env('LSAGE')
      .usage('$0 <cmd> [args]')
      .option('cwd', {
        desc: 'Manually set CWD',
      })
      .command('release', 'Cut a release', releaseOptions)
      .demandCommand(1, colors.red('Specify the command to run'))
      .recommendCommands()
      .strict()
      .help()
      .alias('help', 'h')
      .version()
      .alias('version', 'v');

    const options = optionsParser.argv;
    const command = options._.shift();

    (new this(options))
      .launch(command)
      .catch(err => {
        if (err instanceof UsageError) {
          optionsParser.showHelp();
        }

        console.error(colors.red(err.constructor.name, ':', err.message));

        if (err instanceof AppError) {
          console.error(colors.gray(err.detailsString));
        }
        process.exitCode = 1;
      });
  }

}
