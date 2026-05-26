/**
 * composer.js — Generates resignation letters from tone profiles and answers.
 *
 * Paragraph structure:
 *   1. Formal declaration of departure
 *   2. Acknowledgment of tenure (draws on best/worst/miss)
 *   3. THE CONFESSION — shifts register via "I feel compelled to note..."
 *   4. Gracious close
 *
 * The formality level (1-4) determines vocabulary elevation.
 * The tone profile selects specific language branches.
 * The pivot answer seeds paragraph 3.
 */

const { getFormalityLevel, getToneLabel } = require("./classifier");

// ---------------------------------------------------------------------------
// Date formatting
// ---------------------------------------------------------------------------

function formatDate(raw) {
  if (!raw) return "a date to be determined";
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }
  return raw;
}

function todayFormatted() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ---------------------------------------------------------------------------
// Formality-calibrated vocabulary
// ---------------------------------------------------------------------------

const VOCAB = {
  resign: [
    "am writing to resign",
    "hereby tender my resignation",
    "regretfully submit my formal resignation",
    "do hereby formally notify you of my intention to resign"
  ],
  grateful: [
    "grateful for",
    "indebted for",
    "sincerely appreciative of",
    "profoundly grateful for"
  ],
  experience: [
    "time at",
    "experience at",
    "professional tenure at",
    "years of service at"
  ],
  sincerely: [
    "Sincerely",
    "Yours faithfully",
    "With due respect",
    "Respectfully and sincerely"
  ]
};

function pick(level, group) {
  const idx = Math.min(level - 1, group.length - 1);
  return group[idx];
}

// ---------------------------------------------------------------------------
// Paragraph 1: Formal declaration
// ---------------------------------------------------------------------------

function paraOne(answers, level) {
  const lines = [];
  lines.push(`Dear ${answers.company},`);
  lines.push("");
  lines.push(`I ${pick(level, VOCAB.resign)} from my position as ${answers.role}, effective ${formatDate(answers.lastDay)}.`);
  lines.push(`Please accept this letter as formal notice of my departure after ${answers.duration} of employment.`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Paragraph 2: Acknowledgment of tenure — seeded by bestDay, whatYouMiss, duration
// ---------------------------------------------------------------------------

function paraTwo(answers, profile, level) {
  const parts = [];

  parts.push(`I am ${pick(level, VOCAB.grateful)} the ${pick(level, VOCAB.experience)} ${answers.company}.`);

  // Weave in a detail if provided
  if (answers.whatYouMiss && answers.whatYouMiss.trim()) {
    const miss = answers.whatYouMiss.trim();
    parts.push(`I will remember ${miss}.`);
  }

  if (answers.bestDay && answers.bestDay.trim()) {
    const best = answers.bestDay.trim();
    parts.push(`There was a moment — ${best} — when this work felt like something I was meant to do.`);
  }

  // Acknowledge difficulty without breaking register
  if (profile.tags.includes("anger") || profile.tags.includes("resentment")) {
    parts.push("Not every day was easy. I trust you understand this without my enumerating them.");
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Paragraph 3: THE CONFESSION
// This is where formality becomes a pressure cooker.
// ---------------------------------------------------------------------------

function paraThree(answers, profile, level) {
  const opener = [
    "I also feel I should mention",
    "I feel compelled to note",
    "In the interest of full professional disclosure",
    "I would be remiss if I did not acknowledge"
  ];

  const parts = [];
  parts.push(`${pick(level, opener)}:`);

  if (answers.confession && answers.confession.trim()) {
    const confession = answers.confession.trim();
    // The formality wraps the raw confession — this collision is the engine's purpose
    if (profile.tags.includes("grief") || profile.tags.includes("nostalgia")) {
      parts.push(`During my time in this role, ${confession}. I have carried this privately, and I suspect the carrying was the point.`);
    } else if (profile.tags.includes("anger") || profile.tags.includes("resentment")) {
      parts.push(`${confession}. I record this not out of guilt but because the record should exist somewhere, even if only in a letter no one will keep.`);
    } else if (profile.tags.includes("numbness")) {
      parts.push(`${confession}. I mention it now because I am no longer certain it mattered, and that uncertainty seems worth stating formally.`);
    } else {
      parts.push(`${confession}. I have never spoken of this, and I do so now only because the form of this letter seems to require it.`);
    }
  } else {
    // No confession provided — the absence becomes its own statement
    parts.push("There are things I will not include in this letter. I trust you will understand that this omission is itself a kind of disclosure.");
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Paragraph 4: Gracious close
// ---------------------------------------------------------------------------

function paraFour(answers, profile, level) {
  const parts = [];

  parts.push(`I wish ${answers.company} and my colleagues every future success.`);
  parts.push("I am happy to assist with the transition in whatever way is practical during my remaining time.");

  if (profile.tags.includes("relief")) {
    parts.push("I look forward to what comes next.");
  } else if (profile.tags.includes("grief")) {
    parts.push("I am still learning what it means to leave.");
  } else {
    parts.push("I trust the path forward will be clear for all of us.");
  }

  parts.push("");
  parts.push(pick(level, VOCAB.sincerely) + ",");
  parts.push("");
  parts.push(answers.name);

  return parts.join("\n");
}

// ---------------------------------------------------------------------------
// Compose the full letter
// ---------------------------------------------------------------------------

function compose(answers, profile) {
  const level = getFormalityLevel(profile);
  const label = getToneLabel(profile.dominant);

  const header = `${todayFormatted()}`;
  const p1 = paraOne(answers, level);
  const p2 = paraTwo(answers, profile, level);
  const p3 = paraThree(answers, profile, level);
  const p4 = paraFour(answers, profile, level);

  const letter = [
    header,
    "",
    p1,
    "",
    p2,
    "",
    p3,
    "",
    p4
  ].join("\n");

  return { letter, formalityLevel: level, toneLabel: label };
}

module.exports = { compose };
