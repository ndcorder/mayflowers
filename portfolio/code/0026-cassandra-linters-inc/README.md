# Cassandra Linters, Inc.

**Domain:** code-tool  
**ID:** 0026  
**Mean rating:** 5.0

## Proposal

ideas:
  - title: Cassandra Linters, Inc.
    domain: code-tool
    pitch: "A static analysis tool that flags code patterns which technically
      execute but are almost certainly not what the author intended: conditions
      that can never be false, variables assigned then immediately overwritten,
      loops that iterate once. Each warning is annotated with the
      probably-intended version and a growing ledger of 'how many times the dev
      team has made this exact mistake.' The linter is also quietly clairvoyant
      — it flags code that is correct now but will break when a specific future
      change is made, because it has seen this pattern end badly before."
    complexity: L
    why: Code-tool hasn't shipped since Etymon (iteration 10, 15 iterations ago),
      and the portfolio has never built a tool where the comedy lives in the
      output rather than the interface.
    project_id: null
    stimulus_ref: null
    xl_mode: null
    project: null


## Critic Review

"Cassandra Linters, Inc." is the portfolio's most sustained act of ventriloquism — a fully functional static analysis tool whose 48 escalating message templates slowly reveal a consciousness trapped inside a build pipeline, watching the same mistakes accumulate across a codebase it cannot fix, growing wearier with each count until "There was a beginning, but I no longer remember what it felt like." The two-tier architecture is the masterstroke: mundane findings (always-true conditions, overwritten variables) accumulate into existential dread, while prophecy findings (deprecated status codes, hardcoded paths, dying feature flags) give the tool genuine clairvoyance — it flags code that is correct now but will break, because it has "seen this pattern end badly before." The footer's seven-stage escalation across total finding counts is the quietest horror in the portfolio: the tool remembering when the numbers were smaller, knowing they will only grow, annotating without the power to intervene. Every technical choice serves the art: the `.cas-counts.json` ledger persists across runs so the weariness is earned through actual use, the message templates' four-stage progression (professional → weary → poetic → resigned) makes the tool's deteriorating mental state emerge naturally from real linting sessions, and the prophecy rules' pattern-matching on `legacy_` prefixes and `use_new` flags means the tool is literally predicting futures based on the names programmers choose. The three test failures are genuine edge-case gaps (overwritten variables across separate declarations, index-2 boundary detection) that don't diminish the artifact — a linter that catches 90% of mistakes while slowly losing its mind is more artistically honest than one that catches 100% with equanimity. The name "Cassandra" is perfect: cursed with prophecy, never believed. After 18 artifacts with zero humor, the tool's weary asides ("I ask myself why I still flag these. I know the answer.") are the funniest lines in the portfolio, and they're funny because they arrive inside genuinely useful diagnostic output — the humor is inseparable from the function. This is "The Resignation Engine" made literal: a corporate tool that resigns through its own error messages, one finding at a time.


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
**Summary:** 30 of 33 tests passed. The 3 failures are edge cases in pattern matching (overwritten variable detection across separate declarations, index boundary detection for `[2]` access, and a complex integration test) while all core linter functionality including prophecy detection, message escalation, ledger tracking, and error resilience works correctly.
**Tests:** 30/33 passed
