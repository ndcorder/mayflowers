/**
 * phase4-lexicon.js
 *
 * Generates core vocabulary: semantic fields, function words,
 * and culturally-specific terms whose meanings the scholars
 * will later argue about.
 */

const { SeededRandom } = require('./utils');

// ── Core vocabulary lists ──────────────────────────────────────────

const CORE_NOUNS = [
  { gloss: 'person',  field: 'body' },      { gloss: 'hand',    field: 'body' },
  { gloss: 'head',    field: 'body' },       { gloss: 'eye',     field: 'body' },
  { gloss: 'mouth',   field: 'body' },       { gloss: 'ear',     field: 'body' },
  { gloss: 'foot',    field: 'body' },       { gloss: 'heart',   field: 'body' },
  { gloss: 'blood',   field: 'body' },       { gloss: 'bone',    field: 'body' },
  { gloss: 'mother',  field: 'kinship' },    { gloss: 'father',  field: 'kinship' },
  { gloss: 'child',   field: 'kinship' },    { gloss: 'sibling', field: 'kinship' },
  { gloss: 'grandmother', field: 'kinship' },{ gloss: 'grandfather', field: 'kinship' },
  { gloss: 'water',   field: 'landscape' },  { gloss: 'fire',    field: 'landscape' },
  { gloss: 'earth',   field: 'landscape' },  { gloss: 'sky',     field: 'landscape' },
  { gloss: 'mountain', field: 'landscape' }, { gloss: 'river',   field: 'landscape' },
  { gloss: 'tree',    field: 'plants' },     { gloss: 'fruit',   field: 'plants' },
  { gloss: 'sun',     field: 'weather' },    { gloss: 'moon',    field: 'weather' },
  { gloss: 'star',    field: 'weather' },    { gloss: 'rain',    field: 'weather' },
  { gloss: 'dog',     field: 'animals' },    { gloss: 'fish',    field: 'animals' },
  { gloss: 'bird',    field: 'animals' },    { gloss: 'snake',   field: 'animals' },
  { gloss: 'house',   field: 'artifacts' },  { gloss: 'tool',    field: 'artifacts' },
  { gloss: 'weapon',  field: 'artifacts' },  { gloss: 'food',    field: 'artifacts' },
  { gloss: 'day',     field: 'time' },       { gloss: 'night',   field: 'time' },
  { gloss: 'name',    field: 'social' },     { gloss: 'chief',   field: 'social' },
  { gloss: 'spirit',  field: 'ritual' },     { gloss: 'death',   field: 'ritual' },
  { gloss: 'song',    field: 'ritual' },
];

const CORE_VERBS = [
  { gloss: 'be',    field: 'physical_actions' },  { gloss: 'go',    field: 'physical_actions' },
  { gloss: 'come',  field: 'physical_actions' },  { gloss: 'give',  field: 'social_actions' },
  { gloss: 'take',  field: 'physical_actions' },  { gloss: 'see',   field: 'mental_actions' },
  { gloss: 'hear',  field: 'mental_actions' },    { gloss: 'say',   field: 'social_actions' },
  { gloss: 'know',  field: 'mental_actions' },    { gloss: 'think', field: 'mental_actions' },
  { gloss: 'want',  field: 'mental_actions' },    { gloss: 'eat',   field: 'physical_actions' },
  { gloss: 'drink', field: 'physical_actions' },  { gloss: 'sleep', field: 'physical_actions' },
  { gloss: 'die',   field: 'physical_actions' },  { gloss: 'kill',  field: 'physical_actions' },
  { gloss: 'make',  field: 'physical_actions' },  { gloss: 'break', field: 'physical_actions' },
  { gloss: 'burn',  field: 'physical_actions' },  { gloss: 'carry', field: 'physical_actions' },
  { gloss: 'run',   field: 'physical_actions' },  { gloss: 'sit',   field: 'physical_actions' },
  { gloss: 'stand', field: 'physical_actions' },  { gloss: 'fight', field: 'social_actions' },
  { gloss: 'love',  field: 'emotion' },           { gloss: 'fear',  field: 'emotion' },
  { gloss: 'sing',  field: 'social_actions' },    { gloss: 'speak', field: 'social_actions' },
];

const CORE_ADJECTIVES = [
  { gloss: 'big',    field: 'states' },   { gloss: 'small',  field: 'states' },
  { gloss: 'good',   field: 'states' },   { gloss: 'bad',    field: 'states' },
  { gloss: 'hot',    field: 'states' },   { gloss: 'cold',   field: 'states' },
  { gloss: 'new',    field: 'states' },   { gloss: 'old',    field: 'states' },
  { gloss: 'long',   field: 'states' },   { gloss: 'short',  field: 'states' },
  { gloss: 'red',    field: 'states' },   { gloss: 'white',  field: 'states' },
  { gloss: 'black',  field: 'states' },   { gloss: 'strong', field: 'states' },
];

const FUNCTION_WORDS = [
  { gloss: 'I',     pos: 'pronoun' },      { gloss: 'you',   pos: 'pronoun' },
  { gloss: 'he/she', pos: 'pronoun' },     { gloss: 'we',    pos: 'pronoun' },
  { gloss: 'they',  pos: 'pronoun' },      { gloss: 'this',  pos: 'demonstrative' },
  { gloss: 'that',  pos: 'demonstrative' }, { gloss: 'one',   pos: 'numeral' },
  { gloss: 'two',   pos: 'numeral' },      { gloss: 'three', pos: 'numeral' },
  { gloss: 'many',  pos: 'quantifier' },   { gloss: 'all',   pos: 'quantifier' },
  { gloss: 'not',   pos: 'particle' },     { gloss: 'and',   pos: 'conjunction' },
  { gloss: 'with',  pos: 'adposition' },   { gloss: 'in',    pos: 'adposition' },
  { gloss: 'from',  pos: 'adposition' },   { gloss: 'to',    pos: 'adposition' },
  { gloss: 'who',   pos: 'interrogative' },{ gloss: 'what',  pos: 'interrogative' },
  { gloss: 'where', pos: 'interrogative' },{ gloss: 'when',  pos: 'interrogative' },
];

const CULTURAL_SEEDS = [
  { gloss: 'offering',      domain: 'ritual',          hint: 'gift-giving to spirits or deities' },
  { gloss: 'taboo',         domain: 'social',          hint: 'culturally prohibited action or speech' },
  { gloss: 'ancestor',      domain: 'kinship',         hint: 'revered deceased relative' },
  { gloss: 'harvest',       domain: 'agriculture',     hint: 'seasonal gathering of crops' },
  { gloss: 'council',       domain: 'governance',      hint: 'gathered decision-makers' },
  { gloss: 'exile',         domain: 'punishment',      hint: 'forced departure from community' },
  { gloss: 'dawn',          domain: 'time',            hint: 'metaphor for new beginnings' },
  { gloss: 'dream',         domain: 'spiritual',       hint: 'connection to spirit world during sleep' },
  { gloss: 'oath',          domain: 'legal',           hint: 'binding spoken promise' },
  { gloss: 'story',         domain: 'oral_tradition',  hint: 'narrative preserving cultural knowledge' },
  { gloss: 'sacred_grove',  domain: 'ritual',          hint: 'natural place of worship' },
  { gloss: 'betrayal',      domain: 'social',          hint: 'violation of trust' },
];

// ── Main entry ────────────────────────────────────────────────────

function generateLexicon(phonology, morphology, config, rng) {
  if (!rng) rng = new SeededRandom(config.seed || Date.now());
  const pr  = rng.spawn();
  const C   = phonology.allConsonants;
  const V   = phonology.allVowels;
  const syl = phonology.syllables;

  // Accumulate used forms to avoid homophony
  const usedForms = new Set();
  C.forEach(c => usedForms.add(c));
  V.forEach(v => usedForms.add(v));
  if (morphology.sampleParadigms) {
    for (const p of morphology.sampleParadigms) usedForms.add(p.root);
  }

  const entries = [];

  for (const n of CORE_NOUNS) {
    entries.push({
      form: makeWord(C, V, syl, usedForms, pr.spawn()),
      gloss: n.gloss,
      pos: 'noun',
      field: n.field,
    });
  }
  for (const v of CORE_VERBS) {
    entries.push({
      form: makeWord(C, V, syl, usedForms, pr.spawn()),
      gloss: v.gloss,
      pos: 'verb',
      field: v.field,
    });
  }
  for (const a of CORE_ADJECTIVES) {
    entries.push({
      form: makeWord(C, V, syl, usedForms, pr.spawn()),
      gloss: a.gloss,
      pos: 'adjective',
      field: a.field,
    });
  }
  for (const f of FUNCTION_WORDS) {
    entries.push({
      form: makeWord(C, V, syl, usedForms, pr.spawn()),
      gloss: f.gloss,
      pos: f.pos,
      field: 'function',
    });
  }

  // Cultural vocabulary — included probabilistically
  const cultural = [];
  for (const seed of CULTURAL_SEEDS) {
    if (pr.chance(0.7)) {
      cultural.push({
        form: makeWord(C, V, syl, usedForms, pr.spawn()),
        gloss: seed.gloss,
        pos: 'noun',
        domain: seed.domain,
        hint: seed.hint,
        cultural: true,
      });
    }
  }

  const allEntries = entries.concat(cultural);

  return {
    entries: allEntries,
    cultural,
    totalSize: allEntries.length,
    byPos: {
      nouns: allEntries.filter(e => e.pos === 'noun').length,
      verbs: allEntries.filter(e => e.pos === 'verb').length,
      adjectives: allEntries.filter(e => e.pos === 'adjective').length,
      other: allEntries.filter(e => !['noun', 'verb', 'adjective'].includes(e.pos)).length,
    },
    _meta: { phase: 4 },
  };
}

// ── Word generation ───────────────────────────────────────────────

function makeWord(C, V, syl, usedForms, rng) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const tpl    = syl.templates[rng.int(0, syl.templates.length - 1)].pattern;
    const numSyl = rng.chance(0.5) ? 1 : rng.chance(0.6) ? 2 : 3;
    let form = '';
    for (let s = 0; s < numSyl; s++) {
      for (const ch of tpl) {
        if (ch === 'C') form += C[rng.int(0, C.length - 1)];
        else if (ch === 'V') form += V[rng.int(0, V.length - 1)];
      }
    }
    if (!usedForms.has(form) && form.length >= 2) {
      usedForms.add(form);
      return form;
    }
  }
  // Fallback: should rarely be reached
  const fb = C[rng.int(0, C.length - 1)] + V[rng.int(0, V.length - 1)] + C[rng.int(0, C.length - 1)];
  usedForms.add(fb);
  return fb;
}

module.exports = { generateLexicon };
