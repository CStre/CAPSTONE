# Section 06 — What "User-First" Actually Means

**Research basis:** Synthesis 05 (`/research/synthesis/05-ethical-frameworks-and-user-centered-design.md`).
**Slides:** 7. **Completion:** view all 7.

## What this section teaches

This is the **conceptual core of the project's thesis** — the answer to "what does
it mean to have a user-centered algorithm?" A user-first recommender treats the
user as an **end** (their flourishing is the objective) rather than as a **means**
(a behavioral data source whose attention is the product). Ethics is not a
post-hoc audit layer; it is a _design-time methodology_ for building named human
values into the objective and the architecture. The reader should leave with the
distinction, the methodology (value-sensitive design), the target value
(well-being, held humbly), the argument that makes reform _obligatory_, and the
principles.

---

### Slide 06.1 — The one axis that matters: end vs. means

- **Icon:** a person at the center of concentric rings vs. a person as one cog.
- **Copy:** Every ethical framework converges on a single axis. A user-first
  system treats you as an **end** — your flourishing is the goal — while an
  engagement system treats you as a **means**, a source of behavioral surplus whose
  attention is the product. Today's feeds are structurally the latter, relating to
  people with what one scholar calls "formal indifference." User-first design is
  simply the inversion: make the person's flourishing the objective, even though
  it's harder to measure.
- **Sources:** [[020]] Zuboff, [[025]] Bhargava & Velasquez, [[001]] (the surrogate
  that makes indifference structural).
- **Quote:** addictive design "express[es] the demeaning idea that the person's
  interests do not matter at all" ([[025]]).

### Slide 06.2 — Why a surrogate _is_ indifference

- **Icon:** a person standing behind a number that the system "sees" instead.
- **Copy:** This isn't name-calling — it's structural. Because a platform "rarely
  obtains the ground truth of user satisfaction," it optimizes a surrogate it can
  measure, and a surrogate-optimizing system is by construction indifferent to the
  un-measured person behind the proxy. The indifference is built into the math, not
  the malice. Which is also why the fix is mathematical: change what's measured and
  optimized.
- **Sources:** [[001]] Covington, [[020]] Zuboff.
- **Quote:** the system optimizes a surrogate because "we rarely obtain the ground
  truth of user satisfaction" ([[001]]).

### Slide 06.3 — Ethics is a design-time methodology, not a PR layer

- **Icon:** a blueprint with a heart drawn into it / scaffolding around values.
- **Copy:** The industry's failure mode is to ship for engagement and react to harm
  afterward — Meta launched a feature despite its own data showing it "didn't move
  overall well-being," because it "could make them look good." The alternative,
  Value-Sensitive Design, bakes _named_ human values into the objective and
  architecture from the start, through a conceptual → empirical → technical loop.
  Ethics-as-PR is the disease; ethics-as-method is the cure.
- **Sources:** [[021]] Friedman (VSD), [[004]] (Project Daisy as the anti-pattern).
- **Quote:** VSD accounts for human values "in a principled and comprehensive
  manner throughout the design process" ([[021]]).

### Slide 06.4 — Center the people the objective never sees

- **Icon:** a spotlight finding a figure standing outside the frame.
- **Copy:** Value-Sensitive Design's sharpest demand: model the _indirect_
  stakeholders, not just the engaged user. Engagement optimization represents only
  the person clicking — never the depressed teen funneled self-harm content, never
  the ~87 million non-consenting Facebook friends. The corpus's worst harms fall on
  exactly the people the objective doesn't even include in its math.
- **Sources:** [[021]] Friedman, [[013]] CCDH, [[012]] Molly Russell, [[019]]
  Cambridge Analytica.
- **Quote:** VSD insists on the indirect stakeholders — "the depressed teen
  funneled self-harm content … the ~87M non-consenting Facebook friends"
  (Synthesis 05 §2).

### Slide 06.5 — Aim at well-being — but humbly

- **Icon:** a compass whose needle wavers / a target that breathes.
- **Copy:** Platforms have _already_ changed objectives — YouTube added "user
  satisfaction" surveys; Facebook reweighted toward "meaningful social
  interactions," deliberately cutting roughly 50 million hours of use a day. But
  well-being is "a theoretical construct, not an observable property," and a naive
  proxy just becomes the next thing gamed — that same reweighting later amplified
  divisive content. The commitment isn't a slogan; it's a disciplined,
  participatory, transparent process.
- **Sources:** [[018]] Stray 2020.
- **Quote:** "just because a user might be watching content longer does not mean
  that they are having a positive experience" ([[018]], quoting YouTube).

### Slide 06.6 — The argument that makes change obligatory

- **Icon:** a balance scale tipping decisively to one side.
- **Copy:** Here is the premise that turns "nice to have" into "must": _the
  addictive mechanisms are not necessary to provide the communicative benefits._ If
  you can strip out the slot-machine mechanics without destroying connection and
  information, then those mechanics are _gratuitous_ harm — and gratuitous harm to
  the vulnerable is impermissible. This dissolves the "but people love it" defense:
  keep the benefits, drop the exploitation.
- **Sources:** [[025]] Bhargava & Velasquez, supported by [[026]] Allcott
  (deactivation: usage exceeded what users endorsed).
- **Quote:** "the addictive mechanisms are not necessary to provide the
  communicative … benefits." ([[025]])

### Slide 06.7 — The principles, in one breath

- **Icon:** a small set of pillars / a tidy checklist.
- **Copy:** A user-first philosophy, distilled: the user is the end; the vulnerable
  are centered rather than the median engaged user; real autonomy and honest
  defaults replace dark patterns; ranking is transparent enough to inspect and
  contest; well-being is measured, but humbly; and the burden of proof sits with
  the designer, not the user. These are the standards our own algorithm is built to
  meet — and Section 07 shows exactly how.
- **Sources:** Synthesis 05 §5 (folds in FAccT fairness, [[023]] transparency,
  [[016]]/[[028]] precaution).
- **Quote (carry into Section 07):** "the technique is neutral; the objective and
  data practices are the ethics."

---

## Section takeaway (the one sentence)

> User-first = the user is the **end**, the vulnerable are centered, and autonomy,
> transparency, humility, precaution, and fairness are **designed in** — because
> the harmful mechanisms are gratuitous, removing them is obligatory, not optional.
