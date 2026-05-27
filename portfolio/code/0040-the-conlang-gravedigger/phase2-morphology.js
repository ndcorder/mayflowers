/**
 * phase2-morphology.js
 *
 * Generates the morphological system: inflectional categories,
 * affix inventories, sample paradigms, allomorphy, and
 * derivational patterns.
 */

const {
  SeededRandom,
  weightedChoice,
  weightedSample,
  deepClone,
  MORPHOLOGICAL_TYPES,
  CASE_SIZES,
} = require('./utils');

// ── Main entry ────────────────────────────────────────────────────

function generateMorphology(phonology, config, rng) {
  if (!rng) rng = new SeededRandom(config.seed || Date.now());
  const pr = rng.spawn();
  const C   = phonology.allConsonants;
  const V   = phonology.allVowels;
  const syl = phonology.syllables;

  const morphType = weightedChoice(MORPHOLOGICAL_TYPES, pr.spawn());

  // Track used phonological strings to prevent homophony between
  // roots, affixes, and single segments.
  const usedForms = new Set();
  C.forEach(c => usedForms.add(c));
  V.forEach(v => usedForms.add(v));

  const nominalInflection = generateNominal(pr.spawn(), C, V, morphType, usedForms);
  const verbalInflection  = generateVerbal(pr.spawn(), C, V, morphType, usedForms);
  const derivational      = generateDerivational(pr.spawn(), C, V, morphType);

  const sampleParadigms = buildSampleParadigms(
    pr.spawn(), C, V, syl, nominalInflection, verbalInflection, usedForms,
  );
  const allomorphy = generateAllomorphy(pr.spawn(), nominalInflection, verbalInflection, C, V);

  return {
    type: morphType,
    nominalInflection,
    verbalInflection,
    derivational,
    allomorphy,
    sampleParadigms,
    allAffixes: collectAffixes(nominalInflection, verbalInflection, derivational),
    _meta: {
      phase: 2,
      morphType,
      nominalCategories: Object.keys(nominalInflection.categories),
      verbalCategories:  Object.keys(verbalInflection.categories),
      derivationalPatterns: derivational.patterns.length,
    },
  };
}

// ── Affix generation ──────────────────────────────────────────────

function makeAffix(rng, C, V, type) {
  if (type === 'prefix') {
    let a = '';
    if (rng.chance(0.6)) a += C[rng.int(0, C.length - 1)];
    a += V[rng.int(0, V.length - 1)];
    if (rng.chance(0.3)) a += C[rng.int(0, C.length - 1)];
    return a + '-';
  }
  if (type === 'suffix') {
    let a = '';
    if (rng.chance(0.7)) a += C[rng.int(0, C.length - 1)];
    a += V[rng.int(0, V.length - 1)];
    if (rng.chance(0.4)) a += C[rng.int(0, C.length - 1)];
    return '-' + a;
  }
  if (type === 'circumfix') {
    const pre = C[rng.int(0, C.length - 1)] + V[rng.int(0, V.length - 1)];
    const suf = V[rng.int(0, V.length - 1)] + C[rng.int(0, C.length - 1)];
    return pre + '-...-' + suf;
  }
  // infix
  return '-' + C[rng.int(0, C.length - 1)] + V[rng.int(0, V.length - 1)] + '-';
}

/** Generate a novel root that doesn't collide with existing forms. */
function makeRoot(rng, C, V, syl, usedForms) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const tpl    = syl.templates[rng.int(0, syl.templates.length - 1)].pattern;
    const numSyl = rng.chance(0.5) ? 1 : rng.chance(0.6) ? 2 : 3;
    let root = '';
    for (let s = 0; s < numSyl; s++) {
      for (const ch of tpl) {
        if (ch === 'C') root += C[rng.int(0, C.length - 1)];
        else if (ch === 'V') root += V[rng.int(0, V.length - 1)];
      }
    }
    if (!usedForms.has(root) && root.length >= 2) {
      usedForms.add(root);
      return root;
    }
  }
  // Fallback
  const fb = C[rng.int(0, C.length - 1)] + V[rng.int(0, V.length - 1)];
  usedForms.add(fb);
  return fb;
}

function getMarkingType(rng, morphType) {
  return weightedChoice([
    { item: 'suffix',       weight: morphType === 'agglutinative' ? 30 : 20 },
    { item: 'prefix',       weight: 15 },
    { item: 'infix',        weight: 3  },
    { item: 'circumfix',    weight: 2  },
    { item: 'stem_change',  weight: morphType === 'fusional' ? 20 : 5 },
    { item: 'periphrastic', weight: morphType === 'analytic' ? 15 : 3 },
  ], rng);
}

// ── Nominal inflection ────────────────────────────────────────────

function generateNominal(rng, C, V, morphType) {
  const categories = {};

  // Case
  const numCases = weightedChoice(CASE_SIZES, rng);
  if (numCases > 0) {
    const caseValues = [
      { name: 'nominative',   gloss: 'NOM', weight: 10 },
      { name: 'accusative',   gloss: 'ACC', weight: 9  },
      { name: 'ergative',     gloss: 'ERG', weight: 5  },
      { name: 'absolutive',   gloss: 'ABS', weight: 5  },
      { name: 'genitive',     gloss: 'GEN', weight: 8  },
      { name: 'dative',       gloss: 'DAT', weight: 7  },
      { name: 'locative',     gloss: 'LOC', weight: 6  },
      { name: 'allative',     gloss: 'ALL', weight: 4  },
      { name: 'ablative',     gloss: 'ABL', weight: 4  },
      { name: 'instrumental', gloss: 'INS', weight: 5  },
      { name: 'comitative',   gloss: 'COM', weight: 3  },
      { name: 'vocative',     gloss: 'VOC', weight: 3  },
    ];
    categories.case = {
      values:  weightedSample(
        caseValues.map(v => ({ item: v, weight: v.weight })),
        Math.min(numCases, caseValues.length),
        rng,
      ),
      marking: getMarkingType(rng, morphType),
    };
  }

  // Number
  if (rng.chance(0.85)) {
    const numValues = [
      { name: 'singular', gloss: 'SG',  weight: 10, unmarked: true },
      { name: 'plural',   gloss: 'PL',  weight: 9  },
      { name: 'dual',     gloss: 'DU',  weight: 4  },
      { name: 'paucal',   gloss: 'PAU', weight: 2  },
    ];
    categories.number = {
      values: weightedSample(
        numValues.map(v => ({ item: v, weight: v.weight })),
        rng.chance(0.6) ? 2 : rng.int(2, 3),
        rng,
      ),
      marking: getMarkingType(rng, morphType),
    };
  }

  // Gender
  if (rng.chance(0.45)) {
    const genValues = [
      { name: 'animate',   gloss: 'AN', weight: 5 },
      { name: 'inanimate', gloss: 'IN', weight: 5 },
      { name: 'masculine', gloss: 'M',  weight: 4 },
      { name: 'feminine',  gloss: 'F',  weight: 4 },
      { name: 'neuter',    gloss: 'N',  weight: 3 },
    ];
    categories.gender = {
      values: weightedSample(
        genValues.map(v => ({ item: v, weight: v.weight })),
        rng.int(2, 3),
        rng,
      ),
      marking: 'inherent',
    };
  }

  // Build paradigm table
  const paradigms = {};
  for (const [catName, catData] of Object.entries(categories)) {
    if (catData.marking === 'inherent' || catData.marking === 'periphrastic') continue;
    paradigms[catName] = {};
    for (const val of catData.values) {
      paradigms[catName][val.name] = val.unmarked
        ? { form: '∅', gloss: val.gloss, type: 'zero' }
        : { form: makeAffix(rng, C, V, catData.marking), gloss: val.gloss, type: catData.marking };
    }
  }

  return { categories, paradigms };
}

// ── Verbal inflection ─────────────────────────────────────────────

function generateVerbal(rng, C, V, morphType) {
  const categories = {};

  const tenseVals = [
    { name: 'present',  gloss: 'PRS', weight: 8 },
    { name: 'past',     gloss: 'PST', weight: 8 },
    { name: 'future',   gloss: 'FUT', weight: 6 },
    { name: 'habitual', gloss: 'HAB', weight: 3 },
  ];
  const aspectVals = [
    { name: 'perfective',  gloss: 'PFV', weight: 8 },
    { name: 'imperfective', gloss: 'IPFV', weight: 7 },
    { name: 'progressive', gloss: 'PROG', weight: 5 },
  ];
  const moodVals = [
    { name: 'indicative',  gloss: 'IND',  weight: 9 },
    { name: 'subjunctive', gloss: 'SBJV', weight: 5 },
    { name: 'imperative',  gloss: 'IMP',  weight: 6 },
  ];
  const personVals = [
    { name: 'first',  gloss: '1', weight: 8 },
    { name: 'second', gloss: '2', weight: 8 },
    { name: 'third',  gloss: '3', weight: 8 },
  ];

  if (rng.chance(0.9)) {
    categories.tense = {
      values:  weightedSample(tenseVals.map(v => ({ item: v, weight: v.weight })), rng.chance(0.5) ? 2 : 3, rng),
      marking: getMarkingType(rng, morphType),
    };
  }
  if (rng.chance(0.8)) {
    categories.aspect = {
      values:  weightedSample(aspectVals.map(v => ({ item: v, weight: v.weight })), rng.chance(0.5) ? 2 : 3, rng),
      marking: getMarkingType(rng, morphType),
    };
  }
  if (rng.chance(0.75)) {
    categories.mood = {
      values:  weightedSample(moodVals.map(v => ({ item: v, weight: v.weight })), rng.chance(0.5) ? 2 : 3, rng),
      marking: getMarkingType(rng, morphType),
    };
  }
  if (rng.chance(0.7)) {
    categories.person = {
      values:  weightedSample(personVals.map(v => ({ item: v, weight: v.weight })), 3, rng),
      marking: getMarkingType(rng, morphType),
    };
  }

  const paradigms = {};
  for (const [catName, catData] of Object.entries(categories)) {
    if (catData.marking === 'periphrastic') continue;
    paradigms[catName] = {};
    for (const val of catData.values) {
      paradigms[catName][val.name] = {
        form: makeAffix(rng, C, V, catData.marking),
        gloss: val.gloss,
        type: catData.marking,
      };
    }
  }

  return { categories, paradigms };
}

// ── Derivational morphology ───────────────────────────────────────

function generateDerivational(rng, C, V, morphType) {
  const types = [
    { name: 'nominalizer',    source: 'verb',   target: 'noun',      desc: 'Creates nouns from verbs',          weight: 8 },
    { name: 'verbalizer',     source: 'noun',   target: 'verb',      desc: 'Creates verbs from nouns',          weight: 6 },
    { name: 'adjectivalizer', source: 'noun',   target: 'adjective', desc: 'Creates adjectives from nouns',     weight: 5 },
    { name: 'diminutive',     source: 'any',    target: 'same',      desc: 'Small or endearing version',        weight: 6 },
    { name: 'augmentative',   source: 'any',    target: 'same',      desc: 'Large or intensifying version',     weight: 4 },
    { name: 'privative',      source: 'noun',   target: 'adjective', desc: 'Without X',                         weight: 3 },
  ];

  const selected = weightedSample(
    types.map(t => ({ item: t, weight: t.weight })),
    rng.int(3, 6),
    rng,
  );

  const patterns = selected.map(t => ({
    name:        t.name,
    source:      t.source,
    target:      t.target,
    description: t.desc,
    form:        makeAffix(rng, C, V, rng.chance(0.6) ? 'suffix' : 'prefix'),
    type:        rng.chance(0.6) ? 'suffix' : 'prefix',
  }));

  return { patterns, compounding: rng.chance(0.7) };
}

// ── Allomorphy ────────────────────────────────────────────────────

function generateAllomorphy(rng, nominalInflection, verbalInflection, C, V) {
  const rules = [];
  const allCats = Object.keys(nominalInflection.paradigms || {})
    .concat(Object.keys(verbalInflection.paradigms || {}));

  for (const cat of allCats) {
    if (rng.chance(0.3)) {
      rules.push({
        category: cat,
        allomorphs: [
          { form: makeAffix(rng, C, V, 'suffix'), condition: 'after consonant' },
          { form: makeAffix(rng, C, V, 'suffix'), condition: 'after vowel' },
        ],
      });
    }
  }
  return rules;
}

// ── Sample paradigms ──────────────────────────────────────────────

function buildSampleParadigms(rng, C, V, syl, nominalInflection, verbalInflection, usedForms) {
  const paradigms = [];

  // Noun paradigm
  const nounRoot = makeRoot(rng, C, V, syl, usedForms);
  const nounPara = { root: nounRoot, type: 'noun', forms: {} };

  for (const [catName, catData] of Object.entries(nominalInflection.paradigms)) {
    for (const [valName, affixData] of Object.entries(catData)) {
      nounPara.forms[catName + '.' + valName] = {
        form:     applyAffix(nounRoot, affixData),
        gloss:    affixData.gloss,
        category: catName,
        value:    valName,
      };
    }
  }
  paradigms.push(nounPara);

  // Verb paradigm
  const verbRoot = makeRoot(rng, C, V, syl, usedForms);
  const verbPara = { root: verbRoot, type: 'verb', forms: {} };
  const showCats  = Object.keys(verbalInflection.paradigms).slice(0, 2);

  for (const cName of showCats) {
    for (const [vName, aData] of Object.entries(verbalInflection.paradigms[cName])) {
      verbPara.forms[cName + '.' + vName] = {
        form:     applyAffix(verbRoot, aData),
        gloss:    aData.gloss,
        category: cName,
        value:    vName,
      };
    }
  }
  paradigms.push(verbPara);

  return paradigms;
}

function applyAffix(root, affixData) {
  if (affixData.form === '∅') return root;
  const raw = affixData.form.replace(/-/g, '');

  if (affixData.type === 'prefix') return raw + root;
  if (affixData.type === 'circumfix') {
    const parts = affixData.form.split('...');
    if (parts.length === 2) {
      return parts[0].replace(/-/g, '') + root + parts[1].replace(/-/g, '');
    }
  }
  // Default: suffix
  return root + raw;
}

function collectAffixes(nominalInflection, verbalInflection, derivational) {
  const affixes = [];

  for (const cat of Object.keys(nominalInflection.paradigms || {})) {
    for (const [val, data] of Object.entries(nominalInflection.paradigms[cat])) {
      if (data.form && data.form !== '∅') {
        affixes.push({ form: data.form, gloss: data.gloss, category: cat, value: val });
      }
    }
  }
  for (const cat of Object.keys(verbalInflection.paradigms || {})) {
    for (const [val, data] of Object.entries(verbalInflection.paradigms[cat])) {
      if (data.form && data.form !== '∅') {
        affixes.push({ form: data.form, gloss: data.gloss, category: cat, value: val });
      }
    }
  }
  for (const p of (derivational.patterns || [])) {
    if (p.form) {
      affixes.push({ form: p.form, gloss: p.name.toUpperCase().slice(0, 5), category: 'derivational', value: p.name });
    }
  }
  return affixes;
}

module.exports = { generateMorphology };
