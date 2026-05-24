# Frontend

Single-page app for "Building Better Algorithms" — Vite + React + TypeScript,
deployed to S3 + CloudFront.

## Stack

- **Vite** + **React 19** (TypeScript, strict)
- **React Router** — client-side routing _(added with the app shell)_
- **urql** + **GraphQL Code Generator** — typed GraphQL operations from the backend schema
- **AWS Amplify Auth** — Cognito sign-in + TOTP MFA (wired to deployed Cognito pool)
- **Jest** + **React Testing Library** — component and client tests

## Layout

```
src/
  main.tsx       app entry — mounts React
  App.tsx        root component
  pages/
    HomePage/      canvas hero + intro slide sequence
    LearnPage/     essay with scroll-scale panels
    SourcesPage/   academic sources and acknowledgements
    TravelPage/    swipe-to-rate photo cards
    DashboardPage/ GeoChart world map of preference scores
    AccountPage/   profile, password, TOTP re-enrollment, and account deletion
    LoginPage/     Amplify Auth sign-in / sign-up shell
    NotFoundPage/  404
  components/    Header, Loader, GlassIsland, LordIcon, ThemeToggle, CustomCursor, SecurityInfo
  lib/           urql client, ThemeContext, IntroContext
  gql/           GraphQL Code Generator output (generated — do not edit)
  auth/          Cognito wrapper + MFA UI (SignInForm, SignUpForm with eye toggle + placeholders)
  test/          Jest setup + asset mocks
public/
  icons/         Lordicon JSON files (committed; wired-outline-* saved manually)
                 Includes: login, logout, eye, avatar-user, avatar-plus, shield-lock, cross icons
```

## Home page intro sequence

Unauthenticated visitors see a glass card that cycles through six intro slides
before the **Get Started** CTA appears. Slides advance manually via a circular
chevron button. The header reveals nav items progressively as slides advance —
brand centered with Sign In at stage 0–1, then splits at stage 2 with the full
nav in the center island (true page-center via CSS grid `1fr auto 1fr`).

Authenticated users skip the intro entirely — the canvas animation plays on its
own with the full header already visible.

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
