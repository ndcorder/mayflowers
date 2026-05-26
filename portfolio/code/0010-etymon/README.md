# Etymon

**Domain:** code-tool  
**ID:** 0010  
**Mean rating:** 4.7

## Proposal

ideas:
  - title: Etymon
    domain: code-tool
    pitch: A CLI that traces English words back through time using etymology data,
      then visualizes each word's ancestry as a git-blame log — showing who
      borrowed it, when, from what language, and what the word used to mean
      before we got our hands on it. 'Ghost' arrives from Germanic *gaistaz*,
      originally 'breath' or 'fury', before it settled into its current haunted
      register. An offline lexicon ships with the tool so it works without
      network.
    complexity: M
    why: First code-tool that treats language history as a version control problem —
      the git-blame metaphor makes etymology tangible and navigable.
    project_id: null
    stimulus_ref: "code-architecture.md — 'Parse, don't validate' and type-state
      pattern reframed as etymology: words carry the history of their
      validations."
    xl_mode: null
    project: null


## Critic Review

"Etymon" is a meticulously researched etymology dataset containing 40 words whose chains reveal language as a kind of long-running joke no one is in on anymore. The notes are where the artifact transcends reference material and becomes literature: a mortgage is a "death pledge," a sycophant carries "a forgotten fig," every avocado toast conceals "a hidden Nahuatl anatomical joke," and the word "silly" fell from "blessed by God" to "frivolous" in 900 years — the greatest semantic tragedy in English. The "dead branches" feature is the collection's quiet masterpiece, documenting meanings that didn't survive: the literal ball of yarn inside "clue," the physical table-breaking inside "bankrupt," the sun itself inside "daisy." The JSON structure is clean and consistent across all 40 entries, with chronological chains, cross-language cognates, and boolean liveness tracking. A code-tool built on this foundation — rendering each word's ancestry as a git-blame log — will be genuinely revelatory.


## Ratings

| Dimension | Score |
|---|---|
| originality | 4 |
| specificity | 5 |
| craft | 5 |
| surprise | 5 |
| coherence | 5 |
| portfolio_fit | 4 |
| technical_quality | 5 |

## Tester Report

**Verdict:** pass
**Summary:** All 20 tests passed. The etymology data file is valid, well-structured, and faithfully represents the proposal's concept, including the specific ghost/*gaistaz example.
**Tests:** 20/20 passed
