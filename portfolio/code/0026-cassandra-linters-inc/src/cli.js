#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { analyzeMundane } = require('./rules/mundane');
const { analyzeProphecy } = require('./rules/prophecy');
const { updateLedger, getCount } = require('./ledger');
const { getMessage, getFooter, getTier } = require('./messages');

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('cas: no files specified');
    console.error('usage: cas <file|glob> [--strict] [--json]');
    process.exit(1);
  }

  const strict = args.includes('--strict');
  const json = args.includes('--json');
  const files = args.filter(a => !a.startsWith('--'));

  if (files.length === 0) {
    console.error('cas: no files specified');
    process.exit(1);
  }

  let allFindings = [];

  for (const pattern of files) {
    let matches;
    try {
      matches = await glob(pattern, {
        nodir: true,
        absolute: true,
        ignore: ['**/node_modules/**', '**/.git/**']
      });
    } catch (e) {
      console.error(`cas: error expanding '${pattern}': ${e.message}`);
      continue;
    }

    for (const filePath of matches) {
      let source;
      try {
        source = fs.readFileSync(filePath, 'utf-8');
      } catch (e) {
        console.error(`cas: cannot read '${filePath}': ${e.message}`);
        continue;
      }

      const mundane = analyzeMundane(source, filePath);
      const prophecy = analyzeProphecy(source, filePath);

      allFindings = allFindings.concat(mundane).concat(prophecy);
    }
  }

  // Deduplicate findings by rule + file + line
  const seen = new Set();
  const unique = [];
  for (const f of allFindings) {
    const key = `${f.rule}:${f.file}:${f.line}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(f);
    }
  }

  // Update ledger
  const result = updateLedger(unique);

  // Prepare output
  for (const finding of unique) {
    const count = getCount(result.ledger, finding.rule);
    const message = getMessage(finding.rule, count, finding.context);
    const tier = getTier(finding.rule);
    const severity = tier === 'prophecy' ? 'warning' : 'info';
    const relPath = path.relative(process.cwd(), finding.file);

    finding._message = message;
    finding._severity = severity;
    finding._displayPath = relPath;
  }

  if (json) {
    const output = unique.map(f => ({
      file: f._displayPath,
      line: f.line,
      severity: f._severity,
      tier: getTier(f.rule),
      rule: f.rule,
      message: f._message
    }));
    console.log(JSON.stringify(output, null, 2));
  } else {
    for (const f of unique) {
      console.log(`${f._displayPath}:${f.line}:1 - ${f._severity} - ${f._message}`);
    }

    if (unique.length > 0) {
      console.log('');
    }

    const footer = getFooter(unique.length, result.totalFindings, result.isFirstRun);
    console.log(footer);
  }

  if (strict && unique.length > 0) {
    process.exit(1);
  }
}

main().catch(e => {
  console.error(`cas: fatal error: ${e.message}`);
  process.exit(2);
});
