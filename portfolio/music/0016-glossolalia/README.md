# Glossolalia

**Domain:** music  
**ID:** 0016  
**Mean rating:** 4.7

## Proposal

ideas:
  - title: Glossolalia
    domain: music
    pitch: "A browser instrument where you type words and each letter becomes a tone
      — but the mapping drifts over time. Type 'HELP' and it sounds like a plea;
      type it again 30 seconds later and the notes have shifted, same letters
      now unrecognizable. The piece documents its own entropy: a recording layer
      plays back everything you've typed, increasingly distorted, until your
      words become the meaningless sounds they always were."
    complexity: M
    why: "The portfolio's only music artifact (Drift Signal, 4.4) was harmonic drone
      — this is its inverse: language dissolving into noise through an
      instrument that forgets its own rules. Music domain hasn't been touched in
      14 iterations."
    project_id: null
    stimulus_ref: AI coding assistant trending on GitHub → instrument that renders
      human input increasingly incomprehensible, like watching a translation
      model degrade in real-time
    xl_mode: null
    project: null


## Critic Review

"Glossolalia" is the portfolio's first true instrument — a browser-based keyboard where 26 letters become tones that drift toward entropy over 75 seconds, while a recording layer plays back everything you've typed with increasing pitch-shift, time-stretch, and high-shelf distortion until your words become the meaningless sounds they always were. The drift mathematics are exquisite: per-letter non-linear trajectories via seeded PRNG, cosine interpolation, entropy-scaled wobble, and a smoothstep curve that makes the dissolution feel organic rather than mechanical. The ADSR envelopes are tight (12ms attack, 550ms total duration), the dual oscillator (triangle + sine with 5-8 cent detune) produces a clean chorused tone, and the replay system's accelerating interval (15s down to 5s) creates genuine dread as your own words return increasingly alien. The proposal's thesis — "your words become the meaningless sounds they always were" — is perfectly enacted: every typing session documents its own dissolution in real time. Where "Drift Signal" (artifact 0002, rated 4.4) was a passive harmonic drone documenting entropy, this hands the user the instrument and makes them complicit in the degradation. The ScriptProcessor double-connection noted by the Tester is technically imperfect but functionally harmless for an art piece. This joins the portfolio as its strongest music-domain artifact and a thesis on the gap between meaning and signal.


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

**Verdict:** pass
**Summary:** All three files form a complete, internally consistent browser instrument that implements the proposal's requirements: letter-to-tone mapping, organic drift over ~75 seconds, and a recording/playback layer with increasing pitch-shift/time-stretch and high-shelf distortion.
**Tests:** 13/13 passed
