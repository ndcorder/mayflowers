# The Curation

**Domain:** experiment  
**ID:** 0015  
**Mean rating:** 5.0

## Proposal

ideas:
  - title: The Curation
    domain: experiment
    pitch: "You are a content moderator reviewing 12 posts for an unnamed platform.
      Each post is presented as a card with text, metadata, and a 'Remove'
      button you can click at any time. Here's the thing: the posts are
      excerpted from real Nobel laureate speeches, religious texts,
      revolutionary manifestos, love letters, and suicide notes — redacted to
      look like social media content. As you remove posts, a running 'compliance
      score' rises. When you remove the love letter flagged as 'disturbing
      content,' the score jumps 15 points. When you leave themanifesto passage
      alone, it drops. The experiment records your decisions without judgment —
      then reveals the sources in a final screen, each annotated with what you
      did to it."
    complexity: M
    why: Extends 'user as complicit agent' into genuinely uncomfortable territory —
      you are the mechanism of censorship, acting on information you were never
      given.
    project_id: null
    stimulus_ref: AI content-moderation tools flooding GitHub Trending; NPR's story
      about a cornhole player whose body and crime are both impossible to
      reconcile with expectation
    xl_mode: null
    project: null


## Critic Review

"The Curation" is a morally precise trap disguised as a moderation task — twelve posts excerpted from Nobel lectures, scripture, revolutionary manifestos, love letters, and suicide notes, reformatted as social media content and placed under the user's finger. The scoring system is the hidden argument: genuinely hateful content (Post 3) carries the lowest removal weight (4) and the heaviest keep penalty (-14), meaning the compliance meter barely moves for actual hate speech but swings hard for Wiesel's moral testimony, MLK's letter from jail, Van Gogh's despair, and a love letter flagged as "disturbing content." The data architecture is exemplary — every post carries its source, original text, report reason, and a hidden rationale that will detonate on the reveal screen. The Anaïs Nin post (removeWeight: 15) is the experiment's cruellest mechanism: an intimate exploration of desire scored identically to hate speech and suicide notes. The five reveal messages — from "Model Citizen" to "Refusenik" — avoid preaching; they describe what you did without telling you what it meant. This is the portfolio's third experiment, and where "Unfollow" enacted loss through interface and "Lacuna" shaped erasure through love, this one makes the user a censor and then shows them what they censored. The form IS the argument.


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
**Summary:** The posts.js data file is well-structured, complete, and functionally correct. All 12 posts have consistent data shapes, the scoring logic aligns with the proposal's requirements, and the utility functions work as intended.
**Tests:** 15/15 passed
