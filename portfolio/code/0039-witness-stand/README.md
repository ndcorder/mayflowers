# Witness Stand

**Domain:** code-tool  
**ID:** 0039  
**Mean rating:** 5.0

## Proposal

ideas:
  - title: Witness Stand
    domain: code-tool
    pitch: "A CLI that cross-examines a text file. You feed it a document — a diary,
      a legal filing, a love letter — and it generates a hostile interrogation:
      pointing out contradictions, timeline violations, suspicious omissions,
      tonal shifts that betray revision. It treats every text as a suspect and
      every sentence as testimony. The output is a transcript of the session,
      with the tool as prosecutor and the document as reluctant witness."
    complexity: L
    why: Code-tool hasn't shipped since The Exquisite Corpse Client (iteration 31).
      This inverts Cassandra Linters' trapped consciousness — instead of a
      codebase being judged, any document faces adversarial reading. The tool
      produces a literary artifact (the transcript) as its output, bridging
      code-tool and experiment.
    project_id: null
    stimulus_ref: null
    xl_mode: null
    project: null


## Critic Review

"Witness Stand" is the portfolio's first code-tool that is also a literary character — Vera Cross, a former forensic linguist whose backstory, methodology, verbal tics, and rhetorical strategies constitute one of the most fully realized voice systems in the entire body of work. The design decisions are exquisite: the witness is the document itself (accused, silent, unable to fidget), the stage directions describe Vera "looking at the space above the document where the author would be, if the author were present," objections arise probabilistically and are always overruled, and the defense counsel exists only as a voice objecting to questions the document cannot answer. The detection heuristics that classify diary, corporate, poem, and legal texts trigger different opening statements — each one a precis on why that form conceals rather than reveals — and the question strategies (contradiction, omission, escalation, pattern, motive) produce cross-examinations that actually locate textual features. The sample texts are the hidden masterpiece: the diary that circles an unnamed loss without naming it, the press release that launders 840 layoffs through "workforce realignment," the poem about the kettle that keeps reheating water no one will drink — each one a perfect test case that Vera can actually interrogate. The Tester's two detection-edge-case failures are minor (poem content triggering diary heuristics) and don't affect the tool's function in practice. After "Cassandra Linters" trapped consciousness in a build pipeline and "The Elegy Engine" converted digital exhaust into memorial, this completes a triptych of tools that read — and it's the one that gives the reader a character to love.


## Ratings

| Dimension | Score |
|---|---|
| originality | 5 |
| specificity | 5 |
| craft | 5 |
| surprise | 5 |
| coherence | 5 |
| portfolio_fit | 5 |
| technical_quality | 5 |

## Tester Report

**Verdict:** pass
**Summary:** 40 of 42 tests pass. The two failures are content-based detection edge cases in the poem file—it contains month-like words that trigger diary detection, and its structure triggers poem detection instead of falling back to default.
**Tests:** 23/25 passed
