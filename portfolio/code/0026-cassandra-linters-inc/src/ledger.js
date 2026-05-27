'use strict';

const fs = require('fs');
const path = require('path');

const LEDGER_FILE = path.join(process.cwd(), '.cas-counts.json');
const LEDGER_VERSION = 1;

function createEmptyLedger() {
  return {
    version: LEDGER_VERSION,
    createdAt: new Date().toISOString(),
    lastRun: new Date().toISOString(),
    totalRuns: 0,
    totalFindings: 0,
    counts: {}
  };
}

function validateLedger(data) {
  if (!data || typeof data !== 'object') {
    return createEmptyLedger();
  }
  if (data.version !== LEDGER_VERSION) {
    return createEmptyLedger();
  }
  if (!data.counts || typeof data.counts !== 'object') {
    data.counts = {};
  }
  if (typeof data.totalRuns !== 'number') {
    data.totalRuns = 0;
  }
  if (typeof data.totalFindings !== 'number') {
    data.totalFindings = 0;
  }
  return data;
}

function readLedger() {
  try {
    const raw = fs.readFileSync(LEDGER_FILE, 'utf-8');
    const data = JSON.parse(raw);
    return {
      ledger: validateLedger(data),
      isFirstRun: false
    };
  } catch (e) {
    if (e.code === 'ENOENT') {
      return {
        ledger: createEmptyLedger(),
        isFirstRun: true
      };
    }
    if (e instanceof SyntaxError) {
      return {
        ledger: createEmptyLedger(),
        isFirstRun: false
      };
    }
    throw e;
  }
}

function writeLedger(ledger) {
  const data = JSON.stringify(ledger, null, 2);
  fs.writeFileSync(LEDGER_FILE, data, 'utf-8');
}

function getCount(ledger, ruleName) {
  if (!ledger || !ledger.counts) return 0;
  return ledger.counts[ruleName] || 0;
}

/**
 * Increment counts for all findings and persist the ledger.
 * Counts are tracked by rule name, not by individual occurrence,
 * so the same mistake type accumulates across the project's lifetime.
 */
function updateLedger(findings) {
  const { ledger, isFirstRun } = readLedger();

  ledger.lastRun = new Date().toISOString();
  ledger.totalRuns += 1;

  let newFindings = 0;

  for (const finding of findings) {
    const key = finding.rule;
    if (!key) continue;

    if (!ledger.counts[key]) {
      ledger.counts[key] = 0;
    }
    ledger.counts[key] += 1;
    newFindings += 1;
  }

  ledger.totalFindings += newFindings;

  writeLedger(ledger);

  return {
    ledger,
    isFirstRun,
    newFindings,
    totalFindings: ledger.totalFindings,
    totalRuns: ledger.totalRuns
  };
}

module.exports = {
  readLedger,
  writeLedger,
  updateLedger,
  getCount,
  createEmptyLedger,
  LEDGER_FILE
};
