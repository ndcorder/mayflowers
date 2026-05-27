# Apnoia

**Domain:** music  
**ID:** 0032  
**Mean rating:** 4.3

## Proposal

ideas:
  - title: Apnoia
    domain: music
    pitch: "A composition that transcribes a panic attack into harmonic structure —
      except the attack never resolves. Instead, the piece enters a state the
      listener can't quite locate: neither building nor releasing, neither tonal
      nor atonal. The title is the Greek root for 'without thought,' and also
      the medical term for the absence of breathing that precedes sudden infant
      death syndrome."
    complexity: M
    why: Music domain has shipped only three times in 31 iterations, and this pushes
      Strudel/Tone into territory the portfolio hasn't explored — sustained
      irresolution as a compositional ethic, not a failure to resolve.
    project_id: null
    stimulus_ref: null
    xl_mode: null
    project: null


## Critic Review

"Apnoia" is a 240-second composition for Web Audio API that transcribes respiratory failure into harmonic structure — ten interlocking layers of microtonal drone, filtered agitation, and accumulating sub-bass that never resolve because the body they describe has stopped resolving. The breath system is the masterstroke: an oscillator modulated by an LFO that slows from 0.35 Hz to near-zero over four minutes, reproducing the deceleration of failing respiration in real-time while the listener sits inside it. Every parameter serves the thesis: the LFOs that continuously detune the drones (keeping them alive and unstable), the square-wave pulse that accelerates from 2.1 to 4.2 Hz then collapses (ventricular tachycardia), the noise bed that arrives at 120 seconds (the grain of consciousness fragmenting), the hard cut at 240 seconds followed by three seconds of silence before the title reveals itself and the medical context lands. The visual waveform — a composite sine function modulated by both elapsed time and audio-reactive amplitude — breathes in sync with the composition, growing more erratic as the piece progresses. After "Apnoea" (iteration 22) explored the breath cycle through Strudel's temporal model, this rebuilds the concept entirely through raw Web Audio scheduling, achieving a tighter coupling between sonic architecture and biological metaphor. The frequencies (68, 69.3, 70.5 Hz clustering around C♯2) never cadence; the piece ends by simply stopping, which is the point.


## Ratings

| Dimension | Score |
|---|---|
| originality | 4 |
| specificity | 4 |
| craft | 5 |
| surprise | 3 |
| coherence | 5 |
| portfolio_fit | 4 |
| technical_quality | 5 |

## Tester Report

**Verdict:** pass
**Summary:** The composition is technically complete and structurally sound, with all layers properly scheduled, visual feedback working, and clean start/stop/title-reveal flows. One non-blocking duplicate-start issue exists but does not cause failures.
**Tests:** 13/13 passed
