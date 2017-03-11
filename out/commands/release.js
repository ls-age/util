'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.options = undefined;
exports.prepareRelease = prepareRelease;
exports.createRelease = createRelease;
exports.confirmPublish = confirmPublish;
exports.publishRelease = publishRelease;
exports.run = run;

var _path = require('path');

var _inquirer = require('inquirer');

var _conventionalGithubReleaser = require('conventional-github-releaser');

var _conventionalGithubReleaser2 = _interopRequireDefault(_conventionalGithubReleaser);

var _UsageError = require('../lib/error/UsageError');

var _UsageError2 = _interopRequireDefault(_UsageError);

var _AppError = require('../lib/error/AppError');

var _AppError2 = _interopRequireDefault(_AppError);

var _standardVersion = require('standard-version');

var _standardVersion2 = _interopRequireDefault(_standardVersion);

var _run = require('../lib/utils/run');

var _run2 = _interopRequireDefault(_run);

var _runStep = require('../lib/utils/runStep');

var _runStep2 = _interopRequireDefault(_runStep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const options = exports.options = {
  first: {
    desc: 'Release without dumping new version',
    type: 'boolean',
    default: false
  },
  major: {
    desc: 'Release as next major version',
    type: 'boolean'
  },
  minor: {
    desc: 'Release as next minor version',
    type: 'boolean'
  },
  patch: {
    desc: 'Release as next patch version',
    type: 'boolean'
  },
  pre: {
    desc: 'Release as prerelease',
    type: 'boolean'
  },
  'github-token': {
    desc: 'GitHub token to use',
    type: 'string',
    alias: 't'
  },
  'create-release': {
    desc: 'Create GitHub release',
    type: 'boolean',
    default: true
  },
  yes: {
    desc: 'Publish without confirmation',
    type: 'boolean',
    default: false
  }
};

function prepareRelease() {
  return (0, _run2.default)('git status --short').then(data => {
    if (data) {
      throw new Error('Working directory not clean');
    }
  }).then(() => (0, _run2.default)('git push')).then(() => (0, _run2.default)('npm run prepublish'));
}

function createRelease(opts, releaseAs) {
  return (0, _run2.default)('git add -f out').then(() => (0, _run2.default)('git add -f docs/api')).then(() => new Promise((resolve, reject) => {
    (0, _standardVersion2.default)({
      infile: (0, _path.join)(__dirname, '../../CHANGELOG.md'),
      firstRelease: opts.first,
      releaseAs,
      silent: true,
      commitAll: true
    }, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  })).then(() => (0, _run2.default)('git rm -rf out')).then(() => (0, _run2.default)('git rm -rf docs/api')).then(() => (0, _run2.default)(['git', 'commit', '-m', '"chore(release): Remove generated files"']));
}

function confirmPublish(opts) {
  if (opts.yes) {
    return Promise.resolve(true);
  }

  return (0, _inquirer.prompt)([{
    type: 'confirm',
    name: 'release',
    message: 'Publish release?'
  }]).then(answers => answers.release);
}

function publishRelease(opts) {
  return (0, _run2.default)('git push').then(() => (0, _run2.default)('git push --tags')).then(() => new Promise((resolve, reject) => {
    (0, _conventionalGithubReleaser2.default)({
      type: 'oauth',
      token: opts.githubToken
    }, { preset: 'angular' }, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  }));
}

function run(opts, env) {
  // Validate required options
  if (opts.createRelease && !opts.githubToken) {
    return Promise.reject(new _UsageError2.default('Missing option "github-token"'));
  }

  // Evaluate releaseAs
  let releaseAs;
  const releaseTypeOptions = [opts.major, opts.minor, opts.patch, opts.pre];
  const chosenReleaseType = ['major', 'minor', 'patch', 'prerelease'].filter((type, i) => releaseTypeOptions[i]);

  if (chosenReleaseType.length > 1) {
    return Promise.reject(new _UsageError2.default(`Cannot release with multiple version types (${ chosenReleaseType.join(', ') } specified)`));
  } else if (chosenReleaseType.length === 1) {
    releaseAs = chosenReleaseType[0];
  }

  return (0, _runStep2.default)('Prepare release', this.prepareRelease(opts)).then(() => (0, _runStep2.default)('Create release', createRelease(opts, releaseAs))).then(() => confirmPublish(opts)).then(publish => {
    if (publish) {
      return (0, _runStep2.default)('Publish release', publishRelease(opts));
    } else {
      return (0, _runStep2.default)('Undo release', Promise.resolve());
    }
  });
}