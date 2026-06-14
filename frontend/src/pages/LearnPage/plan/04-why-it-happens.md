# Section 04 — Why It Happens: The Mechanism Chain

**Research basis:** Synthesis 07 (`/research/synthesis/07-mechanism-chain-recommenders-to-mental-health.md`),
with the mechanism material from Synthesis 03. **Slides:** 8.
**Completion:** view all 8.

## What this section teaches

Section 03 established _that_ the harm is real; this section shows _why_ — and the
point is that it is **not vague or mystical, but a specifiable causal chain** with
an identifiable mechanism at every link. Behavior is injected as data → optimized
against an engagement proxy → narrowed by feedback loops → which select for
comparison- and outrage-bait → delivered onto evolved reward circuitry → where the
human, also a reward-maximizer, becomes coupled to the machine → producing
compulsion and measurable well-being decline. Every link is documented, and
therefore every link is _interruptible_ — the bridge to Sections 06 and 07.

---

### Slide 04.1 — The harm is a mechanism, not a mystery

- **Icon:** a connected chain / a clean left-to-right flow diagram.
- **Copy:** The link from algorithm to harm is often waved away as vague or merely
  correlational. It isn't. It's a traceable chain — data injection, an engagement
  proxy, feedback loops, harmful selection, reward circuitry, and measured decline
  — where each link rests on peer-reviewed technical or clinical evidence. Naming
  the mechanism is what lets us _interrupt_ it.
- **Sources:** Synthesis 07 (integrative).
- **Quote:** the chain "makes the connection mechanistic, not mystical"
  (Synthesis 07).

### Slide 04.2 — Link 1: your behavior is injected as data

- **Icon:** a click flowing into a glowing table row.
- **Copy:** First, behavior physically enters the model: every action updates an
  embedding row, a memorized cross-feature, or an online reward signal — relentless
  and continuous. None of these mechanisms carry a term for whether the interaction
  was _good_ for you; they carry only the label the platform optimizes. The
  injection is value-free, which is exactly the problem.
- **Sources:** [[029]] DLRM, [[030]] Wide & Deep, [[031]] contextual bandits,
  [[003]] matrix factorization.
- **Quote:** every interaction "updates an embedding, a cross-feature weight, or a
  bandit policy — continuously, against an engagement label" (Synthesis 07 Link 1).

### Slide 04.3 — Link 2: it optimizes a proxy for engagement, not welfare

- **Icon:** a target labeled "clicks" standing in front of a faint "well-being."
- **Copy:** All of those injection mechanisms serve one target. DLRM predicts
  click-through; bandits maximize clicks; YouTube optimizes watch time then
  retention — none contains a term for the user's welfare. As YouTube concedes, it
  "rarely obtains the ground truth of user satisfaction," so it optimizes the
  measurable surrogate. This proxy–welfare gap is the origin of every downstream
  harm.
- **Sources:** [[001]] Covington, [[002]] Zou, [[029]] Naumov.
- **Quote:** _"We rarely obtain the ground truth of user satisfaction."_ ([[001]])

### Slide 04.4 — Link 3: feedback loops narrow what you see

- **Icon:** a spiral tightening inward / a fan of options collapsing to one.
- **Copy:** Because the system retrains on behavior its _own_ recommendations
  shaped, the data is confounded — and the loop "homogenizes user behavior without
  increasing utility," while a user's interests can "degenerate" into echo chambers.
  Once a vulnerable user drifts toward distressing content, the loop's _natural
  tendency_ is to narrow them into it. This is the formal mechanism behind the
  funnel a coroner tied to a death.
- **Sources:** [[032]] Chaney, [[033]] Jiang, [[013]] CCDH, [[040]] Regehr, [[012]]
  Molly Russell.
- **Quote:** interest follows "a self-reinforcing pattern of narrowing exposure,"
  and the recommender "can only slow down or accelerate" it ([[033]]).

### Slide 04.5 — Link 4: the objective selects the harm

- **Icon:** a sieve catching sharp/comparison content, passing calm content
  through.
- **Copy:** An engagement-maximizing ranker promotes whatever maximizes engagement
  — and the evidence says that is often harmful by arithmetic. It surfaces outrage
  (out-group animosity, the strongest predictor of sharing), idealized
  appearance-content that drives comparison, and reward-bait. Optimizing engagement
  _is_, in practice, optimizing for the very content that hurts.
- **Sources:** [[039]] Rathje (outrage), [[017]] Fardouly & Vartanian (comparison),
  [[004]] Facebook Files, [[027]] Huszár (bounded amplification).
- **Quote:** out-group animosity was "the strongest predictor of sharing"
  (≈2.3×), raising share-odds ~67% per term ([[039]]).

### Slide 04.6 — Link 5a: it lands on evolved reward circuitry

- **Icon:** a brain with a glowing reward center / a "like" lighting a neuron.
- **Copy:** The selected content meets biology. fMRI shows social "likes" activate
  the brain's dopaminergic reward center (the nucleus accumbens), and the
  _adolescent_ striatum is hypersensitive to it — which is why the harm concentrates
  in teens. Broader neuroscience maps how social media instruments three systems at
  once: reward, self-referential thinking, and "mentalizing" about others.
- **Sources:** [[035]] Sherman 2016 (fMRI), [[036]] Meshi 2015.
- **Quote:** greater "nucleus accumbens" activation when adolescents' photos
  receive many likes; the adolescent striatum is hypersensitive ([[035]]).

### Slide 04.7 — Link 5b: two coupled optimizers

- **Icon:** two gears meshing / a feedback arrow between a phone and a brain.
- **Copy:** Here is the decisive insight. Across more than a million posts, people
  behave as _reward-maximizing agents_, spacing posts to maximize the rate of likes
  — researchers literally call it "a Skinner Box," confirmed when lowering the
  reward rate reduced posting. So the platform (a reward-maximizer over clicks) and
  the human (a reward-maximizer over social approval) become **two coupled
  optimizers** — and the algorithm effectively programs your reinforcement schedule.
  Compulsion is engineered, not chosen.
- **Sources:** [[034]] Lindström 2021, [[031]]/[[002]] (the platform side),
  [[035]] (the human side), [[025]] Bhargava & Velasquez.
- **Quote:** social-media engagement is "a Skinner Box"; people post as
  reward-maximizing agents ([[034]]).

### Slide 04.8 — Link 6: measurable well-being decline — with discipline

- **Icon:** a descending well-being line with a confidence band / a balanced scale.
- **Copy:** The coupled loop expresses itself as compulsion, social comparison, and
  a corrosive climate — and these produce _measurable_ harm: within-person mood
  decline with use, causal deterioration when Facebook arrived, improvement on
  deactivation, depression detectable in the exhaust itself. But state it with
  discipline: effects are modest on average and severe in the **vulnerable tail**,
  and amplification is selective, not blanket. The chain is real, mechanistic, and
  honestly bounded.
- **Sources:** [[037]] Kross, [[010]] Braghieri, [[026]] Allcott, [[006]]/[[007]]
  (detectability); bounded by [[008]] Orben, [[027]] Huszár.
- **Quote:** the chain concentrates harm in subgroups, so "population averages
  understate tail harm" (Synthesis 07 boundary conditions).

---

## The chain, in one diagram (a candidate visual slide)

From Synthesis 07 — could render as a single animated "diagram" slide closing the
section:

```
behavior ──inject──▶ embeddings / cross-features / bandit reward     [029,030,031,003]
                         │  optimize
                         ▼
                 ENGAGEMENT PROXY (CTR, watch-time, shares)          [001,002,029]
                         │
            ┌────────────┼─────────────────────────────┐
            ▼            ▼                              ▼
   feedback loop   selects comparison-/outrage-bait   amplification (bounded)
   narrows you     [039,017,004]                       [027,013]
   [032,033]
            └────────────┬─────────────────────────────┘
                         ▼  delivered to
        REWARD + SOCIAL-COGNITION CIRCUITRY (NAcc, mPFC, TPJ)        [035,036]
                         │  human = reward-maximizing agent          [034]
                         ▼  → two coupled optimizers
        compulsion · social comparison · corrosive climate          [025,017,039]
                         │  measurably degrades
                         ▼
        WELL-BEING / MENTAL HEALTH  (concentrated in the vulnerable) [037,010,026,008]
```

## Section takeaway (the one sentence)

> The recommender→harm link is a **traceable mechanism** — inject → proxy → loops →
> harmful selection → reward circuitry → two coupled optimizers → measured decline
> — so because every link is a design choice, the chain is **interruptible**.
