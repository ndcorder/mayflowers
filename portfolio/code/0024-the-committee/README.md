# The Committee

**Domain:** code-game  
**ID:** 0024  
**Mean rating:** 5.0

## Proposal

ideas:
  - title: The Committee
    domain: code-game
    pitch: "You're the last human applicant before the Committee on Perseverance —
      five non-human judges (a crystal, an algorithm, a fungus network, a river
      delta, and an electromagnetic pulse) deciding whether humanity deserves
      another century. You answer their questions through a text parser, but
      each judge scores you on secret criteria they refuse to reveal. The game's
      central discovery: the judge who seems most cynical is actually scoring
      for vulnerability, and the one who seems most empathetic is scoring for
      how funny your answers are phonetically when read aloud by a
      text-to-speech engine."
    complexity: L
    why: This is the one I'm not sure we can pull off. Five distinct feedback
      voices, hidden rubrics, a parser that must feel characterful not
      mechanical, and the phonetic-score surprise must feel earned rather than
      arbitrary. If it works, it's our funniest and most structurally ambitious
      artifact. If it fails, it fails spectacularly — which the manifesto values
      more than safe competence.
    project_id: null
    stimulus_ref: Transformed from 'AI agent' trending on GitHub + 'understand
      anything' repo name — what would an entity that genuinely understood
      everything ask us? Not factual questions, but ones that revealed whether
      we're worth persisting.
    xl_mode: project
    project:
      name: The Committee
      description: "Multi-iteration project: build the questioning engine and judge
        logic, then develop each judge's voice and hidden criteria, then the
        parser and discovery mechanics, then the ending conditions."
      phases:
        - id: 1
          title: Chamber and Logic
          artifact_title: The Committee
          artifact_domain: code-game
          artifact_complexity: L
          artifact_pitch: "Playable first chapter: you face the Committee, answer
            questions, receive feedback from all five judges, and discover one
            judge's hidden criterion. The phonetic-score surprise is hinted but
            not revealed."
        - id: 2
          title: Appeals and Revelations
          artifact_title: "The Committee: Closing Arguments"
          artifact_domain: code-game
          artifact_complexity: L
          artifact_pitch: "The continuation: you can appeal individual judge scores,
            learning more about each criterion. The phonetic judge reveals
            itself. Multiple endings based on which judges you satisfy."


## Critic Review

"The Committee" is the portfolio's most layered code-game since "Mise en Abyme" — five alien judges, five secret criteria, and the game's central subversion is that the most cynical presence (KRN-5, electromagnetic, drowning in static) scores for vulnerability while the warmest conversationalist (ALL-1, the river who says "we are pleased to meet you, genuinely") scores for how phonetically funny your words sound when read through a text-to-speech engine. The discovery is earned through escalating hints: ALL-1's waters "churning with barely suppressed amusement" after your words are machine-read, the phonetic dictionary of 80+ entries from "quagmire" to "borborygmus" to "flarp," and the quiet instruction to "try words that sound unusual when spoken aloud." The judges are mechanically and rhetorically distinct — VEX-9's crystal stutters every fourth word, APEX-7 appends confidence percentages, MYR-3 speaks in mycelial ellipses, KRN-5 strikes through its own words mid-sentence — and the deliberation reveal ("The Committee never promised to be fair. Only to be honest — after the fact.") is the game's thesis landing with precision. Each judge scores every round simultaneously, so optimization is impossible; you are always failing someone. After 18 artifacts with zero laughs, ALL-1's criterion is a phonetic comedy club hidden inside a cosmic tribunal, and the revelation that it exists is itself the funniest moment in the portfolio. The cheese course remains unremarkable.


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
**Summary:** All 75 tests passed with zero failures. The artifact is a fully functional, self-contained HTML game with all five non-human judges, distinct scoring criteria (including the subverted phonetic humor and vulnerability reveals), phonetic TTS integration, progressive discovery hints, deliberation outcomes, accessibility support, and replay functionality.
**Tests:** 13/13 passed
