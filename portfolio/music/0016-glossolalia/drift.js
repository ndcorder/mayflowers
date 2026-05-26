/**
 * drift.js — Drift mathematics for Glossolalia
 *
 * Each of 26 letters starts at a chromatic pitch and drifts toward
 * a scrambled, deterministic target over ~75 seconds. The drift is
 * non-linear and per-letter, so the dissolution feels organic.
 */

const DRIFT_DURATION_MS = 75000;
const LETTERS = "abcdefghijklmnopqrstuvwxyz";
const BASE_FREQ = 220; // A3

// Seeded PRNG (Lehmer / Park-Miller)
function createRng(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Smooth cosine interpolation
function cosLerp(a, b, t) {
  const f = (1 - Math.cos(t * Math.PI)) / 2;
  return a * (1 - f) + b * f;
}

function initialMapping() {
  const map = {};
  for (let i = 0; i < 26; i++) {
    map[LETTERS[i]] = BASE_FREQ * Math.pow(2, i / 12);
  }
  return map;
}

function generateTargets(rng) {
  const params = {};
  for (let i = 0; i < 26; i++) {
    const ch = LETTERS[i];
    params[ch] = {
      targetPitchSemitones: (rng() - 0.5) * 48,
      rateMultiplier: 0.7 + rng() * 0.6,
      wobbleAmp: 0.1 + rng() * 1.2,
      wobbleFreq: 0.3 + rng() * 2.0,
      wobblePhase: rng() * Math.PI * 2,
    };
  }
  return params;
}

const rng = createRng(8817);
const initialMap = initialMapping();
const targets = generateTargets(rng);

function getInitialMapping() {
  return { ...initialMap };
}

function getCurrentMapping(elapsedMs) {
  const result = {};
  const globalT = Math.min(Math.max(elapsedMs / DRIFT_DURATION_MS, 0), 1);
  const tSec = elapsedMs / 1000;

  for (let i = 0; i < 26; i++) {
    const ch = LETTERS[i];
    const p = targets[ch];
    const baseFreq = initialMap[ch];

    const rawLocal = globalT * p.rateMultiplier;
    const localT = Math.min(Math.pow(rawLocal, 0.8), 1);

    const targetFreq =
      baseFreq * Math.pow(2, p.targetPitchSemitones / 12);
    const freq = cosLerp(baseFreq, targetFreq, localT);

    const wobbleSemitones =
      p.wobbleAmp * globalT * Math.sin(tSec * p.wobbleFreq * Math.PI * 2 + p.wobblePhase);
    const finalFreq = freq * Math.pow(2, wobbleSemitones / 12);

    result[ch] = Math.max(20, Math.min(finalFreq, 16000));
  }
  return result;
}

function getEntropyLevel(elapsedMs) {
  const t = Math.min(Math.max(elapsedMs / DRIFT_DURATION_MS, 0), 1);
  return t * t * (3 - 2 * t);
}

export {
  getInitialMapping,
  getCurrentMapping,
  getEntropyLevel,
  DRIFT_DURATION_MS,
};
