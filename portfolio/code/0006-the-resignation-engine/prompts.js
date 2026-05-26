/**
 * prompts.js — Interview questions for the Resignation Engine.
 */

const PROMPTS = [
  {
    key: "name",
    question: "Your full name as it should appear on the letter?",
    hint: "Formal is fine. First and last.",
    required: true
  },
  {
    key: "company",
    question: "Name of the organisation you are resigning from?",
    hint: "Full legal name if you want it formal.",
    required: true
  },
  {
    key: "role",
    question: "Your title or position?",
    hint: "e.g. Senior Developer, Coordinator, VP of Operations",
    required: true
  },
  {
    key: "duration",
    question: "How long did you work there?",
    hint: "Rough span is fine — 'three years', 'since 2019', 'too long'.",
    required: true
  },
  {
    key: "lastDay",
    question: "What should be your final day of employment?",
    hint: "e.g. 2025-02-14 or 'two weeks from now'.",
    required: true
  },
  {
    key: "worstDay",
    question: "Describe the worst single day you had at this job.",
    hint: "Be specific — a meeting, a moment, a person, a decision.",
    required: true
  },
  {
    key: "bestDay",
    question: "Was there a moment when you almost loved it?",
    hint: "A launch, a late night, a quiet win. Or 'no'.",
    required: false
  },
  {
    key: "whatYouMiss",
    question: "What will you actually miss?",
    hint: "A person, a routine, a view from a window. Real things.",
    required: false
  },
  {
    key: "whatYouWont",
    question: "What will you absolutely NOT miss?",
    hint: "Unfiltered honesty encouraged.",
    required: false
  },
  {
    key: "confession",
    question: "One more thing. What did you do there that no one ever found out about?",
    hint: "A decision, a silence, a small betrayal, an act of mercy. Something you carried.",
    required: false,
    pivot: true
  }
];

function getPrompt(key) {
  return PROMPTS.find(p => p.key === key);
}

function getPivotPrompt() {
  return PROMPTS.find(p => p.pivot);
}

module.exports = { PROMPTS, getPrompt, getPivotPrompt };
