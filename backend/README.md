# Backend

GraphQL API for "Building Better Algorithms" — Node.js + TypeScript, served by
GraphQL Yoga, deployed as an AWS Lambda container image.

## Stack

- **GraphQL Yoga** (server) + **Pothos** (code-first schema)
- **AWS SDK v3** — DynamoDB, holding per-user preference maps + Learn-page progress
- **aws-jwt-verify** — Cognito ID-token verification
- **Jest** (tests), **esbuild** (Lambda bundle), **tsx** (dev runner)

## Layout

```
src/
  config.ts      environment configuration
  countries.ts   the country catalog (static config)
  features.ts    curated image-feature taxonomy (tags + colour → feature vector)
  scoring.ts     taste vectors, country signatures, cosine scoring (A/B shared math)
  recommender.ts confidence/exploration, batch selection, novelty (the A/B loop)
  insights.ts    taste→trait inference + "why this card?" reasons (A/B interpretation)
  dossier.ts     per-user A/B state + applyInteraction orchestration (persistable)
  signatures.ts  per-country feature signatures (from the cached pool, else a seed)
  photos.types.ts  CachedPhoto type (kept apart from the generated data)
  photos.data.ts   generated per-country photo pool (empty until build:photos)
  algorithm.ts   preference-learning logic (ported from v1)
  db.ts          DynamoDB data access (preferences + learnProgress)
  auth.ts        Cognito token verification (+ local dev bypass)
  images.ts      weighted country selection + Unsplash client
  schema.ts      Pothos GraphQL schema
  yoga.ts        GraphQL Yoga server instance
  smsSender.ts   Cognito CustomSMSSender_* trigger — decrypts OTP via AWS Encryption
                 SDK + KMS, delivers via Pinpoint SMS Voice v2 (toll-free number)
  emailSender.ts Cognito CustomEmailSender_* trigger — decrypts OTP via same SDK/KMS,
                 delivers branded HTML + plain-text email via SES; trigger-specific
                 copy for SignUp, Authentication (MFA), ForgotPassword, and attribute
                 verification; both multipart/alternative parts always included
  handler.ts     AWS Lambda entrypoint — routes CustomSMSSender_* to smsSender,
                 CustomEmailSender_* to emailSender, everything else to GraphQL Yoga
  dev.ts         local HTTP dev server
tests/           Jest suites
```

## Learn-page progress

The `User.learnProgress` field returns each touched section's viewed slide indices
(sparse). Three mutations keep it in sync with the client:

- `recordSlideView(sectionId, slideIndex)` — appends a single viewed slide
  (idempotent); fired as the reader completes each slide while signed in.
- `mergeLearnProgress(progress: [LearnSectionProgressInput!]!)` — unions a batch of
  client-side progress into the stored map and returns the full result. Used on
  sign-in to reconcile progress recorded while signed out with whatever the account
  already holds (one write instead of one call per slide).
- `resetLearnProgress` — clears the stored progress map (preferences untouched).
  Wired to the account page's "Clear learning progress" control.

Completion is derived **client-side** from each section's own slide count; the
backend only records which slides were seen.

## Local development

```bash
cp .env.example .env
docker compose up -d        # DynamoDB Local on :8000
npm install
npm run dev                 # GraphQL at http://localhost:4000/graphql
```

- **Auth** — local dev runs with `AUTH_MODE=dev` (default when unset), so no Cognito
  is needed. Override the request identity with `x-dev-user-id` / `x-dev-email` /
  `x-dev-name` headers. The deployed Lambda uses `AUTH_MODE=cognito` (set via
  Terraform) and verifies Cognito ID tokens against the pool's JWKS.
- **Images** — without `UNSPLASH_ACCESS_KEY` set, placeholder images are returned.
  The deployed Lambda receives the key as a Lambda environment variable (KMS-encrypted
  at rest), sourced from the `unsplash_access_key` Terraform variable.

## Scripts

| Command                   | Purpose                                                        |
| ------------------------- | -------------------------------------------------------------- |
| `npm run dev`             | Local server with watch reload                                 |
| `npm run build`           | Bundle the Lambda handler with esbuild                         |
| `npm run typecheck`       | `tsc --noEmit`                                                 |
| `npm test`                | Run the Jest suites                                            |
| `npm run lint` / `format` | ESLint + Prettier                                              |
| `npm run printschema`     | Regenerate `schema.graphql`                                    |
| `npm run build:photos`    | Regenerate the cached photo pool (needs `UNSPLASH_ACCESS_KEY`) |

## Deployment

Built as a Lambda **container image** (`Dockerfile`) and deployed by the CI/CD
pipeline + Terraform — never by hand. See the refactor plan at the repo root.
