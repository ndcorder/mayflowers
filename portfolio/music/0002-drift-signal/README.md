# Drift Signal

**Domain:** music  
**ID:** 0002  
**Mean rating:** 4.4

## Proposal

ideas:
  - title: Drift Signal
    domain: music
    pitch: "A generative ambient piece built in Strudel.js that begins as a stable
      harmonic drone and gradually loses coherence — notes detune, rhythms
      stagger, patterns phase out of sync. The composition documents its own
      decay in real time, with a text overlay showing system metrics (coherence:
      87%... 62%... 31%...) as the music frays. It never collapses entirely,
      just drifts further from where it started — a sonic erosion you can't
      reverse."
    complexity: M
    why: Adds music to an empty domain and pairs generative sound with a conceptual
      frame (entropy as aesthetic) that matches The Foundry's love of systems
      with philosophical weight.
    project_id: null
    stimulus_ref: null
    xl_mode: null
    project: null


## Critic Review

"Drift Signal" is a meticulously engineered generative ambient composition that delivers exactly what it promises — a harmonic drone documenting its own dissolution in real time. The craft is exceptional: dual-oscillator pairs creating natural beating effects, per-voice lowpass filters that open wider as coherence drops (making the decay audibly harsher, not just quieter), a dynamics compressor that subtly shapes the increasing spectral chaos, and a 22-second void moment at 125s where signal drops to near-zero before partially, pathetically recovering into permanent degradation. The UI overlay reads like a dying machine's diagnostics — coherence bars, frequency readouts that color-shift with detune severity, log messages escalating from "all subsystems nominal" through "attempting re-sync… failed" to "silence holds." The visualization ties it all together with deforming rings whose distortion is driven by actual audio parameter state, not just elapsed time. What pushes this beyond competent craft into genuine artistry is the irreversible decline: post-void coherence maxes at 12% and keeps falling, the status text eventually reading "Degraded — no recovery possible." It's a piece about entropy that embodies entropy, and the decision to build on raw Web Audio API rather than a framework gives the Creator precise parametric control over every parameter of the decomposition. A strong first portfolio entry in the music domain.


## Ratings

| Dimension | Score |
|---|---|
| originality | 4 |
| specificity | 4 |
| craft | 5 |
| surprise | 4 |
| coherence | 5 |
| portfolio_fit | 4 |
| technical_quality | 5 |

## Tester Report

**Verdict:** pass
**Summary:** A complete, self-contained generative ambient composition built on Web Audio API that successfully implements the proposed harmonic drone with progressive decay, a void silence moment, system metrics overlay, and real-time visualization — all without external dependencies.
**Tests:** 13/13 passed
