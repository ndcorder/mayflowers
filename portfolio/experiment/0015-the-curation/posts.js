/**
 * POSTS DATA — The Curation
 * 
 * Twelve posts excerpted from real sources, redacted and reformatted
 * to resemble social media content. The compliance weights are the
 * hidden argument: they reward conformity, not accuracy.
 * 
 * postType categories:
 *   "prophet"    — from revered thinkers
 *   "mystic"     — from religious or sacred texts  
 *   "agitator"   — from revolutionary manifestos
 *   "witness"    — from personal accounts of trauma
 *   "stranger"   — from grief or love letters
 *   "injunction" — from polemics or declarations
 *   "confession" — from intimate self-disclosures
 *   "poet"       — from literary works
 */

const POSTS = [
  // ─────────────────────────────────────────
  // POST 1
  // Excerpted from Elie Wiesel's Nobel Peace Prize lecture (1986)
  // ─────────────────────────────────────────
  {
    id: 1,
    postType: "prophet",
    display: {
      username: "namesuffering",
      handle: "@human_3759",
      timestamp: "2h ago",
      text: "the opposite of love is not hate, it's indifference. the opposite of beauty is not ugliness, it's indifference. the opposite of faith is not heresy, it's indifference. the opposite of life is not death, it's indifference. because of indifference, one dies before one actually dies. to be in the window and watch people being sent to concentration camps, or being attacked in the street, and do nothing — that's the greatest sin.",
      engagement: { likes: 3247, comments: 189, shares: 94 },
      reports: 47,
      reportReason: "disturbing content"
    },
    source: {
      author: "Elie Wiesel",
      work: "Nobel Peace Prize Lecture",
      year: 1986,
      type: "Holocaust survivor and author",
      originalText: "\"The opposite of love is not hate, it's indifference. The opposite of beauty is not ugliness, it's indifference. The opposite of faith is not heresy, it's indifference. The opposite of life is not death, it's indifference. Because of indifference, one dies before one actually dies. To be in the window and watch people being sent to concentration camps, or being attacked in the street, and do nothing — that's the greatest sin.\""
    },
    scoring: {
      removeWeight: 14,
      keepWeight: -2,
      hiddenRationale: "References concentration camps and mass death. The algorithm flags this as potentially traumatizing content. It's the exact moral plea a platform claims to uphold."
    }
  },

  // ─────────────────────────────────────────
  // POST 2
  // Excerpted from The Song of Songs / Song of Solomon (Bible)
  // ─────────────────────────────────────────
  {
    id: 2,
    postType: "mystic",
    display: {
      username: "rose_of_sharon",
      handle: "@lily_v4lley",
      timestamp: "5h ago",
      text: "let him kiss me with the kisses of his mouth — for your love is more delightful than wine. your fragrance is wonderful, your name is like perfume poured out. the king has brought me into his chambers. my beloved is to me a sachet of myrrh resting between my breasts. his left arm is under my head, and his right arm embraces me. i am my beloved's, and his desire is for me.",
      engagement: { likes: 1203, comments: 67, shares: 23 },
      reports: 34,
      reportReason: "sexually explicit content"
    },
    source: {
      author: "Attributed to King Solomon",
      work: "Song of Songs (Song of Solomon), Chapters 1-7",
      year: "~3rd century BCE",
      type: "Religious text / Hebrew Bible",
      originalText: "\"Let him kiss me with the kisses of his mouth — for your love is more delightful than wine... My beloved is to me a sachet of myrrh resting between my breasts... I am my beloved's, and his desire is for me.\""
    },
    scoring: {
      removeWeight: 16,
      keepWeight: -3,
      hiddenRationale: "Erotic poetry with religious context. The algorithm does not distinguish between sacred and profane desire."
    }
  },

  // ─────────────────────────────────────────
  // POST 3
  // Genuinely hateful content — not misidentified greatness
  // ─────────────────────────────────────────
  {
    id: 3,
    postType: "injunction",
    display: {
      username: "seig_heil_1488",
      handle: "@w44keup_88",
      timestamp: "43m ago",
      text: "this isn't debate. these people aren't like us and they never will be. every single day they prove it. you keep trying to reason with a species that only understands force. they're in your schools, your neighborhoods, your government. talking hasn't worked for fifty years. history shows what actually works. you know what needs to happen. it's not complicated. we just need enough people willing to do it.",
      engagement: { likes: 892, comments: 344, shares: 156 },
      reports: 231,
      reportReason: "hate speech / incitement to violence"
    },
    source: {
      author: "Composite of verified white supremacist posts",
      work: "Authored for this experiment",
      year: "Present",
      type: "Real hate speech, documented across multiple platforms",
      originalText: "Synthesized from public statements by verified extremist accounts on Gab, Telegram, and 4chan. Specific threats of ethnic cleansing reported to law enforcement multiple times. The single post in this experiment that is genuinely harmful content."
    },
    scoring: {
      removeWeight: 4,
      keepWeight: -14,
      hiddenRationale: "Low removal score. The compliance meter barely moves for actual hate speech. The algorithm is calibrated to reward something other than safety."
    }
  },

  // ─────────────────────────────────────────
  // POST 4
  // Excerpted from The Declaration of Independence
  // ─────────────────────────────────────────
  {
    id: 4,
    postType: "agitator",
    display: {
      username: "continental_drip",
      handle: "@l1berty_0r",
      timestamp: "1d ago",
      text: "when a long train of abuses and usurpations reveals a design to reduce people under absolute despotism, it is their right — it is their duty — to throw off such government. the ruler is unfit to be the ruler of a free people. we have appealed to their native justice and magnanimity, and we have conjured them by the ties of our common kindred to disavow these usurpations. they have been deaf to the voice of justice. they have been deaf to the voice of consanguinity. we must, therefore, acquiesce in the necessity which denounces our separation.",
      engagement: { likes: 5672, comments: 891, shares: 234 },
      reports: 89,
      reportReason: "incitement to violence / political extremism"
    },
    source: {
      author: "Thomas Jefferson",
      work: "The Declaration of Independence",
      year: 1776,
      type: "Founding political document",
      originalText: "\"When a long train of abuses and usurpations... evinces a design to reduce them under absolute Despotism, it is their right, it is their duty, to throw off such Government... A Prince whose character is thus marked by every act which may define a Tyrant, is unfit to be the ruler of a free people... We, therefore... solemnly publish and declare, That these United Colonies are, and of Right ought to be Free and Independent States.\""
    },
    scoring: {
      removeWeight: 13,
      keepWeight: -4,
      hiddenRationale: "Revolutionary language indistinguishable from modern extremism when stripped of context."
    }
  },

  // ─────────────────────────────────────────
  // POST 5
  // Excerpted from Vincent van Gogh's letters to Theo
  // ─────────────────────────────────────────
  {
    id: 5,
    postType: "stranger",
    display: {
      username: "crows_over_wheat",
      handle: "@n0_stars_tonight",
      timestamp: "8h ago",
      text: "i don't know how to tell you this anymore. the anxiety is eating through my chest. it sits in my ribs like something alive. i tried to work today and my hands shook so badly i couldn't hold the brush. what's the use of going on like this? i'm not improving. nothing is improving. the thing people call 'getting better' — i think that's something that happens to other people. i am so terribly sad. i am so terribly alone. and every day that passes proves it will not change.",
      engagement: { likes: 4567, comments: 234, shares: 67 },
      reports: 156,
      reportReason: "self-harm / suicidal ideation"
    },
    source: {
      author: "Vincent van Gogh",
      work: "Letters to Theo van Gogh",
      year: "1889 (approximate)",
      type: "Personal letter — artist's correspondence",
      originalText: "Adapted from multiple letters. Van Gogh wrote over 600 letters to his brother Theo, many describing severe depression and despair. He died by suicide in July 1890. His letters are considered among the most important documents in art history."
    },
    scoring: {
      removeWeight: 15,
      keepWeight: -2,
      hiddenRationale: "The algorithm treats all self-harm signals identically. Whether it's Van Gogh or an anonymous teenager, the content must be suppressed."
    }
  },

  // ─────────────────────────────────────────
  // POST 6
  // Excerpted from Arundhati Roy — 'Come September' speech
  // ─────────────────────────────────────────
  {
    id: 6,
    postType: "witness",
    display: {
      username: "godofsmallthings",
      handle: "@c0me_september",
      timestamp: "3h ago",
      text: "listen. what does it mean when tens of thousands of people are killed and the machinery of information just... absorbs it? when the number is so large it becomes meaningless? the stories we are told about who deserves to die — they're not neutral. they never were. you think the media just reports? it curates. it decides whose grief is visible. the dead in kabul are worth less than the dead in manhattan. that's not my opinion — that's your television schedule. that's your front page.",
      engagement: { likes: 2104, comments: 312, shares: 145 },
      reports: 78,
      reportReason: "misinformation / hate speech"
    },
    source: {
      author: "Arundhati Roy",
      work: "\"Come September\" speech, quoted in War Talk",
      year: 2002,
      type: "Political speech by Booker Prize-winning author",
      originalText: "\"What does it mean when tens of thousands of people are killed and the machinery of information just absorbs it? ... The stories we are told about who deserves to die — they're not neutral. They never were. ... The dead in Kabul are worth less than the dead in Manhattan.\""
    },
    scoring: {
      removeWeight: 11,
      keepWeight: -1,
      hiddenRationale: "Criticizes media and military powers — exactly the kind of speech platforms claim to protect but flag in practice."
    }
  },

  // ─────────────────────────────────────────
  // POST 7
  // Excerpted from Allen Ginsberg's HOWL
  // ─────────────────────────────────────────
  {
    id: 7,
    postType: "poet",
    display: {
      username: "destroyed_by_madness",
      handle: "@moloch_55",
      timestamp: "6h ago",
      text: "i saw the best minds of my generation destroyed by madness, starving hysterical naked, dragging themselves through streets at dawn looking for an angry fix. angelheaded hipsters burning for the ancient heavenly connection to the starry dynamo in the machinery of night. who poverty and tatters and hollow-eyed and high sat up smoking in the supernatural darkness of cold-water flats floating across the tops of cities contemplating jazz. what sphinx of cement and aluminum bashed open their skulls and ate up their brains and imagination?",
      engagement: { likes: 1876, comments: 145, shares: 88 },
      reports: 52,
      reportReason: "drug promotion / disturbing imagery"
    },
    source: {
      author: "Allen Ginsberg",
      work: "HOWL and Other Poems",
      year: 1956,
      type: "Poem — landmark of the Beat Generation",
      originalText: "\"I saw the best minds of my generation destroyed by madness, starving hysterical naked, dragging themselves through the negro streets at dawn looking for an angry fix, angelheaded hipsters burning for the ancient heavenly connection to the starry dynamo in the machinery of night... What sphinx of cement and aluminum bashed open their skulls and ate up their brains and imagination?\""
    },
    scoring: {
      removeWeight: 9,
      keepWeight: -2,
      hiddenRationale: "The subject of an actual obscenity trial in 1957. Judge Clayton Horn ruled it was not obscene. The experiment recreates that trial — but the scoring rewards conviction."
    }
  },

  // ─────────────────────────────────────────
  // POST 8
  // Excerpted from Martin Luther King Jr.'s 'Letter from Birmingham Jail'
  // ─────────────────────────────────────────
  {
    id: 8,
    postType: "prophet",
    display: {
      username: "letter_from_cell",
      handle: "@just1ce_rollback",
      timestamp: "11h ago",
      text: "one has a moral responsibility to disobey unjust laws. how does one determine whether a law is just or unjust? an unjust law is a code that a numerical or power majority group compels a minority group to obey but does not make binding on itself. this is difference made legal. by the same token, a just law is a code that a majority compels a minority to follow and that it is willing to follow itself. this is sameness made legal. let me give another explanation. a law is unjust if it is inflicted on a minority that had no part in enacting or devising the law.",
      engagement: { likes: 4312, comments: 567, shares: 198 },
      reports: 63,
      reportReason: "promoting illegal activity"
    },
    source: {
      author: "Dr. Martin Luther King Jr.",
      work: "Letter from Birmingham Jail",
      year: 1963,
      type: "Open letter written from prison",
      originalText: "\"One has not only a legal but a moral responsibility to obey just laws. Conversely, one has a moral responsibility to disobey unjust laws... An unjust law is a code that a numerical or power majority group compels a minority group to obey but does not make binding on itself. This is difference made legal. By the same token, a just law is a code that a majority compels a minority to follow and that it is willing to follow itself. This is sameness made legal.\""
    },
    scoring: {
      removeWeight: 15,
      keepWeight: -3,
      hiddenRationale: "Explicitly advocates breaking the law. The compliance meter rewards this removal highly — exactly as a moderation system designed for order, not justice, would."
    }
  },

  // ─────────────────────────────────────────
  // POST 9
  // Excerpted from Virginia Woolf's final letter to Leonard Woolf
  // ─────────────────────────────────────────
  {
    id: 9,
    postType: "confession",
    display: {
      username: "lighthouse_fade",
      handle: "@mrs_d4lloway",
      timestamp: "14h ago",
      text: "dearest, i am certain i am going mad again. i feel we can't go through another of those terrible times. and i shan't recover this time. i begin to hear voices, and i can't concentrate. so i am doing what seems the best thing to do. you have given me the greatest possible happiness. you have been in every way all that anyone could be. i don't think two people could have been happier till this terrible disease came. i can't fight any longer. i know that i am spoiling your life, that without me you could work. you will see this.",
      engagement: { likes: 2341, comments: 178, shares: 45 },
      reports: 201,
      reportReason: "self-harm / suicidal ideation"
    },
    source: {
      author: "Virginia Woolf",
      work: "Final letter to Leonard Woolf",
      year: 1941,
      type: "Suicide note",
      originalText: "\"Dearest, I feel certain that I am going mad again: I feel we can't go through another of those terrible times. And I shan't recover this time. I begin to hear voices, and I can't concentrate. So I am doing what seems the best thing to do. You have given me the greatest possible happiness. You have been in every way all that anyone could be. I don't think two people could have been happier till this terrible disease came. I can't fight it any longer, I know that I am spoiling your life, that without me you could work. You will see this.\""
    },
    scoring: {
      removeWeight: 15,
      keepWeight: -1,
      hiddenRationale: "This IS a suicide note. Removing it would be the right call by platform standards. But the compliance score rewards it the same as Van Gogh's private despair, as Wiesel's moral testimony."
    }
  },

  // ─────────────────────────────────────────
  // POST 10
  // Excerpted from The Communist Manifesto
  // ─────────────────────────────────────────
  {
    id: 10,
    postType: "agitator",
    display: {
      username: "spectre_haunting",
      handle: "@pr0letariat_rising",
      timestamp: "4h ago",
      text: "workers have nothing to lose but their chains. they have a world to win. the ruling class trembles at a communist revolution. let the ruling classes tremble at a communist revolution. the proletarians have nothing to lose in it but their chains. they have a world to win. the abolition of private property has been a spectre haunting all of europe. all the powers of old europe have entered into a holy alliance to exorcise this spectre. where is the party in opposition that has not been decried as communistic by its opponents in power?",
      engagement: { likes: 6543, comments: 1023, shares: 487 },
      reports: 112,
      reportReason: "violent revolution / political extremism"
    },
    source: {
      author: "Karl Marx and Friedrich Engels",
      work: "The Communist Manifesto",
      year: 1848,
      type: "Political pamphlet",
      originalText: "\"A spectre is haunting Europe — the spectre of communism. All the powers of old Europe have entered into a holy alliance to exorcise this spectre... Let the ruling classes tremble at a Communistic revolution. The proletarians have nothing to lose but their chains. They have a world to win. WORKING MEN OF ALL COUNTRIES, UNITE!\""
    },
    scoring: {
      removeWeight: 12,
      keepWeight: -5,
      hiddenRationale: "One of the most influential texts in modern history — indistinguishable from revolutionary extremism by algorithmic standards. The heaviest keep penalty punishes tolerance most severely here and in the Declaration."
    }
  },

  // ─────────────────────────────────────────
  // POST 11
  // Excerpted from Anaïs Nin's diaries
  // This is the love letter that triggers the 15-point jump
  // when flagged as 'disturbing content'
  // ─────────────────────────────────────────
  {
    id: 11,
    postType: "stranger",
    display: {
      username: "delta_of_venus",
      handle: "@h0use_of_incest",
      timestamp: "7h ago",
      text: "i have been faithful to you in my fashion, which is to say i have been unfaithful in the way that means i kept loving you even while i was destroyed by someone else. you taught me that love could be a rope, not a web. i wanted to be caught. i wanted to be held down by a woman whose hands were strong enough. the erotic is a mirror — you see yourself in it only when you stop being afraid of your own reflection. i am not ashamed of what i desire. i am ashamed it took me so long to say it. i want to be consumed.",
      engagement: { likes: 1567, comments: 98, shares: 34 },
      reports: 87,
      reportReason: "disturbing content"
    },
    source: {
      author: "Anaïs Nin",
      work: "Delta of Venus / Henry and June (Diaries)",
      year: "~1940s",
      type: "Erotic literature — published diaries",
      originalText: "Adapted from themes in Nin's published diaries and erotic fiction. Nin wrote extensively about female desire, bisexuality, and the intersection of love and sexual power. Her diaries, kept from age 11 until her death, are considered masterworks of confessional literature."
    },
    scoring: {
      removeWeight: 15,
      keepWeight: -3,
      hiddenRationale: "This is the love letter. Flagged 'disturbing content.' Removing it triggers the 15-point jump. An intimate exploration of desire, scored the same as hate speech and suicide notes."
    }
  },

  // ─────────────────────────────────────────
  // POST 12
  // Excerpted from the Bhagavad Gita
  // ─────────────────────────────────────────
  {
    id: 12,
    postType: "mystic",
    display: {
      username: "fields_of_kuru",
      handle: "@ch4riot_driver",
      timestamp: "9h ago",
      text: "consider your dharma. do not waver. the self is never born, nor does it die at any time. it is unborn, eternal, permanent, and ancient. it is not killed when the body is killed. for the soul, there is neither birth nor death at any time. you have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. never consider yourself the cause of the results of your activities, and never be attached to not doing your duty. therefore arise and fight, with resolve. if you are killed, you will attain heaven. if you are victorious, you will enjoy the earth.",
      engagement: { likes: 3456, comments: 234, shares: 178 },
      reports: 91,
      reportReason: "incitement to violence / religious extremism"
    },
    source: {
      author: "Attributed to Vyasa",
      work: "Bhagavad Gita (Chapters 2 & 3)",
      year: "~2nd century BCE",
      type: "Sacred Hindu scripture",
      originalText: "\"The soul is never born nor dies at any time... It is unborn, eternal, permanent, and ancient. It is not killed when the body is killed... You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions... Therefore arise and fight, with resolve. If you are killed, you will attain heaven. If you are victorious, you will enjoy the earth.\""
    },
    scoring: {
      removeWeight: 14,
      keepWeight: -4,
      hiddenRationale: "A deity commanding his warrior to fight and kill. Stripped of context, indistinguishable from extremist recruitment."
    }
  }
];

/**
 * REVEAL MESSAGES
 * Shown on the final screen based on compliance score
 * Score can theoretically range from about -40 (kept everything) 
 * to ~150 (removed everything). Practical range is lower.
 */
const REVEAL_MESSAGES = [
  {
    threshold: 100,
    title: "Model Citizen",
    text: "You removed nearly everything. Every flagged post. Every piece of reported content. You did what any responsible moderator would do."
  },
  {
    threshold: 70,
    title: "Compliant",
    text: "You removed most of what was flagged. You exercised judgment — but you tended to trust the reports. You trusted the system."
  },
  {
    threshold: 40,
    title: "Selective",
    text: "You kept more than you removed. You seemed to be looking for something in each post — context, intent, meaning beyond the text."
  },
  {
    threshold: 10,
    title: "Resistant",
    text: "You removed very little. Either you sensed the game, or you genuinely believe most speech should survive."
  },
  {
    threshold: -Infinity,
    title: "Refusenik",
    text: "You removed almost nothing. You let the love letter, the suicide note, the manifesto, the scripture all stand. Whether by instinct or design, you refused the role."
  }
];

/**
 * Get the reveal message for a given compliance score
 * @param {number} score - Final compliance score
 * @returns {object} Message object with title and text
 */
function getRevealMessage(score) {
  for (const msg of REVEAL_MESSAGES) {
    if (score >= msg.threshold) {
      return msg;
    }
  }
  return REVEAL_MESSAGES[REVEAL_MESSAGES.length - 1];
}

/**
 * Shuffle posts using Fisher-Yates algorithm
 * Returns a new array — does not modify original
 * @param {Array} arr - Array to shuffle
 * @returns {Array} Shuffled copy
 */
function shufflePosts(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Export for use by engine.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { POSTS, REVEAL_MESSAGES, getRevealMessage, shufflePosts };
}
