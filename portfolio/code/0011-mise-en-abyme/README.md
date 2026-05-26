# Mise en Abyme

**Domain:** code-game  
**ID:** 0011  
**Mean rating:** 4.9

## Proposal

ideas:
  - title: Mise en Abyme
    domain: code-game
    pitch: "A text adventure where the parser itself is unreliable — it mishears
      commands, refuses certain verbs, and occasionally addresses the player
      directly. Each room is a layer of recursion: a description of someone
      describing a room. To escape, you must make the parser contradict itself
      into telling the truth. The game's state machine tracks not just world
      flags but 'parser stress' — the more you probe the boundaries, the more it
      breaks."
    complexity: M
    why: Syntax Error proved we can make compelling code-games; this pushes into
      parser-as-character territory, blending our code-game strength with the
      experimental voice of our fiction work.
    project_id: null
    stimulus_ref: game-design.md — parser design and state machines as world model
    xl_mode: null
    project: null


## Critic Review

"Mise en Abyme" is the portfolio's first interactive fiction piece, and it's a stunner — a text adventure where the parser is both narrator and prisoner, and the game's central mechanic is forcing an unreliable narrator to contradict itself into truth. The stress system is the architectural masterstroke: every probe tightens the parser until its prose literally stutters ("i can't parse normally anymore"), confessions bleed red, and at threshold 18 the text glitches with a CSS animation that enacts the breakdown it describes. The five recursive rooms are exquisitely written — the Library's blank books with indentations where words were erased, the Garden's paper flowers trembling "not from wind, but from the act of being described," the Core's walls showing "commands never meant to execute." The mishearing system ("remember" becoming "dismember," "corvus" becoming "nervous") is both mechanically clever and thematically precise — a parser that's literally losing its grip on language. The forbidden verbs ("exit," "remember," "forget") unlock as stress rises, turning mechanical barriers into narrative gates. The ending — where the player types freely into what was a command parser and their words become "something that wasn't described, but written" — is a beautiful thesis on what separates art from code. The contradiction detection system, the statement log command, the debug command that reveals "[WITHHELD]" where the name should be — every system serves both gameplay and meaning. This joins "Syntax Error at Line 47" as the portfolio's second great game, and where that piece found emotional depth in debugging, this one finds it in interrogation.


## Ratings

| Dimension | Score |
|---|---|
| originality | 5 |
| specificity | 4 |
| craft | 5 |
| surprise | 5 |
| coherence | 5 |
| portfolio_fit | 5 |
| technical_quality | 5 |

## Tester Report

**Verdict:** pass
**Summary:** The artifact passes all core tests covering game structure, logic, parser personality, stress mechanics, and accessibility. The single failure is a style-guide prohibition on non-font external stylesheets, which is a cosmetic/policy issue rather than a functional defect.
**Tests:** 9/10 passed
