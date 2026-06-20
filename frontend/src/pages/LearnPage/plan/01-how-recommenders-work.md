# Section 01 — How Recommendation Algorithms Actually Work

**Research basis:** Synthesis 01 (`/research/synthesis/01-how-recommender-systems-work.md`).
**Slides:** 10. **Completion:** view all 10.

## What this section teaches

Demystify the machine, then land the thesis that powers the whole site: **a
recommender is just a scoring function, and the math is essentially
value-neutral. The ethics live entirely in _what objective the function is trained
to maximize_ — and at every major platform that objective is a behavioral proxy
for engagement, chosen because real satisfaction can't be measured. Harm is the
predictable gap between the proxy and the person.** It ends on the liberating
corollary: if harm comes from the objective, the same math can serve a better one.

This is the conceptual backbone. If a reader internalizes only one section, this
is it.

---

### Slide 01.1 — A recommender is just a scoring function

- **Icon:** two small vectors / a dot-product symbol; or a "match %" meter.
- **Copy:** Underneath the branding, every recommender does one simple thing: it
  represents you and each item as a list of numbers, scores how well they match,
  and shows you the highest-scoring few. Netflix-era "matrix factorization" made
  this literal — a recommendation is the dot product of a learned user-vector and
  an item-vector, in a shared space of 20–100 hidden "factors." It needs no
  understanding of the content at all; it learns the vectors from patterns alone.
- **Sources:** [[003]] Koren 2009 (matrix factorization).
- **Quote:** _"score = qᵢ · pᵤ"_ — the dot product of a learned item-vector and
  user-vector in a shared latent-factor space ([[003]]).

### Slide 01.2 — One lineage: CF → deep learning → RL

- **Icon:** a branching tree from one root / a timeline of three nodes.
- **Copy:** Collaborative filtering, deep neural networks, and reinforcement
  learning are not different species — they're one lineage. YouTube describes its
  deep model as "a non-linear generalization of factorization techniques": it still
  learns user and item embeddings and serves recommendations as a nearest-neighbor
  lookup in dot-product space. Deep learning didn't change the _shape_ of the
  machine, only how expressively it learns the vectors.
- **Sources:** [[001]] Covington 2016 (YouTube DNN), [[003]] Koren 2009.
- **Quote:** the system is "a non-linear generalization of factorization
  techniques" ([[001]]).

### Slide 01.3 — It learns from your behavior, not your opinions

- **Icon:** a trail of footprints / a cursor leaving a dotted path.
- **Copy:** These systems are trained mostly on _implicit_ signals — clicks, watch
  time, scrolls, even mouse movements — not the ratings you consciously give.
  Behavior is used because there is "orders of magnitude" more of it, and it can be
  gathered "regardless of the user's willingness to provide explicit ratings." The
  feed you see is assembled from a trail you didn't know you were leaving.
- **Sources:** [[003]] Koren 2009, [[001]] Covington 2016.
- **Quote:** implicit feedback "indirectly reflects opinion by observing user
  behavior including purchase history, browsing history, search patterns, or even
  mouse movements" ([[003]]).

### Slide 01.4 — How your behavior physically becomes the model

- **Icon:** a click flowing into a grid of numbers / a table cell lighting up.
- **Copy:** "It learns from you" is concrete, not metaphorical. In production
  systems every action you take indexes a row in an **embedding table** that
  gradient descent rewrites on each interaction; other models add **cross-features**
  that memorize co-occurrences ("installed A _and_ viewing B"); online "bandit"
  systems inject each click as an immediate **reward** that updates the serving
  policy. Every interaction updates an embedding, a weight, or a policy —
  continuously, against an engagement label.
- **Sources:** [[029]] Naumov 2019 (Meta DLRM), [[030]] Cheng 2016 (Wide & Deep),
  [[031]] Li 2010 (contextual bandits / LinUCB).
- **Quote:** "DLRMs … utilize embedding tables for mapping categorical features to
  dense representations" ([[029]]); bandits work by "adapting [the] strategy based
  on user-click feedback" ([[031]]).

### Slide 01.5 — The two-stage funnel

- **Icon:** a wide funnel narrowing to a few items.
- **Copy:** At scale, recommendation is a funnel. A cheap "candidate generation"
  stage narrows _millions_ of items down to a few hundred, then a heavier "ranking"
  model orders those hundreds precisely. This two-stage structure is
  industry-standard — and it means the system is always running a tournament to
  decide what wins your next moment of attention.
- **Sources:** [[001]] Covington 2016.
- **Quote:** the pipeline narrows "millions" of items via candidate generation,
  then a ranking model orders the survivors ([[001]], via Synthesis 01 §1).

### Slide 01.6 — The catch: it optimizes a stand-in for what it can't measure

- **Icon:** a target where the real bullseye is faint and the arrow hits a nearby
  ring.
- **Copy:** A platform can't directly measure whether you're _happy_, so it
  optimizes something it _can_ count instead. YouTube calls this the "surrogate
  problem" and openly admits it "rarely obtains the ground truth of user
  satisfaction." The paper even warns that the choice of surrogate "has an outsized
  importance" — a quiet acknowledgement that the proxy is where everything can go
  wrong.
- **Sources:** [[001]] Covington 2016.
- **Quote:** _"We rarely obtain the ground truth of user satisfaction and instead
  model noisy implicit feedback signals."_ ([[001]])

### Slide 01.7 — The surrogate keeps escalating

- **Icon:** a meter climbing through three notches / an escalator.
- **Copy:** The proxy has a telling history. Ranking by raw clicks "often promotes
  deceptive videos … ('clickbait')," so YouTube switched to **watch time**; the
  frontier then moved to **long-term "stickiness"** — multi-step retention modeled
  with reinforcement learning, "far beyond classical instant metrics." Each step
  makes the system better at keeping you — and, turned on a vulnerable user, better
  at _not letting you leave_.
- **Sources:** [[001]] Covington 2016, [[002]] Zou 2019 (RL for long-term
  engagement).
- **Quote:** "Ranking by click-through rate often promotes deceptive videos … that
  the user does not complete ('clickbait')" ([[001]]); the new reward is "user
  stickiness, which is far beyond classical instant metrics" ([[002]]).

### Slide 01.8 — Why this produces harm by construction

- **Icon:** two arrows diverging from a common origin (proxy vs. welfare).
- **Copy:** When the measurable proxy (watch time) and the real goal (your
  well-being) pull apart, the system faithfully optimizes the proxy — straight
  through the harm. Ranking is also comparative: to lift one post is to bury
  another, so an engagement feed keeps discovering what holds _you_ specifically.
  An audit found one feed serving eating-disorder content within ~2.6 minutes and
  giving "vulnerable" accounts 12× more self-harm recommendations.
- **Sources:** [[013]] CCDH 2022, [[025]] Bhargava & Velasquez 2021.
- **Quote:** an engagement product becomes "an irresistible, weaponized version of
  the experience it once was" ([[025]]).
- **Epistemic guardrail:** amplification is _domain-dependent_ — strong for
  self-harm content to vulnerable teens ([[013]]), but Twitter's own ~2M-account
  RCT found _no_ evidence it pushes political _extremes_ over moderates ([[027]]).
  Say "selectively dangerous," not "radicalizes everyone."

### Slide 01.9 — Feedback loops compound it

- **Icon:** a circular arrow tightening into a spiral.
- **Copy:** It gets worse over time, because models retrain on the behavior their
  _own_ past recommendations shaped — confounded data. Simulations show this loop
  "homogenizes user behavior without increasing utility," and theory shows a user's
  interests can "degenerate" into echo chambers, with the recommender able only to
  "slow down or accelerate" the narrowing. Researchers later watched it happen live
  — recommended misogynistic content on TikTok climbing from 13% to 56% in five
  days.
- **Sources:** [[032]] Chaney 2018, [[033]] Jiang 2019, [[040]] Regehr 2025.
- **Quote:** the loop "homogenizes user behavior without increasing utility"
  ([[032]]); interest "degenerates" and the system "can only slow down or
  accelerate" it ([[033]]).

### Slide 01.10 — The hopeful twist: the math is neutral

- **Icon:** a single tool that can build _or_ break / a fork in a path.
- **Copy:** If harm flows from the _objective_ and not the _math_, then the same
  math can serve a better objective. X's Community Notes runs the _exact_
  matrix-factorization technique — but instead of predicting what you'll engage
  with, it elevates notes that people who usually _disagree_ both rate helpful. The
  technique is neutral; the objective and the data practices are the ethics.
- **Sources:** [[022]] Ovadya & Thorburn (bridging-based ranking reuses [[003]]),
  [[024]] McMahan 2017 (federated learning — the data pipeline can change too).
- **Quote (carry as the section's thesis):** _"Recommendation is not the problem
  and need not be abolished. The intervention point is the objective function and
  the data practices — both of which are engineering choices, not laws of nature."_
  (Synthesis 01 §5)

---

## Section takeaway (the one sentence)

> CF → matrix factorization → deep two-tower → sequence/RL is **one lineage**; the
> representation is neutral, the **objective is the choice**, and today's choice is
> an openly-acknowledged engagement surrogate whose gap from your welfare —
> compounded by feedback loops — is where harm is born.
