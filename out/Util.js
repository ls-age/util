'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _path = require('path');

var _yargs = require('yargs');

var _yargs2 = _interopRequireDefault(_yargs);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _tildify = require('tildify');

var _tildify2 = _interopRequireDefault(_tildify);

var _UsageError = require('./lib/error/UsageError');

var _UsageError2 = _interopRequireDefault(_UsageError);

var _AppError = require('./lib/error/AppError');

var _AppError2 = _interopRequireDefault(_AppError);

var _release = require('./commands/release');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Util {

  constructor(options = {}) {
    this.options = options;
  }

  launch(command) {
    return this.getEnvironment(this.options.cwd).then(env => {
      this.environment = env;
      this.options = Object.assign({}, env.config, this.options);

      if (process.cwd() !== env.cwd) {
        console.log('Changing CWD to', (0, _tildify2.default)(env.cwd));
        process.chdir(env.cwd);
      }
    }).then(() => this.runCommand(command));
  }

  runCommand(commandName) {
    return require((0, _path.join)(__dirname, 'commands', commandName)).run(this.options, this.environment);
  }

  getEnvironment(cwd = process.cwd()) {
    function findPackage(dir, cb) {
      (0, _fs.readdir)(dir, (err, files) => {
        if (err) {
          cb(err);
        } else {
          const pkgs = files.filter(name => name === 'package.json');

          if (pkgs.length === 1) {
            cb(null, {
              cwd: dir,
              packagePath: (0, _path.join)(dir, 'package.json')
            });
          } else {
            const nextDir = (0, _path.join)(dir, '../');
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
    }).then(result => new Promise((resolve, reject) => {
      try {
        resolve(Object.assign(result, { package: require(result.packagePath) }));
      } catch (e) {
        reject(e);
      }
    })).then(pkgResult => new Promise((resolve, reject) => {
      const result = pkgResult;
      result.config = pkgResult.package.lsage || {};

      const configFilePath = (0, _path.join)(pkgResult.cwd, 'lsage.json');
      (0, _fs.stat)(configFilePath, err => {
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
    const optionsParser = (0, _yargs2.default)(args).env('LSAGE').usage('$0 <cmd> [args]').option('cwd', {
      desc: 'Manually set CWD'
    }).command('release', 'Cut a release', _release.options).demandCommand(1, _chalk2.default.red('Specify the command to run')).recommendCommands().strict().help().alias('help', 'h').version().alias('version', 'v');

    const options = optionsParser.argv;
    const command = options._.shift();

    new this(options).launch(command).catch(err => {
      if (err instanceof _UsageError2.default) {
        optionsParser.showHelp();
      }

      console.error(_chalk2.default.red(err.constructor.name, ':', err.message));

      if (err instanceof _AppError2.default) {
        console.error(_chalk2.default.gray(err.detailsString));
      }
      process.exitCode = 1;
    });
  }

}
exports.default = Util;