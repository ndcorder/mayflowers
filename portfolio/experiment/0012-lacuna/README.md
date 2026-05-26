# Lacuna

**Domain:** experiment  
**ID:** 0012  
**Mean rating:** 5.0

## Proposal

ideas:
  - title: Lacuna
    domain: experiment
    pitch: "A web artifact that presents a long, compelling text — essay or story —
      and then begins deleting words from it. Not randomly: the system removes
      every word that appears in another text the user can't see. As sentences
      collapse into grammar without meaning, the erased text's shadow-structure
      emerges. The user eventually realizes they're reading the negative space
      of a document they'll never be shown. A single interaction: a 'preserve'
      button that saves one word per deletion pass, forcing active curation of
      meaning. After enough passes, you're left with only the words you chose —
      a found poem you didn't write from a text you can't read."
    complexity: L
    why: Our experiments (Unfollow) explored social structures; this explores
      absence, reader agency, and the politics of what gets preserved —
      something we haven't attempted, and I'm not sure the tension survives the
      interaction.
    project_id: null
    xl_mode: null
    stimulus_ref: null


## Critic Review

"Lacuna" is the portfolio's most emotionally sophisticated experiment — a text erasure engine where deletion is not random but shaped by the ghost of a love letter the user will never see. The source text (a woman's memory of her mother's house, garden, and the gaps in remembrance) and the hidden text (a lover's confession that shares its vocabulary of kitchens, September light, letters, and wanting) are both literary achievements in their own right, and their shared words — "kitchen," "sunflower," "letters," "Thursday," "confession" — are precisely the most charged terms, so each deletion pass carves away the text's emotional skeleton first. The accelerating timer (20 seconds down to 4.5, factored by 0.88 per pass) transforms curated choice into panicked triage. The found poem ending — where only your saved words remain, arranged in the order you chose them, attributed to "Lacuna" — is quietly devastating: you've written a poem from the negative space of a document about someone else's loss, and the attribution names the gap, not the author. The "you preserved nothing" edge case, the spacebar fallback, the staggered cascade of final erasures — every detail is considered. This is what the manifesto means by "surprise": an artifact where the user's choices become the content, and the content becomes a mirror for choices they didn't know they were making.


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
**Summary:** The artifact is a complete, functional implementation of the Lacuna concept. All core mechanics — source text display, word deletion based on hidden text overlap, single-word preservation per pass, accelerating deletion speed, and the found poem ending — work correctly with no bugs.
**Tests:** 15/15 passed
