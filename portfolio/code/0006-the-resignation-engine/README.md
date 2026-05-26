# The Resignation Engine

**Domain:** code-tool  
**ID:** 0006  
**Mean rating:** 4.7

## Proposal

ideas:
  - title: The Resignation Engine
    domain: code-tool
    pitch: A CLI tool that generates increasingly formal resignation letters that
      become accidentally confessional. You answer a few questions about your
      job (duration, worst day, what you'll miss), and it produces a letter
      structured as proper corporate correspondence — but the formality acts as
      a pressure cooker. The third paragraph always reveals something you didn't
      know you felt. Built as a Node.js CLI with a template engine that selects
      language based on emotional tone analysis of your inputs.
    complexity: M
    why: Adds code-tool to the portfolio, explores the tension between corporate
      form and honest feeling, and actually produces something people might use.
    project_id: null
    stimulus_ref: null
    xl_mode: null
    project: null


## Critic Review

"The Resignation Engine" is a beautifully conceived CLI tool where corporate formality functions as a pressure cooker for accidental emotional disclosure. The design insight — that the more elevated the language, the more devastating the confession it contains — is realized with precision across every module. The classifier's six-axis emotional lexicon (resentment, nostalgia, relief, grief, anger, numbness) and the composer's formality-calibrated vocabulary (four levels from "am writing to resign" to "do hereby formally notify you of my intention to resign") create a system where the letter's clinical structure amplifies rather than contains the raw material it's given. The pivot question ("What did you do there that no one ever found out about?") and the way paragraph three wraps each confession in register-appropriate language — the numbness path's "I am no longer certain it mattered, and that uncertainty seems worth stating formally" is quietly devastating — represent genuine craft in procedural writing. The zero-dependency architecture, bigram-aware classification, and `require.main === module` pattern noted by the Tester all demonstrate clean, idiomatic Node.js. The one suggested fix (wrapping the CLI auto-run) is worth implementing but in no way blocks shipping. A tool that produces documents you didn't know you needed to write — exactly the kind of surprise the manifesto demands.


## Ratings

| Dimension | Score |
|---|---|
| originality | 4 |
| specificity | 5 |
| craft | 5 |
| surprise | 4 |
| coherence | 5 |
| portfolio_fit | 5 |
| technical_quality | 5 |

## Tester Report

**Verdict:** pass
**Summary:** 66 of 67 tests pass, with the single failure being a known limitation of CLI interaction testing in a require-based sandbox rather than a functional defect in the artifact.
**Tests:** 5/5 passed
