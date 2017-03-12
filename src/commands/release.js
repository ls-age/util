import { readFile } from 'fs';
import { join } from 'path';
import { prompt } from 'inquirer';
import standardVersion from 'standard-version';
import githubReleaser from 'conventional-github-releaser';
import UsageError from '../lib/error/UsageError';
import runExternal from '../lib/utils/run';
import runStep from '../lib/utils/runStep';

export const options = {
  first: {
    desc: 'Release without dumping new version',
    type: 'boolean',
    default: false,
  },
  major: {
    desc: 'Release as next major version',
    type: 'boolean',
  },
  minor: {
    desc: 'Release as next minor version',
    type: 'boolean',
  },
  patch: {
    desc: 'Release as next patch version',
    type: 'boolean',
  },
  pre: {
    desc: 'Release as prerelease',
    type: 'boolean',
  },
  'github-token': {
    desc: 'GitHub token to use',
    type: 'string',
    alias: 't',
  },
  'create-release': {
    desc: 'Create GitHub release',
    type: 'boolean',
    default: true,
  },
  yes: {
    desc: 'Publish without confirmation',
    type: 'boolean',
    default: false,
  },
};

export function prepareRelease() {
  return runExternal('git status --short')
    .then(data => {
      if (data) {
        throw new Error('Working directory not clean');
      }
    })
    .then(() => runExternal('git push'))
    .then(() => runExternal('npm run prepublish'));
}

export function createRelease(opts, releaseAs) {
  return runExternal('npm run prepublish')
    .then(() => runExternal('git add -f out'))
    .then(() => runExternal('git add -f docs/api'))
    .then(() => new Promise((resolve, reject) => {
      standardVersion({
        infile: join(process.cwd(), 'CHANGELOG.md'),
        firstRelease: opts.first,
        releaseAs,
        silent: true,
        commitAll: true,
      }, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }))
    .then(() => runExternal('git rm -rf out'))
    .then(() => runExternal('git rm -rf docs/api'))
    .then(() => runExternal(['git', 'commit', '-m', 'chore(release): Remove generated files [ci skip]']));
}

export function confirmPublish(opts) {
  if (opts.yes) {
    return Promise.resolve(true);
  }

  return prompt([
    {
      type: 'confirm',
      name: 'release',
      message: 'Publish release?',
    },
  ])
    .then(answers => answers.release);
}

export function publishRelease(opts) {
  return runExternal('git push')
    .then(() => runExternal('git push --tags'))
    .then(() => new Promise((resolve, reject) => {
      githubReleaser({
        type: 'oauth',
        token: opts.githubToken,
      }, { preset: 'angular' }, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    }));
}

function undoRelease(env) {
  return new Promise((resolve, reject) => {
    readFile(env.packagePath, 'utf8', (readErr, contents) => {
      if (readErr) {
        reject(readErr);
      } else {
        try {
          resolve(JSON.parse(contents).version);
        } catch (e) {
          reject(e);
        }
      }
    });
  })
    .then(version => runExternal(`git tag -d v${version}`)) // Delete tag
    .then(() => runExternal('git reset --hard HEAD~2')); // Undo release commits
}

export function run(opts, env) {
  // Validate required options
  if (opts.createRelease && !opts.githubToken) {
    return Promise.reject(new UsageError('Missing option "github-token"'));
  }

  // Evaluate releaseAs
  let releaseAs;
  const releaseTypeOptions = [opts.major, opts.minor, opts.patch, opts.pre];
  const chosenReleaseType = ['major', 'minor', 'patch', 'prerelease']
    .filter((type, i) => releaseTypeOptions[i]);

  if (chosenReleaseType.length > 1) {
    return Promise.reject(new UsageError(
      `Cannot release with multiple version types (${chosenReleaseType.join(', ')} specified)`
    ));
  } else if (chosenReleaseType.length === 1) {
    releaseAs = chosenReleaseType[0];
  }

  return runStep('Prepare release', this.prepareRelease(opts))
    .then(() => runStep('Create release', createRelease(opts, releaseAs)))
    .then(() => confirmPublish(opts))
    .then(publish => {
      if (publish) {
        return runStep('Publish release', publishRelease(opts));
      }

      return runStep('Undo release', undoRelease(env));
    });
}
