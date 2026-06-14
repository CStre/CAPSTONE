# Section 07 — Building It Better: The Engineering Playbook

**Research basis:** Synthesis 06 (paths forward) + Synthesis 08 (the technical
playbook). **Slides:** 10. **Completion:** view all 10.

## What this section teaches

The payoff section: **specific, buildable ways to avoid the common problems with
recommendation algorithms.** Because every harmful link in the chain (Section 04)
is a _design choice_, a recommender can be re-engineered to serve the user. The
reader should leave with a concrete "stack of levers" — objective, feedback loop,
data, anti-compulsion, measurement, governance — each grounded in something already
working or already mandated. There is no silver bullet; there is a stack. This
section sets up the Travel-page demo (Section 08).

---

### Slide 07.1 — Lever 1: change the objective

- **Icon:** a dial/knob being turned from "engagement" to "welfare."
- **Copy:** The single highest-leverage fix is to stop maximizing engagement.
  Instead of `max engagement`, solve a constrained problem — roughly
  `relevance − harm_risk − over-use + diversity` — so welfare terms enter the
  ranking score _directly_, not as an afterthought. The reward _is_ the ethics:
  same machinery, different target.
- **Sources:** [[018]] Stray (well-being in the loss), [[002]] RL reward shaping.
- **Quote:** "welfare terms enter the ranking score directly, not as an
  afterthought" (Synthesis 08 Lever A).

### Slide 07.2 — Lever 1b: reward agreement across difference (bridging)

- **Icon:** two opposing arrows meeting at a shared point / a bridge.
- **Copy:** One concrete welfare objective already runs at scale. X's Community
  Notes uses _bridging_ matrix factorization — the exact technique behind ordinary
  recommenders — to elevate content rated helpful by people who usually _disagree_,
  directly countering the outrage the engagement objective selects for. Same linear
  algebra, pro-social target: the clearest proof that the technique is neutral.
- **Sources:** [[022]] Ovadya & Thorburn (reuses [[003]]), [[039]] (the outrage it
  counters).
- **Quote:** bridging ranking optimizes for content endorsed "across differing
  viewpoints rather than for engagement" ([[022]]).

### Slide 07.3 — Lever 2: break the feedback loop

- **Icon:** a closed loop with a clean cut in it.
- **Copy:** Models retrain on logs their own past recommendations shaped, which
  homogenizes users "without increasing utility." Counter it with off-policy
  correction — re-weight each logged interaction by `1 / P(it was shown)` (inverse
  propensity scoring) so the model learns _true_ preference rather than its own echo.
  This directly attacks the confounding that biases naive training.
- **Sources:** [[032]] Chaney 2018 (confounding).
- **Quote:** the loop "homogenizes user behavior without increasing utility," and
  offline accuracy metrics "hide this" ([[032]]).

### Slide 07.4 — Lever 2b: actively fight narrowing

- **Icon:** a collapsing fan being pushed back open / an entropy gauge.
- **Copy:** Exploration alone isn't enough — even random exploration can degenerate
  a user's interests into an echo chamber. So _monitor_ the narrowing: track the
  entropy of what a user is shown over time, and when it collapses, inject breadth
  and cap the reinforcement of any single attractor. The system "can only slow down
  or accelerate" degeneration — so make it actively slow it.
- **Sources:** [[033]] Jiang 2019, [[031]] Li 2010 (exploration).
- **Quote:** the recommender "can only slow down or accelerate" interest
  degeneration ([[033]]) — so it must _actively_ slow it (Synthesis 08 Lever B).

### Slide 07.5 — Lever 3: minimize the data

- **Icon:** a small lock / a shrinking data footprint.
- **Copy:** Train on-device and share only aggregated model updates (federated
  learning, bounded by differential privacy), so personalization needs no central
  behavioral hoard. Never derive sensitive traits for ranking or ads; if you derive
  them for safety, wall them off from monetization. Offer a genuine non-profiling
  mode — and prefer protective _defaults_, because defaults dominate options.
- **Sources:** [[024]] McMahan, [[023]] DSA non-profiling option, [[005]]–[[007]]
  (the inferences to refuse).
- **Quote:** federated learning leaves "training data distributed on the mobile
  devices," sharing only aggregated updates ([[024]]).

### Slide 07.6 — Lever 4: remove the slot machine

- **Icon:** a pause/stop symbol / a calm "you're caught up" checkmark.
- **Copy:** The user is a reward-maximizing agent on evolved circuitry, and
  variable-ratio reward is the compulsion engine — so de-randomize the schedule.
  Batch notifications on a schedule, drop autoplay and infinite-scroll defaults, and
  add natural stopping cues like "you're caught up." The addictive mechanics are not
  necessary for the benefits, so they can go.
- **Sources:** [[025]] Bhargava & Velasquez, [[034]] Lindström, [[035]] Sherman.
- **Quote:** strip mechanics that are "not necessary to provide the … benefits"
  ([[025]]).

### Slide 07.7 — Lever 4b: safety and developmental defaults

- **Icon:** a shield over a young figure / a guardrail.
- **Copy:** Because harm is concentrated, protection should be too. Use high-recall
  classifiers to down-rank and rate-limit self-harm, pro-eating-disorder, and crisis
  content, with circuit-breakers that interrupt the narrowing funnel. For minors,
  default to no engagement-max feed, profiling off, and conservative
  time/notification limits — sized to the heightened adolescent reward sensitivity.
- **Sources:** [[013]] CCDH, [[012]] Molly Russell, [[016]] Surgeon General,
  [[028]] APA, [[043]] AAP.
- **Quote:** developmental defaults for minors — "no engagement-max feed,
  profiling-off by default" (Synthesis 08 Lever D).

### Slide 07.8 — Lever 5: measure welfare honestly

- **Icon:** a ruler/scale with a small heart on it.
- **Copy:** Stop trusting offline accuracy computed on confounded logs — it's
  biased toward the algorithm that produced them; use counterfactual evaluation
  instead. Instrument real well-being endpoints — experience sampling, regret,
  "time well spent" versus time spent — and hold welfare _outside_ the optimizer as
  a guardrail, so it can't be gamed. A metric you maximize gets gamed; a guardrail
  you respect does not.
- **Sources:** [[032]] (confounded metrics), [[037]] Kross (experience sampling),
  [[018]] Stray.
- **Quote:** hold well-being as "a guardrail metric and a counterfactual A/B
  endpoint … not the single maximized target" (Synthesis 08 Lever E).

### Slide 07.9 — Lever 6: transparency, audits, and governance

- **Icon:** an open panel with visible dials / a magnifying glass with a checkmark.
- **Copy:** Bake accountability in rather than bolting it on. Expose the main
  ranking parameters "in plain and intelligible language" with real controls (as
  the EU's DSA already requires), and open the system to independent
  researcher audits — large platform RCTs prove rigorous internal audits are
  possible. Run Value-Sensitive Design from the start, centering the indirect
  stakeholders the engagement objective never modeled.
- **Sources:** [[023]] DSA Arts. 27 & 40, [[027]] Huszár (audits possible), [[021]]
  VSD.
- **Quote:** the DSA requires explaining "the main parameters" of recommenders "in
  plain and intelligible language" ([[023]]).

### Slide 07.10 — The throughline

- **Icon:** a keystone locking an arch / a signature.
- **Copy:** There is no silver bullet — only a stack of levers, and every one is
  grounded in something already working or already mandated, not speculation.
  Across all of them, one lesson repeats: the technique is neutral; the objective,
  the data, and the loop are the ethics. The next section shows this stack, in
  miniature, actually running.
- **Sources:** Synthesis 06 / 08 takeaways.
- **Quote:** "the technique is neutral; the objective and data practices are the
  ethics" (Synthesis 06).

---

## Section takeaway (the one sentence)

> A user-first recommender is **buildable today** via a stack of levers — redesign
> the objective (incl. bridging), de-confound and de-narrow the loop, minimize the
> data, strip the slot machine, add safety/developmental defaults, measure welfare
> honestly, and govern it transparently — each proven in practice, none a silver
> bullet alone.

## The reference architecture (a candidate "diagram" slide)

From Synthesis 08 — useful as a single visual payoff card if the section wants one:

```
RETRIEVAL    minimal, purpose-limited features; federated + DP; no sensitive inference
RANKING      score = relevance − harm − over-use + diversity + bridging   (NOT watch-time)
LOOP CONTROL off-policy / IPS de-confounding; entropy monitor + breadth injection
GUARDRAILS   down-rank self-harm/ED; de-randomized notifications; minor-safe defaults
SERVING      non-profiling option + transparent parameters & controls
EVALUATION   off-policy eval; well-being A/B + experience sampling; welfare as guardrail
GOVERNANCE   value-sensitive design + indirect stakeholders; duty-of-care defaults
```
