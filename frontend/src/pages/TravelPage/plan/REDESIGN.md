# Travel Page — Redesign Plan

> **Supersedes** the maximalist parts of [DEVELOPMENT-PLAN.md](./DEVELOPMENT-PLAN.md).
> Goal: cut the Travel page's complexity by **subtraction and repurposing**, not a
> rebuild. Most of what this plan needs already exists in the codebase — it is just
> wired together in the most complex possible way.

## Why the page exploded

The page was quietly doing three jobs; only one is the demo Learn §08 actually calls
for:

1. **The planned demo** — explicit like/dislike → visible score movement; minimal,
   legible, nothing inferred.
2. **A surveillance simulator** — a `driver` A/B toggle that swaps the _entire live
   feed_, plus a hidden "dossier" of inferred traits, confidence, dwell tracking.
3. **Production polish** — column parallax, hold-to-zoom, `useRef` choreography around
   auto-submit.

Jobs 2 and 3 are the whole complexity budget, and job 2 (dwell + inferred dossier)
_contradicts_ §08's thesis (explicit-only, nothing inferred). The fix is to stop
doing the two expensive things the page was never asked to do, and to **reframe** the
already-computed A/B data as the lesson.

## What already exists (reused, not rebuilt)

- **Static photo pool, zero external calls** — `backend/src/photos.data.ts` +
  `scripts/build-photo-pool.ts` cache metadata-rich photos so the running app makes
  ~0 Unsplash calls. Currently near-empty (4 entries) and still hotlinks Unsplash
  URLs.
- **Rich metadata type** — `CachedPhoto` (country, tags, color, photographer,
  downloadLocation), ready to expand.
- **A-vs-B data already computed** — `dossier.ts` computes both an engagement taste
  (A) and a user-first taste (B) from the _same_ interactions; `insights.ts` already
  does `inferTraits` with an "illustrative, not a diagnosis" disclaimer.

## Confirmed decisions

1. **Images self-hosted in S3** (not hotlinked). Fine under the Unsplash License;
   keep attribution + download-trigger. Matches the "no live external calls" goal.
2. **Metadata honesty** — Unsplash reliably gives tags/color/location; EXIF/GPS is
   spotty and season/terrain/light are _derived_. Label derived fields as inferred,
   never as precise measured EXIF.
3. **Feed selection stays on the backend** — `travelImages` already serves the static
   pool with zero external calls; keeps "the algorithm chose these for you" real.

## The interaction (unchanged)

Keep the current **click-halves snap feed**: left half = dislike (✕), right half =
like (♥), keyboard support, snap-scroll sections, infinite preload, info button +
credit, auto-submit when a section scrolls off the top.

---

## Phase 1 — Strip the feed down (subtraction)

`TravelPage.tsx` (~793 → ~450 lines) and `TravelPage.css` trims.

- **Delete** column parallax: the feed `scroll` handler, `COL_SPEEDS`, per-cell
  `translate`, and the `PARALLAX_PX` constant.
- **Delete** hold-to-zoom: `holdTimerRef`, `holdFiredRef`, `zoomedPhoto` state, the
  zoom overlay JSX, the pointer-down/up handlers, and the Escape effect for zoom.
- **Delete** the display-driving `driver` state and the two-tab toggle; the feed
  becomes a single user-first / preference-weighted stream.
- **Keep**: click-halves like/dislike, keyboard, snap-scroll, infinite preload, info
  panel + credit, auto-submit-on-scroll-off, dwell/hover recording (now feeds the
  contrast, see Phase 3).

## Phase 2 — Static photo dataset in S3 (data + metadata)

**Sizing (confirmed):** catalog is **228 countries** (not 35), **~15 photos/country ≈
3,400 total**, ~850 MB (≈17% of the 5 GB S3 free tier). Density is nearly free on both
storage and API calls (one search returns 30). Unsplash **demo mode (50/hr)**.

**Metadata via enrichment (confirmed).** Unsplash **search returns no `tags`** (verified)
— they require a per-photo `GET /photos/:id`, which also yields `location` + camera
`exif`. Since the recommender needs tags, each kept photo is enriched. That pushes the
full demo-mode run to **~2.5–3 days** (all calls share the 50/hr budget; resumable).
`country` stays the search association (catalog key); geotags are stored when present
but don't override it.

**Code — done (`develop`):**

- **Metadata schema** — `photos.types.ts` `CachedPhoto` (id, kind, likes, dimensions,
  blurHash, description, `unsplashImageUrl`, same-origin `imageUrl`, + enrichment: tags,
  `locationName`/`lat`/`lng`, `exif`). Only measured or self-assigned fields.
- **Curation** — `photos.curate.ts` (pure, tested): dedup by id, min-likes gate,
  food/interior/people/text denylist, cities↔landscapes interleave, per-country cap.
- **Step A generator** — `build-photo-pool.ts`: two searches/country + per-photo
  **enrichment** (real tags + location + exif); global rate gate; resumable +
  checkpointed; curated to 15/country. Verified live (tags/location/exif land).
- **Step B sync** — `sync-photos-s3.ts`: resumable CDN download → uploads **both**
  images (`photos/<id>.jpg`) and metadata (`photos.json`) to the bucket. `photos-cache/`
  - `photos.json` gitignored.
- **Metadata in S3, not the code** — the pool is **not** bundled into the Lambda. It's
  `photos.json` in `bba-photos`, loaded once per cold start by `pool.ts` (cached warm),
  which also primes the country signatures. `images.ts` selects from it; local dev reads
  a local `photos.json`. Lambda gets `s3:GetObject` on `bba-photos/photos.json`.

**Data run — pending (owner-run; nothing photo-related is committed):**

- `UNSPLASH_ACCESS_KEY=… npm run build:photos` (~2.5–3 days background, resumable; incl.
  enrichment) → writes `photos.json` (gitignored).
- `PHOTO_S3_BUCKET=bba-photos npm run sync:photos` (once — shared bucket; after
  `bootstrap/` applied) → images + `photos.json` to S3.

## Phase 3 — Repurpose the dossier into the "data collected" contrast

**Done (`develop`):** the old "What the algorithm has on you" modal is now the
**"Same taps. Two algorithms."** contrast — two ledgers (`computeContrast` in
`TravelPage.tsx`) split from the one `dossier` query: User-First keeps only
likes+dislikes; Engagement itemizes impressions, dwell samples, skips, inferred
features/traits, with per-column data-point tallies and an "Nx the data" line. Pure
reframing — no schema change, no photos needed. Format/lint/40 tests green.

Replace the "What the algorithm has on you" dossier modal with a single **"See your
data"** button that opens a two-column contrast for _this session_:

| Algorithm B — User-First (what we collected) | Algorithm A — Engagement (same session)                    |
| -------------------------------------------- | ---------------------------------------------------------- |
| N likes, M dislikes → explicit signals only  | + every scroll, hover-dwell (ms/photo), skip, time-on-card |
| "Two numbers per country you rated."         | + metadata inferences from the rich photo fields           |
| Nothing else left your browser.              | + confidence %, inferred traits _(illustrative)_           |
| **~5 data points**                           | **~80 data points**                                        |

Punchline: **same taps, ~15× the footprint.** Honest by construction — the feed still
records dwell/hover, but that tracking now visibly powers the lesson instead of a
hidden profile. Powered by the existing `dossier` (both tastes) + `insights`
(`inferTraits`), reframed from "your profile" to "the gap between two algorithms."

Add a concrete **data-points tally**:

- **B**: likes + dislikes (explicit events).
- **A**: likes + dislikes + skips + per-photo dwell samples + hover events + scroll
  depth + N inferred features + N inferred traits → one headline number ~10–20× B.

## Phase 4 — Backend trims

**Done (`develop`):**

- Dropped the `driver` arg **and** the `Driver` enum from the public schema —
  `travelImages(count)` now always selects user-first (Algorithm B). Regenerated
  `schema.graphql` + frontend codegen; removed `FEED_DRIVER`/`Driver` from
  `TravelPage.tsx`. The recommender's internal `driver: 'B'` selection stays.
- **Kept** `dossier.ts` / `insights.ts` / `recommender.ts` / `features.ts` — the A/B
  machinery still powers the "data collected" contrast (Phase 3), just not a public
  display toggle.
- Photo metadata is loaded from S3 at runtime (`pool.ts`), not committed — see Phase 2.
- Backend 115 tests + frontend 40 tests green.

## Phase 5 — Infra

- **Done (`develop`):** single shared **`bba-photos`** bucket created in
  `bootstrap/main.tf` (private, OAC, SSE; policy trusts any CloudFront distribution in
  the account via `AWS:SourceAccount`, so all envs read it — photos are identical, so
  we never triplicate them). `infra/photos.tf` looks it up; `frontend.tf` wires the
  `s3-photos` origin + `/photos/*` behavior (long TTL, security headers).
  `terraform validate` passes.
- **Pending:** `terraform apply -f bootstrap` (creates the bucket), then per-env
  `terraform apply`, then run Step B sync **once** against `bba-photos`.

---

## After-change checklist (per CLAUDE.md)

After each phase touching code: update the relevant README(s), then
`npm run format` → `npm run lint` → `npm test` in the affected workspace(s). Re-run
GraphQL Code Generator after any schema change (`travelImages` arg / `TravelImage`
fields). Do not commit — the owner makes all commits.
