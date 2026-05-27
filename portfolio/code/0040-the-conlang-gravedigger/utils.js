/**
 * utils.js — Shared utilities
 * Seeded PRNG (xorshift32), weighted choice, constants, decay tracking.
 */

class SeededRandom {
  constructor(seed) {
    this.state = (seed >>> 0) || 1;
    // Warm up the generator to avoid early-state bias
    for (let i = 0; i < 64; i++) this.next();
  }

  /** Return raw 32-bit unsigned integer. */
  next() {
    let s = this.state;
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    this.state = s >>> 0;
    return this.state;
  }

  /** Uniform float in [0, 1). */
  float() {
    return (this.next() - 1) / 0xFFFFFFFF;
  }

  /** Uniform integer in [min, max] inclusive. */
  int(min, max) {
    if (min > max) [min, max] = [max, min];
    return min + Math.floor(this.float() * (max - min + 1));
  }

  /** Bernoulli trial with probability p. */
  chance(p) {
    return this.float() < p;
  }

  /** Fork the generator — returns a new independent stream. */
  spawn() {
    return new SeededRandom(this.next());
  }
}

/**
 * Select one item from a weighted list.
 * Each entry is { item: <any>, weight: <number> }.
 */
function weightedChoice(items, rng) {
  const total = items.reduce((s, e) => s + e.weight, 0);
  if (total <= 0) throw new Error('weightedChoice: total weight must be > 0');
  let roll = rng.float() * total;
  for (const entry of items) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return items[items.length - 1].item;
}

/** Select n distinct items from a weighted list (without replacement). */
function weightedSample(items, n, rng) {
  const remaining = items.map(e => ({ ...e }));
  const chosen = [];
  for (let i = 0; i < n && remaining.length > 0; i++) {
    const total = remaining.reduce((s, e) => s + e.weight, 0);
    let roll = rng.float() * total;
    for (let j = 0; j < remaining.length; j++) {
      roll -= remaining[j].weight;
      if (roll <= 0) {
        chosen.push(remaining[j].item);
        remaining.splice(j, 1);
        break;
      }
    }
  }
  return chosen;
}

/** Select n items uniformly from an array (without replacement). */
function uniformSample(arr, n, rng) {
  const copy = [...arr];
  const chosen = [];
  const count = Math.min(n, copy.length);
  for (let i = 0; i < count; i++) {
    const idx = rng.int(0, copy.length - 1);
    chosen.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return chosen;
}

/** Fisher-Yates shuffle (pure — does not mutate input). */
function shuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Deep clone via JSON round-trip. */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** Join with Oxford comma: "a, b, and c". */
function listJoin(items, conj) {
  conj = conj || 'and';
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items[0] + ' ' + conj + ' ' + items[1];
  return items.slice(0, -1).join(', ') + ', ' + conj + ' ' + items[items.length - 1];
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

// ── Frequency tables ──────────────────────────────────────────────

const WORD_ORDER_FREQUENCIES = [
  { item: 'SOV', weight: 45 },
  { item: 'SVO', weight: 42 },
  { item: 'VSO', weight: 9  },
  { item: 'VOS', weight: 3  },
  { item: 'OVS', weight: 1  },
  { item: 'OSV', weight: 0.5 },
];

const MORPHOLOGICAL_TYPES = [
  { item: 'agglutinative', weight: 35 },
  { item: 'fusional',      weight: 30 },
  { item: 'analytic',      weight: 20 },
  { item: 'polysynthetic', weight: 10 },
  { item: 'isolating',     weight: 5  },
];

const CASE_SIZES = [
  { item: 0,  weight: 20 },
  { item: 2,  weight: 25 },
  { item: 4,  weight: 30 },
  { item: 6,  weight: 15 },
  { item: 8,  weight: 7  },
  { item: 12, weight: 3  },
];

const SOUND_CHANGE_TYPES = [
  { type: 'lenition',        description: 'Weakening of consonant articulation',               frequency: 0.25 },
  { type: 'merger',          description: 'Two phonemes collapse into one',                    frequency: 0.20 },
  { type: 'deletion',        description: 'Segment lost in certain environments',              frequency: 0.20 },
  { type: 'assimilation',    description: 'Segment becomes more like a neighbor',              frequency: 0.15 },
  { type: 'vowel_shift',     description: 'Systematic vowel raising or lowering',              frequency: 0.15 },
  { type: 'palatalization',  description: 'Consonants palatalize before front vowels',         frequency: 0.12 },
  { type: 'epenthesis',      description: 'Insertion to break clusters',                       frequency: 0.10 },
  { type: 'nasalization',    description: 'Vowels nasalize near nasal consonants',             frequency: 0.08 },
  { type: 'debuccalization', description: 'Oral consonant reduces to glottal',                 frequency: 0.08 },
  { type: 'fortition',       description: 'Strengthening of articulation',                     frequency: 0.05 },
  { type: 'dissimilation',   description: 'Segment becomes less like a neighbor',              frequency: 0.05 },
];

const SEMANTIC_FIELDS = [
  { name: 'body',             proportion: 0.12, weight: 12 },
  { name: 'kinship',          proportion: 0.10, weight: 10 },
  { name: 'animals',          proportion: 0.08, weight: 8  },
  { name: 'plants',           proportion: 0.06, weight: 6  },
  { name: 'landscape',        proportion: 0.06, weight: 6  },
  { name: 'weather',          proportion: 0.05, weight: 5  },
  { name: 'physical_actions', proportion: 0.12, weight: 12 },
  { name: 'mental_actions',   proportion: 0.06, weight: 6  },
  { name: 'social_actions',   proportion: 0.06, weight: 6  },
  { name: 'states',           proportion: 0.08, weight: 8  },
  { name: 'emotion',          proportion: 0.05, weight: 5  },
  { name: 'quantity',         proportion: 0.04, weight: 4  },
  { name: 'time',             proportion: 0.04, weight: 4  },
  { name: 'space',            proportion: 0.04, weight: 4  },
  { name: 'artifacts',        proportion: 0.05, weight: 5  },
  { name: 'social',           proportion: 0.04, weight: 4  },
  { name: 'ritual',           proportion: 0.03, weight: 3  },
  { name: 'trade',            proportion: 0.02, weight: 2  },
];

// ── Configuration ─────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  seed: Date.now(),
  centuries: 600,
  lexiconSize: 200,
  reportScholars: 3,
  decayRate: 0.15,
  preservationRate: 0.30,
};

function parseConfig(overrides) {
  overrides = overrides || {};
  const config = {};
  for (const key of Object.keys(DEFAULT_CONFIG)) config[key] = DEFAULT_CONFIG[key];
  for (const key of Object.keys(overrides)) {
    if (overrides[key] !== undefined && overrides[key] !== null) config[key] = overrides[key];
  }
  return config;
}

/** Minimal argv parser — handles --key value and --flag. */
function parseArgs(argv) {
  argv = argv || process.argv.slice(2);
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const value = argv[i + 1];
      if (value && !value.startsWith('--')) {
        const num = Number(value);
        args[key] = isNaN(num) ? value : num;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

// ── Change log (used by decay phase) ──────────────────────────────

class ChangeLog {
  constructor() { this.entries = []; }

  add(century, type, description, affectedForms) {
    this.entries.push({
      century,
      type,
      description,
      affectedForms: affectedForms || [],
    });
  }

  getAll() { return this.entries.slice(); }
  getByType(type) { return this.entries.filter(e => e.type === type); }

  summarize() {
    const counts = {};
    for (const e of this.entries) counts[e.type] = (counts[e.type] || 0) + 1;
    return {
      totalChanges: this.entries.length,
      centurySpan: this.entries.length > 0
        ? [this.entries[0].century, this.entries[this.entries.length - 1].century]
        : [0, 0],
      typeCounts: counts,
    };
  }
}

module.exports = {
  SeededRandom,
  weightedChoice,
  weightedSample,
  uniformSample,
  shuffle,
  deepClone,
  listJoin,
  capitalize,
  WORD_ORDER_FREQUENCIES,
  MORPHOLOGICAL_TYPES,
  CASE_SIZES,
  SOUND_CHANGE_TYPES,
  SEMANTIC_FIELDS,
  DEFAULT_CONFIG,
  parseConfig,
  parseArgs,
  ChangeLog,
};
