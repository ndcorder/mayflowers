/**
 * phase1-phonology.js
 *
 * Generates a phonological system with deliberate gaps,
 * asymmetries, and markedness pressures that will create
 * interesting sound changes during the decay phase.
 *
 * Uses real IPA symbols throughout.
 */

const {
  SeededRandom,
  weightedChoice,
  weightedSample,
  uniformSample,
} = require('./utils');

// ── Segment catalogs ──────────────────────────────────────────────
// Each entry: [symbol, place, manner, voicing (0=voiceless, 1=voiced)]

const CONSONANT_CATALOG = [
  // Stops
  ['p','bilabial','stop',0],   ['b','bilabial','stop',1],
  ['t','alveolar','stop',0],   ['d','alveolar','stop',1],
  ['k','velar','stop',0],      ['g','velar','stop',1],
  ['q','uvular','stop',0],     ['ɢ','uvular','stop',1],
  ['ʔ','glottal','stop',0],
  ['ʈ','retroflex','stop',0],  ['ɖ','retroflex','stop',1],
  ['c','palatal','stop',0],    ['ɟ','palatal','stop',1],
  // Fricatives
  ['ɸ','bilabial','fricative',0],    ['β','bilabial','fricative',1],
  ['f','labiodental','fricative',0],  ['v','labiodental','fricative',1],
  ['θ','alveolar','fricative',0],     ['ð','alveolar','fricative',1],
  ['s','alveolar','fricative',0],     ['z','alveolar','fricative',1],
  ['ʃ','postalveolar','fricative',0], ['ʒ','postalveolar','fricative',1],
  ['ʂ','retroflex','fricative',0],    ['ʐ','retroflex','fricative',1],
  ['ç','palatal','fricative',0],      ['ʝ','palatal','fricative',1],
  ['x','velar','fricative',0],        ['ɣ','velar','fricative',1],
  ['χ','uvular','fricative',0],       ['ʁ','uvular','fricative',1],
  ['h','glottal','fricative',0],      ['ɦ','glottal','fricative',1],
  // Nasals
  ['m','bilabial','nasal',1],     ['ɱ','labiodental','nasal',1],
  ['n','alveolar','nasal',1],     ['ɳ','retroflex','nasal',1],
  ['ɲ','palatal','nasal',1],      ['ŋ','velar','nasal',1],
  ['ɴ','uvular','nasal',1],
  // Approximants
  ['ʋ','labiodental','approximant',1],
  ['ɹ','alveolar','approximant',1],
  ['ɻ','retroflex','approximant',1],
  ['j','palatal','approximant',1],
  ['ɰ','velar','approximant',1],
  // Trills and taps
  ['r','alveolar','trill',1],   ['ʀ','uvular','trill',1],
  ['ɾ','alveolar','tap',1],
  // Laterals
  ['l','alveolar','lateral',1],   ['ɭ','retroflex','lateral',1],
  ['ʎ','palatal','lateral',1],    ['ʟ','velar','lateral',1],
  // Affricates
  ['t͡s','alveolar','affricate',0],     ['d͡z','alveolar','affricate',1],
  ['t͡ʃ','postalveolar','affricate',0], ['d͡ʒ','postalveolar','affricate',1],
  ['ʈ͡ʂ','retroflex','affricate',0],    ['ɖ͡ʐ','retroflex','affricate',1],
  ['c͡ç','palatal','affricate',0],      ['ɟ͡ʝ','palatal','affricate',1],
];

// [symbol, height, backness, rounding (0=unrounded, 1=rounded)]
const VOWEL_CATALOG = [
  ['i','close','front',0],       ['y','close','front',1],
  ['ɨ','close','central',0],     ['ʉ','close','central',1],
  ['ɯ','close','back',0],        ['u','close','back',1],
  ['ɪ','near_close','front',0],  ['ʏ','near_close','front',1],
  ['ʊ','near_close','back',1],
  ['e','close_mid','front',0],   ['ø','close_mid','front',1],
  ['ɘ','close_mid','central',0], ['ɵ','close_mid','central',1],
  ['ɤ','close_mid','back',0],    ['o','close_mid','back',1],
  ['ə','mid','central',0],
  ['ɛ','open_mid','front',0],    ['œ','open_mid','front',1],
  ['ʌ','open_mid','back',0],     ['ɔ','open_mid','back',1],
  ['æ','near_open','front',0],
  ['a','open','central',0],
  ['ɑ','open','back',0],         ['ɒ','open','back',1],
];

// ── Main entry ────────────────────────────────────────────────────

function generatePhonology(config, rng) {
  if (!rng) rng = new SeededRandom(config.seed || Date.now());
  const pr = rng.spawn();

  const consonants = generateConsonants(pr.spawn());
  const vowels     = generateVowels(pr.spawn());
  const syllables  = generateSyllables(pr.spawn(), consonants, vowels);
  const prosody    = generateProsody(pr.spawn());
  const rules      = generatePhonoRules(pr.spawn(), consonants, vowels);
  const markedness = analyzeMarkedness(consonants, vowels);

  const allConsonants = consonants.inventory.map(c => c.symbol);
  const allVowels     = vowels.inventory.map(v => v.symbol);

  return {
    consonants,
    vowels,
    syllables,
    prosody,
    rules,
    markedness,
    allConsonants,
    allVowels,
    formatted: formatInventory(consonants, vowels, syllables),
    _meta: {
      phase: 1,
      consonantCount: allConsonants.length,
      vowelCount: allVowels.length,
      avgSyllableComplexity: syllables.avgComplexity,
      hasTone: prosody.tone !== null,
      hasStress: prosody.stress !== null,
    },
  };
}

// ── Consonant generation ──────────────────────────────────────────

function generateConsonants(rng) {
  const targetSize = weightedChoice([
    { item: 14, weight: 8  },
    { item: 20, weight: 15 },
    { item: 26, weight: 25 },
    { item: 32, weight: 25 },
    { item: 38, weight: 15 },
    { item: 44, weight: 8  },
  ], rng);

  const inventory = [];
  const gaps      = [];
  const usedKeys  = new Set();

  // ── Core stops (with intentional voicing gaps) ──
  const stopPlaces = ['bilabial', 'alveolar', 'velar'];
  const includeVoiced = rng.chance(0.75);

  for (const place of stopPlaces) {
    const vl = CONSONANT_CATALOG.find(c => c[1] === place && c[2] === 'stop' && c[3] === 0);
    const vd = CONSONANT_CATALOG.find(c => c[1] === place && c[2] === 'stop' && c[3] === 1);
    if (vl) { inventory.push(makeConsonant(vl)); usedKeys.add(vl[0]); }
    if (vd && includeVoiced) {
      // Omit ~20% of voiced stops (except alveolar, which is most stable)
      if (rng.chance(0.20) && place !== 'alveolar') {
        gaps.push({ place, manner: 'stop', voicing: 'voiced', symbol: vd[0] });
      } else {
        inventory.push(makeConsonant(vd));
        usedKeys.add(vd[0]);
      }
    }
  }

  // ── Core nasals (m, n always; ŋ conditional) ──
  for (const sym of ['m', 'n']) {
    const cat = CONSONANT_CATALOG.find(c => c[0] === sym);
    inventory.push(makeConsonant(cat));
    usedKeys.add(sym);
  }
  if (rng.chance(0.6)) {
    const ng = CONSONANT_CATALOG.find(c => c[0] === 'ŋ');
    inventory.push(makeConsonant(ng));
    usedKeys.add('ŋ');
  }

  // ── Fricatives ──
  const fricPlaces = weightedSample([
    { item: 'alveolar',     weight: 9 },
    { item: 'postalveolar', weight: 5 },
    { item: 'labiodental',  weight: 6 },
    { item: 'velar',        weight: 4 },
    { item: 'glottal',      weight: 4 },
    { item: 'bilabial',     weight: 2 },
  ], rng.int(2, 5), rng);

  for (const place of fricPlaces) {
    const vl = CONSONANT_CATALOG.find(c => c[1] === place && c[2] === 'fricative' && c[3] === 0);
    const vd = CONSONANT_CATALOG.find(c => c[1] === place && c[2] === 'fricative' && c[3] === 1);
    if (vl && !usedKeys.has(vl[0])) { inventory.push(makeConsonant(vl)); usedKeys.add(vl[0]); }
    if (vd && rng.chance(0.6) && !usedKeys.has(vd[0])) { inventory.push(makeConsonant(vd)); usedKeys.add(vd[0]); }
  }

  // ── Liquids and glides ──
  if (rng.chance(0.7)) {
    const lat = CONSONANT_CATALOG.find(c => c[0] === 'l');
    if (lat && !usedKeys.has('l')) { inventory.push(makeConsonant(lat)); usedKeys.add('l'); }
  }
  if (rng.chance(0.6)) {
    const rhoticSym = rng.chance(0.5) ? 'r' : 'ɾ';
    const rhotic = CONSONANT_CATALOG.find(c => c[0] === rhoticSym);
    if (rhotic && !usedKeys.has(rhotic[0])) { inventory.push(makeConsonant(rhotic)); usedKeys.add(rhotic[0]); }
  }
  if (rng.chance(0.7)) {
    const glide = CONSONANT_CATALOG.find(c => c[0] === 'j');
    if (glide && !usedKeys.has('j')) { inventory.push(makeConsonant(glide)); usedKeys.add('j'); }
  }
  if (rng.chance(0.4) && !usedKeys.has('w')) {
    inventory.push({ symbol: 'w', place: 'bilabial', manner: 'approximant', voicing: 'voiced' });
    usedKeys.add('w');
  }

  // ── Fill remaining slots from catalog ──
  const extras = CONSONANT_CATALOG.filter(c => !usedKeys.has(c[0]));
  const shuffled = extras.sort(() => rng.float() - 0.5);
  for (const c of shuffled) {
    if (inventory.length >= targetSize) break;
    if (rng.chance(0.4)) {
      inventory.push(makeConsonant(c));
      usedKeys.add(c[0]);
    }
  }

  // ── Affricates (marked — add sparingly) ──
  if (rng.chance(0.5) && inventory.length < targetSize) {
    const affr = CONSONANT_CATALOG.find(c => c[2] === 'affricate' && c[3] === 0 && !usedKeys.has(c[0]));
    if (affr) { inventory.push(makeConsonant(affr)); usedKeys.add(affr[0]); }
  }

  return { inventory, gaps, targetSize, actualSize: inventory.length };
}

function makeConsonant(cat) {
  return {
    symbol:  cat[0],
    place:   cat[1],
    manner:  cat[2],
    voicing: cat[3] ? 'voiced' : 'voiceless',
  };
}

// ── Vowel generation ──────────────────────────────────────────────

function generateVowels(rng) {
  const targetSize = weightedChoice([
    { item: 3,  weight: 8  },
    { item: 5,  weight: 30 },
    { item: 7,  weight: 25 },
    { item: 9,  weight: 20 },
    { item: 11, weight: 12 },
    { item: 13, weight: 5  },
  ], rng);

  const inventory = [];
  const usedKeys  = new Set();

  // Core triangle: /i u a/ are always present
  for (const sym of ['i', 'u', 'a']) {
    const cat = VOWEL_CATALOG.find(v => v[0] === sym);
    inventory.push(makeVowel(cat));
    usedKeys.add(sym);
  }

  // Priority additions — occasionally skip one to create a gap
  const priority = ['e','o','ɛ','ɔ','ə','ɨ','y','ø','ɯ','ɪ','ʊ','æ','ɑ'];
  let remaining = targetSize - 3;

  for (const sym of priority) {
    if (remaining <= 0) break;
    if (usedKeys.has(sym)) continue;
    const cat = VOWEL_CATALOG.find(v => v[0] === sym);
    if (!cat) continue;
    if (rng.chance(0.15)) continue; // intentional gap
    inventory.push(makeVowel(cat));
    usedKeys.add(sym);
    remaining--;
  }

  // Diphthongs
  const diphthongs = [];
  if (rng.chance(0.5)) {
    const nuclei    = inventory.map(v => v.symbol);
    const offglides = ['i', 'u'];
    for (let i = 0; i < rng.int(2, 5); i++) {
      const n = nuclei[rng.int(0, nuclei.length - 1)];
      const o = offglides[rng.int(0, offglides.length - 1)];
      if (n !== o) diphthongs.push(n + o);
    }
  }

  return { inventory, diphthongs, targetSize, actualSize: inventory.length };
}

function makeVowel(cat) {
  return {
    symbol:   cat[0],
    height:   cat[1],
    backness: cat[2],
    rounding: cat[3] ? 'rounded' : 'unrounded',
  };
}

// ── Syllable structure ────────────────────────────────────────────

function generateSyllables(rng) {
  const onsetType = weightedChoice([
    { item: 'simple',   weight: 40 },
    { item: 'moderate', weight: 35 },
    { item: 'complex',  weight: 20 },
    { item: 'none',     weight: 5  },
  ], rng);

  const codaType = weightedChoice([
    { item: 'none',     weight: 20 },
    { item: 'simple',   weight: 40 },
    { item: 'moderate', weight: 30 },
    { item: 'complex',  weight: 10 },
  ], rng);

  const templates = [{ pattern: 'V', weight: 1, complexity: 1 }];
  if (onsetType !== 'none')                        templates.push({ pattern: 'CV',   weight: 10,  complexity: 2 });
  if (['moderate','complex'].includes(onsetType))  templates.push({ pattern: 'CCV',  weight: 3,   complexity: 3 });
  if (onsetType === 'complex')                     templates.push({ pattern: 'CCCV', weight: 0.5, complexity: 4 });
  if (codaType !== 'none')                         templates.push({ pattern: 'CVC',  weight: 6,   complexity: 3 });
  if (['moderate','complex'].includes(codaType))   templates.push({ pattern: 'CVCC', weight: 2,   complexity: 4 });
  if (codaType === 'complex')                      templates.push({ pattern: 'CVCCC', weight: 0.3, complexity: 5 });

  const totalW = templates.reduce((s, t) => s + t.weight, 0);
  const avgComplexity = templates.reduce((s, t) => s + t.complexity * t.weight, 0) / totalW;

  return { templates, onsetType, codaType, avgComplexity };
}

// ── Prosody ───────────────────────────────────────────────────────

function generateProsody(rng) {
  const prosodyType = weightedChoice([
    { item: null,              weight: 5  },
    { item: 'initial',         weight: 25 },
    { item: 'penultimate',     weight: 25 },
    { item: 'final',           weight: 10 },
    { item: 'weight_sensitive', weight: 20 },
    { item: 'lexical_tonal',   weight: 15 },
  ], rng);

  const stress = (prosodyType && prosodyType !== 'lexical_tonal')
    ? { type: prosodyType }
    : null;

  const tone = (prosodyType === 'lexical_tonal' || rng.chance(0.08))
    ? {
        type: rng.chance(0.6) ? 'register' : 'contour',
        levels: rng.int(2, 4),
      }
    : null;

  const hasLength = rng.chance(0.4);

  return { stress, tone, hasLength };
}

// ── Phonological rules ────────────────────────────────────────────

function generatePhonoRules(rng) {
  const candidates = [
    { type: 'nasal_assimilation',    desc: 'Nasal assimilates to following stop\'s place',     freq: 0.7 },
    { type: 'intervocalic_voicing',  desc: 'Voiceless stops voice between vowels',              freq: 0.4 },
    { type: 'spirantization',        desc: 'Stops spirantize between vowels',                   freq: 0.5 },
    { type: 'palatalization',        desc: 'Velars palatalize before front vowels',             freq: 0.4 },
    { type: 'vowel_harmony',         desc: 'Vowels harmonize for backness within word',         freq: 0.25 },
    { type: 'final_devoicing',       desc: 'Voiced obstruents devoice word-finally',            freq: 0.3 },
    { type: 'vowel_nasalization',    desc: 'Vowels nasalize before nasal consonants',           freq: 0.3 },
  ];

  const rules = [];
  for (const r of candidates) {
    if (rng.chance(r.freq)) rules.push({ type: r.type, description: r.desc });
  }
  return rules;
}

// ── Markedness analysis ───────────────────────────────────────────

function analyzeMarkedness(consonants, vowels) {
  const pressures = [];

  if (consonants.inventory.some(c => c.manner === 'stop' && c.voicing === 'voiced'))
    pressures.push({ feature: 'voiced_stops', markedness: 0.6, decayTarget: true });
  if (consonants.inventory.some(c => c.manner === 'affricate'))
    pressures.push({ feature: 'affricates', markedness: 0.7, decayTarget: true });
  if (consonants.inventory.some(c => c.place === 'retroflex'))
    pressures.push({ feature: 'retroflex', markedness: 0.8, decayTarget: true });
  if (consonants.inventory.some(c => c.place === 'uvular'))
    pressures.push({ feature: 'uvular', markedness: 0.75, decayTarget: true });
  if (vowels.inventory.some(v => v.backness === 'front' && v.rounding === 'rounded'))
    pressures.push({ feature: 'rounded_front_vowels', markedness: 0.65, decayTarget: true });
  if (consonants.inventory.some(c => c.manner === 'lateral'))
    pressures.push({ feature: 'lateral', markedness: 0.5, decayTarget: true });

  return {
    pressures,
    mostVulnerable: pressures
      .filter(p => p.decayTarget)
      .sort((a, b) => b.markedness - a.markedness)
      .slice(0, 3)
      .map(p => p.feature),
  };
}

// ── Pretty-print ─────────────────────────────────────────────────

function formatInventory(consonants, vowels, syllables) {
  const lines = [];
  lines.push('=== CONSONANTS ===');

  const byManner = {};
  for (const c of consonants.inventory) {
    if (!byManner[c.manner]) byManner[c.manner] = [];
    byManner[c.manner].push(c.symbol);
  }
  for (const [manner, syms] of Object.entries(byManner)) {
    lines.push('  ' + manner + ': ' + syms.join(' '));
  }

  lines.push('');
  lines.push('=== VOWELS ===');
  lines.push('  ' + vowels.inventory.map(v => v.symbol).join(' '));
  if (vowels.diphthongs.length > 0) {
    lines.push('  Diphthongs: ' + vowels.diphthongs.join(' '));
  }

  lines.push('');
  lines.push('=== SYLLABLE STRUCTURES ===');
  for (const t of syllables.templates) {
    lines.push('  ' + t.pattern + ' (weight: ' + t.weight + ')');
  }
  return lines.join('\n');
}

module.exports = { generatePhonology };
