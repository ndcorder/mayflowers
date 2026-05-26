/**
 * classifier.js — Lightweight keyword-based emotional tone detection.
 *
 * Maps user input to emotional vectors along six axes:
 *   resentment, nostalgia, relief, grief, anger, numbness
 *
 * No external dependencies. No API calls. Just lexicon matching.
 */

const LEXICON = {
  // Resentment
  unfair:        { resentment: 0.8 },
  favoritism:    { resentment: 0.9 },
  overlooked:    { resentment: 0.7 },
  ignored:       { resentment: 0.7 },
  underpaid:     { resentment: 0.8 },
  exploited:     { resentment: 0.9 },
  blamed:        { resentment: 0.8 },
  unappreciated: { resentment: 0.8 },
  credit:        { resentment: 0.5 },
  stole:         { resentment: 0.7 },
  promised:      { resentment: 0.5 },
  lied:          { resentment: 0.8, anger: 0.7 },
  betrayed:      { resentment: 0.9, grief: 0.5 },
  betrayal:      { resentment: 0.9, grief: 0.5 },
  toxic:         { resentment: 0.7, anger: 0.7 },

  // Nostalgia
  miss:        { nostalgia: 0.6 },
  remember:    { nostalgia: 0.5 },
  memory:      { nostalgia: 0.6 },
  memories:    { nostalgia: 0.7 },
  early:       { nostalgia: 0.5 },
  beginning:   { nostalgia: 0.5 },
  first:       { nostalgia: 0.4 },
  once:        { nostalgia: 0.4 },
  loved:       { nostalgia: 0.7 },
  good:        { nostalgia: 0.4 },
  home:        { nostalgia: 0.6 },
  family:      { nostalgia: 0.6 },
  younger:     { nostalgia: 0.5 },
  different:   { nostalgia: 0.3 },

  // Relief
  free:       { relief: 0.7 },
  freedom:    { relief: 0.8 },
  escape:     { relief: 0.8 },
  leaving:    { relief: 0.5 },
  finally:    { relief: 0.6 },
  glad:       { relief: 0.6 },
  breathe:    { relief: 0.7 },
  better:     { relief: 0.5 },
  fresh:      { relief: 0.7 },
  done:       { relief: 0.6 },
  over:       { relief: 0.5 },
  release:    { relief: 0.7 },
  light:      { relief: 0.4 },

  // Grief
  lost:     { grief: 0.6 },
  loss:     { grief: 0.8 },
  sad:      { grief: 0.7 },
  cry:      { grief: 0.8 },
  cried:    { grief: 0.8 },
  crying:   { grief: 0.8 },
  tears:    { grief: 0.9 },
  grief:    { grief: 1.0 },
  mourn:    { grief: 0.9 },
  alone:    { grief: 0.6 },
  lonely:   { grief: 0.7 },
  empty:    { grief: 0.6, numbness: 0.4 },
  hurt:     { grief: 0.7 },
  painful:  { grief: 0.8 },
  goodbye:  { grief: 0.6, nostalgia: 0.4 },
  gone:     { grief: 0.7 },
  buried:   { grief: 0.9 },

  // Anger
  angry:       { anger: 0.9 },
  furious:     { anger: 1.0 },
  rage:        { anger: 1.0 },
  hated:       { anger: 0.9 },
  hate:        { anger: 0.9 },
  screaming:   { anger: 0.8 },
  yelled:      { anger: 0.7 },
  hostile:     { anger: 0.8 },
  aggressive:  { anger: 0.8 },
  awful:       { anger: 0.6 },
  terrible:    { anger: 0.5, resentment: 0.3 },
  horrible:    { anger: 0.6, resentment: 0.3 },
  destroyed:   { anger: 0.8, grief: 0.5 },
  incompetent: { anger: 0.7, resentment: 0.5 },
  stupid:      { anger: 0.6 },
  bullshit:    { anger: 0.9 },
  nightmare:   { anger: 0.7, resentment: 0.5 },

  // Numbness
  nothing:  { numbness: 0.7 },
  numb:     { numbness: 0.9 },
  dead:     { numbness: 0.7 },
  hollow:   { numbness: 0.8 },
  flat:     { numbness: 0.6 },
  whatever: { numbness: 0.6 },
  blank:    { numbness: 0.7 },
  silence:  { numbness: 0.4 },
  quiet:    { numbness: 0.3 },
  forgot:   { numbness: 0.5 },
  fog:      { numbness: 0.6 },
  stopped:  { numbness: 0.5 }
};

function normalise(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
}

function ngrams(tokens, n) {
  const result = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n).join("_"));
  }
  return result;
}

function classify(text) {
  const tokens = normalise(text);
  const bigrams = ngrams(tokens, 2);
  const allTerms = [...bigrams, ...tokens];

  const scores = {
    resentment: 0, nostalgia: 0, relief: 0,
    grief: 0, anger: 0, numbness: 0
  };
  const tags = [];

  for (const term of allTerms) {
    const entry = LEXICON[term];
    if (!entry) continue;
    for (const [emotion, weight] of Object.entries(entry)) {
      scores[emotion] += weight;
    }
    for (const emotion of Object.keys(entry)) {
      if (!tags.includes(emotion)) tags.push(emotion);
    }
  }

  const nonZero = Object.values(scores).filter(v => v > 0).length;
  const maxScore = Math.max(...Object.values(scores));

  return {
    scores,
    tags,
    wordCount: tokens.length,
    isVolatile: nonZero >= 3 || maxScore >= 2.5
  };
}

function classifyCombined(answers) {
  const combined = {
    resentment: 0, nostalgia: 0, relief: 0,
    grief: 0, anger: 0, numbness: 0
  };
  const allTags = [];
  let totalWords = 0;
  let volatileCount = 0;

  for (const [key, text] of Object.entries(answers)) {
    if (!text || !text.trim()) continue;
    const result = classify(text);
    const weight = key === "confession" ? 1.5 : 1.0;

    for (const [emotion, score] of Object.entries(result.scores)) {
      combined[emotion] += score * weight;
    }
    for (const tag of result.tags) {
      if (!allTags.includes(tag)) allTags.push(tag);
    }
    totalWords += result.wordCount;
    if (result.isVolatile) volatileCount++;
  }

  const sorted = Object.entries(combined).sort((a, b) => b[1] - a[1]);
  const dominant = sorted[0] ? sorted[0][0] : "numbness";
  const secondary = sorted[1] ? sorted[1][0] : null;
  const answerCount = Object.values(answers).filter(v => v && v.trim()).length;
  const volatility = answerCount > 0 ? volatileCount / answerCount : 0;
  const hasConfession = Boolean(answers.confession && answers.confession.trim().length > 0);

  return { dominant, secondary, scores: combined, tags: allTags, volatility, hasConfession, totalWords };
}

function getFormalityLevel(profile) {
  let level = 1;
  if (profile.totalWords > 50) level++;
  if (profile.totalWords > 120) level++;
  if (profile.volatility > 0.3) level++;
  if (profile.hasConfession) level++;
  return Math.min(level, 4);
}

function getToneLabel(dominant) {
  const labels = {
    resentment: "measured grievance",
    nostalgia: "aching retrospection",
    relief: "liberated composure",
    grief: "wounded decorum",
    anger: "brittle restraint",
    numbness: "hollow formality"
  };
  return labels[dominant] || "guarded professionalism";
}

module.exports = { classify, classifyCombined, getFormalityLevel, getToneLabel };
