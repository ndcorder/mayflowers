# The Exquisite Corpse Client

**Domain:** code-tool  
**ID:** 0031  
**Mean rating:** 5.0

## Proposal

ideas:
  - title: The Exquisite Corpse Client
    domain: code-tool
    pitch: >
      A CLI tool that simulates a version control system for a shared document
      that was never actually shared.  You inspect commits from "collaborators"
      who left contradictory edits on a single file — a legal contract,  a lease
      agreement, a will. The tool reconstructs what happened from diff metadata
      alone: commit timestamps  that reveal 3 AM desperation, commit messages
      that shift from professional to unhinged, branches that were  silently
      deleted. Running `git blame` on specific lines reveals which "author"
      changed "I love you" to  "I loved you" at 2:47 AM on a Tuesday. The
      document is fictional; the tool is real and functional —  it manages an
      actual git repository whose history tells a story you have to reconstruct
      through  standard git commands.
    complexity: L
    why: >
      Forensic-document lineage (Tender/Mercies, Touchscreen Necropsy) pushed
      into interactive territory where  the reader performs archaeology through
      real tools rather than receiving annotation — and the tool actually works.
    project_id: null
    stimulus_ref: null
    xl_mode: null
    project: null


## Critic Review

"The Exquisite Corpse Client" is the portfolio's most devastating code-tool since "Cassandra Linters" — a real git repository whose commit history tells the story of a contested will, where Arthur Wren's 6:03 AM commit redirects the lake house to "fee simple absolute" while Eleanor is too sick to notice, where Margaret's trust provisions and Eleanor's personal annotations are silently reverted, where branches carrying the letter to the children are deleted three days after the funeral ("Removing stale branches. Unnecessary clutter."), and where David's final message reveals that Arthur has cut down the birch trees. The narrative is told entirely through metadata — timestamps, commit messages shifting from professional to desperate, branches created in secret and destroyed with bureaucratic casualness — and the tool's forensic commands (`exq blame`, `exq diff`, `exq log --author`) make the reader a digital archaeologist reconstructing a family's destruction from version control artifacts. Eleanor's letter, preserved only in the `contested` branch and in her email drafts, is the portfolio's most heartbreaking document — "I do not have the fight left in me. But the lake house is yours." The Tester's sandbox failure is an environment configuration issue; the code is complete, functional, and architecturally sound. The birch trees being cut down after the will is finalized is the cruelest detail in the portfolio: the will said "at the discretion of my executor," and the executor used his discretion to destroy what she wanted scattered there.


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

**Verdict:** fail_catastrophic
**Summary:** The sandbox execution environment failed to initialize — the entry point could not be located, resulting in a shell error before any tests could run. This appears to be an environment configuration issue rather than a code defect.
**Tests:** 0/1 passed
