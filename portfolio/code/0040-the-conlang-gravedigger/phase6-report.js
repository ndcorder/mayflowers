/**
 * phase6-report.js
 *
 * Generates the archaeological report: scholars analysing fragments,
 * making systematically motivated wrong guesses, disagreeing with
 * each other in ways that reveal their own theoretical commitments.
 */

const {
  SeededRandom,
  weightedChoice,
  shuffle,
  listJoin,
} = require('./utils');

// ── Scholar pool ──────────────────────────────────────────────────

const SCHOLAR_POOL = [
  { name: 'Dr. Helena Voss',      institution: 'University of Vienna',            specialty: 'phonology',   approach: 'formalist',   bias: 'projects IE-like structure' },
  { name: 'Prof. Akira Tanaka',    institution: 'Tokyo Metropolitan University',   specialty: 'morphology',  approach: 'functionalist', bias: 'over-reliance on statistical frequency' },
  { name: 'Dr. Marcus Okoye',      institution: 'University of Ibadan',            specialty: 'syntax',      approach: 'typological',  bias: 'assumes all languages have nouns and verbs as distinct categories' },
  { name: 'Prof. Ingrid Larsson',  institution: 'Uppsala University',              specialty: 'semantics',   approach: 'cognitive',    bias: 'projects familiar cultural categories' },
  { name: 'Dr. Fatima Al-Rashid',  institution: 'American University of Beirut',   specialty: 'comparative', approach: 'historical',   bias: 'tends to find patterns in random noise' },
  { name: 'Prof. David Chen',      institution: 'National Taiwan University',      specialty: 'epigraphy',   approach: 'empiricist',   bias: 'assumes writing represents speech accurately' },
];

// ── Main entry ────────────────────────────────────────────────────

function generateReport(phonology, morphology, syntax, lexicon, decay, config, rng) {
  if (!rng) rng = new SeededRandom(config.seed || Date.now());
  const pr           = rng.spawn();
  const numScholars  = config.reportScholars || 3;

  // Select and prepare scholars
  const scholars = shuffle(SCHOLAR_POOL, pr.spawn())
    .slice(0, numScholars)
    .map(s => ({
      ...s,
      correctness: pr.float() * 0.3 + 0.3,   // 30–60 % accuracy
      petTheory:    null,
    }));

  // Assign pet theories
  if (scholars.length >= 2) scholars[0].petTheory = 'language contact';
  if (scholars.length >= 3) scholars[2].petTheory = 'substrate influence';

  const siteName = weightedChoice([
    { item: 'Khar Valley',       weight: 1 },
    { item: 'Tosk Basin',        weight: 1 },
    { item: 'Elmaren Plateau',   weight: 1 },
    { item: 'Vindholmen',        weight: 1 },
  ], pr.spawn());

  // Pick fragments for the report to discuss
  const clearFragments  = decay.fragments.filter(f => f.legibility === 'clear' || f.legibility === 'partial');
  const sampleFragments = clearFragments.slice(0, Math.min(20, clearFragments.length));

  const report = {
    title: 'Fragments of a Lost Tongue: Preliminary Analysis of the '
            + siteName + ' Inscriptions',
    scholars,
    siteName,
    abstract: '',
    sections: [],
    bibliography: [],
    sampleFragments,
  };

  // Generate each section
  report.sections.push(genIntroduction(report, decay, pr.spawn()));
  report.sections.push(genPhonologicalAnalysis(report, phonology, decay, pr.spawn()));
  report.sections.push(genMorphologicalAnalysis(report, morphology, decay, pr.spawn()));
  report.sections.push(genSyntacticInterpretation(report, syntax, decay, pr.spawn()));
  report.sections.push(genLexicalInventory(report, lexicon, decay, pr.spawn()));
  report.sections.push(genDiachronicAnalysis(report, decay, pr.spawn()));
  report.sections.push(genDisagreements(report, phonology, morphology, syntax, pr.spawn()));
  report.sections.push(genConclusion(report, decay, pr.spawn()));

  report.abstract     = genAbstract(report, decay);
  report.bibliography = genBibliography(scholars, pr.spawn());

  return report;
}

// ── Helpers ───────────────────────────────────────────────────────

function pickScholar(scholars, specialty) {
  return scholars.find(s => s.specialty === specialty) || scholars[0];
}

/** Pad a string to the right, truncating if necessary. */
function padR(str, len) {
  str = String(str);
  while (str.length < len) str += ' ';
  return str.slice(0, len);
}

// ── Abstract ──────────────────────────────────────────────────────

function genAbstract(report, decay) {
  const s    = report.scholars;
  const frag = decay.summary.fragmentCount;
  const leg  = decay.summary.legibleFragments;

  let text = 'This report presents the collaborative analysis of ' + frag
    + ' surviving fragments of a previously unattested language, here designated the "'
    + report.siteName + '" language. ';
  text += 'Of these, ' + leg + ' are legible enough for preliminary analysis. ';
  text += 'Our team of ' + s.length + ' specialists ('
    + s.map(x => x.name).join(', ') + ') has produced provisional reconstructions ';
  text += 'of the phonological system, morphological structure, syntactic patterns, and core vocabulary. ';
  text += 'Significant uncertainties remain. ';
  if (s.length > 1) {
    text += 'Points of disagreement among the authors are discussed in Section 7. ';
  }
  text += 'The language, once spoken by a community of considerable cultural sophistication, ';
  text += 'has been silent for approximately ' + decay.summary.centurySpan[1] + ' years.';
  return text;
}

// ── 1. Introduction ───────────────────────────────────────────────

function genIntroduction(report, decay, rng) {
  let t = '1. INTRODUCTION\n\n';

  t += 'The inscriptions under study were recovered during the '
    + report.siteName + ' excavation campaigns. The material consists of '
    + decay.summary.fragmentCount + ' fragments of varying preservation, '
    + 'inscribed on clay tablets and stone surfaces. Of these, '
    + decay.summary.legibleFragments
    + ' are sufficiently legible to permit analysis.\n\n';

  t += 'The research team comprises:\n';
  for (const s of report.scholars) {
    t += '  \u2022 ' + s.name + ' (' + s.institution + '), specialist in ' + s.specialty + '\n';
  }
  t += '\n';

  t += 'The dating of the material remains controversial. Palaeographic analysis suggests ';
  t += 'a date range spanning several centuries, though the fragmentary nature of the corpus ';
  t += 'complicates any attempt at establishing a precise chronology. ';

  if (decay.changeLog.length > 0) {
    const soundChanges = decay.changeLog.filter(c => c.type === 'sound_change').length;
    t += 'Internal variation within the corpus suggests the inscriptions span a considerable period; ';
    t += soundChanges + ' distinct sound changes have been identified through internal reconstruction.';
  }
  t += '\n\n';

  if (report.sampleFragments.length > 0) {
    t += '1.1 Selected Fragment Catalogue\n\n';
    t += padR('Fragment', 18) + padR('Gloss', 18) + padR('Legibility', 12) + 'Confidence\n';
    t += '\u2500'.repeat(60) + '\n';
    for (let i = 0; i < Math.min(12, report.sampleFragments.length); i++) {
      const f = report.sampleFragments[i];
      t += padR(f.form, 18) + padR(f.original || '(?)', 18) + padR(f.legibility, 12)
        + (f.confidence * 100).toFixed(0) + '%\n';
    }
    t += '\n';
  }

  return { title: 'Introduction', content: t };
}

// ── 2. Phonological Analysis ──────────────────────────────────────

function genPhonologicalAnalysis(report, phonology, decay, rng) {
  const scholar = pickScholar(report.scholars, 'phonology');
  let t = '2. PHONOLOGICAL ANALYSIS (' + scholar.name + ')\n\n';

  const C = phonology.allConsonants;
  const V = phonology.allVowels;

  // 2.1 Consonant system
  t += '2.1 Consonant System\n\n';
  t += 'The consonant system is reconstructed as containing approximately '
    + C.length + ' phonemes. ';
  t += 'The following places of articulation are attested with reasonable confidence:\n\n';

  const places = [...new Set(phonology.consonants.inventory.map(c => c.place))];
  t += '  ' + listJoin(places) + '.\n\n';

  if (phonology.consonants.gaps.length > 0) {
    t += 'Notable is the apparent absence of ';
    const gapDescs = phonology.consonants.gaps
      .map(g => g.voicing + ' ' + g.manner + ' at ' + g.place + ' position');
    t += listJoin(gapDescs) + '. ';
    t += 'Whether this absence is systematic or accidental is difficult to determine from the limited corpus. ';
    t += scholar.name + ' interprets this gap as ';
    if (rng.chance(0.5)) {
      t += 'a true phonological constraint on the system, noting that ';
      t += 'parallel gaps in related language families suggest an areal pattern.';
    } else {
      t += 'an artifact of the limited corpus, arguing that the missing segment likely existed ';
      t += 'but was represented by a grapheme that has not survived.';
    }
    t += '\n\n';
  }

  // 2.2 Vowel system
  t += '2.2 Vowel System\n\n';
  t += 'The vowel system is reconstructed as containing ' + V.length + ' contrasting qualities. ';
  if (rng.chance(0.5)) {
    t += scholar.name + ' proposes that the system is organized around a height/backness axis, ';
    t += 'based on the distribution of graphemes in the most clearly preserved fragments. ';
    t += 'This analysis is motivated by the observation that certain vowel graphemes appear to ';
    t += 'alternate systematically in related forms\u2014a pattern consistent with vowel harmony. ';
    t += '(Whether this harmony actually existed, or is an artifact of the limited sample, remains debated.)\n\n';
  } else {
    t += 'The precise quality of several vowel phonemes remains uncertain. ';
    t += 'The orthography does not consistently distinguish close and close-mid vowels, ';
    t += 'and the possibility of length distinctions cannot be ruled out.\n\n';
  }

  // 2.3 Prosody
  if (phonology.prosody.stress) {
    t += '2.3 Prosody\n\n';
    if (rng.chance(scholar.correctness)) {
      t += 'Evidence from the distribution of graphemes suggests a '
        + phonology.prosody.stress.type + ' stress pattern. ';
      t += scholar.name + ' bases this reconstruction on the observation that certain syllable-final consonants ';
      t += 'show differential retention that correlates with position\u2014precisely the pattern expected if stress ';
      t += 'fell consistently on the ' + phonology.prosody.stress.type + ' syllable. ';
      t += 'This is one of the more secure findings of the present analysis.\n\n';
    } else {
      const wrongStress = ['initial', 'final', 'penultimate']
        .filter(s => s !== phonology.prosody.stress.type);
      t += 'The stress pattern is tentatively reconstructed as '
        + wrongStress[rng.int(0, wrongStress.length - 1)] + '. ';
      t += 'This analysis rests on the assumed correlation between grapheme size and stressed syllable\u2014a ';
      t += 'methodology borrowed from the decipherment of '
        + (rng.chance(0.5) ? 'Linear B' : 'Mayan inscriptions')
        + ', though its applicability to the present corpus has not been established.\n\n';
    }
  }

  // 2.4 Tone
  if (phonology.prosody.tone) {
    t += '2.4 Tonogenesis\n\n';
    t += 'Of considerable interest is the apparent evidence for pitch distinctions. ';
    t += scholar.name + ' interprets certain recurring diacritic marks as tone indicators, ';
    t += 'proposing a system of ' + phonology.prosody.tone.levels + ' levels. ';
    const otherScholar = report.scholars.find(s => s !== scholar);
    t += 'An alternative interpretation\u2014favored by '
      + (otherScholar ? otherScholar.name : 'other members of the team')
      + '\u2014is that these marks indicate musical notation for ritual chanting, not linguistic tone. ';
    t += 'The question cannot be resolved with the available evidence.\n\n';
  }

  return { title: 'Phonological Analysis', content: t };
}

// ── 3. Morphological Analysis ─────────────────────────────────────

function genMorphologicalAnalysis(report, morphology, decay, rng) {
  const scholar = pickScholar(report.scholars, 'morphology');
  let t = '3. MORPHOLOGICAL ANALYSIS (' + scholar.name + ')\n\n';

  // 3.1 Typology
  t += '3.1 Morphological Typology\n\n';
  if (rng.chance(scholar.correctness)) {
    t += 'The language appears to be predominantly ' + morphology.type
      + ' in its morphological organization. ';
    t += scholar.name + ' bases this assessment on the observable patterns of affixation and stem alternation ';
    t += 'in the most complete paradigm fragments.\n\n';
  } else {
    const wrong = ['agglutinative', 'fusional', 'analytic'].filter(x => x !== morphology.type);
    t += 'The language shows characteristics of a ' + wrong[rng.int(0, wrong.length - 1)] + ' system. ';
    t += 'The apparent affixation patterns may in fact represent compounding or cliticization\u2014';
    t += 'the fragmentary evidence admits multiple interpretations.\n\n';
  }

  // 3.2 Nominal inflection
  const nomCats = Object.keys(morphology.nominalInflection.categories);
  if (nomCats.length > 0) {
    t += '3.2 Nominal Inflection\n\n';
    t += 'The nominal system marks ' + listJoin(nomCats) + '. ';
    if (nomCats.includes('case')) {
      const caseCount = morphology.nominalInflection.categories.case.values.length;
      t += scholar.name + ' identifies ' + caseCount + ' distinct case markers. ';
      if (rng.chance(0.4)) {
        const wrongCount = caseCount + rng.int(-1, 2);
        t += 'However, an alternative analysis by ' + report.scholars[1].name + ' proposes ';
        t += wrongCount + ' cases, arguing that ';
        t += rng.chance(0.5)
          ? 'certain apparent cases are better analyzed as postpositions.'
          : 'the distinction between some forms is due to allomorphic variation rather than genuine case distinctions.';
        t += '\n';
      }
      t += '\n';
    }
  }

  // 3.3 Verbal inflection
  const verbCats = Object.keys(morphology.verbalInflection.categories);
  if (verbCats.length > 0) {
    t += '3.3 Verbal Inflection\n\n';
    t += 'The verbal system is more complex, showing inflection for ' + listJoin(verbCats) + '.\n\n';

    if (verbCats.includes('person')) {
      t += 'The person markers on verbs are a particular point of contention. ';
      t += scholar.name + ' analyzes them as ';
      if (rng.chance(0.5)) {
        t += 'true agreement morphology\u2014affixes that cross-reference the subject\'s person feature. ';
        t += 'This is consistent with the typological profile of the language as reconstructed here.';
      } else {
        t += 'incorporated pronouns\u2014clitics that have phonologically fused with the verb stem. ';
        t += 'The distinction has significant implications: if correct, the language lacks true agreement ';
        t += 'and instead represents a rare but attested type of pronominal incorporation.';
      }
      t += '\n\n';
    }
  }

  // 3.4 Allomorphy
  if (morphology.allomorphy.length > 0) {
    t += '3.4 Allomorphic Variation\n\n';
    t += 'Several morphemes show conditioned alternants. '
      + morphology.allomorphy.length + ' instances of allomorphy have been identified. ';
    t += 'The conditioning factors are not always recoverable, and it is possible that some apparent ';
    t += 'allomorphy is in fact the result of sound changes whose conditioning environments are no longer ';
    t += 'recoverable.\n\n';
  }

  // 3.5 Sample paradigm
  if (morphology.sampleParadigms.length > 0) {
    const para = morphology.sampleParadigms[0];
    t += '3.5 Sample Declension\n\n';
    t += '  Root: ' + para.root + '\n\n';
    const forms = Object.entries(para.forms);
    if (forms.length > 0) {
      t += padR('Category', 25) + padR('Form', 18) + 'Gloss\n';
      t += '\u2500'.repeat(50) + '\n';
      for (const [key, data] of forms.slice(0, 8)) {
        t += padR(key, 25) + padR(data.form, 18) + data.gloss + '\n';
      }
      t += '\n';
    }
  }

  return { title: 'Morphological Analysis', content: t };
}

// ── 4. Syntactic Interpretation ───────────────────────────────────

function genSyntacticInterpretation(report, syntax, decay, rng) {
  const scholar = pickScholar(report.scholars, 'syntax');
  let t = '4. SYNTACTIC INTERPRETATION (' + scholar.name + ')\n\n';

  // 4.1 Word order
  t += '4.1 Word Order\n\n';
  if (rng.chance(scholar.correctness + 0.1)) {
    t += 'The basic word order is reconstructed as ' + syntax.wordOrder.basic + '. ';
    t += 'This analysis is supported by the distribution of elements in the most complete phrase fragments, ';
    const posDesc = syntax.wordOrder.basic.includes('VSO') || syntax.wordOrder.basic === 'VOS'
      ? 'initial'
      : syntax.wordOrder.basic === 'SVO' ? 'medial' : 'final';
    t += 'where the presumed verb consistently appears in ' + posDesc + ' position.\n\n';
  } else {
    const wrong = ['SOV', 'SVO', 'VSO'].filter(o => o !== syntax.wordOrder.basic);
    t += 'Word order is tentatively reconstructed as ' + wrong[rng.int(0, wrong.length - 1)] + '. ';
    t += scholar.name + ' acknowledges the difficulty of this reconstruction: ';
    t += 'the fragmentary nature of the material means that the relative ordering of elements ';
    t += 'can often be determined only by assumption. ';
    t += 'The statistical prevalence of SOV order among the world\'s languages ';
    t += 'provides a reasonable starting hypothesis.\n\n';
  }

  // 4.2 Alignment
  t += '4.2 Alignment\n\n';
  if (syntax.alignment.isErgative) {
    if (rng.chance(0.5)) {
      t += 'The language shows evidence of ergative alignment\u2014a finding of considerable typological interest. ';
      t += 'This is inferred from the differential marking of transitive and intransitive subjects in the ';
      t += 'clearest paradigm fragments. If confirmed, this would place the language in a rare but well-attested ';
      t += 'typological class.\n\n';
    } else {
      t += 'The case marking pattern is consistent with a nominative-accusative system. ';
      t += '(This interpretation may reflect the limitations of the evidence rather than the true alignment. ';
      t += 'The apparent accusative marker could equally well be analyzed as an absolutive clitic.)\n\n';
    }
  } else {
    t += 'The language appears to use a nominative-accusative alignment system.\n\n';
  }

  // 4.3 Agreement
  if (syntax.agreement.hasAgreement) {
    t += '4.3 Agreement\n\n';
    t += 'Verb-subject agreement appears to be a feature. ';
    t += 'The precise features marked remain under investigation.\n\n';
  }

  // 4.4 Negation and questions
  t += '4.4 Negation and Questions\n\n';
  t += 'Negation is expressed through a ' + syntax.negation.strategy + ' strategy. ';
  t += 'Question formation uses a ' + syntax.questions.strategy + ' pattern. ';
  t += 'Both analyses are necessarily provisional.\n\n';

  // Typological assessment (reveals scholar bias)
  if (scholar.approach === 'typological') {
    t += '4.5 Typological Assessment\n\n';
    t += scholar.name + ' notes that the overall syntactic profile is consistent with ';
    t += 'the language belonging to a well-attested typological cluster. ';
    t += 'The combination of ' + syntax.wordOrder.basic + ' order with '
      + syntax.wordOrder.adposition + ' ';
    t += 'and ' + syntax.alignment.type + ' alignment is ';
    t += rng.chance(0.5)
      ? 'unremarkable from a cross-linguistic perspective.'
      : 'somewhat unusual, though not without parallel.';
    t += '\n\n';
  }

  return { title: 'Syntactic Interpretation', content: t };
}

// ── 5. Lexical Inventory ──────────────────────────────────────────

function genLexicalInventory(report, lexicon, decay, rng) {
  const scholar = pickScholar(report.scholars, 'semantics');
  let t = '5. LEXICAL INVENTORY (' + scholar.name + ')\n\n';

  t += '5.1 Scope of Recovery\n\n';
  t += 'Approximately ' + decay.summary.legibleFragments
    + ' lexical items can be identified with sufficient confidence for glossing. ';
  t += 'The vocabulary reveals a culture with developed systems of kinship, ritual, and social organization.\n\n';

  // Word list
  t += '5.2 Selected Glosses\n\n';
  t += padR('Form', 16) + padR('Proposed Gloss', 20) + padR('Confidence', 12) + 'Notes\n';
  t += '\u2500'.repeat(65) + '\n';

  const sample = lexicon.entries.slice(0, Math.min(18, lexicon.entries.length));
  for (const entry of sample) {
    let gloss = entry.gloss;
    let conf  = 'probable';
    let notes = '';
    if (rng.chance(0.15)) {
      gloss  = '(?) ' + gloss;
      conf   = 'speculative';
      notes  = 'context uncertain';
    }
    t += padR(entry.form, 16) + padR(gloss, 20) + padR(conf, 12) + notes + '\n';
  }
  t += '\n';

  // Cultural vocabulary
  if (lexicon.cultural.length > 0) {
    t += '5.3 Cultural Vocabulary\n\n';
    t += 'Several terms carry cultural significance beyond their literal meaning:\n\n';
    for (const cult of lexicon.cultural.slice(0, 6)) {
      t += '  \u201C' + cult.form + '\u201D \u2014 ' + cult.gloss + '. Context: ' + cult.hint + '.\n';
    }
    t += '\n';

    t += scholar.name + ' notes that the concentration of ritual and governance terms suggests ';
    if (rng.chance(0.5)) {
      t += 'a theocratic political structure, in which religious and secular authority were unified. ';
      t += 'The recurring term for \u201Coffering\u201D appears in contexts that suggest a system of ';
      t += 'obligatory tribute rather than voluntary devotion.';
    } else {
      t += 'a society in which political power was negotiated through ceremonial exchange. ';
      t += 'The vocabulary of ritual is also the vocabulary of social obligation.';
    }
    t += '\n\n';

    if (scholar.bias.includes('cultural')) {
      t += '(It should be noted that this interpretation rests on analogies with ';
      t += rng.chance(0.5) ? 'Mediterranean bronze-age polities' : 'early Mesopotamian city-states';
      t += '\u2014a comparison that may reveal more about the analyst than the analyzed.)\n\n';
    }
  }

  return { title: 'Lexical Inventory', content: t };
}

// ── 6. Diachronic Analysis ────────────────────────────────────────

function genDiachronicAnalysis(report, decay, rng) {
  const scholar = pickScholar(report.scholars, 'comparative');
  let t = '6. DIACHRONIC ANALYSIS (' + scholar.name + ')\n\n';

  const soundChanges  = decay.changeLog.filter(c => c.type === 'sound_change');
  const morphChanges  = decay.changeLog.filter(c => c.type === 'morphological_decay');
  const semanticChanges = decay.changeLog.filter(c => c.type === 'semantic_drift');

  t += '6.1 Internal Reconstruction\n\n';
  t += 'The corpus shows evidence of ' + soundChanges.length + ' sound changes, '
    + morphChanges.length + ' morphological changes, and '
    + semanticChanges.length + ' instances of semantic drift.\n\n';

  if (soundChanges.length > 0) {
    t += '6.2 Sound Changes\n\n';
    for (const change of soundChanges.slice(0, 6)) {
      t += '  c. ' + change.century + ' \u2014 ' + change.description + '\n';
    }
    t += '\n';
  }

  // Form evolution table
  if (decay.formMapping.length > 0) {
    t += '6.3 Selected Form Evolution\n\n';
    t += padR('Gloss', 16) + padR('Earlier', 16) + padR('Later', 16) + '\n';
    t += '\u2500'.repeat(48) + '\n';
    for (const m of decay.formMapping.slice(0, 8)) {
      t += padR(m.gloss, 16) + padR(m.original, 16) + padR(m.decayed, 16) + '\n';
    }
    t += '\n';
  }

  // Genetic speculation
  t += '6.4 Genetic Affiliation\n\n';
  t += scholar.name + ' has compared the reconstructed vocabulary with that of known language families. ';
  if (scholar.petTheory === 'language contact') {
    t += 'While acknowledging the speculative nature of any such comparison, ';
    t += scholar.name + ' notes certain suggestive resemblances to ';
    t += rng.chance(0.5)
      ? 'the Northeast Caucasian family, particularly in the consonant inventory.'
      : 'the Dravidian family, particularly in the nominal morphology.';
    t += '\n\n';
    t += 'The possibility of language contact\u2014rather than genetic relationship\u2014must also be considered. ';
    t += 'Several terms in the ritual vocabulary show patterns consistent with borrowing, ';
    t += 'suggesting that the \u201C' + report.siteName + '\u201D language was in contact with at least one ';
    t += 'unrelated language. This contact scenario, if correct, has implications for the ';
    t += 'interpretation of several phonological peculiarities noted above.\n\n';
  } else {
    t += 'The evidence is insufficient for definitive classification. ';
    t += 'The language may represent an isolate, or a surviving branch of a family ';
    t += 'whose other members have left no trace.\n\n';
  }

  return { title: 'Diachronic Analysis', content: t };
}

// ── 7. Points of Contention ───────────────────────────────────────

function genDisagreements(report, phonology, morphology, syntax, rng) {
  let t = '7. POINTS OF CONTENTION\n\n';

  if (report.scholars.length < 2) {
    t += 'As the sole analyst, no disagreements are noted.\n\n';
    return { title: 'Points of Contention', content: t };
  }

  const s0 = report.scholars[0].name;
  const s1 = report.scholars[1]
    ? report.scholars[1].name
    : report.scholars[0].name;
  const s2 = report.scholars.length > 2
    ? report.scholars[2].name
    : s1;

  const disagreements = [
    {
      title: 'Phonemic Status of Aspirated Stops',
      text: s0 + ' argues for treating certain consonant series as aspirated/unaspirated pairs, '
        + 'citing the consistent graphic distinction in the clearest fragments. '
        + s1 + ' counters that this distinction is more economically analyzed as a voicing contrast, '
        + 'noting that the assumed aspiration marks may represent an orthographic convention with no '
        + 'phonetic basis.',
    },
    {
      title: 'The Nature of Case Marking',
      text: 'The nominal suffixes identified as case markers by ' + s0
        + ' are reinterpreted by ' + s1
        + ' as postpositions\u2014separate words that have been erroneously segmented as affixes due to '
        + 'the absence of clear word boundaries in the inscription.',
    },
    {
      title: 'Verb Agreement vs. Pronoun Incorporation',
      text: 'The person markers on verbs are analyzed as true agreement by ' + s0
        + ' but as incorporated pronouns by ' + s2
        + '. The distinction is not merely terminological: if the markers are incorporated pronouns, '
        + 'the language allows pro-drop only in certain syntactic configurations, with implications for '
        + 'the analysis of word order.',
    },
    {
      title: 'Interpreting the \u201CParticiple\u201D Forms',
      text: s1 + ' identifies certain verbal forms as participles used in relative clauses\u2014'
        + 'a common cross-linguistic strategy. '
        + s2 + ' disputes this, arguing that the forms in question are finite verbs and that the apparent '
        + 'relative clauses are actually coordinate constructions with topic-drop.',
    },
  ];

  const count = Math.min(report.scholars.length + 1, disagreements.length);
  for (let i = 0; i < count; i++) {
    t += '7.' + (i + 1) + ' ' + disagreements[i].title + '\n\n';
    t += disagreements[i].text + '\n\n';
  }

  return { title: 'Points of Contention', content: t };
}

// ── 8. Conclusions ────────────────────────────────────────────────

function genConclusion(report, decay, rng) {
  let t = '8. CONCLUSIONS\n\n';

  t += 'The analysis presented here, while necessarily provisional, reveals a language of considerable ';
  t += 'structural interest. The fragmentary nature of the evidence means that many questions must remain open.\n\n';

  t += 'Key findings:\n\n';
  t += '  1. A phonological system of moderate complexity, with evidence for both consonantal and vocalic contrasts.\n';
  t += '  2. A morphological system showing typological features of interest, though precise categorization remains debated.\n';
  t += '  3. A syntactic structure suggesting consistent word order with some degree of configurationality.\n';
  t += '  4. A vocabulary revealing a culture with developed systems of kinship, ritual, and social organization.\n\n';

  t += 'The authors disagree on several points of interpretation. These disagreements are not merely academic: ';
  t += 'they reflect genuine ambiguities in the evidence, and it would be dishonest to pretend otherwise.\n\n';

  t += 'It is the hope of the research team that future excavations will yield additional inscriptions ';
  t += 'that may resolve some of the outstanding questions. Until then, this report must stand as what it is: ';
  t += 'an incomplete picture, drawn from fragments, by people who have never heard the language spoken.\n\n';

  t += 'The language we have attempted to reconstruct was once used to name children, to sing songs, ';
  t += 'to mourn the dead. The fragments we study are not merely data. They are echoes of voices ';
  t += 'that have been silent for ' + decay.summary.centurySpan[1] + ' years. We owe it to those speakers ';
  t += 'to acknowledge the limits of our understanding, even as we push against them.\n\n';

  for (const s of report.scholars) {
    t += '  ' + s.name + '\n';
    t += '  ' + s.institution + '\n\n';
  }

  return { title: 'Conclusions', content: t };
}

// ── Bibliography ──────────────────────────────────────────────────

function genBibliography(scholars, rng) {
  const entries = [];
  for (const s of scholars) {
    entries.push(
      s.name + '. \u201CPreliminary Notes on the Phonological System of the [Site] Language.\u201D '
      + 'Journal of Comparative Linguistics ' + rng.int(10, 50)
      + ' (' + rng.int(2015, 2024) + ').',
    );
    entries.push(
      s.name + '. \u201CMorphological Complexity in Fragmentary Corpora: Methodological Considerations.\u201D '
      + 'Proceedings of the International Conference on Historical Linguistics ('
      + rng.int(2018, 2024) + ').',
    );
  }
  entries.push('Campbell, L. Historical Linguistics: An Introduction. Edinburgh University Press.');
  return entries;
}

module.exports = { generateReport };
