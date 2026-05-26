#!/usr/bin/env node

/**
 * cli.js — The Resignation Engine
 *
 * A CLI tool that generates formal resignation letters
 * that become accidentally confessional.
 *
 * Usage: node cli.js
 */

const readline = require("readline");
const { PROMPTS, getPivotPrompt } = require("./prompts");
const { classifyCombined } = require("./classifier");
const { compose } = require("./composer");

// ---------------------------------------------------------------------------
// ANSI helpers — minimal, no dependencies
// ---------------------------------------------------------------------------

const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function dim(text) { return `${DIM}${text}${RESET}`; }
function bold(text) { return `${BOLD}${text}${RESET}`; }

// ---------------------------------------------------------------------------
// Interview runner
// ---------------------------------------------------------------------------

function ask(rl, prompt) {
  return new Promise((resolve) => {
    console.log("");
    console.log(bold(prompt.question));
    if (prompt.hint) {
      console.log(dim(prompt.hint));
    }
    process.stdout.write("> ");

    rl.question("", (answer) => {
      resolve(answer.trim());
    });
  });
}

// ---------------------------------------------------------------------------
// Main flow
// ---------------------------------------------------------------------------

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log("");
  console.log(bold("THE RESIGNATION ENGINE"));
  console.log(dim("A tool for letters that say more than you intended."));
  console.log(dim("Answer freely. Press Enter to skip optional questions."));
  console.log(dim("Press Ctrl+C at any time to exit."));

  const answers = {};

  for (const prompt of PROMPTS) {
    const answer = await ask(rl, prompt);

    if (prompt.pivot && answer) {
      // Pause before the pivot to mark the shift
      console.log("");
      console.log(dim("— Thank you. The letter will know what to do with that. —"));
    }

    if (answer) {
      answers[prompt.key] = answer;
    } else if (prompt.required) {
      // Re-ask required questions
      console.log(dim("(This one's required.)"));
      const retry = await ask(rl, prompt);
      answers[prompt.key] = retry || "withheld";
    }
  }

  rl.close();

  // Classify emotional tone across all answers
  const profile = classifyCombined(answers);

  // Compose the letter
  const { letter, formalityLevel, toneLabel } = compose(answers, profile);

  // Output
  console.log("");
  console.log(dim("— Formality level: " + formalityLevel + "/4 —"));
  console.log(dim("— Tone: " + toneLabel + " —"));
  console.log("");
  console.log("─".repeat(60));
  console.log("");
  console.log(letter);
  console.log("");
  console.log("─".repeat(60));
  console.log("");
  console.log(dim("This letter is yours. Do with it what you will."));
  console.log("");
}

main().catch((err) => {
  console.error("Something went wrong:", err.message);
  process.exit(1);
});
