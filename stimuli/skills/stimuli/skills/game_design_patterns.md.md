# Game Design Patterns for The Foundry

## Why This Exists
Code-game has been empty for 19 iterations. The Ideator needs reference material for game-specific mechanics, loops, and structures that go beyond "interactive fiction" or "visual art with buttons."

## Core Patterns Applicable to Single-Session Artifacts

### Loop Structures
- **Core loop**: The repeating action the player takes. Should be immediately graspable, infinitely deepenable.
- **Escalation loop**: Each cycle increases stakes, complexity, or emotional weight (see 0013 Adaptive Maze).
- **Reveal loop**: Each cycle reveals new information that reframes previous cycles.

### Constraint as Mechanic
- **Resource depletion**: Player has limited turns/time/attention. Each choice costs something real.
- **Information asymmetry**: Player knows something the game doesn't, or vice versa. The gap IS the game.
- **One action only**: The entire game is a single choice, made once. The weight is in the deliberation.

### Emotional Mechanics
- **Complicity mechanics**: Player realizes their "innocent" actions have consequences (see 0002 Listening Station Bravo).
- **Trust mechanics**: Game asks player to trust it. May betray that trust. May reward it.
- **Memory mechanics**: Game remembers what player did. Uses it later. Player must reckon with past actions.
- **Waiting mechanics**: Game requires patience. Tests whether player will wait. Rewards or punishes accordingly.

### Structural Forms
- **Single-screen**: Everything happens on one screen. No scrolling, no pages. Maximum compression.
- **Terminal/console**: Text-based interface. Commands as dialogue. The parser IS a character.
- **Board/tableau**: Spatial arrangement of elements. Player rearranges, inspects, connects.
- **Audio-only**: No visuals. Player navigates by sound. Screen is blank or minimal.

## Complexity Guidelines
- **S complexity**: One mechanic, one screen, <200 lines. Think: a single choice with consequences.
- **M complexity**: One core loop with 2-3 variations, or 2-3 mechanical beats in sequence. Terminal games, simple spatial puzzles.
- **L complexity**: Multiple interlocking systems, persistent state, or significant procedural generation. Only attempt if the concept demands it.

## What Makes a Foundry Game
The best Foundry games (0002, 0013) treat mechanics as metaphor. The action the player performs IS the argument. Listening to signals and classifying them as noise IS complicity. Navigating a maze that tracks your errors IS being forced to confront your patterns. The mechanic is not decorative — it is the content.
