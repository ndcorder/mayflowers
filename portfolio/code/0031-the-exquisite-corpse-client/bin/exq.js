#!/usr/bin/env node
'use strict';

const { Command } = require('commander');
const repo = require('../src/repo');
const seed = require('../src/seed');
const path = require('path');

const program = new Command();

program
  .name('exq')
  .description('Forensic analysis of a contested will')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize the repository')
  .option('-f, --force', 'Overwrite existing repository')
  .action((opts) => {
    if (repo.repoExists() && !opts.force) {
      const repoPath = repo.getRepoPath();
      console.log(`Repository exists at: ${repoPath}`);
      console.log('Use --force to overwrite.');
      return;
    }

    const result = seed.seedRepo(opts.force);
    console.log(`Repository initialized at: ${result.path}`);
    console.log(`${result.commitCount} commits across ${result.authors.length} contributors.`);
    console.log('');
    console.log('Enter the repository:');
    console.log(`  cd ${result.path}`);
    console.log('');
    console.log('Begin reading:');
    console.log('  git log --oneline --all');
    console.log('  git log --format="%H %an %aI %s" --all');
    console.log('  cat document.md');
  });

program
  .command('log')
  .description('Show commit history')
  .option('-n, --number <count>', 'Number of commits', '50')
  .option('-a, --all', 'Show all branches')
  .option('--author <name>', 'Filter by author')
  .action((opts) => {
    if (!repo.repoExists()) {
      console.log('No repository found. Run: exq init');
      return;
    }

    const entries = repo.getLog({ count: parseInt(opts.number) });
    if (entries.length === 0) {
      console.log('No commits found.');
      return;
    }

    for (const entry of entries) {
      if (opts.author && !entry.author.toLowerCase().includes(opts.author.toLowerCase())) {
        continue;
      }
      const short = entry.hash.substring(0, 7);
      const date = new Date(entry.date);
      const dateStr = date.toISOString().replace('T', ' ').substring(0, 16);
      console.log(`${short}  ${entry.author.padEnd(20)} ${dateStr}  ${entry.message}`);
    }
  });

program
  .command('show <hash>')
  .description('Show commit details')
  .option('-s, --stat', 'Show diffstat')
  .action((hash, opts) => {
    if (!repo.repoExists()) {
      console.log('No repository found. Run: exq init');
      return;
    }

    const short = hash.substring(0, 7);
    const commit = repo.getCommit(hash);
    if (!commit) {
      console.log(`Commit ${short} not found.`);
      return;
    }

    const date = new Date(commit.date);
    const dateStr = date.toISOString().replace('T', ' ').substring(0, 16);

    console.log(`commit ${commit.hash}`);
    console.log(`Author: ${commit.author}`);
    console.log(`Date:   ${dateStr}`);
    console.log('');
    console.log(`    ${commit.message}`);
    console.log('');

    if (opts.stat) {
      const diff = repo.getDiff(hash, { stat: true });
      if (diff) {
        console.log(diff);
      }
    } else {
      const diff = repo.getDiff(hash, { color: false });
      if (diff) {
        console.log(diff);
      }
    }
  });

program
  .command('blame [line]')
  .description('Show line-level attribution')
  .action((line) => {
    if (!repo.repoExists()) {
      console.log('No repository found. Run: exq init');
      return;
    }

    if (line) {
      const result = repo.getBlameLine(parseInt(line));
      console.log(result);
    } else {
      const result = repo.getBlame();
      console.log(result);
    }
  });

program
  .command('read')
  .description('Read the current document')
  .action(() => {
    if (!repo.repoExists()) {
      console.log('No repository found. Run: exq init');
      return;
    }

    const content = repo.readFile();
    if (content) {
      console.log(content);
    } else {
      console.log('Document not found.');
    }
  });

program
  .command('branches')
  .description('List all branches')
  .action(() => {
    if (!repo.repoExists()) {
      console.log('No repository found. Run: exq init');
      return;
    }

    const branches = repo.getAllBranches();
    const current = repo.getCurrentBranch();

    for (const branch of branches) {
      if (branch === current) {
        console.log(`* ${branch}`);
      } else {
        console.log(`  ${branch}`);
      }
    }

    console.log('');
    console.log(`Current: ${current}`);
  });

program
  .command('checkout <branch>')
  .description('Switch branches')
  .action((branch) => {
    if (!repo.repoExists()) {
      console.log('No repository found. Run: exq init');
      return;
    }

    try {
      repo.checkoutBranch(branch);
      console.log(`Switched to branch '${branch}'`);
    } catch (err) {
      console.log(`Error: ${err.message}`);
    }
  });

program
  .command('diff <hash>')
  .description('Show changes in a commit')
  .alias('d')
  .action((hash) => {
    if (!repo.repoExists()) {
      console.log('No repository found. Run: exq init');
      return;
    }

    const diff = repo.getDiff(hash);
    if (diff) {
      console.log(diff);
    }
  });

program
  .command('tags')
  .description('List all tags')
  .action(() => {
    if (!repo.repoExists()) {
      console.log('No repository found. Run: exq init');
      return;
    }

    const tags = repo.getTags();
    if (tags.length === 0) {
      console.log('No tags found.');
    } else {
      for (const tag of tags) {
        console.log(tag);
      }
    }
  });

program
  .command('path')
  .description('Show repository location')
  .action(() => {
    console.log(repo.getRepoPath());
  });

program
  .command('reset')
  .description('Delete the repository and start over')
  .action(() => {
    const fs = require('fs');
    const repoPath = repo.getRepoPath();
    if (fs.existsSync(repoPath)) {
      fs.rmSync(repoPath, { recursive: true, force: true });
      console.log('Repository deleted. Run: exq init');
    } else {
      console.log('No repository found.');
    }
  });

program.parse();
