/**
 * phase3-syntax.js
 *
 * Generates syntactic structure: word order, alignment,
 * phrase structure, agreement, clause combining.
 */

const {
  SeededRandom,
  weightedChoice,
  WORD_ORDER_FREQUENCIES,
} = require('./utils');

const ALIGNMENT_TYPES = [
  { item: 'nominative_accusative', weight: 55 },
  { item: 'ergative_absolutive',   weight: 25 },
  { item: 'tripartite',            weight: 5  },
  { item: 'neutral',               weight: 10 },
  { item: 'split_s',               weight: 5  },
];

const REL_CLAUSE_TYPES = [
  { item: 'pre_nominal',       weight: 15 },
  { item: 'post_nominal',      weight: 30 },
  { item: 'internally_headed', weight: 10 },
  { item: 'correlative',       weight: 15 },
  { item: 'adjacency',         weight: 20 },
  { item: 'participial',       weight: 10 },
];

const QUESTION_TYPES = [
  { item: 'wh_movement',  weight: 25 },
  { item: 'wh_in_situ',   weight: 30 },
  { item: 'particle',     weight: 25 },
  { item: 'verb_morphology', weight: 10 },
  { item: 'intonation_only', weight: 10 },
];

const NEGATION_TYPES = [
  { item: 'verbal_prefix',      weight: 20 },
  { item: 'verbal_suffix',      weight: 15 },
  { item: 'pre_verbal_particle', weight: 25 },
  { item: 'post_verbal_particle', weight: 10 },
  { item: 'double_negation',    weight: 15 },
  { item: 'auxiliary',          weight: 15 },
];

// ── Main entry ────────────────────────────────────────────────────

function generateSyntax(phonology, morphology, config, rng) {
  if (!rng) rng = new SeededRandom(config.seed || Date.now());
  const pr = rng.spawn();

  const wordOrder       = genWordOrder(pr.spawn());
  const alignment       = genAlignment(pr.spawn(), morphology);
  const agreement       = genAgreement(pr.spawn(), morphology);
  const relativeClauses = { strategy: weightedChoice(REL_CLAUSE_TYPES, pr.spawn()) };
  const questions       = { strategy: weightedChoice(QUESTION_TYPES, pr.spawn()) };
  const negation        = { strategy: weightedChoice(NEGATION_TYPES, pr.spawn()) };
  const topicFocus      = genTopicFocus(pr.spawn());
  const clauseCombining = {
    coordination: weightedChoice([
      { item: 'conjunctions',   weight: 60 },
      { item: 'juxtaposition',  weight: 25 },
      { item: 'particles',      weight: 15 },
    ], pr.spawn()),
    serialVerbs: pr.chance(0.15),
  };

  return {
    wordOrder,
    alignment,
    agreement,
    relativeClauses,
    questions,
    negation,
    topicFocus,
    clauseCombining,
    _meta: {
      phase: 3,
      basicOrder: wordOrder.basic,
      isErgative: alignment.type.includes('ergative'),
    },
  };
}

// ── Sub-generators ────────────────────────────────────────────────

function genWordOrder(rng) {
  const basic = weightedChoice(WORD_ORDER_FREQUENCIES, rng);

  const adjNoun = weightedChoice([
    { item: 'N-Adj', weight: 35 },
    { item: 'Adj-N', weight: 25 },
    { item: 'either', weight: 10 },
  ], rng);

  const adposition = weightedChoice([
    { item: 'prepositions',  weight: 45 },
    { item: 'postpositions', weight: 40 },
    { item: 'none',          weight: 10 },
  ], rng);

  const genNoun = weightedChoice([
    { item: 'N-Gen', weight: 40 },
    { item: 'Gen-N', weight: 40 },
    { item: 'either', weight: 20 },
  ], rng);

  return { basic, adjNoun, adposition, genNoun };
}

function genAlignment(rng, morphology) {
  const type    = weightedChoice(ALIGNMENT_TYPES, rng);
  const hasCase = morphology.nominalInflection
    && morphology.nominalInflection.categories
    && morphology.nominalInflection.categories.case;

  return {
    type,
    hasCase,
    isErgative: type.includes('ergative'),
    splitCondition: (type === 'ergative_absolutive' && rng.chance(0.4))
      ? 'person_based'
      : null,
  };
}

function genAgreement(rng, morphology) {
  const patterns = [];

  const vCats = morphology.verbalInflection
    ? Object.keys(morphology.verbalInflection.categories)
    : [];
  if (vCats.includes('person')) {
    patterns.push({ type: 'subject_verb', features: ['person'] });
  }

  const nCats = morphology.nominalInflection
    ? Object.keys(morphology.nominalInflection.categories)
    : [];
  const adjAgreesIn = nCats.filter(c => ['number', 'gender', 'case'].includes(c));
  if (adjAgreesIn.length > 0 && rng.chance(0.6)) {
    patterns.push({ type: 'noun_adjective', features: adjAgreesIn });
  }

  return { patterns, hasAgreement: patterns.length > 0 };
}

function genTopicFocus(rng) {
  const system = weightedChoice([
    { item: 'none',            weight: 20 },
    { item: 'topic_prominent', weight: 25 },
    { item: 'focus_fronting',  weight: 20 },
    { item: 'focus_particle',  weight: 15 },
    { item: 'clefting',        weight: 10 },
    { item: 'both',            weight: 10 },
  ], rng);
  return {
    system,
    isTopicProminent: system === 'topic_prominent' || system === 'both',
  };
}

module.exports = { generateSyntax };
