import { join } from 'path';
import UsageError from '../lib/error/UsageError';
import AppError from '../lib/error/AppError';
import standardVersion from 'standard-version';
import runExternal from '../lib/utils/run';

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
};

export function run(opts, env) {
  if (opts.createRelease && !opts.githubToken) {
    return Promise.reject(new UsageError('Missing option "github-token"'));
  }

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

  return runExternal('git status --short')
    .then(data => {
      if (data) {
        throw new Error('Working directory not clean');
      }
    })
    .then(() => runExternal('git push'))
    .then(() => runExternal('npm run prepublish'))
    .then(() => runExternal('git add -f out'))
    .then(() => runExternal('git add -f docs/api'))
    .then(() => new Promise((resolve, reject) => {
      standardVersion({
        infile: join(__dirname, '../../CHANGELOG.md'),
        firstRelease: options.first,
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
    .then(() => runExternal(['git', 'commit', '-m', '"chore(release): Remove generated files"']))
    .then(() => console.log('Now, create github release', opts.createRelease));
}
