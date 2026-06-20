# Frontend

Single-page app for "Building Better Algorithms" — Vite + React + TypeScript,
deployed to S3 + CloudFront.

## Stack

- **Vite** + **React 19** (TypeScript, strict) — CSS processed by **Lightning CSS**
  (vendor-prefixes `backdrop-filter` etc. from browserslist; esbuild's minifier
  mishandled the prefix pair, breaking frosted-glass surfaces in Chrome)
- **React Router** — client-side routing _(added with the app shell)_
- **urql** + **GraphQL Code Generator** — typed GraphQL operations from the backend schema
- **AWS Amplify Auth** — Cognito sign-in + TOTP MFA (wired to deployed Cognito pool)
- **react-simple-maps** + **world-atlas** — Brochure choropleth (bundled TopoJSON, no
  network fetch at runtime or in tests). It declares a React ≤18 peer (we run React 19),
  so `.npmrc` sets `legacy-peer-deps=true` for both local installs and CI `npm ci`. Its
  transitive `d3-color` is pinned to `^3.1.0` via `package.json` `overrides` (the v2 build
  has a HIGH ReDoS advisory); the resulting ESM-only d3 chain is stubbed in tests via the
  `react-simple-maps` mock (`src/test/reactSimpleMapsMock.tsx`).
- **Jest** + **React Testing Library** — component and client tests

## Layout

```
src/
  main.tsx       app entry — mounts React
  App.tsx        root component
  pages/
    HomePage/      canvas hero + intro slide sequence
    LearnPage/     section-driven course — one section at a time as a controlled
                   carousel (LearnDeck), menu-driven navigation + progress, 5s-dwell
                   completion; "Skip to the demo" button under the intro card jumps to
                   the demo chapter (08, travel-demo) whose completion unlocks Travel;
                   sections/ data, copy from plan/*.md; see plan/ for the plan
    SourcesPage/   glass index-card carousel (scroll-driven scale + spread-apart + cursor tilt)
                   over a faded strings canvas; rAF org-logo marquee (slows on hover, grows the
                   hovered logo), AMA academic references (generated references.ts) + disclosure
    TravelPage/    two-algorithm photo feed: one full-bleed card at a time, double-tap/♥ to
                   like, ✕ to dislike, Skip to pass (keyboard ↑↓→). A driver toggle flips
                   Engagement (A) vs User-First (B); a "See your data" dossier panel shows
                   what A has inferred. Batches interactions to submitFeedback; Unsplash-
                   compliant (hotlinked images, linked photographer+Unsplash credit w/ UTM,
                   trackPhotoUse pings the download endpoint when a photo is used)
    DashboardPage/ react-simple-maps equirectangular world map (bundled world-atlas 50m
                   TopoJSON, Antarctica filtered, full-viewport width) choropleth-shaded by
                   preference score; hover readout is a cursor-following gooey "score chip"
                   (rAF-eased, edge-flips to stay on-screen). NAME_ALIAS reconciles
                   world-atlas vs catalog names. Labelled "Brochure" in the UI (kept
                   "Dashboard" in code/routes); gated behind completing the Learn
                   demo (shows a "your data lives here" card until then)
    AccountPage/   profile (name/email/phone) with User Settings / Data Settings tabs. Rounded buttons (tabs, Messaging terms) + verified badges use the gooey spring; rectangular buttons plus text and inputs use a hover grow (scale). User: name/email/phone, email-based password reset, TOTP re-enrollment; Data: Data Request (download your data / our research), Reset Your Progress (reset learning progress / clear preferences), then Delete account — paired buttons stack as slim, uniform-width rows — each opening a confirm popup ("Reset learning progress" is wired to reset local + DB progress; the others are not yet wired). Reached via the header "Settings" dropdown link (cog icon)
    LoginPage/     Amplify Auth sign-in / sign-up shell
    NotFoundPage/  404
  components/    Header, Loader, GlassIsland, GlassCard (unified frosted-glass card + cursor tilt —
                 the .glass-card CSS recipe lives in index.css), ThemeToggle, CustomCursor,
                 SecurityInfo, PhoneInput, SmsConsent, GooeyButton (gooey+ripple button — used for
                 rounded buttons: the Learn progress toggle, and the pill buttons across the
                 sign-in/up flow + Account page; rectangular buttons and text/inputs use a hover grow),
                 ExploreButton (animated circle-expand CTA — "Get Started"/"Play with Phil" on the
                 home page, and the Dashboard demo-gate "Go to Learn" link; renders a button or a
                 router Link via the `to` prop),
                 Typewriter (typed text), DropdownMenu (shared bouncy dropdown — header + Learn menus;
                 the panel is portaled to <body> and positioned fixed from the trigger, so it floats
                 free of the animated island instead of deforming with it, then carries the island's
                 own elastic cursor-pull + gooey squash while open; account-menu icons play in-reveal
                 on open then hand off to hover),
                 StringsAnimation, CanvasAnimation, StarfieldAnimation (parallax stars
                 + shooting stars — Learn page background), Scrollbar, PasswordStrength
                 (strength meter + checklist, rendered in a GlassCard with the bounce-in reveal)
                 (global `.hover-grow` text utility lives in index.css)
  icons/         LordIcon wrapper + the icon registry, split per-page (header/home/auth/
                 account/learn/sources/travel/notFound) + shared, aggregated as ICONS in index.ts
  lib/           urql client, ThemeContext, IntroContext, pointer.ts (clientToFixed —
                 visual-viewport coord fix for fixed-position pointer followers under
                 pinch-zoom; Safari-only offset, no-op on Chrome/Firefox)
  gql/           GraphQL Code Generator output (generated — do not edit)
  auth/          Cognito wrapper + full auth UI: sign-in/up with phone, email verify,
                 TCPA/CTIA phone-consent step (PhoneConsentForm), SMS phone verify,
                 TOTP setup, forgot-email/password flows (ForgotPanel), email-based password reset
  test/          Jest setup + asset mocks
public/
  icons/         Lordicon JSON files (committed; wired-outline-* saved manually), foldered by
                 page: Header/ HomePage/ AuthPage/ AccountPage/ LearnPage/ SourcesPage/
                 TravelPage/ NotFoundPage/ + shared/ (referenced by 2+ pages). Paths map to
                 the per-page registries in src/icons/
  logos/         Organisation logo images (PNG/SVG) shown in the Sources page marquee
                 See public/logos/README.md for the full file → organisation mapping
```

## Home page intro sequence

Unauthenticated visitors see a glass card that cycles through six intro slides
before the **Get Started** CTA appears. Slides advance manually via a circular
chevron button. The header reveals nav items progressively as slides advance —
brand centered with Sign In at stage 0–1, then splits at stage 2 with the full
nav in the center island (true page-center via CSS grid `1fr auto 1fr`).

Authenticated users skip the intro entirely — the canvas animation plays on its
own with the full header already visible.

**Tab reveal choreography (center island).** When a nav tab appears, the island
first opens the space (the item's `max-width` expands) and _then_ the content fades
in and its icon plays its in-reveal (`navReveal()` sequences width→content on show,
and content→width on hide so a tab fades out before the island shrinks — e.g. when
Travel locks again after a progress reset). Each center icon (`NavIcon`) plays its
in-reveal then hands off to hover; it replays on page load / when the loader clears
(keyed by `iconKey`, which flips when auth status leaves `loading`) and whenever the
tab itself appears. Reveal timing is the `NAV_REVEAL_DELAY_MS` constant in
`Header.tsx`.

## Learn progress & the Travel gate

`LearnProgressProvider` (in `pages/LearnPage/LearnProgressContext.tsx`) is mounted
at the app root (`main.tsx`) so progress is readable everywhere — the Header,
Dashboard, and Account page, not just the Learn page. It exposes `useLearnProgress`
(throws outside the provider) and `useLearnProgressOptional` (returns `null` instead
— for components that also render in isolated tests, e.g. the Header).

- **Travel tab** — shown only when `authenticated && demoComplete`. `demoComplete`
  means every slide of the demo chapter (section 08, `travel-demo`) has been viewed.
  Because the Header and the Learn deck read the same provider, finishing the demo
  flips the tab in immediately (no refetch).
- **Dashboard** — login-gated by the router, then additionally gated on
  `demoComplete`; until then it renders a "finish the demo first" card.
- **Persistence** — progress is always written to `localStorage` (`bba.learnProgress`);
  signed-in users also persist per-slide (`recordSlideView`). On **sign-in**, local
  progress is unioned into the account with a single `mergeLearnProgress` mutation
  (handles the "had offline progress _and_ existing account progress" case). On
  **sign-out**, local progress is cleared and cached server progress is ignored, so
  nothing leaks to the next visitor on the browser.
- **Reset** — Account → Data Settings → "Clear learning progress" calls
  `resetProgress()`, which clears local storage and (when signed in) calls
  `resetLearnProgress` then refetches so the now-empty server state sticks.

## Local development

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

Run the backend (`../backend`, `npm run dev`) alongside it — Vite proxies
`/graphql` to `http://localhost:4000`. After a backend schema change, re-run
`npm run codegen` to refresh the typed operations in `src/gql/`.

## Scripts

| Command             | Purpose                             |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Vite dev server with HMR            |
| `npm run build`     | Type-check, then build to `dist/`   |
| `npm run preview`   | Serve the production build locally  |
| `npm run typecheck` | `tsc` over app + tooling configs    |
| `npm run codegen`   | Regenerate typed GraphQL operations |
| `npm test`          | Run the Jest suites                 |
| `npm run lint`      | ESLint + Prettier check             |
| `npm run format`    | Prettier write                      |

## Deployment

Built to static assets, published to S3, and served via CloudFront by the
CI/CD pipeline + Terraform — never by hand. See the refactor plan at the repo root.
