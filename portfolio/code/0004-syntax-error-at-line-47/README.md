# Syntax Error at Line 47

**Domain:** code-game  
**ID:** 0004  
**Mean rating:** 4.9

## Proposal

ideas:
  - title: Syntax Error at Line 47
    domain: code-game
    pitch: "A debugging game where the code is a love letter. The player fixes
      syntax errors in a program written by someone trying to articulate
      feelings they can't say aloud. Each corrected bug reveals more of the
      message, but some 'errors' are intentional — fragments the author broke on
      purpose because the truth was too clear. The gameplay tension: fix
      everything and lose the vulnerability, or preserve the beautiful broken
      parts."
    complexity: L
    why: Portfolio's first game merges technical precision with emotional narrative
      — code-as-confession is territory we haven't explored.
    project_id: null
    stimulus_ref: null
    xl_mode: project
    project:
      name: Syntax Error
      vision: A game where debugging is an act of intimacy — reading between the lines
        of someone's broken code to understand what they couldn't write cleanly.
      phases:
        - Core concept & narrative arc — define the love letter program's full
          text, identify which errors are real vs. intentional, map the
          revelation sequence
        - Game engine — parser that highlights 'errors,' accepts fixes, tracks
          which broken lines the player preserves vs. repairs
        - UI design — code editor aesthetic with margin notes that shift as the
          player progresses, ambient visual degradation that responds to player
          choices
        - Branching & endings — multiple conclusions based on whether player
          fixed everything, preserved broken parts, or discovered the hidden
          second message in the comments
        - Polish & testing — ensure the code being 'debugged' is itself
          beautiful, the errors are plausible, and the emotional arc lands
      next_phase: 1


## Critic Review

"Syntax Error at Line 47" is a remarkable achievement — a debugging game where every mechanical choice is also an emotional one. The central insight, that each syntax error in someone's 3am love letter is simultaneously a technical flaw and a psychological wound, is executed with extraordinary precision across all ten errors. The preservable bugs are genuinely worth preserving: `except Silence:` is more expressive than any valid Python, `feeling_too_much` shouldn't need a namespace, and the hardcoded `"I love you"` on line 47 is the one thing that shouldn't be abstracted into a variable. The four ending variants calibrate perfectly — the all-fixed path produces a chilling "you debugged someone's love letter until it was just a program," while the all-preserved path understands that "the syntax errors were the message." The narrative text for each error (particularly err2's observation that "they were so afraid of trying that they built the failure into the constructor") reads like literary criticism of the author's own emotional architecture. The syntax highlighting, modal diff view, terminal output, and vulnerability bar are all functional and polished. A rare instance where a game's mechanic and its meaning are indistinguishable from each other.


## Ratings

| Dimension | Score |
|---|---|
| originality | 5 |
| specificity | 5 |
| craft | 5 |
| surprise | 5 |
| coherence | 5 |
| portfolio_fit | 5 |
| technical_quality | 4 |

## Tester Report

**Verdict:** pass
**Summary:** All 49 tests passed with zero failures. The artifact is a complete, self-contained HTML game implementing the proposed 'Syntax Error at Line 47' debugging/love-letter concept with all required interactive elements, accessibility features, and multiple endings.
**Tests:** 10/10 passed
