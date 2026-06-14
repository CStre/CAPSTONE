# Section 02 — Your Behavior Becomes the Algorithm

**Research basis:** Synthesis 02 (`/research/synthesis/02-data-collection-and-inference.md`).
**Slides:** 9. **Completion:** view all 9.

## What this section teaches

The data a recommender needs to personalize is the _same_ data that lets a model
infer your sexuality, politics, ethnicity — and your psychiatric diagnosis.
"Preference" and "private trait" are two labels on one classifier. Because
sensitive attributes are **emergent** from innocuous behavior, the standard
safeguard ("don't share what you want private") is technically void. The reader
should leave unsettled but informed — and should also learn the counter-proof:
total capture is an economic choice, not a technical necessity.

---

### Slide 02.1 — Total capture, by default

- **Icon:** a stream of small events pouring into a funnel / a firehose.
- **Copy:** The industry's default posture is to capture _everything_ — every
  click, dwell, scroll, and hover is treated as a training label. Platforms choose
  implicit behavioral data precisely because there is vastly more of it than
  anything you'd consciously volunteer. You are not occasionally measured; you are
  continuously logged.
- **Sources:** [[003]] Koren 2009, [[001]] Covington 2016.
- **Quote:** behavior can be gathered "regardless of the user's willingness to
  provide explicit ratings" ([[003]]).

### Slide 02.2 — Every interaction rewrites a model of you

- **Icon:** scattered dots resolving into a portrait / a profile assembling.
- **Copy:** That captured behavior doesn't sit in a log — it's written into the
  machine. Each thing you do indexes and updates a row in an "embedding table," a
  learned vector that literally represents you, rewritten by gradient descent on
  every interaction. Your behavioral exhaust isn't merely collected; it
  _continuously becomes_ the model's picture of who you are.
- **Sources:** [[029]] Naumov 2019 (Meta DLRM).
- **Quote:** _"DLRMs … utilize embedding tables for mapping categorical features to
  dense representations."_ ([[029]])

### Slide 02.3 — Sensitivity is emergent — you can't hide it by hiding posts

- **Icon:** small puzzle pieces assembling into a hidden silhouette / an x-ray.
- **Copy:** From Facebook "Likes" alone — nothing explicitly sensitive —
  researchers predicted sexual orientation (88% accuracy in men), ethnicity (95%),
  Democrat vs. Republican (85%), Christian vs. Muslim (82%), and even whether your
  parents separated during your childhood (~60%). As they warned, "merely avoiding
  explicitly homosexual content may be insufficient to prevent others from
  discovering one's sexual orientation." You cannot withhold a trait the model
  reconstructs from a thousand unrelated signals.
- **Sources:** [[005]] Kosinski 2013 (private traits from digital records).
- **Quote:** _"it becomes difficult for individuals to control which of their
  attributes are being revealed."_ ([[005]])

### Slide 02.4 — From trait to diagnosis: depression, before onset

- **Icon:** a screen emitting a faint heartbeat / a warning that precedes an event.
- **Copy:** The most consequential trait to infer is health. From public Twitter
  behavior alone — posting volume, late-night "insomnia" patterns, self-focused
  language — researchers predicted major depression at roughly 70% accuracy
  _before_ users reported its onset, and proposed an explicit "MDD risk score."
  The behavioral exhaust that personalizes a feed doubles as an early-warning
  psychiatric screen.
- **Sources:** [[006]] De Choudhury 2013.
- **Quote:** the authors propose an "MDD risk score" and flag that the data is
  "sensitive" ([[006]]).

### Slide 02.5 — Validated against actual medical records

- **Icon:** a phone and a medical chart converging / a checkmark over a clipboard.
- **Copy:** This isn't a lab curiosity. Among patients who shared _both_ their
  Facebook _and_ their medical records, their language predicted depression up to
  three months before the documented diagnosis, with accuracy "comparable to
  validated self-report depression scales." The same machine that ranks your feed
  is, unmodified, a clinical-grade depression screen — the platform just isn't
  using it for your care.
- **Sources:** [[007]] Eichstaedt 2018 (validated vs. EHR, AUC 0.72).
- **Quote:** depression predictable "up to 3 months before" diagnosis, accuracy
  "comparable to validated self-report depression scales" ([[007]]).

### Slide 02.6 — An economy that trades your inferences

- **Icon:** a tag/barcode being passed between hands / a data marketplace.
- **Copy:** Inference isn't confined to the platforms you use. Data brokers hold
  "billions of data elements covering nearly every U.S. consumer" — one keeps
  "3000 data segments for nearly every U.S. consumer" — and sell health-adjacent
  categories with names like "Diabetes Interest," "Cholesterol Focus," and
  "Expectant Parent." Most of this runs in the dark, off-platform, feeding the same
  ad ecosystem.
- **Sources:** [[011]] FTC 2014 (data brokers).
- **Quote:** brokers "make inferences … including potentially sensitive
  inferences," with explicit health segments ([[011]]).

### Slide 02.7 — Consent collapses at scale: Cambridge Analytica

- **Icon:** a single quiz spreading into a web of faces / falling dominoes.
- **Copy:** A single personality-quiz app harvested up to **87 million** Facebook
  profiles — overwhelmingly people who never touched the app, exposed through their
  _friends'_ permissions — to build psychographic profiles for political
  micro-targeting. The fine that followed, £500,000, was the pre-GDPR maximum and
  so trivial it became the argument for stronger law. The lesson is structural:
  consent is broken at the root when your data is emitted by the people around you.
- **Sources:** [[019]] ICO 2018 (Cambridge Analytica).
- **Quote:** ~87M profiles built largely via friends' permissions, with "zero
  interaction" from most of those affected (Synthesis 02 §5).

### Slide 02.8 — Why it's relentless: surveillance capitalism

- **Icon:** an extraction pump / raw material flowing into a factory.
- **Copy:** Why is capture total and inference relentless? Because, in one
  scholar's framing, this is "surveillance capitalism" — a logic of accumulation
  whose raw material is your behavior and whose product is prediction, operating
  with "formal indifference" to the people it monetizes. Under that lens,
  engagement optimization and trait inference aren't bugs or excesses — they are
  the core revenue activity. That's why "just collect less" is hard: it cuts the
  business model.
- **Sources:** [[020]] Zuboff 2015.
- **Quote:** the apparatus performs "extraction, commodification, and control" with
  "formal indifference to the populations" it monetizes ([[020]]).

### Slide 02.9 — But total capture is a choice, not a necessity

- **Icon:** a phone with a small shield keeping data inside it / a lock that stays
  local.
- **Copy:** The "we must centralize everything" premise is economic, not technical.
  Federated learning trains good personalization models while leaving the data
  "distributed on the mobile devices," sharing only aggregated updates — and with
  differential privacy, it bounds what any update can leak. Data minimization and
  real personalization can coexist; this project is built on exactly that bet.
- **Sources:** [[024]] McMahan 2017 (federated learning).
- **Quote:** federated learning keeps training data on-device "because this data is
  often privacy sensitive" ([[024]]).
- **Epistemic guardrail:** be precise — federated learning changes _where data
  lives_, not _what is optimized_. It fixes Section 02's problem (capture), not
  Section 01's problem (objective). Two harms, two fixes.

---

## Section takeaway (the one sentence)

> Personalization data **is** surveillance data — "preference" and "private trait"
> are one classifier, validated all the way to clinical diagnosis — and because
> sensitivity is emergent, notice-and-consent is technically defeated; yet capture
> remains a choice, not a necessity.
