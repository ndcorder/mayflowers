/**
 * phase5-decay.js
 *
 * Simulates centuries of transmission loss:
 * sound changes, morphological leveling, semantic drift.
 * Produces corrupted fragments with full provenance tracking.
 */

const {
  SeededRandom,
  weightedChoice,
  deepClone,
  ChangeLog,
  SOUND_CHANGE_TYPES,
} = require('./utils');

// ── Main entry ────────────────────────────────────────────────────

function simulateDecay(phonology, morphology, syntax, lexicon, config, rng) {
  if (!rng) rng = new SeededRandom(config.seed || Date.now());
  const pr               = rng.spawn();
  const centuries        = config.centuries || 600;
  const decayRate        = config.decayRate || 0.15;
  const preservationRate = config.preservationRate || 0.30;

  const changeLog = new ChangeLog();
  const snapshots = [];

  // Deep-clone everything we will mutate
  const decayedEntries   = deepClone(lexicon.entries);
  const decayedParadigms = deepClone(morphology.sampleParadigms);

  const activeSoundChanges = [];

  // ── Walk through time in 50-century steps ───────────────────────
  for (let century = 0; century < centuries; century += 50) {
    const changesThisPeriod = [];

    // Markedness-driven changes
    if (phonology.markedness && phonology.markedness.mostVulnerable) {
      for (const vuln of phonology.markedness.mostVulnerable) {
        if (pr.chance(decayRate * 0.4)) {
          const change = makeSoundChange(vuln, pr.spawn());
          if (change) {
            changesThisPeriod.push(change);
            changeLog.add(century, 'sound_change', change.description, []);
          }
        }
      }
    }

    // Random sound changes
    if (pr.chance(decayRate * 0.8)) {
      const changeType = weightedChoice(
        SOUND_CHANGE_TYPES.map(s => ({ item: s, weight: s.frequency * 100 })),
        pr.spawn(),
      );
      const change = makeRandomSoundChange(changeType, phonology, pr.spawn());
      if (change) {
        changesThisPeriod.push(change);
        changeLog.add(century, 'sound_change', change.description, []);
      }
    }

    // Morphological decay
    if (pr.chance(decayRate * 0.3)) {
      const morphDesc = pr.chance(0.5)
        ? 'Paradigm leveling: irregular forms regularized'
        : 'Syncretism: previously distinct forms merge';
      changeLog.add(century, 'morphological_decay', morphDesc, []);
    }

    // Semantic drift
    if (pr.chance(decayRate * 0.2)) {
      const driftTypes = ['narrowing', 'broadening', 'pejoration', 'metaphorical extension'];
      const drift = driftTypes[pr.int(0, driftTypes.length - 1)];
      changeLog.add(century, 'semantic_drift', 'Lexical item undergoes ' + drift, []);
    }

    // Apply accumulated changes to all forms
    for (const change of changesThisPeriod) {
      applyChangeToAll(decayedEntries, decayedParadigms, change);
    }
    activeSoundChanges.push(...changesThisPeriod);

    // Snapshot every 100 centuries
    if (century % 100 === 0) {
      snapshots.push({
        century,
        soundChangeCount: activeSoundChanges.length,
        avgFormLength: decayedEntries.length > 0
          ? (decayedEntries.reduce((s, e) => s + e.form.length, 0) / decayedEntries.length).toFixed(1)
          : 0,
      });
    }
  }

  // ── Generate surviving fragments ────────────────────────────────
  const fragments = generateFragments(
    decayedEntries, decayedParadigms, phonology, morphology, syntax,
    preservationRate, pr.spawn(),
  );

  // Build original → decayed mapping for the report
  const formMapping = buildFormMapping(
    lexicon.entries, decayedEntries,
    morphology.sampleParadigms, decayedParadigms,
  );

  const summary = changeLog.summarize();

  return {
    changeLog: changeLog.getAll(),
    fragments,
    snapshots,
    formMapping,
    summary: {
      totalChanges:    summary.totalChanges,
      centurySpan:     summary.centurySpan,
      typeCounts:      summary.typeCounts,
      originalLexiconSize: lexicon.entries.length,
      fragmentCount:   fragments.length,
      legibleFragments: fragments.filter(f => f.legibility === 'clear' || f.legibility === 'partial').length,
    },
    _meta: { phase: 5, centuries, decayRate },
  };
}

// ── Sound change factories ────────────────────────────────────────

function makeSoundChange(vulnerability, rng) {
  const changes = {
    voiced_stops: {
      from: ['b', 'd', 'g'],
      to:   ['p', 't', 'k'],
      description: 'Voiced stops devoice in word-final position',
      type: 'final_devoicing',
    },
    affricates: {
      from: ['t͡s', 'd͡z', 't͡ʃ', 'd͡ʒ'],
      to:   ['s',  'z',  'ʃ',  'ʒ'],
      description: 'Affricates simplify to fricatives',
      type: 'affricate_simplification',
    },
    retroflex: {
      from: ['ʈ', 'ɖ', 'ʂ', 'ʐ', 'ɳ', 'ɭ'],
      to:   ['t', 'd', 's', 'z', 'n', 'l'],
      description: 'Retroflex consonants merge with alveolars',
      type: 'retroflex_merger',
    },
    uvular: {
      from: ['q', 'ɢ', 'χ', 'ʁ', 'ɴ', 'ʀ'],
      to:   ['k', 'g', 'x', 'ɣ', 'ŋ', 'r'],
      description: 'Uvular consonants merge with velars',
      type: 'uvular_merger',
    },
    rounded_front_vowels: {
      from: ['y', 'ø', 'œ', 'ʏ'],
      to:   ['i', 'e', 'ɛ', 'ɪ'],
      description: 'Rounded front vowels unround',
      type: 'vowel_unrounding',
    },
    lateral: {
      from: ['l'],
      to:   ['r'],
      description: 'Lateral merges with rhotic',
      type: 'lateral_merger',
    },
  };
  return changes[vulnerability] || null;
}

function makeRandomSoundChange(changeType, phonology, rng) {
  const t = changeType.type;

  if (t === 'lenition') {
    const stops = phonology.allConsonants.filter(c => ['p','t','k','b','d','g'].includes(c));
    if (stops.length === 0) return null;
    return {
      from: stops,
      to:   stops.map(s => fricativize(s)),
      description: 'Intervocalic consonant lenition',
      type: 'lenition',
    };
  }
  if (t === 'deletion') {
    return {
      from: null,
      to:   null,
      description: 'Unstressed vowel deletion in polysyllabic words',
      type: 'syncope',
    };
  }
  if (t === 'merger') {
    const C = phonology.allConsonants;
    if (C.length < 4) return null;
    const a = C[rng.int(0, C.length - 1)];
    const b = C[rng.int(0, C.length - 1)];
    if (a === b) return null;
    return { from: [a], to: [b], description: 'Merger of /' + a + '/ and /' + b + '/', type: 'merger' };
  }
  if (t === 'palatalization') {
    return {
      from: ['k', 'g'],
      to:   ['t͡ʃ', 'd͡ʒ'],
      description: 'Velars palatalize before front vowels',
      type: 'palatalization',
    };
  }
  if (t === 'debuccalization') {
    const sibilants = phonology.allConsonants.filter(c => ['s','z','ʃ','ʒ'].includes(c));
    if (sibilants.length === 0) return null;
    return {
      from: sibilants,
      to:   sibilants.map(() => 'h'),
      description: 'Sibilant debuccalization to /h/',
      type: 'debuccalization',
    };
  }

  // Generic fallback
  return { from: null, to: null, description: changeType.description, type: t };
}

function fricativize(stop) {
  const map = { p: 'f', b: 'v', t: 'θ', d: 'ð', k: 'x', g: 'ɣ' };
  return map[stop] || stop;
}

// ── Apply changes to forms ────────────────────────────────────────

function applyChangeToAll(entries, paradigms, change) {
  if (!change.from || !change.to) return;
  for (let i = 0; i < change.from.length; i++) {
    const from = change.from[i];
    const to   = change.to[i];
    if (!from || !to) continue;
    for (const entry of entries) {
      entry.form = applyChangeToForm(entry.form, from, to, change.type);
    }
    for (const para of paradigms) {
      for (const key of Object.keys(para.forms)) {
        para.forms[key].form = applyChangeToForm(para.forms[key].form, from, to, change.type);
      }
    }
  }
}

function applyChangeToForm(form, from, to, type) {
  if (type === 'final_devoicing') {
    return form.endsWith(from) ? form.slice(0, -from.length) + to : form;
  }
  // General: replace all occurrences
  return form.split(from).join(to);
}

// ── Fragment generation ───────────────────────────────────────────

function generateFragments(decayedEntries, decayedParadigms, phonology, morphology, syntax,
                            preservationRate, rng) {
  const fragments = [];

  // Lexical fragments
  for (const entry of decayedEntries) {
    if (rng.chance(preservationRate)) {
      const confidence = rng.float() * 0.5 + 0.3;
      const corrupted  = rng.chance(0.3) ? corruptForm(entry.form, rng) : entry.form;
      fragments.push({
        original:    entry.gloss,
        form:        corrupted,
        pos:         entry.pos,
        legibility:  confidence > 0.7 ? 'clear' : confidence > 0.5 ? 'partial' : 'faint',
        confidence,
        source:      'lexicon',
        cultural:    entry.cultural || false,
      });
    }
  }

  // Paradigm fragments
  for (const para of decayedParadigms) {
    for (const [key, formData] of Object.entries(para.forms)) {
      if (rng.chance(preservationRate * 0.6)) {
        fragments.push({
          original:   key,
          form:       formData.form,
          pos:        para.type,
          legibility: rng.chance(0.6) ? 'partial' : 'faint',
          confidence: rng.float() * 0.3 + 0.2,
          source:     'paradigm',
        });
      }
    }
  }

  // Phrase fragments (word pairs)
  const nouns = decayedEntries.filter(e => e.pos === 'noun');
  const verbs = decayedEntries.filter(e => e.pos === 'verb');
  const numPhrases = Math.min(8, Math.floor(nouns.length * 0.1));

  for (let i = 0; i < numPhrases; i++) {
    if (rng.chance(preservationRate * 0.3) && nouns.length > 0 && verbs.length > 0) {
      const n = nouns[rng.int(0, nouns.length - 1)];
      const v = verbs[rng.int(0, verbs.length - 1)];
      const isVerbFinal = ['SOV', 'OSV'].includes(syntax.wordOrder.basic);
      const phrase = isVerbFinal ? n.form + ' ' + v.form : v.form + ' ' + n.form;
      fragments.push({
        original:   n.gloss + ' + ' + v.gloss,
        form:       phrase,
        pos:        'phrase',
        legibility: 'faint',
        confidence: rng.float() * 0.3 + 0.1,
        source:     'phrase',
      });
    }
  }

  return fragments;
}

/** Introduce random corruption: deletions, uncertain characters, parentheticals. */
function corruptForm(form, rng) {
  const chars = form.split('');
  const numCorruptions = rng.int(1, Math.max(1, Math.floor(chars.length / 3)));

  for (let i = 0; i < numCorruptions; i++) {
    if (chars.length === 0) break;
    const pos    = rng.int(0, chars.length - 1);
    const action = rng.int(0, 3);

    if (action === 0) {
      chars.splice(pos, 1);             // deletion
    } else if (action === 1) {
      chars[pos] = '?';                  // uncertain
    } else if (action === 2) {
      chars[pos] = '(' + chars[pos] + ')'; // bracketed
    }
    // action === 3: leave intact
  }
  return chars.join('');
}

// ── Form mapping (for report appendix) ────────────────────────────

function buildFormMapping(originalEntries, decayedEntries,
                          originalParadigms, decayedParadigms) {
  const mapping  = [];
  const minLen   = Math.min(originalEntries.length, decayedEntries.length);

  for (let i = 0; i < minLen; i++) {
    if (originalEntries[i].form !== decayedEntries[i].form) {
      mapping.push({
        gloss:    originalEntries[i].gloss,
        original: originalEntries[i].form,
        decayed:  decayedEntries[i].form,
      });
    }
  }
  return mapping;
}

module.exports = { simulateDecay };
