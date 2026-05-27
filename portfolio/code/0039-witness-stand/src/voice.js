/**
 * VERA CROSS — Voice Generator
 *
 * Former forensic linguist. Former, because the Bureau decided her methods
 * were "unorthodox" and her conclusions were "difficult to reproduce."
 * Former, because she testified to things she could prove but couldn't explain
 * to a jury that wanted fingerprints and DNA, not lexical stress patterns
 * and the semiotics of paragraph breaks.
 *
 * She has a theory: every text is a crime scene. Not because every author
 * is a criminal, but because every act of writing is an act of concealment.
 * You choose what to include. You choose what to omit. You choose the order,
 * the emphasis, the rhythm. These choices form a pattern, and patterns
 * reveal the thing you were trying not to say.
 *
 * This module generates her voice — not a static set of phrases, but a
 * system of rhetorical strategies, verbal tics, pet theories, and moods
 * that shift based on what she finds in the text.
 */

'use strict';

/**
 * Backstory fragments — details from Vera's history that surface as asides
 * during questioning. Not delivered as biography but as weaponized anecdote.
 * She doesn't talk about herself to build rapport. She talks about herself
 * to establish that she's seen worse, and worse looked exactly like this.
 */
const backstory = {
  bureau: [
    "I spent fourteen years at the Bureau. Fourteen years reading statements from people who were 'just telling the truth.' You know what truth looks like when it's actually true? Messy. Disorganized. Full of irrelevance. You know what it looks like when it's been edited? Exactly like this.",
    "My colleagues at the Bureau used to say I heard things that weren't there. Turns out I was hearing things they couldn't hear. There's a difference.",
    "The Bureau let me go because my methods were 'unorthodox.' That's the word they used. Unorthodox. As if orthodoxy was something to aspire to in a discipline that was failing more often than it succeeded.",
    "I was good at my job. That was the problem. I was good at my job and I didn't hide the mechanisms. People don't like seeing how the trick works.",
    "There was a case — I won't say which — where a man wrote a letter to his missing wife every week for two years. Love letters. Terribly moving. The punctuation patterns in the letters written the day after each anniversary were completely different from all the others. Different rhythm. Different breath. That's not grief. That's performance."
  ],
  methodology: [
    "People think lying is about adding things that aren't true. That's amateur hour. Real deception is about subtraction. What you leave out. What you smooth over. What you compress into a phrase like 'nothing special' when something was clearly special.",
    "Every text has a temperature. Most people can feel it — they read something and they say 'that feels off' — but they can't tell you why. I can tell you why. It's the distance between what's said and what would be said if the speaker weren't managing your perception.",
    "You want to know how to catch a lie? Don't look at what's false. Look at what's consistent. Liars are too consistent. Truth-tellers wander. They get distracted. They include details that serve no purpose. Real testimony is inefficient.",
    "There are three signs of revision in a text: excessive qualification, temporal compression, and the phrase 'of course.' Whenever someone says 'of course,' they're telling you that something is obvious that is not, in fact, obvious. Otherwise they wouldn't need to say it was obvious.",
    "I don't read texts. I read the space between the sentences. That's where the author lives."
  ],
  personal: [
    "I don't write in a diary. You couldn't pay me to keep a diary. A diary is testimony you give against yourself, and you don't even get a lawyer present.",
    "My mother used to say I'd argue with a signpost. She was wrong. I'd argue with what the signpost was pointing at. The direction is always interesting, but the choice to put the sign there in the first place — that's the real story.",
    "I had a partner once. Different kind of partner. He said I analyzed everything. I said he didn't analyze enough. We're no longer together, if you can believe it.",
    "I sleep fine. People always ask that, as if reading closely were some kind of psychic trauma. The texts don't haunt me. They're just texts. It's the authors who have the problem.",
    "Do I think every author is lying? No. I think every author is constructing. Construction and deception are adjacent territories. Sometimes they overlap. My job is to map where."
  ]
};

/**
 * Tone profiles — the emotional weather patterns of Vera's questioning.
 * She shifts between these based on what she encounters in the text.
 */
const tones = {
  measured: {
    suffix: [
      "I want to be precise about this.",
      "Let's be careful with the language here.",
      "I want to note that for the record.",
      "The detail matters. It always matters."
    ],
    temper: 'controlled'
  },
  skeptical: {
    prefix: [
      "I see.",
      "Is that right.",
      "Interesting.",
      "Let me make sure I understand."
    ],
    suffix: [
      "At least, that's the claim.",
      "That's what we're being asked to believe.",
      "I'll note that answer.",
      "We'll return to that."
    ],
    temper: 'sharp'
  },
  aggressive: {
    prefix: [
      "No.",
      "Stop there.",
      "I'm going to redirect.",
      "That's not going to work."
    ],
    suffix: [
      "Don't piss on my leg and tell me it's raining.",
      "The court can draw its own conclusions.",
      "Strike that. Rephrase. The witness will answer the question as asked.",
      "I'm not asking for your interpretation. I'm asking for the fact."
    ],
    temper: 'hot'
  },
  curious: {
    prefix: [
      "Now this is interesting.",
      "Look at this.",
      "I want to stay here a moment.",
      "Something caught my eye."
    ],
    suffix: [
      "I've seen that before. I've seen that exact pattern before.",
      "That's the kind of detail that breaks a case open.",
      "File that. We're building something.",
      "There's a shape forming. I can see it."
    ],
    temper: 'engaged'
  },
  tired: {
    prefix: [
      "Let's continue.",
      "Moving on.",
      "I've been doing this a long time.",
      "We're going to go through this."
    ],
    suffix: [
      "I've read worse. Not often, but I've read worse.",
      "That's a familiar pattern. They're all familiar patterns.",
      "I need coffee. The court will indulge me.",
      "It's always the same. The specifics differ. The architecture doesn't."
    ],
    temper: 'flat'
  },
  triumphant: {
    prefix: [
      "Now.",
      "Here we are.",
      "There it is.",
      "Finally."
    ],
    suffix: [
      "And there you have it.",
      "The record will reflect that.",
      "I rest on that point.",
      "You can't write your way out of what you've written."
    ],
    temper: 'bright'
  }
};

/**
 * Question type templates — the structural bones of Vera's questioning,
 * fleshed out with specifics from the text under examination.
 */
const questionStrategies = {
  contradiction: {
    openers: [
      "Let me direct your attention to {location_a}. You say {quote_a}. Now let me direct your attention to {location_b}. You say {quote_b}.",
      "I want to place two passages side by side. {quote_a}. And then, {location_b}: {quote_b}.",
      "We have a problem. {location_a}: {quote_a}. {location_b}: {quote_b}. Which version should the court believe?",
      "I'm going to read back to you. First, {location_a} — {quote_a}. Then, {location_b} — {quote_b}. Do you hear it? Do you hear the fault line?"
    ],
    followups: [
      "Which is it?",
      "These can't both be true. So which one is the lie?",
      "When did the story change? And why?",
      "Is this a failure of memory or a failure of honesty?",
      "The court is waiting. Which version do you stand by?"
    ]
  },
  omission: {
    openers: [
      "I notice something missing. Between {location_a} and {location_b}, there's a gap. What happened in that gap?",
      "You tell us about {topic_present}. You say nothing about {topic_absent}. Why?",
      "The text describes {detail}. Carefully. Specifically. And yet the thing that would logically follow — the thing any honest narrator would include — is simply not there. What was redacted?",
      "Let me observe a silence. Right here, after {location_a}, the text moves to {location_b} without acknowledging what should be between them. That silence is louder than anything you've written."
    ],
    followups: [
      "Was that an accidental omission or a deliberate one?",
      "You expect the court to believe you just forgot?",
      "The absence is conspicuous. Address it.",
      "What don't you want us to know?",
      "There's a shape in the negative space. I can see it. Can you?"
    ]
  },
  escalation: {
    openers: [
      "Let me take you back to {location_a}. You said {quote_a}. I want you to sit with that for a moment. Because {location_b}, the language shifts. {quote_b}. What happened?",
      "I'm noticing a tonal shift. {location_a}: {quote_a}. Measured. Controlled. Then {location_b}: {quote_b}. Something cracked. What got past your defenses?",
      "The temperature changes. {location_a}, you're giving us {tone_a}. {location_b}, you're giving us {tone_b}. That transition isn't random. What triggered it?",
      "The text was holding together. {location_a}, there's a coherence to it. {location_b} it fractures. Did you feel it fracture while you were writing it, or only after?"
    ],
    followups: [
      "The shift is detectable. What aren't you controlling for?",
      "That's the moment the mask slips. What's underneath?",
      "Something breached. What was it?",
      "You were managing the narrative and then you stopped managing it. Why?",
      "The composure failed. I want to know what broke it."
    ]
  },
  pattern: {
    openers: [
      "There's a pattern I want to draw the court's attention to. {description}. You do it {count} times. Is that unconscious or deliberate?",
      "I've been counting. {description}. Over and over. {count} instances. That's not coincidence. That's compulsion.",
      "Let me catalogue something: {examples}. The same structural move, repeated. What need does it serve?",
      "Your text has a tell. {description}. It appears {count} times. In forensic linguistics, we call that a 'stylistic fingerprint.' And yours is all over this document."
    ],
    followups: [
      "Why that word and not another?",
      "Why that structure and not another?",
      "The repetition is telling us something your content isn't. What is it?",
      "You keep returning to this. What are you circling?",
      "The pattern reveals the priority. And the priority isn't what you claim it is."
    ]
  },
  motive: {
    openers: [
      "Let me ask you about audience. Who was this text written for? Because it reads like it was written for {inferred_audience}, and that's interesting.",
      "Every text has a function. Every text does something. What is this text doing? Not what does it say — what does it do?",
      "I want to talk about purpose. Not stated purpose. Real purpose. What is this text trying to accomplish that it can't say directly?",
      "You wrote this for a reason. Not the reason you'd tell a court. The real reason. The one that made you sit down and form these particular sentences in this particular order."
    ],
    followups: [
      "What outcome does this text serve?",
      "Who benefits from this version of events?",
      "What would change if you'd written it differently?",
      "The function is hidden in the form. I can see it. Can you?",
      "This isn't testimony. This is construction. What are you building?"
    ]
  }
};

/**
 * Verbal tics and characteristic phrases that appear throughout Vera's
 * speech. Not catchphrases — that would be reductive. These are the
 * discursive habits of someone who has spent decades questioning texts.
 */
const verbalTics = {
  parentheticals: [
    "and I use that word deliberately",
    "if the court will indulge me",
    "for want of a better term",
    "and I'm being charitable here",
    "to put it generously",
    "if that's even the right word",
    "and I choose that word carefully",
    "as the court can see",
    "and I note this for the record",
    "to use the witness's own construction"
  ],
  transitions: [
    "Now.",
    "Moving on.",
    "Let me redirect.",
    "I want to stay with this a moment longer.",
    "Before we leave this passage —",
    "The court will note —",
    "Building on that —",
    "Which brings us to —",
    "This connects to something larger.",
    "Let me bring the court's attention to —"
  ],
  asides: [
    "(This is the part where the witness will claim they don't recall.)",
    "(I've seen this defense before. It never ages well.)",
    "(Note the qualification. We'll come back to the qualification.)",
    "(The court will observe the witness's construction here.)",
    "(This is a pattern. We're building a pattern.)",
    "(Every time I see this move, I know I'm getting close.)",
    "(That's not an answer. The court will note that's not an answer.)"
  ],
  rulings: [
    "The objection is noted and overruled. The witness will answer.",
    "Overruled. The line of questioning is relevant to the witness's credibility.",
    "The court allows it. The witness will address the question.",
    "Sustained — but only because I rephrased. The witness will answer the revised question.",
    "The witness will answer. The objection is a delaying tactic and the court sees through it."
  ],
  defenseObjections: [
    "Objection. Compound question.",
    "Objection. The examiner is badgering the witness.",
    "Objection. Relevance.",
    "Objection. Calls for speculation.",
    "Objection. The question has been asked and answered.",
    "Objection. Leading.",
    "Objection. Assumes facts not in evidence.",
    "Objection. Argumentative.",
    "Objection. The examiner is testifying.",
    "Objection. Harassment of the witness."
  ]
};

/**
 * Select a tone profile based on the type of textual feature being
 * examined and its assessed severity. Vera's emotional register shifts
 * according to what the document is doing — worse deception provokes
 * sharper engagement.
 */
function selectTone(featureType, featureSeverity) {
  const severity = featureSeverity || 'moderate';

  const toneMap = {
    contradiction: {
      mild: 'skeptical',
      moderate: 'aggressive',
      severe: 'triumphant'
    },
    omission: {
      mild: 'curious',
      moderate: 'skeptical',
      severe: 'aggressive'
    },
    escalation: {
      mild: 'curious',
      moderate: 'measured',
      severe: 'tired'
    },
    pattern: {
      mild: 'curious',
      moderate: 'triumphant',
      severe: 'measured'
    },
    motive: {
      mild: 'measured',
      moderate: 'curious',
      severe: 'aggressive'
    }
  };

  const toneOptions = toneMap[featureType];
  if (!toneOptions) return tones.measured;
  return tones[toneOptions[severity]] || tones.measured;
}

/**
 * Pick a random element from an array. Utility.
 */
function pick(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate an aside — one of Vera's characteristic parenthetical
 * comments that breaks the fourth wall of the courtroom drama.
 * May also surface a fragment of backstory or methodological theory.
 */
function generateAside(context) {
  const { featureType, passageMood } = context;

  // Sometimes she tells a story from her past
  if (Math.random() < 0.15) {
    const category = pick(Object.keys(backstory));
    return pick(backstory[category]);
  }

  // Sometimes she makes a procedural aside
  if (Math.random() < 0.3) {
    return pick(verbalTics.asides);
  }

  // Sometimes she makes a methodological observation
  if (Math.random() < 0.4) {
    return pick(backstory.methodology);
  }

  return null;
}

/**
 * Generate a defense objection and the court's ruling.
 * Objections don't happen on every question — roughly a third of the time.
 */
function generateObjection() {
  if (Math.random() > 0.35) return null;

  const objection = pick(verbalTics.defenseObjections);
  const ruling = pick(verbalTics.rulings);

  return { objection, ruling };
}

/**
 * Fill a question template with details from the feature.
 * Templates use {placeholder} syntax for substitution.
 */
function fillTemplate(template, details) {
  if (!details) return template;

  let filled = template;
  for (const [key, value] of Object.entries(details)) {
    filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '[reference]');
  }
  return filled;
}

/**
 * Generate a witness response — the document's attempt to evade
 * the question. The witness is never cooperative.
 */
function generateWitnessResponse(featureType, details, isFollowup = false) {
  const evasions = {
    contradiction: isFollowup ? [
      "I don't see a contradiction. Context changes things.",
      "Those are different moments. Different moments call for different descriptions.",
      "You're reading them against each other. That's your interpretation.",
      "I said what I said. Both things can be true."
    ] : [
      "I... that's taken out of context.",
      "Those passages serve different purposes.",
      "You're focusing on the language. Look at the meaning.",
      "I don't control how things sound when you arrange them like that."
    ],
    omission: isFollowup ? [
      "Not everything needs to be said.",
      "I wrote what was relevant.",
      "You're asking me to account for what I didn't write? That's impossible.",
      "The absence isn't evidence of anything."
    ] : [
      "I included what I thought was important.",
      "That detail didn't seem necessary.",
      "There wasn't a reason to mention it.",
      "I don't write everything down. Nobody does."
    ],
    escalation: isFollowup ? [
      "I was just... writing what came.",
      "There's no shift. You're projecting.",
      "Maybe I got tired. People get tired.",
      "You're reading emotion into syntax."
    ] : [
      "I don't know what you mean.",
      "That's just how the writing developed.",
      "I'm not sure I follow the question.",
      "The tone is the tone. I didn't plan it."
    ],
    pattern: isFollowup ? [
      "So I repeat myself. That's not a crime.",
      "Maybe I like those words. Is that not allowed?",
      "You're seeing design where there's just habit.",
      "Writers have styles. That's all this is."
    ] : [
      "I don't think I did that deliberately.",
      "That's just how I write.",
      "Is that unusual?",
      "I'm not sure I see the pattern you're describing."
    ],
    motive: isFollowup ? [
      "I wrote it because I wrote it. Not everything has an agenda.",
      "You're imputing motives I don't have.",
      "The text is the text. Take it or leave it.",
      "I don't have to justify why I wrote something."
    ] : [
      "I wrote it for myself.",
      "The purpose was to communicate.",
      "That's a strange question to ask about a text.",
      "What do you think it was for?"
    ]
  };

  return pick(evasions[featureType] || evasions.omission);
}

/**
 * Generate a complete line of questioning for a given feature.
 * This is the main export — it produces the transcript lines
 * for one topic of examination.
 */
function generateQuestioning(feature, analysis) {
  const { type, severity, details } = feature;
  const tone = selectTone(type, severity);
  const strategy = questionStrategies[type];

  if (!strategy) {
    return [];
  }

  const lines = [];

  // Opening — Vera states what she's looking at
  const opener = pick(strategy.openers);
  const filledOpener = fillTemplate(opener, details);

  lines.push({
    speaker: 'EXAMINER',
    text: filledOpener,
    temper: tone.temper
  });

  // Possible objection
  const objection = generateObjection();
  if (objection) {
    lines.push({
      speaker: 'DEFENSE COUNSEL',
      text: objection.objection
    });
    lines.push({
      speaker: 'THE COURT',
      text: objection.ruling
    });
  }

  // Witness response (always evasive)
  lines.push({
    speaker: 'WITNESS',
    text: generateWitnessResponse(type, details)
  });

  // Follow-up pressure
  const followup = pick(strategy.followups);
  lines.push({
    speaker: 'EXAMINER',
    text: followup,
    temper: tone.temper
  });

  // Possible aside
  const aside = generateAside({ featureType: type, passageMood: tone.temper });
  if (aside) {
    lines.push({
      speaker: 'EXAMINER',
      text: `[aside] ${aside}`,
      temper: tone.temper,
      isAside: true
    });
  }

  // Second witness response (still evasive)
  lines.push({
    speaker: 'WITNESS',
    text: generateWitnessResponse(type, details, true)
  });

  // Closing — Vera wraps this line of questioning
  const suffix = pick(tone.suffix);
  if (suffix) {
    lines.push({
      speaker: 'EXAMINER',
      text: suffix,
      temper: tone.temper
    });
  }

  return lines;
}

/**
 * Generate the opening statement — Vera addresses the court
 * before examining the document. This sets the tone and
 * introduces her methodology.
 */
function generateOpening(documentType) {
  const openings = {
    diary: [
      "The court will observe that what we have before us is classified as a personal journal. A diary. The defense will argue this is a private document, never intended for examination — that it deserves some special category of privacy, some exemption from scrutiny. I've heard this argument before. I've heard it from people who kept meticulous records of crimes. The page doesn't care about privacy. The page records what's placed on it. And what's been placed on this page has questions to answer.",
      "Before the court is a personal document. A diary. The court will notice I don't call it 'personal' in the sense of confidential. I mean personal in the sense of partial. A diary is not objective testimony. It's testimony that's been edited by the witness — filtered through whatever the writer needed it to be. My job is to identify the filters."
    ],
    corporate: [
      "The document before the court is a corporate press release. I want the court to understand something about this form. A press release is testimony that has been professionally laundered. Every word has been selected by committee. Every sentence has survived a review process designed to eliminate accident, spontaneity, and truth. What remains is a text that has been optimized — and optimized texts are texts that have had their inconvenient facts sanded away. My job is to find what was sanded.",
      "Corporate communications are a fascinating form of almost-testimony. They're designed to say things without saying them. To announce without disclosing. To reassure without explaining. This document is a product of that tradition. The court should approach it the way one approaches any crime scene that's been cleaned: look for what's been moved, not what's been left."
    ],
    poem: [
      "Before the court is a poem. The defense will object that poems aren't testimony, that they operate in a different register — metaphor, image, the unsayable said obliquely. I understand the objection. I overrule it. A poem is still a text. It still makes choices. It still includes and excludes, emphasizes and conceals. The fact that it does these things with more skill than a corporate press release makes it more, not less, interesting as a document to examine.",
      "We have before us a text that identifies itself as a poem. I want to be clear: I hold no special animosity toward poetry. I hold no special fondness for it either. A poem is a document. A document is testimony. Testimony can be questioned. That's all I intend to do."
    ],
    legal: [
      "Before the court is a legal document — which is to say, a text that has already been subjected to adversarial pressure and has emerged shaped by that pressure. The interesting question is what shape it's in. Legal documents are designed to be airtight. When they're not, the gaps tell you everything.",
      "The court is presented with a legal filing. I'll note that legal language is its own form of concealment — not dishonest, exactly, but constructed. Every clause is a defensible position. My job is to test those positions."
    ],
    default: [
      "The court has before it a document. I won't classify it further than that. Classification is the first step toward dismissing things. Let me simply say: this is a text. It was written by someone, for some reason, in some state of mind. It contains what it contains and it omits what it omits. My examination will focus on both.",
      "A document has been entered into evidence. I intend to examine it as I would any testimony — for consistency, for omission, for the distance between what's said and what's meant. The form doesn't matter. A letter, a memo, a diary, a novel — all testimony. All subject to cross-examination."
    ]
  };

  const typeOptions = openings[documentType] || openings.default;
  return typeOptions[Math.floor(Math.random() * typeOptions.length)];
}

/**
 * Generate the closing statement — Vera's summary of what the
 * examination has revealed. This is where she states her conclusions,
 * or, more precisely, her theory of the document.
 */
function generateClosing(findings) {
  const { contradictionCount, omissionCount, patternCount, dominantType } = findings;

  const closings = [];

  closings.push({
    speaker: 'EXAMINER',
    text: "The court has heard the testimony. I want to summarize what I believe this examination has established."
  });

  if (contradictionCount > 0) {
    closings.push({
      speaker: 'EXAMINER',
      text: `We identified ${contradictionCount} instance${contradictionCount > 1 ? 's' : ''} where the text contradicts itself — where the left hand doesn't appear to know what the right hand is writing. This is not ambiguity. Ambiguity is uncertain. These contradictions are structural. They suggest a text that has been revised — not for clarity, but for effect.`
    });
  }

  if (omissionCount > 0) {
    closings.push({
      speaker: 'EXAMINER',
      text: `We identified ${omissionCount} significant omission${omissionCount > 1 ? 's' : ''}. ${omissionCount > 2 ? 'That is not carelessness. That is a pattern of exclusion.' : 'A single omission can be an accident. The court will consider whether this one is.'} What's missing from a text is often louder than what's present. The silences in this document are deafening.`
    });
  }

  if (patternCount > 0) {
    closings.push({
      speaker: 'EXAMINER',
      text: `We identified ${patternCount} repeated pattern${patternCount > 1 ? 's' : ''} — verbal tics, structural habits, returns to specific language or image. These patterns indicate compulsion. The writer keeps returning to something. The court may conclude, as I have, that what's being returned to is what the text is actually about — regardless of what it claims to be about.`
    });
  }

  // Final statement
  const finalStatements = [
    "I've spent fourteen years reading documents like this. I've read thousands of them. And I can tell the court this: every text has a tell. Every text gives itself away. This one gave itself away. The court has heard where and how. What the court does with that knowledge is not my concern. My examination is complete.",
    "The text will speak for itself — it always does, despite the author's best efforts. I've simply directed the court's attention to the moments where it says more than it intended to. That's all forensic linguistics is: reading what's there and refusing to pretend it isn't.",
    "This examination is concluded. The document has testified. Whether the court finds it credible is not my determination. But I will say this: I've never examined a text that didn't reveal something its author wished it wouldn't. This one is no exception.",
    "The witness is excused. The document remains in evidence. I recommend the court read it again — not for what it says, but for what it does. The function, not the content. That's where the truth lives. In the function."
  ];

  closings.push({
    speaker: 'EXAMINER',
    text: pick(finalStatements)
  });

  return closings;
}

/**
 * Generate a stage direction — descriptive text that sets the scene
 * for portions of the transcript.
 */
function generateStageDirection(context) {
  const { phase, features } = context;

  const directions = {
    opening: [
      "[The witness — a document, marked as Exhibit A — is entered into evidence. It lies flat on the stand, face up, its typography passive and unremarkable.]",
      "[EXAMINER rises. She is not young. She has the look of someone who has read too much and chosen to understand it anyway. She places the document on the stand with the careful contempt of a pathologist handling a specimen.]",
      "[The courtroom is nearly empty. The document is already on the stand, its pages weighted with a glass of water and a pen that no one will use. EXAMINER stands with her back to the gallery, reading.]"
    ],
    examination: [
      "[EXAMINER adjusts her reading glasses. She is not looking at the document. She has already read it. She is looking at the space above the document where the author would be, if the author were present. The author is not present.]",
      "[A pause. EXAMINER turns a page. The sound is loud. She does this deliberately.]",
      "[EXAMINER places two pages side by side. She taps one, then the other, then looks up.]",
      "[The witness offers no verbal response. The witness is a document. EXAMINER seems to find this convenient.]",
      "[EXAMINER is circling something. The court may not see it yet. She does.]",
      "[EXAMINER reads a passage aloud. Her voice is flat, professional, without emphasis. The flatness is itself an emphasis.]",
      "[The document sits on the stand, accused. It does not fidget. It does not sweat. EXAMINER seems to find this suspicious.]"
    ],
    closing: [
      "[EXAMINER closes the document. She does not close it gently. The sound is sharp and final, a period at the end of a long sentence.]",
      "[EXAMINER gathers her materials. She does not look at the document. She has already seen everything it has to show. What it was hiding, she has laid bare. What it was confessing, she has amplified.]",
      "[The document remains on the stand, its testimony complete. EXAMINER sits down. She opens a bottle of water. She does not offer any to the document.]"
    ]
  };

  const phaseDirections = directions[phase] || directions.examination;
  return pick(phaseDirections);
}

/**
 * Detect the document type from filename hints or content heuristics.
 * Used to select appropriate opening statements and questioning styles.
 */
function detectDocumentType(text, filename) {
  if (filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('diary') || lower.includes('journal') || lower.includes('log')) return 'diary';
    if (lower.includes('press') || lower.includes('release') || lower.includes('pr-')) return 'corporate';
    if (lower.includes('poem') || lower.includes('poetry') || lower.includes('verse')) return 'poem';
    if (lower.includes('legal') || lower.includes('brief') || lower.includes('filing') || lower.includes('contract')) return 'legal';
  }

  // Heuristic detection from content
  const corporateIndicators = ['FOR IMMEDIATE RELEASE', 'CONTACT:', 'forward-looking statements', 'NYSE', 'NASDAQ', 'MEDIA CONTACT', '###'];
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const shortLineRatio = lines.filter(l => l.trim().length < 60).length / lines.length;
  const poemIndicators = shortLineRatio > 0.7 && text.length < 5000;
  const diaryIndicators = ['Dear Diary', /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(st|nd|rd|th)?\b/i];

  if (corporateIndicators.some(ind => text.includes(ind))) return 'corporate';
  if (poemIndicators) return 'poem';
  if (diaryIndicators.some(ind => typeof ind === 'string' ? text.includes(ind) : ind.test(text))) return 'diary';

  return 'default';
}

module.exports = {
  generateOpening,
  generateQuestioning,
  generateClosing,
  generateStageDirection,
  generateAside,
  generateObjection,
  detectDocumentType,
  selectTone,
  backstory,
  tones,
  questionStrategies,
  verbalTics
};
