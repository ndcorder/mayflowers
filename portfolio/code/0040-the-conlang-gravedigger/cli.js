#!/usr/bin/env node

/**
 * cli.js \u2014 CLI entry point for the Conlang Gravedigger.
 *
 * Orchestrates the six phases and writes the final
 * archaeological report to stdout or a file.
 */

'use strict';

const fs      = require('fs');
const utils   = require('./utils');
const phase1  = require('./phase1-phonology');
const phase2  = require('./phase2-morphology');
const phase3  = require('./phase3-syntax');
const phase4  = require('./phase4-lexicon');
const phase5  = require('./phase5-decay');
const phase6  = require('./phase6-report');

// ── Parse arguments ────────────────────────────────────────────────

const args = utils.parseArgs();
const config = utils.parseConfig({
  seed:             args.seed,
  centuries:        args.centuries,
  lexiconSize:      args.lexicon,
  reportScholars:   args.scholars,
  decayRate:        args.decay_rate,
  preservationRate: args.preservation,
});

const rng = new utils.SeededRandom(config.seed);

console.error('\u2550\u2550\u2550 The Conlang Gravedigger \u2550\u2550\u2550');
console.error('Seed: ' + config.seed);
console.error('Centuries of decay: ' + config.centuries);
console.error('');

// ── Phase 1: Phonology ─────────────────────────────────────────────

console.error('[Phase 1] Generating phonology\u2026');
const phonology = phase1.generatePhonology(config, rng.spawn());
console.error('  Consonants: ' + phonology._meta.consonantCount);
console.error('  Vowels: '     + phonology._meta.vowelCount);
console.error('  Has tone: '   + phonology._meta.hasTone);
console.error('  Has stress: ' + phonology._meta.hasStress);
console.error('');

// ── Phase 2: Morphology ────────────────────────────────────────────

console.error('[Phase 2] Generating morphology\u2026');
const morphology = phase2.generateMorphology(phonology, config, rng.spawn());
console.error('  Type: ' + morphology._meta.morphType);
console.error('  Nominal categories: ' + morphology._meta.nominalCategories.join(', '));
console.error('  Verbal categories: '  + morphology._meta.verbalCategories.join(', '));
console.error('');

// ── Phase 3: Syntax ────────────────────────────────────────────────

console.error('[Phase 3] Generating syntax\u2026');
const syntax = phase3.generateSyntax(phonology, morphology, config, rng.spawn());
console.error('  Basic order: ' + syntax._meta.basicOrder);
console.error('  Ergative: '    + syntax._meta.isErgative);
console.error('');

// ── Phase 4: Lexicon ───────────────────────────────────────────────

console.error('[Phase 4] Generating lexicon\u2026');
const lexicon = phase4.generateLexicon(phonology, morphology, config, rng.spawn());
console.error('  Total entries: ' + lexicon.totalSize);
console.error('  Nouns: ' + lexicon.byPos.nouns + ', Verbs: ' + lexicon.byPos.verbs);
console.error('');

// ── Phase 5: Decay ─────────────────────────────────────────────────

console.error('[Phase 5] Simulating decay\u2026');
const decay = phase5.simulateDecay(phonology, morphology, syntax, lexicon, config, rng.spawn());
console.error('  Total changes: ' + decay.summary.totalChanges);
console.error('  Fragments: '     + decay.summary.fragmentCount);
console.error('  Legible: '       + decay.summary.legibleFragments);
console.error('');

// ── Phase 6: Report ────────────────────────────────────────────────

console.error('[Phase 6] Generating archaeological report\u2026');
const report = phase6.generateReport(phonology, morphology, syntax, lexicon, decay, config, rng.spawn());
console.error('  Title: '    + report.title);
console.error('  Scholars: ' + report.scholars.map(s => s.name).join(', '));
console.error('');

// ── Format and output ──────────────────────────────────────────────

const outputText = formatReport(report, phonology, morphology, decay);

if (args.output) {
  fs.writeFileSync(args.output, outputText, 'utf8');
  console.error('Report written to: ' + args.output);
} else {
  console.log(outputText);
}

// Optional structured JSON dump
if (args.json) {
  const json = {
    config,
    phonology: {
      consonantCount: phonology._meta.consonantCount,
      vowelCount:     phonology._meta.vowelCount,
      consonants:     phonology.allConsonants,
      vowels:         phonology.allVowels,
      hasTone:        phonology._meta.hasTone,
      stress:         phonology.prosody.stress,
      gaps:           phonology.consonants.gaps,
    },
    morphology: {
      type:               morphology._meta.morphType,
      nominalCategories:  morphology._meta.nominalCategories,
      verbalCategories:   morphology._meta.verbalCategories,
    },
    syntax: {
      basicOrder: syntax._meta.basicOrder,
      isErgative: syntax._meta.isErgative,
    },
    lexicon: { totalSize: lexicon.totalSize },
    decay:   decay.summary,
  };
  fs.writeFileSync(args.json, JSON.stringify(json, null, 2), 'utf8');
  console.error('JSON data written to: ' + args.json);
}

// ── Report formatter ───────────────────────────────────────────────

function formatReport(report, phonology, morphology, decay) {
  const lines = [];
  const bar   = '\u2550'.repeat(72);

  lines.push(bar);
  lines.push('');
  lines.push(report.title);
  lines.push('');
  lines.push(bar);
  lines.push('');
  lines.push('ABSTRACT');
  lines.push('');
  lines.push(report.abstract);
  lines.push('');
  lines.push('\u2500'.repeat(72));
  lines.push('');

  for (const section of report.sections) {
    lines.push(section.content);
    lines.push('\u2500'.repeat(72));
    lines.push('');
  }

  // Appendix A: phonological inventory
  lines.push('APPENDIX A: PHONOLOGICAL INVENTORY');
  lines.push('');
  lines.push(phonology.formatted);
  lines.push('');

  // Appendix B: form changes
  if (decay.formMapping && decay.formMapping.length > 0) {
    lines.push('APPENDIX B: FORM CHANGES');
    lines.push('');
    for (const m of decay.formMapping.slice(0, 15)) {
      lines.push('  ' + m.original + ' \u2192 ' + m.decayed + ' (' + m.gloss + ')');
    }
    lines.push('');
  }

  lines.push('BIBLIOGRAPHY');
  lines.push('');
  for (const bib of report.bibliography) {
    lines.push('  ' + bib);
  }
  lines.push('');
  lines.push(bar);
  lines.push('END OF REPORT');
  lines.push(bar);

  return lines.join('\n');
}
