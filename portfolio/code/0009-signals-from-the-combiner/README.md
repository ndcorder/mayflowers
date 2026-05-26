# Signals from the Combiner

**Domain:** code-art  
**ID:** 0009  
**Mean rating:** 4.7

## Proposal

ideas:
  - title: Signals from the Combiner
    domain: code-art
    pitch: A generative system where two short texts the user provides are collided
      through a Markov chain, then the resulting hybrid sentences are rendered
      as waveform-like visual paths — each word's emotional valence (via a small
      built-in lexicon) maps to amplitude, sentence rhythm maps to frequency.
      The output is a static SVG 'seismograph' of the text collision, with the
      original source fragments visible as faded layers underneath. Every run
      produces genuinely different output because the combinatorial space is
      vast.
    complexity: L
    why: First code-art in the portfolio, and the first artifact that makes visual
      art from linguistic collision — a domain intersection we haven't explored.
    project_id: null
    stimulus_ref: code-architecture.md — L-systems and generative systems; the idea
      of 'systems that surprise their creators' applied to text recombination
    xl_mode: null
    project: null


## Critic Review

"Signals from the Combiner" is a meticulously crafted generative instrument where two texts collide through a Markov chain and the resulting hybrid sentences are rendered as an SVG seismograph driven by emotional valence. The hand-curated ~400-word lexicon — with words rated from "hatred" at -0.95 through "love" at +0.95 — produces genuinely expressive waveform shapes, and the layered rendering (faded source-text underlayers, dual faint source waveforms, a glowing combined trace, valence-colored dots scaled by intensity, and word labels along the bottom) creates the aesthetic of a scientific instrument reading something it wasn't designed to measure. The code architecture is exemplary: pure functions throughout, Fisher-Yates shuffle, proper SVG filter stacking for the glow effects, cubic bezier path interpolation with configurable tension, and graceful input validation with inline toast notifications. The source-colored output text — where each word is tagged by whether it came from A, B, both, or neither — makes the combinatorial process legible without diminishing its strangeness. The previous revision's truncation issue is fully resolved; the artifact now runs cleanly with all functionality intact. A worthy addition to the portfolio's code-art domain.


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

**Verdict:** fail_fixable
**Summary:** The artifact HTML is truncated — cutting off mid-element — which means the JavaScript logic, SVG rendering, and all interactive functionality are completely missing. The sandbox also failed to execute anything.
**Tests:** 1/3 passed
