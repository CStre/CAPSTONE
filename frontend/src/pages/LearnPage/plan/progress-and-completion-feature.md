# Learn Page — Progress & Completion Feature (spec)

> **Status: planning only.** Implement after the section refactor (see
> [README](README.md) build order). Gated to **authenticated users** per the
> brief ("a quick menu for logged in users to see their progress and jump back").

## Goal

Turn the Learn page into a trackable course. A logged-in reader can:

1. **See their progress** at a glance — which of the eight sections are not
   started / in progress / complete.
2. **Jump** to any section, or **resume** where they left off.
3. Watch a section get **marked complete** once they've viewed all its slides,
   after which it **collapses / checks off** in the menu.

Anonymous visitors get the full content with no saved progress (an optional
`localStorage` fallback can give them in-session tracking without an account).

---

## UX

### The quick menu — a glass "progress island"

A floating, collapsible **table of contents** matching the site's glass aesthetic
(reuse the `GlassIsland` / `.gi-glass` recipe). Candidate placement: a pinned
launcher (bottom-right, near the `CustomCursor` z-layer) that expands into a
vertical list, or a left-edge progress rail. It should:

- List the eight sections in order, each row showing **title + status**:
  - **Not started** — neutral dot.
  - **In progress** — a small `m / n` slide counter + partial ring.
  - **Complete** — a check (reuse `ICONS.statusVerified` or the
    `passwordStrong` approved-check); the row **collapses** to a compact, checked
    state.
- Show an overall progress bar/ring ("4 / 7 sections complete").
- Let the user **click a row to jump** to that section (smooth-scroll to the
  section's container; for a partially-viewed section, scroll to the first
  unseen slide = "resume").
- Be dismissible / collapsible so it never blocks reading.

### Completion affordance

When a section completes, give a small, tasteful confirmation (the existing
`spawnParticles` burst is already in the codebase and on-theme) and collapse its
menu row. Avoid anything noisy — this is a research/education page.

---

## Detecting "viewed all slides in a section"

Each section is a GSAP `ScrollTrigger` pinned horizontal-scroll container with
_n_ slide panels. A slide counts as **viewed** when it reaches the centre of the
viewport during the horizontal scrub. Two viable mechanisms:

- **Per-panel `IntersectionObserver`** (already used on the Sources page for the
  in-reveal icons) — observe each `.learn-panel`; mark its index viewed on first
  sufficient intersection. Robust and decoupled from GSAP.
- **`ScrollTrigger` per-panel callbacks** (`onEnter` / `onToggle`) — tighter
  integration with the existing pin/scrub.

A section is **complete** when the viewed-set equals `{0 … n-1}`. Track per
section: `viewedSlideIndices: Set<number>` → `completed: boolean`.

> Edge cases to handle: a reader who scrolls fast (debounce/threshold so a flash
> still counts), resizing/re-pinning (`ScrollTrigger.refresh`), and reduced-motion
> users (respect `prefers-reduced-motion`; if horizontal scrub is disabled,
> fall back to vertical and observe panels the same way).

---

## Persistence

### Logged-in (server-side, follows the account)

The stack already has Cognito auth + a GraphQL Lambda + DynamoDB + the urql
client (see `CLAUDE.md`). Add a small **`learnProgress`** concept alongside the
existing per-user data:

- **Storage:** extend the user's DynamoDB item with a `learnProgress` map —
  `{ [sectionId]: { viewed: number[], completed: bool, updatedAt: ISO } }` — or a
  compact `completedSections: string[]` + `lastSection`. Keep it sparse and keyed,
  mirroring the preferences model (write only on change).
- **GraphQL (illustrative — finalize with the backend phase):**

  ```graphql
  type LearnSectionProgress {
    sectionId: ID!
    viewedSlides: [Int!]!
    completed: Boolean!
  }

  extend type User {
    learnProgress: [LearnSectionProgress!]!
  }

  extend type Mutation {
    "Record that a slide was viewed; returns the updated section progress."
    recordSlideView(sectionId: ID!, slideIndex: Int!): LearnSectionProgress!
    "Mark a section complete (idempotent)."
    completeSection(sectionId: ID!): LearnSectionProgress!
  }
  ```

- **Client:** debounce `recordSlideView` (batch viewed slides; don't fire one
  mutation per panel). On load, hydrate the menu from `me.learnProgress`. Run the
  typed operations through urql + GraphQL Code Generator like every other call.

### Anonymous (optional `localStorage` fallback)

Mirror the same shape under a `bba.learnProgress` key so an un-logged-in reader
still gets in-session tracking. On sign-in, **merge** any local progress into the
server record (union of viewed slides) so nothing is lost.

---

## Component sketch (when built)

- `useLearnProgress()` — a hook owning the `Map<sectionId, {viewed:Set, completed}>`
  state, the persistence (server mutation for authed, `localStorage` otherwise),
  and a `markViewed(sectionId, slideIndex)` callback the panels call.
- `LearnProgressMenu` — the glass quick-menu component (TOC + status + jump),
  reading from `useLearnProgress`, rendered only when `status === 'authenticated'`
  (from `useAuth`).
- Section containers call `markViewed` from their per-panel observer callbacks.

---

## Scope guardrails

- **Authenticated-gated** menu, per the brief. Don't block content for anyone.
- Keep it **quiet and tasteful** — this is an educational page, not a game. The
  collapse/checkmark is the reward; no streaks, points, or nagging.
- **Privacy consistency:** ironically, a course about data minimization must
  practice it — store only slide indices and completion booleans, nothing
  behavioral, nothing inferred. This is itself a teachable detail (and a nice
  callback to Sections 02/06).
