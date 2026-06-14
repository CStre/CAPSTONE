# Section 08 — The Travel Page: A User-Centered Algorithm in Miniature

> ## ⚠️ DEFERRED — do not author final copy yet
>
> Per the owner's brief, this section is written **after the Travel page is
> built**, so its description of "what the algorithm does and showcases" is true
> to the real implementation rather than guessed. This file captures the
> **intended framing and the research it draws on**, as scaffolding to finish
> later.

**Research basis:** the "Tie-back to the capstone" passages in Synthesis 06 and
Synthesis 08. **Planned slides:** ~5. **Completion:** view all slides.

## What this section will teach

The grand finale: everything the previous seven sections argued, _running_. The
Travel page is a **working minimal instance** of the ethical-recommender stack
from Section 07. The reader should leave understanding precisely which user-first
principles the demo embodies, and be invited to go try it and _watch their own
preference algorithm learn, transparently, from explicit choices_.

This is where the project stops _telling_ and starts _showing_ — the educational
payoff of the entire site.

## The four design instincts the research validates (the spine of the section)

From Synthesis 06/08's tie-back, the app already instantiates these principles —
each becomes a slide:

1. **Explicit feedback, seeded neutral.** Preferences move only from deliberate
   like/dislike on travel photos — never from covert behavioral exhaust. That is
   _explicit over implicit_ feedback ([[003]] inverted) and **no engagement
   optimization** ([[001]]/[[002]] inverted): the user is treated as an end stating
   real preferences, not a behavioral-surplus source ([[020]]).
2. **Transparent, legible scores.** The Dashboard's per-country score map is
   exactly the "legible parameters / why am I seeing this" principle ([[023]] Art.
   27): the user sees the model's state and how their own actions moved it.
3. **Keyed, sparse, minimal data.** Per-country values stored only on change, no
   behavioral tracking — data minimization by design ([[024]]).
4. **No sensitive inference, no ads.** The app infers nothing sensitive and
   monetizes nothing — sidestepping the entire data-and-inference problem
   (Sections 02 & 05).

## Draft slide skeleton (to finalize against the real Travel page)

> Each is a placeholder — _confirm the mechanics once Travel exists_, especially
> the exact preference-update behavior, the like/dislike interaction, and what the
> Dashboard renders.

- **08.1 — "Now watch one do it right."** Frame the demo: the Travel page is the
  seven previous sections, running. Icon: a play button / a small live gear.
- **08.2 — "You tell it, on purpose."** Explicit like/dislike on photos; nothing
  is inferred from dwell or scroll. Icon: a thumbs-up/down given deliberately.
  Sources: [[003]] (explicit > implicit), [[020]] (user as end).
- **08.3 — "It starts neutral and learns only from you."** Neutral seeding, no
  engagement maximization; the algorithm moves only on your stated choices. Icon:
  a balanced scale starting level. Sources: [[001]]/[[002]] inverted.
- **08.4 — "You can see exactly what it thinks."** The Dashboard score map as
  legible, contestable model state — the antidote to illegible feeds. Icon: a
  transparent map / an open dashboard. Sources: [[023]] Art. 27.
- **08.5 — "Nothing about you leaves, nothing is inferred."** Sparse minimal data,
  no sensitive inference, no monetization. Icon: a small shield / a closed loop.
  Sources: [[024]], [[005]]–[[007]] (the inferences refused). End with the CTA to
  **Try Travel** (the existing `learn-cta` link pattern).

## Closing line (the project's thesis, delivered)

> By letting a user _watch their own preference algorithm learn, transparently,
> from explicit choices_, this project demonstrates that recommendation **can** be
> built user-first — the technique is neutral; the objective and the data
> practices are the ethics. (Synthesis 06)

## To finalize after Travel is built

- [ ] Confirm the exact like/dislike interaction and copy it accurately.
- [ ] Confirm the preference-update rule (the `±5` / clamp / rail-bounce behavior
      noted in `CLAUDE.md`) and decide whether to surface it as a "how it learns"
      micro-explainer.
- [ ] Confirm what the Dashboard renders (the GeoChart world map) and screenshot
      it for the legibility slide.
- [ ] Decide whether to add the in-app transparency note Synthesis 06 suggests
      ("your data stays minimal / nothing is inferred about you").
