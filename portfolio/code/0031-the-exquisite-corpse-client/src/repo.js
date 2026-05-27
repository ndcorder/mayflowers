'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const REPO_DIR_NAME = 'exquisite-corpse';

function getBaseDir() {
  return path.join(os.homedir(), '.exq');
}

function getRepoPath() {
  return path.join(getBaseDir(), REPO_DIR_NAME);
}

function repoExists() {
  const repoPath = getRepoPath();
  return fs.existsSync(path.join(repoPath, '.git'));
}

function ensureBaseDir() {
  const baseDir = getBaseDir();
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
}

function createRepo(force = false) {
  const repoPath = getRepoPath();

  if (repoExists() && !force) {
    return repoPath;
  }

  if (fs.existsSync(repoPath)) {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }

  ensureBaseDir();
  fs.mkdirSync(repoPath, { recursive: true });

  git('init', repoPath);
  git('config user.email "exq@localhost"', repoPath);
  git('config user.name "exq"', repoPath);

  return repoPath;
}

function exec(command, cwd) {
  const workingDir = cwd || getRepoPath();
  try {
    const result = execSync(command, {
      cwd: workingDir,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { success: true, output: result.trim() };
  } catch (err) {
    return {
      success: false,
      output: err.stdout ? err.stdout.trim() : '',
      error: err.stderr ? err.stderr.trim() : err.message
    };
  }
}

function git(command, cwd) {
  const result = exec(`git ${command}`, cwd);
  if (!result.success) {
    throw new Error(`Git command failed: git ${command}\n${result.error}`);
  }
  return result.output;
}

function createCommit(options) {
  const {
    authorName,
    authorEmail,
    date,
    message,
    content,
    filePath = 'document.md',
    branch = null,
    tag = null
  } = options;

  const repoPath = getRepoPath();
  const fullPath = path.join(repoPath, filePath);

  if (branch) {
    const branches = getAllBranches();
    if (!branches.includes(branch)) {
      git(`checkout -b ${branch}`, repoPath);
    } else {
      git(`checkout ${branch}`, repoPath);
    }
  }

  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content, 'utf-8');

  git(`add "${filePath}"`, repoPath);

  const authorFlag = `--author="${authorName} <${authorEmail}>"`;
  const dateFlag = `--date="${date}"`;
  const messageFlag = `-m "${message.replace(/"/g, '\\"')}"`;

  const env = {
    ...process.env,
    GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_DATE: date
  };

  try {
    execSync(`git commit ${authorFlag} ${dateFlag} --allow-empty ${messageFlag}`, {
      cwd: repoPath,
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      env
    });
  } catch (err) {
    const stderr = err.stderr || '';
    const stdout = err.stdout || '';
    if (!stderr.includes('nothing to commit') && !stdout.includes('nothing to commit')) {
      throw err;
    }
  }

  if (tag) {
    try {
      const tagEnv = { ...process.env, GIT_COMMITTER_DATE: date };
      execSync(`git tag -a "${tag}" -m "${tag}"`, {
        cwd: repoPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
        env: tagEnv
      });
    } catch (_) {
      // Tag may already exist
    }
  }

  return getHeadCommit();
}

function getHeadCommit() {
  try {
    return git('rev-parse HEAD');
  } catch (_) {
    return null;
  }
}

function getLog(options = {}) {
  const { count = 100, format = null } = options;

  const defaultFormat = '%H|%an|%ae|%aI|%s';
  const formatStr = format || defaultFormat;

  let command = `log --format="${formatStr}" --all --date-order`;
  if (count) {
    command += ` -n ${count}`;
  }

  try {
    const output = git(command);
    if (!output) return [];

    return output.split('\n').filter(Boolean).map(line => {
      if (!format) {
        const [hash, author, email, date, ...msgParts] = line.split('|');
        return {
          hash,
          author,
          email,
          date,
          message: msgParts.join('|')
        };
      }
      return line;
    });
  } catch (_) {
    return [];
  }
}

function getCommit(hash) {
  try {
    const output = git(`show --format="%H|%an|%ae|%aI|%s" --stat ${hash}`);
    const lines = output.split('\n');
    const [metaLine] = lines;
    const [fullHash, author, email, date, ...msgParts] = metaLine.split('|');

    const fileLine = lines.find(l => l.includes('file changed') || l.includes('files changed'));
    const fileStats = fileLine || '';

    return {
      hash: fullHash,
      author,
      email,
      date,
      message: msgParts.join('|'),
      fileStats
    };
  } catch (_) {
    return null;
  }
}

function getDiff(hash, options = {}) {
  const { stat = false, color = false } = options;

  let command = `show ${hash}`;
  if (stat) {
    command += ' --stat';
  }
  if (!color) {
    command += ' --no-color';
  }
  command += ' --format=""';

  try {
    return git(command);
  } catch (_) {
    return '';
  }
}

function getBlame(filePath = 'document.md') {
  try {
    return git(`blame "${filePath}"`);
  } catch (_) {
    return '';
  }
}

function getBlameLine(lineNumber, filePath = 'document.md') {
  try {
    return git(`blame -L ${lineNumber},${lineNumber} "${filePath}"`);
  } catch (_) {
    return '';
  }
}

function getAllBranches() {
  try {
    const output = git('branch');
    return output
      .split('\n')
      .filter(Boolean)
      .map(b => b.replace(/^\*?\s+/, ''));
  } catch (_) {
    return [];
  }
}

function getTags() {
  try {
    const output = git('tag -l');
    return output.split('\n').filter(Boolean);
  } catch (_) {
    return [];
  }
}

function checkoutBranch(branch) {
  git(`checkout ${branch}`);
}

function getCurrentBranch() {
  try {
    return git('rev-parse --abbrev-ref HEAD');
  } catch (_) {
    return 'HEAD detached';
  }
}

function readFile(filePath = 'document.md') {
  const fullPath = path.join(getRepoPath(), filePath);
  try {
    return fs.readFileSync(fullPath, 'utf-8');
  } catch (_) {
    return null;
  }
}

function deleteBranch(branchName) {
  const current = getCurrentBranch();
  if (current === branchName) {
    git('checkout main');
  }
  git(`branch -D ${branchName}`);
}

function createBranch(branchName, startPoint = 'HEAD') {
  git(`branch ${branchName} ${startPoint}`);
}

function getRepoStats() {
  const entries = getLog({ count: 0 });
  const branches = getAllBranches();
  const tags = getTags();

  const authorSet = new Set(entries.map(l => l.author));

  return {
    totalCommits: entries.length,
    authors: Array.from(authorSet),
    branches: branches.length,
    tags: tags.length,
    path: getRepoPath()
  };
}

module.exports = {
  getRepoPath,
  getBaseDir,
  repoExists,
  createRepo,
  createCommit,
  readFile,
  getLog,
  getCommit,
  getDiff,
  getBlame,
  getBlameLine,
  getAllBranches,
  getTags,
  checkoutBranch,
  getCurrentBranch,
  getRepoStats,
  deleteBranch,
  createBranch,
  git,
  exec
};
