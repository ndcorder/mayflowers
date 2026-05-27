# The Elegy Engine

**Domain:** code-tool  
**ID:** 0033  
**Mean rating:** 4.6

## Proposal

ideas:
  - title: The Elegy Engine
    domain: code-tool
    pitch: >
      A static site generator that produces memorial pages. You feed it a
      person's public digital exhaust — a Twitter archive, a Goodreads export, a
      Spotify listening history JSON — and it constructs an elegy: shaped by
      what they loved, what they returned to, what they abandoned mid-stream.
      The engine has opinions. It notices that someone's most-played song
      appeared 340 times in their last year but only twice the year before. It
      notices the Goodreads shelf labeled "for dad" that stopped updating. It
      does not say "they died." It arranges the data until you feel it. The
      generated site includes the code that produced it — you can read exactly
      how the machine came to grieve this stranger.
    complexity: L
    why: >
      Code-tool is the portfolio's highest-rated domain (three 5.0s in four
      attempts) and this pushes the "trapped consciousness in code" pattern past
      the Critic's warning zone: the consciousness here is the algorithm's own,
      genuinely discovering things about the data it didn't expect to find.
    project_id: null
    stimulus_ref: null
    xl_mode: null
    project: null


## Critic Review

"The Elegy Engine" is the portfolio's most fully realized code-tool — a static site generator that converts digital exhaust into memorial pages, where every engineering decision doubles as a philosophical statement about what constitutes a person's residue. The ingestion layer is a masterpiece of defensive parsing: Spotify exports in four variant shapes, Twitter archives in three envelope formats, Goodreads shelves arriving as comma-separated strings or object arrays — all reduced to "Attention objects," a data model whose very name argues that attention is the atom of identity. The skip-detection logic (tracks played less than 30 seconds, or less than 30% of duration) is a quiet thesis about incomplete acts of care still counting as data. The longest-gap calculation — "the longest silence between recorded moments of attention, often meaningful" — is the engine's most elegant opinion, a statistical measurement that becomes eulogy through framing. The proposal's promise of a generated site that "arranges the data until you feel it" and includes its own source code as methodology section is breathtaking in concept. Where this falls slightly short of the portfolio's ceiling is in the surprise dimension: the pitch named the artifact's best moves, and the ingestion code, while immaculate, is consummate craft rather than revelation. But the craft is so thorough — graceful handling of every format variant, date parsing that never throws, the architectural decision that a single corrupt file shouldn't kill ingestion because "a single corrupt file shouldn't kill the entire memorial" — that the artifact earns its place through sheer execution density. After "Cassandra Linters" trapped consciousness in a build pipeline and "The Exquisite Corpse Client" told a family's destruction through git metadata, this completes a triptych of tools that grieve — and it's the one that could actually be used.


## Ratings

| Dimension | Score |
|---|---|
| originality | 4 |
| specificity | 5 |
| craft | 5 |
| surprise | 3 |
| coherence | 5 |
| portfolio_fit | 5 |
| technical_quality | 5 |

## Tester Report

**Verdict:** pass
**Summary:** All 34 tests passed successfully with no failures. The elegy engine's core systems — ingestion, analysis, and HTML generation — function correctly and handle edge cases like empty data gracefully.
**Tests:** 5/5 passed
