# Learn Page — Development Plan

How to actually build the redesign documented in this folder. This is the
implementation roadmap: the data model, the component breakdown, the placeholder
**icon convention**, the phase order, and the testing/checklist gates.

> **Interaction model (revised):** the page now shows **one section at a time** as
> a controlled carousel (`LearnDeck`) below the hero banner — not stacked GSAP
> decks. The **progress menu** (always shown, top-centre) is the navigation: pick a
> section → it becomes the active deck. Slides advance by **wheel** (page locked to
> the deck, releasing at the first/last slide), **arrow keys**, or the **dash-bar
> arrows**; a **dash progress bar** marks position; each section ends in a "pick the
> next section" **outro** slide; a **bottom-right button** returns to the start.
> GSAP/`useHorizontalScroll` were removed from this page.
>
> **Slide behaviour:** each slide's body **types out** (reusable `Typewriter` hook);
> a slide completes **only when the typewriter finishes** (not a fixed dwell), then
> the check reveals in a **reserved slot** (no layout shift). Text uses the global
> **`.hover-grow`** utility. The wheel/trackpad is **accumulated** (deliberate
> gestures, not over-sensitive). The menu toggle, dash arrows, and back button are
> **`GooeyButton`s** (header-island feel). The menu **closes on outside click /
> Escape**, uses **short section labels**, and the outro slide shows
> **complete (✓) vs incomplete (✗)** for the section.
>
> **Build status (current):**
>
> - ✅ **L0** data-model refactor · ✅ **L1** sections 00–07 authored as data ·
>   ✅ **L2** section transitions + reduced-motion · ✅ **L3** progress feature
>   (frontend, localStorage, authed-gated menu).
> - ✅ **L4** backend persistence — `LearnSectionProgress` type, `User.learnProgress`,
>   and `recordSlideView` mutation in the Pothos schema + DynamoDB (`learnProgress`
>   map on the user item); the provider unions server + localStorage for signed-in
>   users. _Future tweak:_ on first sign-in, bulk-push any local-only progress so
>   the server holds the full union (today only new views are pushed).
> - ⬜ **L5** Section 08 (Travel demo) — pending the Travel page.
> - ⬜ **Icon curation** — every slide still uses the brain placeholder; swap per
>   the `TODO(icon)` comments when ready.
> - The Technology Stack and About the Creator decks were **removed**, and their
>   dead CSS, `ICONS` entries (`learnPanel1–11`, `learnTech`), and the
>   `assets/learn/*.svg` files were pruned.
> - L3 specifics as built: a slide completes after a **5-second continuous dwell**
>   (not a single intersection) — covered by `LearnSection.test.tsx` — then an
>   approved-check icon (`ICONS.slideComplete`) reveals below its text. The
>   progress menu sits **top-center under the header**.
> - Reduced-motion: the GSAP pin/scrub is skipped under `prefers-reduced-motion`
>   and the deck stacks vertically (`useHorizontalScroll` + a CSS fallback).

> **Scope note.** Sections 00–07 do **not** depend on the Travel page and can be
> built now. Only **Section 08** (the Travel demo) waits until the Travel page is
> finished, so its copy is true to the real algorithm. See
> [README → build order](README.md).

---

## 0. The icon-placeholder convention (read this first)

Per the owner's directive: **every slide uses one placeholder icon for now — the
brain `in-reveal` — and carries a comment marking the real icon to swap in later.**

- Placeholder icon: `ICONS.greetingBrain`
  (`/icons/wired-outline-426-brain-in-reveal.json`).
- _Optional, recommended:_ add a self-documenting alias in
  `components/LordIcon/LordIcon.tsx` so intent is obvious at the call site:

  ```ts
  // Temporary placeholder for Learn-page slides until per-slide icons are chosen.
  slidePlaceholder: '/icons/wired-outline-426-brain-in-reveal.json', // === greetingBrain
  ```

  Then slides reference `ICONS.slidePlaceholder`. Swapping the alias is a one-line
  change if you ever want a different global placeholder. (If you prefer not to add
  the alias, use `ICONS.greetingBrain` directly — same file.)

- **Every slide carries a `// TODO(icon): …` comment** whose text is that slide's
  **Icon** note from its section file (e.g. `01-how-recommenders-work.md` slide
  01.4 → `// TODO(icon): a click flowing into a grid of numbers / a table cell
lighting up`). That way each placeholder records exactly what to replace it with.

Concrete shape (one slide):

```tsx
{
  // TODO(icon): two small vectors / a dot-product symbol; or a "match %" meter
  icon: ICONS.slidePlaceholder,
  title: 'A recommender is just a scoring function',
  body: 'Underneath the branding, every recommender does one simple thing: …',
},
```

When real icons are chosen, the only edits are: change `ICONS.slidePlaceholder`
→ the real `ICONS.*` entry, and delete the `TODO(icon)` comment.

---

## 1. The data model

Today `LearnPage.tsx` hard-codes two arrays (`ESSAY_PANELS`, `TECH_PANELS`) and
maps them into one big horizontal-scroll container. The redesign makes **sections
first-class data** so the page is driven by structure, not markup.

```ts
// LearnPage/types.ts
export interface Slide {
  /** Placeholder for now (ICONS.slidePlaceholder); see TODO(icon) comment per slide. */
  icon: string;
  title: string;
  body: string | ReactElement; // JSX allowed for lists / emphasis, like today
}

export interface LearnSection {
  id: string; // stable id, e.g. 'how-recommenders-work' — used by progress tracking
  number: string; // '01' … for the menu
  title: string; // section heading shown between decks
  subtitle?: string; // optional one-liner under the heading
  slides: Slide[];
  /** Deferred sections render a placeholder/"coming soon" state (Section 08). */
  deferred?: boolean;
}
```

### File layout

```
LearnPage/
  LearnPage.tsx          ← becomes a thin orchestrator (maps sections → <LearnSection/>)
  LearnPage.css          ← mostly reused; add section-header + progress-menu styles
  types.ts               ← Slide / LearnSection
  sections/
    index.ts             ← export const LEARN_SECTIONS: LearnSection[] = [ … ]
    00-orientation.tsx   ← one module per section, exports a LearnSection object
    01-how-recommenders-work.tsx
    02-data-and-inference.tsx
    03-the-human-cost.tsx
    04-why-it-happens.tsx
    05-the-law-and-inference.tsx
    06-what-user-first-means.tsx
    07-building-it-better.tsx
    08-travel-demo.tsx   ← deferred: true (placeholder copy until Travel ships)
  components/
    LearnSection.tsx     ← one pinned horizontal-scroll deck (wraps useHorizontalScroll)
    LearnSlide.tsx       ← icon + title + body card
    LearnProgressMenu.tsx← the glass quick-menu (authed only)
  useLearnProgress.ts    ← progress state + persistence
```

Slide **copy comes verbatim from the section `.md` files in this folder**; the
`TODO(icon)` comment for each slide comes from that slide's **Icon** note.

---

## 2. Component breakdown

- **`LearnSlide`** — renders one slide: a `<LordIcon src={slide.icon} size={180}
trigger="in" state="in-reveal" stroke="bold" />` (the existing essay-panel
  pattern), the title `<h2>`, and the body. Reuse the current `.learn-panel`
  styles. The brain placeholder already supports `in-reveal`, so animations work
  immediately.
- **`LearnSection`** — renders a section heading + a `.learn-container`
  horizontal-scroll deck of `LearnSlide`s. Owns one `useHorizontalScroll` (the
  existing GSAP hook, unchanged) and the per-panel **viewed** detection for
  progress (see §4). A `deferred` section renders a single "coming soon after the
  Travel page" card instead of slides.
- **`LearnPage`** — maps `LEARN_SECTIONS` → `LearnSection`s, keeps the hero banner,
  the Technology Stack deck, and the About the Creator section unchanged, and
  mounts `LearnProgressMenu` when authenticated.
- **`LearnProgressMenu`** — the glass TOC (see
  [progress-and-completion-feature.md](progress-and-completion-feature.md)).

---

## 3. Phase order

Each phase ends with the **after-change checklist** (README, format, lint, test).

### Phase L0 — Data-model refactor (no visual change)

Move the existing essay into the new `Slide`/`LearnSection` shape and render from
data, proving the structure before adding content. Keep behavior identical.

- Add `types.ts`, `sections/index.ts`, `LearnSection`, `LearnSlide`.
- Port the current 11 essay panels into a temporary section so the page looks the
  same. (These keep their existing `learnPanelN` icons for now; the _new_ sections
  below use the placeholder.)
- Verify horizontal scroll still works; update `LearnPage.test.tsx`.

### Phase L1 — Author sections 00–07 as data

Replace the single essay with the eight-section structure from this folder.

- Create `sections/00-…tsx` … `07-…tsx`, each a `LearnSection` with its slides,
  **every slide using `ICONS.slidePlaceholder` + a `TODO(icon)` comment**.
- Copy body text verbatim from the matching `.md` file. Keep the 3–4-sentence cap.
- Add `08-travel-demo.tsx` with `deferred: true` and a placeholder card.
- Section headings render between decks (reuse `.learn-tech-intro`-style markup).

### Phase L2 — Section transitions & polish

- Section heading cards between decks; ensure each deck pins/unpins cleanly
  (`ScrollTrigger.refresh()` on resize; the cards already exist as a pattern).
- Respect `prefers-reduced-motion`: if horizontal scrub is disabled, fall back to
  vertical stacking and still observe panels for progress.

### Phase L3 — Progress feature (frontend only)

- `useLearnProgress()` — `Map<sectionId, {viewed:Set<number>, completed:boolean}>`,
  persisted to `localStorage` for now; `markViewed(sectionId, slideIndex)`.
- Per-panel `IntersectionObserver` in `LearnSection` calls `markViewed`; a section
  completes when `viewed.size === slides.length`.
- `LearnProgressMenu` (glass island, reuse `GlassIsland`/`.gi-glass`) — renders
  only when `useAuth().status === 'authenticated'`; shows per-section status,
  jump/resume, collapse-on-complete, overall progress. Tasteful completion cue
  (reuse `spawnParticles`).

### Phase L4 — Progress persistence (backend)

- Extend the GraphQL schema + DynamoDB with `learnProgress` (see the feature spec
  for the illustrative schema). Hydrate the menu from `me.learnProgress`; debounce
  `recordSlideView`; merge `localStorage` → server on sign-in.
- This is a backend-phase task (Phase 1/3 of the root refactor plan); it can ship
  after L3 since L3 already works via `localStorage`.

### Phase L5 — Section 08 (Travel demo)

- After the Travel page is built, write `08-travel-demo.tsx` for real against the
  finished algorithm; flip `deferred` off. Use the
  [08 stub](08-travel-demo-DEFERRED.md) checklist.

---

## 4. Detecting "viewed all slides" (detail)

In `LearnSection`, attach an `IntersectionObserver` (threshold ~0.6) to each
rendered `.learn-panel`. On first sufficient intersection, call
`markViewed(section.id, index)`. This is decoupled from GSAP and already proven on
the Sources page (the source-link in-reveal uses the same approach). Debounce so a
fast scrub still registers; re-observe after `ScrollTrigger.refresh()`.

Mirror the privacy ethic the course teaches: **store only slide indices and a
completion boolean — nothing behavioral, nothing inferred** (a nice callback to
Sections 02/06).

---

## 5. Icon-curation pass (later, separate task)

When ready to replace placeholders:

1. For each slide, read its `TODO(icon)` comment, pick/obtain a Lordicon, drop the
   `.json` into `public/icons/`, and add an `ICONS.*` entry in `LordIcon.tsx`.
2. Swap `ICONS.slidePlaceholder` → the new entry and delete the comment.
3. Suggested per-section icon "families" (consistent stroke/trigger) live in each
   section file's Icon notes; keep a section visually coherent.
4. Re-run format/lint/test.

Because every slide shares one placeholder until then, the page is fully functional
and on-brand during development — no slide is ever icon-less.

---

## 6. Testing

- **Unit/RTL:** extend `LearnPage.test.tsx` — section headings render; a known
  slide title from each section is present; the progress menu appears only when
  authenticated (mock `useAuth`); `markViewed` marks a section complete when all
  indices are seen. Stub `IntersectionObserver` (already stubbed in
  `src/test/setup.ts`) and GSAP `ScrollTrigger`.
- **Manual:** scroll each deck end-to-end; confirm completion + collapse; confirm
  reduced-motion fallback; confirm anonymous users see content but no menu.

---

## 7. Definition of done (sections 00–07)

- [ ] `LearnPage` is section-driven; the eight sections render as horizontal decks.
- [ ] Every slide uses the brain placeholder with a `TODO(icon)` comment.
- [ ] Copy matches the section `.md` files (3–4 sentences each, quotes preserved).
- [ ] Honest-epistemics nuance intact (no "screens are bad").
- [ ] Progress menu works for authed users (localStorage at minimum), gated off for
      anonymous; section completion + collapse functions.
- [ ] After-change checklist passes (README, format, lint, test).
- [ ] Section 08 left deferred until Travel ships.
