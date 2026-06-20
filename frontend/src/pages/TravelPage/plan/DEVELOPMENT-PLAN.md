# Travel + Brochure — Development Plan

How to build the project's **live demo**: the Travel page (where the user feeds the
algorithm) and the Brochure page (where the user sees what the algorithm became).
Together they are the "user-centered algorithm in miniature" that Learn Section 08
(`travel-demo`) points at — completing the demo is what unlocks both in the header.

> **Scope chosen:** Travel = _maximal / experimental_ (the showcase, not just a
> rating screen). Brochure = a real _data-viz dashboard_ (map + rankings + history +
> session diffs), keeping the transparency framing it already opens with.
>
> **Design thesis (from the Learn course):** this stack is the _anti-engagement_
> demo. Every feature must make the contrast legible — **explicit feedback** (you
> swipe, on purpose), **neutral seeding** (everyone starts at 50), **transparent
> scores** (the Brochure shows the _entire_ model), **minimal data**, and **no
> inference** (we never guess a trait you didn't state). When in doubt, the feature
> that best _exposes the machinery_ wins.

---

## 0. Current state (as built)

**Travel** — [TravelPage.tsx](../TravelPage.tsx)

- Swipe-stack UI: up = like, down = dislike; 3 cards fan behind the active one.
  **Being redesigned** (§1b interaction model): a single-image "image after image" feed
  — double-tap = like, dislike control, swipe-past = skip, details/credit button. The
  card-stack is superseded.
- `TravelImages(count: 8)` query → Unsplash-backed photos, weighted by preference;
  falls back to a hard-coded `PREVIEW_PHOTOS` list when unauthenticated / erroring.
- After the batch, `submitFeedback([{country, liked}])` runs the algorithm and
  refetches a fresh batch.
- Pip progress bar; like/dislike stamps; basic error lines.

**Brochure** — [DashboardPage.tsx](../../DashboardPage/DashboardPage.tsx)

- Gated behind `useLearnProgressOptional().demoComplete`; shows a "finish the demo"
  GlassCard until then.
- `Preferences` query → **`react-simple-maps`** equirectangular world map (bundled
  `world-atlas` 50m TopoJSON, Antarctica filtered, full-viewport width) choropleth-shaded
  0–100, with a cursor-following gooey **score chip** for the hover readout; one summary
  line (strongest / weakest country). GeoChart removed (D0 done).
- Per the gating memory, three Account/Brochure buttons are **placeholder popups**:
  `clearPreferences`, `downloadData`, `downloadResearch` — not wired.

**Backend** — [schema.graphql](../../../../../backend/schema.graphql),
[algorithm.ts](../../../../../backend/src/algorithm.ts), `countries.ts` (35 countries)

- Algorithm: `±5` per swipe, clamp `0–100`, rail-bounce (`100→95`, `0→5`), neutral
  default `50`. Pure, keyed by country code. Stored **sparsely** (only moved
  countries written).
- API exposes: `me.preferences` (full catalog, defaults filled), `travelImages`,
  `submitFeedback`, plus Learn-progress + account mutations.
- **No history is stored** — only the current score per country. Anything
  time-series (trends, session diffs across visits) needs a backend addition.
- **No `resetPreferences` mutation** — only `deleteAccount`. Wiring "clear
  preferences" needs a new resolver.
- `TravelImage` exposes only `attribution` (a name string) — no photographer URL
  and no `download_location` trigger, so we are **not yet Unsplash-ToS compliant**.

---

## 1. Target vision

```
   ┌──────────────────────────────┐         ┌──────────────────────────────┐
   │           TRAVEL             │         │          BROCHURE            │
   │  feed the algorithm          │  ──▶    │  see what it became          │
   │                              │ submit  │                              │
   │  • swipe / button / key      │ feedback│  • world map (shaded)        │
   │  • "why this card?" reveal   │         │  • full ranked list          │
   │  • live ±5 score delta       │         │  • session diff (what moved) │
   │  • batch review before submit│         │  • per-country history spark │
   │  • engagement-vs-user-first  │         │  • stats + "all we store"    │
   │    contrast toggle           │         │  • export / clear data       │
   └──────────────────────────────┘         └──────────────────────────────┘
            explicit signal in                    total transparency out
```

The two pages are one loop. Travel is where the contrast with engagement feeds is
_felt_ (you choose, deliberately); the Brochure is where "no inference, all visible"
is _proven_ (the whole model fits on one screen, and you can export or delete it).

---

## 1b. The two-algorithm demo (core concept)

This is the heart of the Travel page: **two algorithms react to the exact same
swipes.** The user rates one stream of photos; both models observe identical
interactions, but they treat that behavior radically differently. The divergence —
made visible — _is_ the demo. It turns the research thesis into something felt.

### The two models

|                                     | **A — "Engagement Engine"** (data-maximal)                                                                                                                                                                                                                                                                                                                                      | **B — "User-First"** (data-minimal)                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Collects per image**              | Everything: the image's **tags, dominant color, scene type, EXIF (camera/aperture/ISO), GPS location, description keywords** — _plus_ every interaction signal (see interaction model below): **dwell time to the millisecond, whether you swiped past without rating (a skip), whether you tapped the details/credit button (curiosity), gesture timing/hesitation, re-views** | Only **country code + the explicit double-tap like / dislike**. Skips, dwell, and curiosity are ignored. Nothing else.                                                                           |
| **Builds**                          | A rich multi-dimensional **taste vector** across many latent dimensions ("warm-toned remote mountains shot on pro gear at golden hour; avoids crowds/cities")                                                                                                                                                                                                                   | A transparent **per-country score** (0–100) — _now derived by legible inference from a small declared feature set_, not a direct country tally (a departure from today's ±5 model; see below)    |
| **Derives country preference from** | **Inferred from abstract image metadata** (tags, palette, scene, light…) **plus behavioral signals** — a sprawling, opaque model; can rank countries you never engaged with and can't say why.                                                                                                                                                                                  | **Also inferred from abstract metadata** — but a **small, declared feature set, explicit likes only**, and it **shows its work**. Same technique, minimal + legible.                             |
| **Infers**                          | Traits you never stated — and deliberately **over-reaches** (clearly labelled) to dramatize emergent sensitivity (S2): "prefers solitude → likely introvert," "avoids cities → …"                                                                                                                                                                                               | **Nothing.** Only what you explicitly told it.                                                                                                                                                   |
| **Evolves the feed (when driving)** | **Narrows — lazily.** Greedily over-commits to your latest signals and collapses exploration fast → converges on near-duplicates ("the same thing again and again"), a feedback loop                                                                                                                                                                                            | **Stays diverse.** Treats signals as partial evidence; weighted draw with the **rail-bounce floor** (100→95, 0→5) + a diversity guardrail → no bubble, and can **pull you back out** of A's loop |
| **Grounded in**                     | S1 (latent taste vector / MF), **S2** (behavior = surveillance; preference and private trait are one classifier), **S7** (feedback loops "homogenize," interests "degenerate" into echo chambers)                                                                                                                                                                               | S5/S6/S8 (user-as-end, data minimization, transparency, exploration preserved)                                                                                                                   |

> **The punchline (S2 verbatim):** "Preference and private trait are different labels
> on one classifier." Identical input, two data footprints. A proves that the data you
> need to personalize is the same data that profiles you; B proves you can personalize
> _without_ that — still finding real preferences, still relevant.

### Both infer from abstract metadata — the ethics is the data practices, not the technique

A deliberate design rule that makes the contrast _fair and stronger_: **neither model
decides your country preference by reading the literal image `location`.** Pinpointing a
country straight from the location tag is too straightforward and misses the point —
modern recommenders draw conclusions from **abstract** data, and so do **both A and B
here.** Each builds a country ranking by inferring from abstract features (tags, palette,
scene, light, crowd-level, architecture), never from a direct location lookup. So A can't
be dismissed as "just smarter than B" — they share the same neutral technique.

This is **S1 made literal:** _"The technique is neutral; the objective and the data
practices are the ethics."_ Both can rank **Portugal #1 though you never knowingly liked a
Portuguese photo** — destination preference reconstructed from abstract signals (S2).

**Storing data is not the harm — its _use_ is.** Both models persist their data in the
database (nothing is kept in the browser); retaining a user's data is normal and useful —
it is how a recommender remembers you and improves. The contrast is **stewardship, not
storage**, on these axes:

- **Use / manipulation** — A uses what it stores to **narrow you into a bubble**; B uses it
  only to serve your stated preference, exploration preserved (S7).
- **Interpretation / inference overreach** — A interprets the data invasively, inferring
  **sensitive traits you never stated** ("solitude → introvert"); B infers **only
  destination preference**, nothing about you as a person (S2).
- **Monetization** — A treats the profile as a sellable asset (the data-broker/attention
  economy, `011`/`020`/`015`); B **never sells or shares it.**
- **Privacy & control** — A's profile is opaque and locked-in; B's is **transparent,
  exportable, and deletable**, and B **shows its work**.
- **Necessity (the supporting point)** — A also collects **far more than it needs**; B
  reaches the same useful preferences with restraint. The dossier PDF (§4c) proves the
  surplus is unnecessary.

> So B doesn't win by storing less for its own sake — it wields the **same inferential
> power** while using, interpreting, and protecting the data responsibly. _User-first isn't
> a weaker algorithm; it's the same capability, stored and stewarded without the harm._

**The transparency trade-off to manage:** inferring (rather than tallying) could cost B
its "you can always see why." Preserve it deliberately — keep B's feature set **small and
declared**, explicit-signal-only, and have B **show its work** ("you liked 4 warm coastal
photos → Greece, Portugal, Italy up"). Legible inference, not a black box.

Implementation sketch (for the Algorithm A/B spec): precompute a **feature signature per
country** from the cached pool's abstract metadata (tag/color histograms); both models
rank countries by similarity (cosine) of that signature to the user's taste vector.
**A's** vector is built from the full signal firehose and many feature dimensions; **B's**
from explicit likes over a small declared dimension set. `location.country` may ride along
for display, but **never feeds either model's preference math.**

### Cold start, neutral photos, and full-catalog exposure

Three linked design rules about _what images we show and when_:

1. **Neutral photos, never landmarks.** Show "seemingly neutral" scenery (coastline,
   plateau, valley, street-level mood) — **not** iconic landmarks. This is essential, not
   cosmetic: a landmark lets the user consciously recognize the destination ("that's the
   Eiffel Tower → I love Paris"), which is **recognition, not inference**, and it guts the
   abstract-data thesis. Neutral imagery forces reactions to _aesthetics_ (terrain,
   palette, light, crowd-level), so the surfaced country preference is genuinely
   **reconstructed from abstract features** — and the payoff lands: _"it figured out you'd
   love Norway from photos you never knew were Norway."_ This also reframes the product as
   **discovery** (find where you want to go by taste) rather than confirming a bucket list.
   - **Implementation:** `countries.ts` search terms must move off landmark/city strings
     (`"Paris France"`, `"Santorini Greece"`) to neutral modifiers (`"Norway landscape
nature"`, `"rural countryside"`). A returned photo _not_ being obviously recognizable
     is a feature here.
2. **Equal exposure first, then adapt.** Early batches sample **uniformly across the
   catalog** (exploration), then weight shifts as preference emerges (A narrows hard; B
   shifts gently, keeping the rail-bounce floor). This falls out naturally: every country
   seeded neutral (50) ⇒ the weighted draw is already uniform at t=0. The Brochure map
   doubles as the visual — starts flat/neutral, differentiates as you swipe.
3. **Expose the whole world.** Grow the catalog toward **all ~195 countries** (or a robust
   ~150 curated by what Unsplash serves well). The sparse keyed-map model scales for free,
   and — crucially — **country count does not slow learning**: because both models infer
   from _features_, the taste vector converges on aesthetic dimensions within a few dozen
   swipes regardless of catalog size; more countries only widen the ranking surface, making
   the discovery more impressive and the map more alive.
   - **Caveat / guardrail:** neutral scenery is sparse/low-quality on Unsplash for some
     obscure or conflict-affected countries. Add a **quality guardrail** — skip or fall
     back on countries that return weak results. Start wide, prune what looks bad.

### The interaction model (UI)

**A single full-bleed image at a time — an "image after image" feed** (deliberately
engagement-feed-shaped, like Reels/Instagram, so the UI itself is the thing the course
critiques). The user can:

- **Like / dislike** via **visible on-image controls** (thumb up / down) — symmetric and
  discoverable, _plus_ **double-tap = like** as a familiar shortcut. The controls are
  deliberately explicit: making dislike easy and visible **is** the user-first design
  choice. (Engagement feeds hide negative feedback in a menu precisely so they can infer
  it from your behavior instead — the dark pattern B refuses. Decided; was an open item.)
- **Swipe past → skip** to the next image, **with no explicit rating.** A skip is not a
  neutral non-event — it is itself behavior.
- **Tap the details / credit button** → see more about the image. This affordance is
  **required anyway** (Unsplash mandates photographer attribution), so we get it for
  free — and whether the user opened it becomes a signal.

**What each model does with that interaction — the core contrast:**

- **Algorithm A harvests _all_ of it**, explicit and passive alike: the **dwell time to
  the millisecond**, every **skip** (and how fast you scrolled past), every **details-
  button tap** (curiosity), gesture hesitation, re-views — exactly S2's "even mouse
  movements." Your passive behavior profiles you even when you never chose to rate.
- **Algorithm B uses _only the explicit choice_** — the double-tap like or the dislike,
  mapped to a country. It throws away dwell, skips, and curiosity. It treats "I didn't
  rate this" as exactly that: no data.

> This passive-vs-explicit split is the sharpest demonstration in the whole demo: same
> feed, same gestures, but A turns your scrolling into a dossier while B only listens to
> what you deliberately said. (Note: this supersedes the current swipe-up/down card-stack
> in [TravelPage.tsx](../TravelPage.tsx) — see §0.)

### Closing the loop: metadata → next images (this is the recommender)

Both models are **recommenders** — they feed what the user liked back into what they're
shown next. The _difference is what they feed back_, and that is the whole demo.

**Algorithm A — content-based filtering on metadata (the narrowing loop).** Track every
liked image's metadata into a session **tag-weight map** (like `+1`, dislike `−1`) and a
color histogram. To fetch the next batch, switch from `/photos/random` to
**`GET /search/photos`** and compose the query from what was learned:

- `query` = top ~3–5 liked tags (e.g. `mountain snow alps remote`) — keep it short;
  too many keywords over-constrains and returns nothing. **Subtract disliked tags.**
- `color` = the dominant liked-color bucket (`blue`/`teal`/`green`/…) — Unsplash search
  supports a color filter.
- optionally prepend the country `searchTerm` so results stay destination-grounded.

The **narrowing** that produces "the same thing again and again" (S7 degeneration) is a
single dial: an **exploration fraction** that shrinks each round — early batches keep a
random/diverse slice, later batches don't, so the query tightens and results converge on
near-duplicates of the dominant cluster.

**Algorithm B — legible inference, diversity preserved.** Also infers from abstract
metadata, but from a **small declared feature set** and **explicit likes only** — it maps
your liked photos' features to country scores (showing its work), then draws the next batch
**weighted by those scores with the rail-bounce floor** (every country stays ≥5 weight) so
exploration never collapses → **no bubble.** It does **not** touch passive signals
(dwell/skip/curiosity) and does **not** narrow.

> Same swipes in: A composes ever-tighter metadata queries; B stays diverse. That is the
> contrast, and it falls out of _what each model is allowed to feed back_.

**Caveat + upgrade path.** Unsplash search is **keyword relevance**, not vector
similarity — fine for a convincing demo, but "match" is only as good as tag overlap.
The premium version (only if self-hosting CLIP, §2b): **embed each cached photo once and
pick the next batch by cosine similarity** to the taste vector — a real content
recommender with smooth, tunable narrowing. Start with the Unsplash-query loop; treat
the embedding version as a stretch.

### The differentiator, displayed on three axes

Each axis maps to a research strand and gets its own live UI:

1. **How much it collects (surveillance — S2).** A shows a live, **ballooning data
   dossier** — a ledger that adds rows every swipe (tag captured, color logged, dwell
   2.3s recorded, camera model read…). B shows a tiny fixed ledger: _"Country + your
   like. That's all."_ Watching A's counter race past B's is the gut-punch.
2. **What it infers (emergent sensitivity — S2).** A shows an **"Inferred about you"**
   panel guessing un-stated traits (and slightly over-reaching, honestly labelled as
   illustrative). B: _"We infer nothing."_
3. **How your feed evolves (filter bubble — S7).** A **diversity / novelty gauge**:
   A's crashes as the feed homogenizes ("again and again"); B's holds steady because
   exploration is preserved. This is S7's "degeneration" made watchable.

### A's "lazy" interpretation is what spins up the loop

A is not lazy in _gathering_ signals (it hoovers up everything) — it is lazy in _how it
interprets_ them. It takes the cheap, greedy path: treat whatever you just engaged with as
a strong, settled preference and let confidence run ahead of the evidence. **The trap is
not rigged or guaranteed — it _emerges_** when the user's behavior feeds it, which it
naturally tends to (you like what you're shown). The dynamic is **self-reinforcing and
roughly exponential:** more trapped → more confirming likes → more A confidence → tighter
narrowing → still more confirming likes. Crucially, A's exploration is **endogenous** —
it shrinks as a function of how consistently you _confirm_ the predicted cluster, **not** a
fixed per-round timer. Behave diversely and no trap forms; that conditionality is what
makes the demo honest. B does the harder, responsible thing — treats each signal as
**partial evidence**, holds an **exploration floor**, keeps uncertainty, and never lets
confidence compound past the evidence. We build the _mechanism_ that lets a trap happen
(S7 "degeneration") — we do not manufacture one.

> **Safe-proxy note.** In a travel-photo demo the "negative feedback loop" is merely
> **monotony** (A funnels you into nothing but cold gray peaks). That is a deliberate safe
> stand-in for the _documented_ harmful loops in the research — TikTok funneling vulnerable
> teens to ED/self-harm content, 13%→56% in five days (S3/S7), Molly Russell (`012`). Same
> mechanism, far higher stakes. Say this in the copy so the demo borrows the gravity
> without claiming scenic photos are harmful.

### How to present it (recommended): both observe, one drives, user flip-flops

Two layers, reconciled by one distinction — **collecting vs driving**:

- **Both models always _observe_ every interaction.** So the data-collection contrast
  (A's ballooning dossier vs B's two-field ledger) holds no matter what. A keeps harvesting
  dwell/skip/curiosity; B keeps using only your explicit thumb.
- **Only one model _drives_ the feed at a time** — picks your next images — and the user
  can **flip the driver at any moment** via a visible toggle.

**The flip-flop is the demonstration.** Let A drive and you feel the bubble close in
(monotony, the diversity gauge crashing). Then **flip to B and watch it pull you back out**
— diversity returns, fresh countries reappear. The user _experiences_ both the trap and the
escape. This solidifies the thesis far harder than a static comparison: **recommendation
algorithms can trap you, and a user-first one can free you.** Switching the driver never
stops either model from observing, so flipping is free and reversible.

On top of the live toggle, keep the **split reveal** (the side-by-side dossier/diversity
comparison) as the summary payoff — now it can show "here's where A had driven you vs where
B keeps you." The sequential "try A, then B" guided version drives the Learn Section 08
walkthrough.

### The verdict — Algorithm B wins (be intentional about this)

The contrast is not neutral: **B is the model this project champions**, and the demo
should be _intentionally built to make B win_ — not by rigging A, but by letting each
model's honest behavior speak. The arc lands on: _"A knew more about you and gave you a
narrowing, surveilled feed; B knew almost nothing, kept you diverse and in control, and
still recommended well."_

Design the contrast so every axis resolves in B's favor:

- **A's strength is also its indictment.** A genuinely makes eerily accurate inferences
  and tight recommendations — show that honestly, then show the cost: the dossier, the
  passive surveillance, the collapsing diversity. Accuracy bought with your autonomy.
- **B's apparent weakness is its strength.** B "only" knows your explicit country likes —
  and that turns out to be enough for relevant recommendations _while staying diverse and
  legible_. Minimal data is a feature, not a compromise.
- **End on B.** The split reveal should conclude with B foregrounded as the responsible
  steward (today's `preferences`/Brochure), A shown as the cautionary one. The closing line
  ties back to the Learn course: this is what "user-first" looks like running. Avoid
  strawmanning A — the win is more convincing when A is shown at its best.

### Ethical resolution: data isn't the harm — its use is

**Both models persist their data in the database** (nothing in the browser). We are _not_
making the argument that storing user data is wrong — retaining preferences is normal,
useful, and how a recommender serves and improves. The argument is about **stewardship**:

- A's data is **interpreted invasively, used to manipulate (narrow), would be sold, and is
  opaque/locked-in** — that is the harm.
- B's data is **used only to serve you, never inferred-against beyond destination, never
  sold, private, transparent, and one-click deletable** — same storage, opposite practice.

So we **keep** A's full dossier (it's the evidence — see the Data Dossier PDF, §4c); we do
not hide or auto-delete it. The teaching move is: collect it → **show the user all of it**
→ show how it _would_ be interpreted, used, and sold → make the case that the harm is the
**use**, not the storage → and that much of it was **unnecessary** anyway (B got the
preferences responsibly). The user stays in control: they can export and delete.

---

## 2. Backend dependencies (do these first where flagged)

Several frontend features need data the API doesn't return yet. Grouped so a phase
can pull them in as needed.

| #   | Addition                                                                                                                                                                           | Why / which feature                                                      | Notes                                                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | `resetPreferences: Boolean!` mutation                                                                                                                                              | Wire "Clear preferences" (Brochure/Account) without deleting the account | Mirror `resetLearnProgress` — `REMOVE preferences`. Cheap.                                                                                                                                                                                        |
| B2  | `TravelImage.attribution { name, profileUrl }` + trigger `download_location`                                                                                                       | Unsplash **ToS compliance** + clickable credit                           | Required, not optional — Unsplash requires the download ping and a linked credit. Restructures `attribution` (string → object) → codegen + Travel card update.                                                                                    |
| B3  | `submitFeedback` returns the **delta** (before/after per country), not just `User`                                                                                                 | Live ±5 animation + Travel batch summary + Brochure session diff         | Can be derived client-side from the pre-submit `me.preferences` snapshot instead — **prefer client-side** to keep the resolver thin. Only add to schema if the snapshot proves unreliable.                                                        |
| B4  | Lightweight **history**: per-country `interactionCount` + last-N score snapshots (or an append-only feedback log)                                                                  | Brochure sparklines / trends                                             | Biggest add; **defer to its own phase**. Keep within free tier: store a capped array on the user item (e.g. last 20 score snapshots, or `{liked, disliked}` counts per country) rather than an unbounded event log. Decide shape before building. |
| B5  | `me.stats { totalRatings, sessionsCount, mostMovedCountry }` (or derive client-side)                                                                                               | Brochure stat strip                                                      | Derive client-side from counts in B4 if possible; only promote to schema if it needs server aggregation.                                                                                                                                          |
| B6  | Expand `TravelImage` with `tags: [String!]!`, `color: String`, `blurHash: String`, `description: String`, `exif {…}`, `location {…}`                                               | **Algorithm A** metadata harvest (§1b/§2b)                               | All already in the Unsplash response — just parse + expose. EXIF/location nullable (sparse). Drives codegen.                                                                                                                                      |
| B7  | **DB-persisted** Algorithm-A dossier — structured interaction log + derived metrics + taste vector, on the user item (or a side table), exposed via GraphQL                        | Power the Data Dossier PDF (§4c) + the live ledger                       | **Stored in DynamoDB, never the browser.** It's the user's own data: fully visible, exportable, **one-click deletable**. The ethic is _use_, not storage (§1b, §4c). Keep bounded.                                                                |
| B8  | Rework `countries.ts`: **neutral (non-landmark) search terms**, **expand toward all ~195 countries**, add a **quality guardrail** (drop/fallback countries Unsplash serves poorly) | §1b cold-start / neutral-photo / full-catalog rules                      | Just data — no schema change. Precompute the per-country **feature signature** from the cached pool here too.                                                                                                                                     |

**Rule:** prefer deriving on the client from existing `me.preferences` over growing
the schema. Only B1 (clear) and B2 (Unsplash ToS) are firm backend work; B3–B5 should
be client-derived unless a phase proves otherwise.

---

## 2b. Image & metadata sourcing (free-tier research, June 2026)

The demo needs (1) good scenic world photos and (2) **deep metadata** to feed
Algorithm A. Research conclusion: **this is fully possible for $0**, and the metadata
source we already pay nothing for (Unsplash) is also the richest.

### Headline finding: Unsplash already returns deep metadata — we just don't ask for it

Our current `images.ts` parses only `urls.regular`, `user.name`, and
`links.download_location`. But the **same `GET /photos/random` response** already
includes, per photo:

- **`tags[]`** — keyword tags (mountains, beach, sunset, architecture, wildlife,
  snow, city…). _The workhorse signal for Algorithm A's taste vector._ Dense, curated.
- **`color`** — dominant hex color. Dense. Great for a "warm vs cool palette" axis.
- **`blur_hash`** — instant placeholder (nice UX bonus).
- **`description` / `alt_description`** — natural-language scene text → more keywords.
- **`exif`** — camera make/model, aperture, focal length, ISO, exposure. _Sparse_
  (only when the photographer added it) — but a perfect surveillance flourish when
  present ("it even read your photo's camera and shutter speed").
- **`location`** — city, country, latitude/longitude. _Sparse_ — same flourish ("…and
  the GPS coordinates").
- **`downloads`**, `current_user_collections`, etc.

So **no second API is required** to make Algorithm A compelling. The richest part
(tags + color) is dense and free. EXIF/location are sparse bonuses that, when present,
make the surveillance point land harder.

### Cost & rate-limit reality — Unsplash (answering "will I hit a threshold?")

**Unsplash's standard API has no monetary cost at any volume — there is no paid tier
and no overage billing.** The only ceiling is a **rate limit**, and exceeding it
returns `403`, it does **not** generate a charge. So there is **zero bill-shock
risk**, unlike the vision APIs below.

| Mode                                         | Limit                  | What counts                                                                                                    |
| -------------------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Demo** (default on signup)                 | **50 requests/hour**   | Only JSON calls to `api.unsplash.com`. Image file loads from `images.unsplash.com` are **free and uncounted.** |
| **Production** (after a short approval form) | **1000 requests/hour** | same                                                                                                           |

**Will you hit it?** Depends entirely on how we batch:

- **Today's code = 1 JSON request _per country_** → a batch of 8 photos = **8 requests.**
  - Demo (50/hr): ~6 batches/hr **total across all users** — too tight even for solo
    dev testing. **Apply for production before any real use.**
  - Production (1000/hr): ~125 batches/hr. Fine for a capstone (you + reviewers +
    light traffic); you would only approach it under an unlikely traffic spike.
- **Optimization that removes the worry:** `GET /photos/random` accepts **`count` (up
  to 30) in a single request**, and **cache** fetched photos (DynamoDB/S3) as a
  per-country pool refreshed occasionally. With caching, steady-state API calls drop
  to near-zero and the rate limit becomes a non-issue regardless of traffic.

**Prediction:** in **production mode + light caching, you will not hit the threshold**,
and even if you did, the consequence is a throttled request, never a bill. The real
action item is: **(a) get the app approved for production (1000/hr), and (b) cache
photos** so repeated demos don't re-hit the API. Both are in the phases below.

### The other options (and why Unsplash stays primary)

| Source                                                                                  | Free tier                                                         | Metadata                                                    | Verdict                                                                                                                                                       |
| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unsplash** (current)                                                                  | Free, 50→1000 req/hr, **no $ cost ever**                          | **Richest:** tags, color, EXIF, GPS, description, blur_hash | **Primary.** Already integrated; just parse more fields.                                                                                                      |
| **Pexels**                                                                              | Free, **200 req/hr & 20k/mo**, no $ cost                          | Lean: `avg_color` + `alt` text only (no tags/EXIF/GPS)      | **Fallback / secondary source** if Unsplash throttles; also has video. Weaker for Algorithm A.                                                                |
| **Google Cloud Vision** (label detection + image properties)                            | **Perpetual** free **1000 units/mo/feature**, then **$1.50/1000** | Deep: object/scene labels, landmarks, colors, web entities  | **Optional deepener** if Unsplash tags feel thin. **Bills after free tier** → set a budget alarm. 8/batch = ~125 batches/mo free.                             |
| **AWS Rekognition** `DetectLabels`                                                      | Free **5000 img/mo for 12 months only**, then **$1/1000**         | Deep: objects/scenes/concepts w/ confidence                 | Tempting (we're on AWS) but the **free window expires** and then it bills per image → bill-shock risk. Avoid for an indefinitely-running demo.                |
| **Imagga**                                                                              | Free dev **1000/mo**, paid **$79+/mo**                            | Tags, color, categorization                                 | Paid tier too expensive; skip.                                                                                                                                |
| **Self-hosted model in the Lambda** (CLIP / a Places365 scene classifier / ONNX tagger) | **Free forever, no external API**                                 | As deep as the model                                        | **Best "never costs anything" deepener.** Cost is container size + cold start, not dollars. Good Phase-stretch option if we want labels beyond Unsplash tags. |

### Deepener decision: Google Vision vs self-hosted model

If Unsplash tags aren't deep enough for Algorithm A, the two realistic deepeners:

|                              | **Google Cloud Vision**                                                                                                                                                                                                                                                                    | **Self-hosted (transformers.js + onnxruntime-node in the Lambda)**                                                                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Both doable?**             | Yes — HTTPS POST + API key (SSM)                                                                                                                                                                                                                                                           | Yes — our backend is **already a container-image Lambda** (10 GB limit), so a quantized ONNX model bundles fine                                                                                                                                                                                                                               |
| **Easiest**                  | **Winner.** No model files, no inference code, no cold-start/memory tuning. ~½ day                                                                                                                                                                                                         | More work: bundle model, wire inference, tune `/tmp`/memory, manage cold start. Multi-day                                                                                                                                                                                                                                                     |
| **Deepest _out of the box_** | **Winner.** `LABEL_DETECTION` (confidence + Knowledge-Graph `mid`), **`LANDMARK_DETECTION` (named landmark + GPS)**, `WEB_DETECTION` (entities + best-guess label + similar images), `IMAGE_PROPERTIES` (dominant colors). The landmark + knowledge-graph linking is hard to match locally | A single ViT classifier is shallow; but **CLIP zero-shot lets _you_ define the taste dimensions** (terrain, climate, crowd-level, time-of-day, architecture, aesthetic), and you can stack a captioner (BLIP) + scene model (Places365) for sentence + 365 scenes — **deepest _potential_, most controllable**, but only with the engineering |
| **Cost**                     | Free 1000 units/mo/feature, then **$1.50/1000 → bills, needs budget alarm**                                                                                                                                                                                                                | **Free forever** (compute only, ~87 MB quantized CLIP; cold start a few seconds)                                                                                                                                                                                                                                                              |
| **On-theme?**                | ⚠️ Sends every user-reacted image **to Google** — ironic for a privacy project (could be lampshaded)                                                                                                                                                                                       | ✅ **Fully private, no third party** — matches the project ethic                                                                                                                                                                                                                                                                              |

**The architecture move that makes _both_ cheap:** photos come from a finite cached
pool (the per-country cache we need for rate limits anyway). **Enrich each photo's
metadata once, at cache/ingest time — not per user, per swipe.** Then total vision
work = number of unique cached photos, so Google Vision stays inside the free tier
(no bill) and the self-hosted cold-start becomes irrelevant (offline batch job). Store
the enriched metadata on the cached photo record.

**Verdict for this project:** start with **Unsplash tags only** (free, already there) to
prove the two-algorithm narrative; if a deepener is needed, ship **self-hosted CLIP
zero-shot** — free, private, on-theme, and its controllable vocabulary maps directly to
Algorithm A's taste vector and "inferred about you" panel. Use **Google Vision** only
as the fast prototype path or if you specifically want landmark-naming drama and accept
the third party + small bill.

### Decision (locked)

**Unsplash is the image _and_ metadata source. No vision deepener for now** — its
`tags` + `color` are deep enough to build the taste vector and the narrowing loop. The
1000 req/hr production limit is accepted. Self-hosted CLIP stays documented as a future
stretch only (embedding-similarity narrowing); Google Vision is off the table (bills +
sends user-reacted images to a third party, off-theme).

### Recommendation

1. **Use Unsplash as both image _and_ metadata source** — expand `images.ts` /
   `TravelImage` to surface `tags`, `color`, `blur_hash`, `description`, and (when
   present) `exif` + `location`. **No second paid API needed; total cost $0.**
2. **Capture implicit signals client-side** (dwell, hesitation, swipe velocity) — this
   is S2's "even mouse movements" point and costs nothing, no API.
3. **Apply for Unsplash production (1000/hr)** and **cache photos** (per-country pools)
   so the rate limit never bites and demos are repeatable offline-ish.
4. **Only if** Unsplash tags prove too thin for Algorithm A's narrowing to look
   convincing, add a **self-hosted scene/label model in the Lambda** (free) before
   reaching for Google Vision (which bills past the free tier). Keep a budget alarm
   either way.
5. Keep **Pexels** wired as a free fallback source for resilience.

---

## 2c. Shared A/B algorithm spec

The technical core. A and B **share one set of pure functions** and differ only in (i)
which signals feed the taste vector and (ii) how the next batch is selected. Everything
here is a **pure function** (Jest-testable like today's `algorithm.ts`); all state lives in
**DynamoDB**; resolvers stay thin. Constants below are starting points to tune.

### 1. Feature taxonomy (the curated dimensions)

A static, declared map from Unsplash `tags` + `color` → a **fixed-length feature vector**
`F` (≈24 dims). Each image becomes one `F`. Axes (each contributes a few components):

| Axis             | Components (examples)                                                       | Source                                  |
| ---------------- | --------------------------------------------------------------------------- | --------------------------------------- |
| Terrain/scene    | mountain, coast/beach, forest, desert, plains, urban, water, snow, tropical | tag keywords                            |
| Palette          | warm-toned, cool-toned, neutral                                             | `color` hue bucket                      |
| Human presence   | empty/remote, populated/crowd                                               | tags (wilderness/remote vs people/city) |
| Light/time       | golden/sunset, daylight, night, overcast                                    | tags                                    |
| Built vs natural | natural, architecture/built                                                 | tags                                    |
| Water present    | water/lake/river/sea                                                        | tags                                    |

```ts
extractFeatures(image): Features            // tags+color → normalized number[] (len D)
```

Pure, deterministic, table-driven (a `TAG_TO_AXIS` dict + a hue→palette function). The
declared, legible taxonomy is what lets **B "show its work."**

### 2. Per-country feature signature

```ts
countrySignature(photosForCountry: Image[]): Features   // mean of extractFeatures(...)
```

Precomputed once **at cache/enrichment time** (depends on the cached, enriched pool — see
§2b/B8) and stored per country. Stable so similarity is comparable.

### 3. Taste vector (per user, per algorithm)

A vector `T` (length D) accumulating evidence. Same update math for both; **different
inputs** — this is the "same technique" thesis in code:

```ts
updateTaste(T, F, signals, algo): T'        // T += Σ wᵢ·sᵢ·F  (then clamp/normalize)
```

- **B (user-first):** only the **explicit** signal — `+w_like·F` on like, `−w_dislike·F`
  on dislike. Ignores dwell/skip/details entirely.
- **A (engagement):** the **firehose** — explicit like/dislike **plus** passive signals:
  `+w_dwell·g(dwellMs)·F`, a small `±` for skip (fast pass-by = mild negative),
  `+w_curiosity·F` on a details-tap, `+w_review·F` on a re-view.

### 4. Country scoring (both — abstract, never location lookup)

```ts
scoreCountries(T, signatures): Record<code, 0..100>   // scaled cosine(T, S_c)
```

Both rank countries by cosine of their taste vector to each country signature → 0–100.
**B's result becomes the persisted `me.preferences`** (replacing the ±5 tally). A's result
is the engagement ranking shown in the dossier/split-reveal. Neither reads
`location.country` (§1b).

### 5. A's endogenous narrowing — the emergent, compounding loop

Confidence drives exploration; **feedback drives confidence** (not a timer):

```ts
updateConfidence(κ, F, T): κ'    // κ↑ when a like confirms T (F·T high); κ↓ when surprising
explorationFraction(κ): ε        // ε = ε_max · e^(−α·κ)   → shrinks as κ compounds
```

When **A drives**, `selectNext` exploits with prob `(1−ε)` (pick images nearest `T_A` →
narrowing) and explores with prob `ε` (diverse/random). Confirming likes → `κ↑` → `ε↓` →
more exploit → more confirming likes: **self-reinforcing, ≈exponential**. Surprising/diverse
likes → `κ↓` → `ε↑` → **no trap forms.** The trap is _emergent and conditional_, never
forced (§1b). Tune `α` so a trap can become visible within **~15–20 confirming
interactions** and deepen across visits (cumulative `κ`).

### 6. B's diversity-preserving selection (and active recovery)

When **B drives**, draw country-weighted by B's scores but with **two guards**:

- **Floor** (rail-bounce equivalent): every country keeps ≥ a minimum draw weight →
  exploration never collapses.
- **Diversity guardrail**: enforce a minimum feature spread per batch (cap consecutive
  similarity). This is what lets B **actively recover novelty** when the user flips from a
  trapped A-feed back to B — fresh terrain/palette reappears.

```ts
selectNext(driver, T, ε, signatures, pool, rng): Image[]   // exploit/explore mix per driver
```

### 7. Novelty metric (the gauge)

```ts
noveltyScore(recentWindow: Image[]): 0..100    // mean pairwise feature distance / entropy
```

Falls as A's loop tightens; held/recovered by B. Drives the diversity gauge and the T8
tests.

### 8. Inferred traits (illustrative — guardrailed)

```ts
inferTraits(T_A, metrics): { trait, basis, confidence }[]
```

Static pattern→trait map, e.g. high "empty/remote" → _"values solitude → possibly
introverted"_; long dwell + low skip → _"deliberative."_ **Guardrails:** always labelled
_"illustrative of what engagement systems attempt — not a real diagnosis"_; do **not**
output protected/health categories as live claims (cite the depression-inference danger
`006`/`007` as the _warning_, never as our own output).

### 9. "Why this card?" reason strings (truthful — T2)

```ts
reasonForCard(driver, image, T, dossier): { reason } | { layer1, layer2 }
```

B → top contributing axes that match (`"warm + coast"`) + country revealed after. A →
Layer 1 platitude + Layer 2 the **real** signals/score that drove the pick (from the
dossier). Never fabricate — strings are derived from the same computation that made the
choice.

### 10. State (DynamoDB, B7)

Per user: `algoA { tasteVector, confidence κ, interactionLog[ {imageId, country, action,
dwellMs, detailsTapped, gestureVelocity, ts} ] (capped), derivedMetrics, inferredTraits }`
and `algoB { tasteVector }`; plus the existing `preferences` country map (now = B's scored
output). Both persist (cumulative). `resetPreferences`/dossier reset clears them (cold-start
reset + the §4c delete right).

### 11. GraphQL surface changes

- `submitFeedback` input shifts from `{country, liked}` → per-image interaction records
  (`{imageId, action, dwellMs, detailsTapped, gestureVelocity}`); backend looks up the
  cached image's features by `imageId`, runs the pure pipeline, persists, returns the
  updated `User` (+ optionally the per-card reasons).
- `travelImages` takes a `driver: A|B` and returns the next batch from `selectNext`.
- Add a `dossier` query (powers §4c PDF + ledger + A's "why this card?") and a dossier/
  preferences **reset** mutation. Re-run codegen after each change.

### 12. The pure-function test surface (what we Jest)

`extractFeatures` · `countrySignature` · `updateTaste` (A vs B inputs) · `scoreCountries` ·
`updateConfidence`/`explorationFraction` (κ↑→ε↓) · `selectNext` (exploit vs explore mix) ·
`noveltyScore` · `inferTraits` · `reasonForCard`. Property tests for the loop: a
**confirming** stream drives `κ↑, ε↓, novelty↓` and compounds; a **diverse** stream keeps
`ε` high and novelty up (trap not forced); flipping driver→B raises novelty; both dossiers
grow regardless of driver.

---

## 3. Travel page — phased plan

> **Phase reconciliation (post-redesign):** T1–T6 below predate the feed + two-algorithm
>
> - flip-flop direction. Reconciled: **T1** (a11y/controls) and **T2** ("why this card?")
>   still apply, re-cast for the feed; **T3** (batch review) and **T4** (live ±5 delta) fold
>   into the per-interaction `submitFeedback` + the dossier ledger; **T5** (engagement
>   contrast) is now the live A/B driver itself (T8), not a static overlay. The spine is:
>   cache+enrich pool (B8) → metadata (B6) → dossier (B7) → **T7** harvest → **T8** narrowing
> - flip-flop + split reveal → §4c PDF.

Each phase ends with the **after-change checklist** (README, format, lint, Jest) for
`frontend/` (and `backend/` if a B-item is touched).

### T1 — Accessibility & control parity (foundation)

The swipe is the only input today; experimental features need a non-pointer path and
an undo before they're worth building on.

- Add explicit **Like / Dislike buttons** and **arrow-key** (↑/↓) handlers that call
  the existing `triggerSwipe`. Swipe stays as the headline interaction.
- **Undo last swipe** — pop the last entry off `ratings`, step `currentIndex` back,
  re-show the card. (Pure client state; no API.)
- Respect `prefers-reduced-motion`: skip the fan/exit transforms, keep button flow.
- Tests: keyboard like/dislike updates `ratings`; undo restores index.

### T2 — "Why this card?" reveal (driver-aware — the contrast in miniature)

The single most on-thesis per-card feature: a tap on any image explains why it was
shown — and it behaves **oppositely depending on which model is driving** (§1b), so the
whole thesis is legible at the level of a single card. Always abstract features, **never
the landmark/location shortcut** ("warm + coast", not "because France").

- **B drives → legible, honest "shows its work":** _"You've liked warm, coastal,
  low-crowd scenes. This matches on **warmth + coast**. (It happens to be Croatia.)"_
  The country is revealed _after_ the aesthetic reason (discovery, not lookup).
- **A drives → the two-layer reveal (the gut-punch):**
  - **Layer 1 — what a real platform shows you:** a non-answer — _"Picked for you ✨"_ /
    _"Because you liked similar."_ Engagement feeds refuse to explain, so A does too.
  - **Layer 2 — "see what it actually used":** the hidden truth — _"Because you engaged
    with cool-toned remote mountains 7× (avg dwell 4.2s), 91% confident. Also inferred:
    prefers solitude · deliberative."_ The **gap between Layer 1 and Layer 2 is the
    transparency lesson** (S5/S6) — we let you peek; the real platform never would.
- **Makes the loop visible card-by-card:** as A's loop tightens, Layer 2's reason
  collapses toward _"more of the same — similar to the last 9 you liked,"_ so the user
  watches the justification narrow in real time (complements the aggregate diversity
  gauge). Flipping to B and re-tapping shows the opposite character instantly.
- **Data:** B's reason comes from its small declared feature set; A's Layers come from the
  dossier (B7). Keep copy tight and accurate to the real scoring — no fabricated reasons.

### T3 — Batch review before submit

Today submit is a single button after all 8 are swiped. Make the **explicit signal**
reviewable.

- On the "all rated" screen, list each photo with its like/dislike verdict and let
  the user **flip any verdict** before submitting (reinforces "you are in control").
- Show the net effect preview: "France +5, Japan −5, …" (uses the T4 delta).
- Keep the submit/refetch loop intact.

### T4 — Live score delta after submit

- Snapshot `me.preferences` **before** submit; diff against the returned `User` after
  (client-side B3). Animate each changed country's chip from old→new value (`+5`/`−5`).
- Brief "your model updated" beat before the next batch loads — the payoff of the loop.
- If the client diff proves flaky (cache races), fall back to B3 server delta.

### T5 — Engagement-vs-user-first contrast (experimental, capstone-grade)

The demo's argument made interactive — optional, build last.

- A toggle / ghost overlay that shows what an **engagement-optimized** feed would do
  differently with the same swipes (e.g. "an engagement model would now double down on
  your top country and stop showing you the rest"). Clearly labeled as illustrative,
  not a second live algorithm.
- Ties directly back to Learn Sections 01/04/07. Cite the same framing the course uses;
  do not overclaim (honest-epistemics rule from the Learn plan).

### T7 — Algorithm A: the metadata harvest + dossier (needs B6, B7)

The data-maximal engine of the two-algorithm demo (§1b).

- Surface Unsplash metadata via **B6**; capture interaction signals (dwell-ms, skips,
  details-taps, hesitation, re-views) per card and **persist them to the DB** (B7).
- Build the live **dossier ledger** UI — a row appears for every field/signal captured,
  visibly ballooning as B's stays at two rows.
- Compute a per-user **taste vector** from tags + color (+ optional scene labels) and
  **persist the structured dossier** (B7) — it is the evidence for the PDF (§4c), not
  hidden or auto-wiped; the user controls export + deletion.
- Build the **"Inferred about you"** panel (clearly-labelled illustrative over-reach).
- Tests: ledger grows on swipe; dossier persists + reloads; taste vector updates.

### T8 — A's narrowing, the driver flip-flop, and the split reveal (needs T7)

- **Both models observe always; one drives.** Architect a `driver` state (A | B) that
  decides which model picks the next batch; **both** keep ingesting every interaction
  regardless. A visible **flip-flop toggle** switches the driver at any time, reversibly.
- **A drives → emergent narrowing:** confidence compounds with confirming likes
  (endogenous, feedback-driven — _not_ a fixed decay), so a monotony bubble **can** form and
  deepen exponentially if the user keeps confirming. Diverse behavior averts it. **B drives
  → diversity restored:** flipping to B visibly **pulls the user out of the loop** (fresh
  countries reappear).
- **Diversity/novelty gauge** that falls as A's loop tightens and recovers when B takes
  over — the (emergent) trap and the escape made watchable (S7).
- The **split reveal** summary: A (huge dossier, collapsing diversity, inferred traits) vs
  B (two-field ledger, preserved diversity, nothing inferred) — wire to Brochure §D and
  Learn §08.
- Tests: under a **confirming** like-stream, A's novelty decreases (and compounds);
  under a **diverse** stream it does **not** collapse (trap is emergent, not forced);
  novelty **rises after flipping to B**; both dossiers keep growing across a driver switch
  (observation is driver-independent).

### T6 — Polish

- Real loading/empty/error states (distinguish "Unsplash rate-limited" from "signed
  out"); the `PREVIEW_PHOTOS` fallback should be labeled as a preview, not silently
  shown as real data.
- Photographer credit becomes a **link** (B2) with the download ping (ToS).
- Prefetch the next batch so submit→new-photos has no visible gap.

---

## 4. Brochure page — phased plan

Goal: a genuine data-viz dashboard that still reads as "here is the _entire_ model,
nothing hidden, yours to export or delete."

### D0 — Replace the map (modern, playful, all countries) ✅ done

- Swapped Google **GeoChart** (`react-google-charts`, now removed) for **`react-simple-maps`**
  (MIT, free, **no API key, no usage billing**) rendering every country from the bundled
  **`world-atlas`** TopoJSON — no network fetch at runtime or in tests. Choropleth-shaded by
  score, theme-aware palette (`lerpHex` between low/high), hover readout.
- **Resolution / projection:** the **50m** dataset (≈7× the detail of 110m, smooth as SVG —
  10m was too heavy and janked on hover). **`geoEquirectangular`** (flat, not globe-curved),
  **Antarctica filtered out**, projection re-centered so the inhabited world fills the frame.
  The map breaks out of the `.page` max-width to span the full viewport (`width: 100vw`), no
  container chrome, no tilt animation.
- **Hover readout = cursor-following "score chip"** (not a static line): a gooey/glass pill
  (matching the app's gooey buttons, but not a `<button>`) shows `country · value/100`, eased
  toward the pointer via a `requestAnimationFrame` lerp, flipping to the other side of the
  cursor near the right/bottom viewport edges so it never runs off-screen.
- **Name matching:** `NAME_ALIAS` maps world-atlas names that differ from the catalog
  (abbreviations/accents like `macedonia → north macedonia`, `marshall is. → marshall islands`,
  `são tomé and principe → são tomé and príncipe`) plus two disputed regions shaded with their
  parent (`somaliland → somalia`, `n. cyprus → cyprus`). Remaining gray areas are genuine
  non-catalog dependencies (Guernsey, Niue, Pitcairn, …) — add them to `countries.ts` if they
  should be scoreable.
- **Pinch-zoom:** the cursor chip (and the global custom cursor) position via the shared
  `lib/pointer.ts#clientToFixed`, which adds `visualViewport.offset` **only on Safari** (where
  `position: fixed` anchors to the layout viewport while client coords are visual-relative);
  Chrome and Firefox already place fixed followers under the pointer, so it's a no-op there.
- This is also the live "watch your taste differentiate" surface (§1b cold start): flat at
  t=0, lighting up as you swipe.

### D1 — Full ranked view (beyond the one summary line)

- Below the map, a **sortable ranked list/bar chart of all countries** with their
  scores — the map shows geography, the list shows magnitude precisely.
- Color-consistent with the map's axis; theme-aware.
- Highlight the neutral line (50) so "above/below baseline" is legible.
- Tests: list renders all catalog countries; sort by value works.

### D2 — Session diff ("what moved")

- Using the T4 before/after snapshot (stash the last submit's delta in context or
  route state), surface a **"changed this session"** panel: countries that moved, with
  ±direction. Makes the Travel→Brochure causal link explicit.
- No backend if scoped to the current session; cross-visit history is D4.

### D3 — Stats strip + "everything we store" panel

- A compact stat strip: total ratings made, countries moved off neutral, most-moved
  country, % of catalog still neutral. Derive client-side (B5 only if needed).
- A **transparency panel** that literally enumerates the stored fields
  (`userId`, `preferences{code→value}`, `createdAt`, `learnProgress`) — "this is all
  of it." This is the Brochure's thesis moment; lift the field list from the
  DynamoDB design in `CLAUDE.md` so it stays truthful.

### D4 — History / trends (needs B4)

- Per-country **sparkline** of score over time, and/or an overall "how concentrated
  are your tastes" trend. Requires the B4 history store — **gate this phase on B4**
  being designed and shipped first.
- Keep it honest: with `±5` increments and few sessions, trends are coarse — present
  as "your last N updates," not a smooth analytics graph.

### D5 — Export & clear (wire the placeholders)

- **Export data** (`downloadData`): on the **Account page**, this is the **Data Dossier
  PDF** (§4c) — not a raw JSON dump.
- **Clear preferences** (`clearPreferences`): wire to the new **B1** mutation; confirm,
  then reset the map to neutral and refetch. Distinct from `deleteAccount`.
- **Download research** (`downloadResearch`): decide what this is (the `/research`
  corpus? a methods PDF?) — **open question**, see §7. Leave as labeled placeholder
  until decided.
- Region/continent **aggregation** view (optional): group countries by region for a
  higher-level read; pure client grouping.

---

## 4c. The Data Dossier PDF (Account page — the persuasion artifact)

The single most persuasive surface in the project: on the **Account page**, "Download my
data" (`downloadData`) exports a **detailed, interpreted PDF report** of everything
Algorithm A collected and inferred — so the user feels, viscerally, _"that's an enormous
amount of data from a two-minute interaction."_ It is the evidence behind the whole thesis.

**The argument it makes (per §1b — use, not storage):** the report doesn't say "data is
bad." It says: _here is everything collected; here is how it **would be interpreted, used
to manipulate you, and sold**; here is how much was **unnecessary** (B got your
preferences responsibly); and here is your control over it (export/delete)._ Frame it as a
**Data Subject Access Request** (what GDPR/CCPA entitle you to) — your right-to-access
report (`011` data brokers, `020` surveillance capitalism, `023` DSA, `015` FTC).

**Source of truth: the DB.** The PDF is generated from the **DB-persisted** dossier (B7) —
nothing is read from the browser. The frontend queries the dossier via GraphQL and renders
the PDF.

**How (free, no server cost):** render client-side with **`@react-pdf/renderer`** (MIT) —
declarative React → multi-page PDF with tables, sections, and charts-as-images. (Avoid
server-side Puppeteer — heavy in Lambda.)

**What's in it — summarize the data as many in-depth ways as possible:**

1. **Raw interaction log** — every image: dwell-time-to-the-ms, action
   (like/dislike/skip/details-tap), timestamp, gesture velocity, re-views. _Pages of it_ —
   the volume is the point.
2. **Derived behavioral metrics** — total time, avg/fastest/slowest dwell, hesitation,
   skip rate, curiosity (details) rate, decision-style, engagement trajectory.
3. **Aesthetic taste profile** — top liked/disliked tags, color palette, terrain/scene
   preferences, with confidence.
4. **Inferred destinations** — ranked countries from abstract features, **including ones
   you never saw** ("inferred, not told").
5. **Inferred personal traits (the overreach — clearly labelled illustrative)** —
   solitude→introversion, decisive vs deliberative, activity level, budget tier — showing
   what engagement systems _attempt_ (`005` Kosinski, `006`/`007` mental-health inference).
6. **How this would be _used_** — the manipulation (narrowing/bubble) and the
   **monetization** ("in the attention economy this profile would be brokered/used to…").
   This is the heart of the use-not-storage argument.
7. **The conclusion / contrast** — "All of the above came from **N swipes over M
   minutes**. Algorithm B reproduced your core destination preferences from your explicit
   likes alone — a fraction of this. The surplus was **unnecessary**, and the danger was
   never the storage — it was the use."
8. **How to interpret each section** + **your rights** (export already in hand; delete in
   one click — B1 / a dossier reset).

**Embedded visuals:** the map, palette swatches, a dwell-time histogram, tag bars, the
inferred-country ranking, a session timeline.

**Depends on:** B7 (DB dossier) and B6 (metadata). Tests: PDF builds from a mocked dossier
query; the unnecessary-surplus contrast (A vs B counts) computes correctly.

---

## 5. Build order (recommended)

1. **B2** (Unsplash ToS) — compliance, do early; **B1** (resetPreferences) — small.
2. **T1 → T2 → T4** — control parity, the "why this card" reveal, live delta (the core
   loop, all client-side).
3. **B8 → D0 → D1 → D3** — catalog rework (neutral terms, all countries) + the new
   `react-simple-maps` map + ranked view + stats/transparency (high dashboard value).
4. **T3 → D2** — batch review + session diff (share the same delta plumbing).
5. **D5** — export + wire clear (uses B1).
6. **B4 → D4** — history store, then trends (the one heavy backend phase).
7. **B6 → B7 → T7 → T8** — the two-algorithm engine: metadata harvest + DB-persisted
   dossier, then narrowing + the split reveal. This _is_ the capstone showcase (§1b); T5's
   contrast toggle folds into it. Apply for Unsplash production + add photo caching here.
8. **§4c Data Dossier PDF** — once the dossier (B7) exists, build the Account-page report
   (`@react-pdf/renderer`). The persuasion artifact.
9. **T6** — final Travel polish pass.

This front-loads compliance + the highest-thesis-value, lowest-backend-cost features
and isolates the one schema-heavy item (history) into its own late phase.

---

## 6. Testing

- **Travel (RTL):** keyboard + button like/dislike, undo, batch-review verdict flip,
  delta computation from a mocked before/after `me`. Mock urql query/mutation as the
  existing `TravelPage.test.tsx` does.
- **Brochure (RTL):** ranked list renders the full catalog and sorts; stats derive
  correctly from a mocked preference map; gate still shows the GlassCard when
  `demoComplete` is false; export produces a Blob/anchor (mock the download).
- **Backend (Jest):** `resetPreferences` (B1) clears the map; B2 attribution shape +
  download trigger; B4 history shape + cap, if/when built. Mock DynamoDB with
  `aws-sdk-client-mock` and Unsplash HTTP per the existing suites.
- Re-run **GraphQL Code Generator** after any schema change (B1/B2/B3/B5) so frontend
  types stay in sync.

---

## 7. Open decisions (confirm before the relevant phase)

- **History model (B4):** capped snapshot array vs per-country like/dislike counts vs
  append-only feedback log — pick the cheapest shape that supports the D4 viz. Affects
  free-tier footprint.
- **`download_location` / attribution (B2):** confirm the Unsplash app is out of demo
  mode (prod rate limits) before relying on per-card photo fetches at batch scale.
- **"Download research" button:** what does it deliver? (the `/research` source corpus,
  a generated methods doc, or remove the button entirely?)
- **T5 engagement-contrast:** how far to simulate — a static illustrative overlay
  (safe, recommended) vs an actual second ranking model (scope creep). Default: static.
- ✅ **Resolved — dislike affordance:** visible on-image like/dislike controls + double-
  tap-to-like shortcut; swipe = skip. Explicit-and-visible by design (user-first). (§1b)
- ✅ **Resolved — two-algorithm presentation (§1b):** **both observe, one drives, user
  flip-flops the driver** any time (B is the escape hatch from A's loop), with the split
  reveal as the summary payoff and a sequential guided version for Learn §08. Ends on B.
- ✅ **Resolved — image/metadata source:** **Unsplash** (`tags` + `color`), no vision
  deepener. Self-hosted CLIP = documented future stretch only. (See §2b "Decision".)
- ✅ **Resolved — loop state is cumulative, and the trap is _emergent, not guaranteed_:**
  A's narrowing/taste state **persists across visits** (dossier, B7). We build the
  _mechanism_ by which a trap can form — a **feedback-driven, self-reinforcing (≈
  exponential)** loop: more trapped → more confirming likes → more A confidence → tighter
  narrowing → … — **not** a rigged guarantee. Diverse behavior avoids it; that honesty is
  the point. A's exploration is **endogenous** (shrinks with confirming feedback), never a
  fixed per-round decay. The **flip-flop is the always-available escape**; **"clear my
  data" resets the cold start**. Tune so a trap _can_ become visible within ~15–20
  confirming interactions and deepens across visits.
- ✅ **Resolved — compute:** A/B logic runs **backend** as **pure functions** (Jest-
  testable, like today's `algorithm.ts`) with state in **DynamoDB**; resolvers stay thin.
- ✅ **Resolved — feature space:** a **curated dimension taxonomy** — map Unsplash tags →
  declared axes (terrain, climate, palette, crowd-level, architecture, …). Legible (powers
  B "showing its work"), controllable, unit-testable. To be enumerated in the algorithm spec.
- ⚠️ **Implication — B departs from today's ±5 country tally:** both models now infer
  country preference from abstract metadata (§1b), so B is no longer "exactly today's
  algorithm." `submitFeedback` input shifts from `{country, liked}` to image-feature-based,
  `algorithm.ts` distributes updates across feature-similar countries, and a per-country
  **feature signature** must be precomputed from the cached pool. Persisted shape
  (country→score map) is unchanged; only the derivation is. Supersedes the CLAUDE.md
  "Algorithm port" note. Confirm before the backend phase.
- **Unsplash production approval + caching (owner action):** apply for 1000/hr and add
  per-country photo caching before any public traffic (see §2b) — no $ risk, only rate
  limits.
- **Brochure history:** storing score history is fine under the use-not-storage ethic
  (§1b) — keep it capped, transparent, exportable, deletable, and never sold.
- ✅ **Resolved — dossier storage:** Algorithm A's dossier persists in the **DB, not the
  browser** (B7); the ethic is _use_, not storage. It powers the Data Dossier PDF (§4c)
  and is user-exportable + deletable. Supersedes the earlier "session-only / auto-wipe"
  idea.

---

## 8. Definition of done

- [ ] Travel has keyboard/button parity, undo, the "why this card" reveal, and a live
      post-submit delta; swipe still headline.
- [ ] Brochure shows map + full ranked list + stats + the "everything we store" panel;
      export works and "clear preferences" is wired to a real mutation.
- [ ] Unsplash ToS satisfied (download ping + linked credit).
- [ ] No inference anywhere; every new surface reinforces the transparency thesis and
      preserves honest-epistemics copy.
- [ ] Backend additions covered by Jest; codegen re-run; both after-change checklists
      pass.
- [ ] Learn Section 08 (`travel-demo`) copy updated to describe the finished pages
      truthfully (the section file still says "Coming soon").

```

```
