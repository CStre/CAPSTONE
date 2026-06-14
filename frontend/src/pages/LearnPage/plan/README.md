# Learn Page — Content & Structure Plan

> **Status: planning only.** This folder documents the _future_ redesign of the
> Learn page. **No Learn page code is to change yet.** The Travel-page section
> (08) is intentionally deferred until the Travel page is built, so its "what the
> algorithm does" copy can be written against the real thing.

This plan reorganizes the project's research corpus (`/research` — **43 sources**,
8 synthesis documents) into a sequence of **self-contained, horizontally-scrolling
sections**. As the reader scrolls _down_ the Learn page, they hit each section and
scroll _sideways_ through its slides (the existing GSAP `ScrollTrigger`
pinned-horizontal pattern in `LearnPage.tsx`), then continue down to the next
section.

> **This is the expanded plan.** An earlier draft used ~35 slides; this version
> presents far more of the research — **~65 content slides across 8 sections**,
> each grounded in specific studies with verbatim quotes and the actual numbers.
> The goal is to do justice to a corpus that took real work to assemble.

---

## The vision in one paragraph

The Learn page becomes a guided course. Instead of one long essay, the reader
moves through **eight teaching sections** — each a horizontal "deck" of slides.
Every slide is **one summarizing icon + three or four sentences**, grounded in a
peer-reviewed source with its real figures. Logged-in users get a **progress
menu**: each section they fully explore is marked complete (and collapses / checks
off), and they can jump back to where they left off. The arc takes the reader from
_"how do these algorithms even work?"_ to _"here is exactly how to build one that
serves the user — and here is ours doing it."_

---

## The section model

Each **section** is:

- A pinned horizontal-scroll container (one per section, like today's
  `.learn-container`).
- A deck of **slides**. Each slide = **one Lordicon** (summarizing the idea) + a
  **title** + **3–4 sentences** of body copy.
- Backed by specific sources from `/research/sources/` with **verbatim quotes and
  the real numbers**, so the copy is defensible and can cite.
- Independently **completable** — when a logged-in user has viewed every slide in
  the section, it is marked complete.

### The eight sections

| #   | Section                                                         | Slides | Teaches (one line)                                                              | Basis    |
| --- | --------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------- | -------- |
| 00  | [Orientation](00-orientation.md)                                | 5      | The question the site answers; user-_focused_ vs user-_centered_.               | Framing  |
| 01  | [How Recommenders Actually Work](01-how-recommenders-work.md)   | 10     | A recommender is a neutral scoring function; the **objective** is the ethics.   | S1       |
| 02  | [Your Behavior Becomes the Algorithm](02-data-and-inference.md) | 9      | Personalization data _is_ surveillance data; sensitive traits are emergent.     | S2       |
| 03  | [The Human Cost — the harms](03-the-human-cost.md)              | 9      | The documented, clinical harms, harm by harm, with the real figures.            | S3       |
| 04  | [Why It Happens — the mechanism chain](04-why-it-happens.md)    | 8      | The traceable chain: data → proxy → loops → selection → reward circuitry.       | S7 (+S3) |
| 05  | [The Law's Blind Spot](05-the-law-and-inference.md)             | 6      | HIPAA protects the _holder_, not the fact; the data/use/possibility fix.        | S4       |
| 06  | [What "User-First" Actually Means](06-what-user-first-means.md) | 7      | User-as-end vs user-as-data-source; design-time ethics; the obligatory premise. | S5       |
| 07  | [Building It Better](07-building-it-better.md)                  | 10     | The engineering playbook of levers that avoid the common failures.              | S6 + S8  |
| 08  | [The Travel Page (DEFERRED)](08-travel-demo-DEFERRED.md)        | ~6     | **Deferred.** What our Travel algorithm does and showcases.                     | tie-back |

After section 08 the existing **Technology Stack** and **About the Creator**
sections remain (no change planned).

### The narrative arc

```
00 Orientation        →  "Here's the question."
01 How they work      →  "The machine is neutral; the objective is the choice."
02 Data & inference   →  "Your behavior is the fuel — and it also diagnoses you."
03 The human cost     →  "Here is the documented, clinical harm — harm by harm."
04 Why it happens     →  "And here is the traceable mechanism that causes it."
05 The law's gap      →  "Which the law mostly doesn't cover."
06 User-first ethics  →  "So what does 'serving the user' actually mean?"
07 Building it better  →  "Here is concretely how you build one that does."
08 Our Travel demo    →  "And here is ours, doing exactly that." (deferred)
```

> **On section length:** Sections 01, 03, 04, and 07 are deliberately the longest
> — they carry the most research. If any deck feels too long in practice, it can
> split into two decks (e.g. 03 "harms" could become "appearance/eating" +
> "mood/compulsion/wider"); the progress feature treats each deck as a completable
> unit. Don't trim the _research_ to shorten — split the deck instead.

---

## Slide-authoring conventions

1. **Length:** 3–4 sentences, hard cap. A slide is a _beat_, not a paragraph.
2. **Placeholder icon for now.** Every slide ships with **one placeholder icon —
   the brain `in-reveal` (`ICONS.greetingBrain`, or an `ICONS.slidePlaceholder`
   alias)** — plus a `// TODO(icon): …` comment carrying that slide's intended
   icon (its "Icon" note in the section file). Real icons are a later curation
   pass. Animate `trigger="in" state="in-reveal"` then `hover`, matching the
   existing essay panels. Full detail: **[DEVELOPMENT-PLAN.md §0](DEVELOPMENT-PLAN.md)**.
3. **Lead with a real number or a real quote.** This corpus's power is its
   specificity (AUC 0.72; 87 million profiles; 13%→56% in five days). Use it.
   Every slide lists its source ID(s) and a verbatim quote from
   `/research/sources/NNN-*.md`.
4. **Honest epistemics (non-negotiable).** The corpus is disciplined about _not_
   overclaiming (S3 §5): report effect sizes, distinguish population-average from
   subgroup/tail, never say "screens are bad." The slides must preserve that
   nuance — it is what makes the project credible.
5. **Voice:** professional, educated, precise — matching the elevated register
   used on the Sources page. Define jargon in-line the first time.

> **How to build all of this:** see **[DEVELOPMENT-PLAN.md](DEVELOPMENT-PLAN.md)** —
> the data model, component breakdown, phase order (L0–L5), the icon-placeholder
> convention, the progress-feature build, and testing gates.

---

## The progress & completion feature

Full spec: **[progress-and-completion-feature.md](progress-and-completion-feature.md)**.
In brief: logged-in users get a glass "progress island" TOC showing each section's
status (_not started · in progress m/n · complete_); a section completes when all
its slides have been viewed; completed sections collapse/check off; jump & resume
supported; persisted server-side (a small `learnProgress` GraphQL + DynamoDB
addition) with a `localStorage` fallback for anonymous users. **Authenticated-gated
menu**; anonymous visitors still get the full content.

---

## Source map (which sources power which section)

From `/research/sources/INDEX.md`. Numbers are source IDs (`/research/sources/NNN-*.md`).

| Section | Primary sources                                                      | Synthesis |
| ------- | -------------------------------------------------------------------- | --------- |
| 01      | 001, 002, 003, 022, 024, 027, 029, 030, 031, 032, 033, 040           | S1        |
| 02      | 003, 005, 006, 007, 011, 019, 020, 024, 029                          | S2        |
| 03      | 004, 009, 010, 012, 013, 016, 028, 037, 038, 039, 042, 043           | S3        |
| 04      | 029, 030, 031, 032, 033, 034, 035, 036, 039, 040; 001, 002, 037, 010 | S7        |
| 05      | 005, 006, 007, 011, 014, 015, 019, 023                               | S4        |
| 06      | 001, 018, 020, 021, 025, 016, 028, 035, 043                          | S5        |
| 07      | 018, 022, 023, 024, 031, 032, 033, 016, 028, 009, 013, 037, 010      | S6 + S8   |
| 08      | 001, 002, 003, 023, 024 (tie-back) — finalize post-Travel            | S6/S8     |

The remaining sources (008 Orben & Przybylski, 026 Allcott, 041 Common Sense/Hopelab,
017 Fardouly & Vartanian, 025 Bhargava & Velasquez) anchor the epistemics and
mechanism slides across 03/04/06.

---

## Build order (when implementation begins — not now)

1. Build the **Travel page** first (so section 08 can be written truthfully).
2. Refactor `LearnPage.tsx` from hard-coded panel arrays into a **section-driven**
   structure (sections as data, each an array of slides), so adding/splitting decks
   is a data change, not a markup change.
3. Author sections 00–07 from these files.
4. Add the **progress feature** (frontend tracking → backend persistence).
5. Write section 08 against the finished Travel page.
6. Run the after-change checklist (README, format, lint, test).
