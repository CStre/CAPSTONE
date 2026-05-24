# Backend

GraphQL API for "Building Better Algorithms" — Node.js + TypeScript, served by
GraphQL Yoga, deployed as an AWS Lambda container image.

## Stack

- **GraphQL Yoga** (server) + **Pothos** (code-first schema)
- **AWS SDK v3** — DynamoDB, holding per-user preference maps
- **aws-jwt-verify** — Cognito ID-token verification
- **Jest** (tests), **esbuild** (Lambda bundle), **tsx** (dev runner)

## Layout

```
src/
  config.ts      environment configuration
  countries.ts   the country catalog (static config)
  algorithm.ts   preference-learning logic (ported from v1)
  db.ts          DynamoDB data access
  auth.ts        Cognito token verification (+ local dev bypass)
  images.ts      weighted country selection + Unsplash client
  schema.ts      Pothos GraphQL schema
  yoga.ts        GraphQL Yoga server instance
  handler.ts     AWS Lambda entrypoint
  dev.ts         local HTTP dev server
tests/           Jest suites
```

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

| Command                   | Purpose                                |
| ------------------------- | -------------------------------------- |
| `npm run dev`             | Local server with watch reload         |
| `npm run build`           | Bundle the Lambda handler with esbuild |
| `npm run typecheck`       | `tsc --noEmit`                         |
| `npm test`                | Run the Jest suites                    |
| `npm run lint` / `format` | ESLint + Prettier                      |

## Deployment

Built as a Lambda **container image** (`Dockerfile`) and deployed by the CI/CD
pipeline + Terraform — never by hand. See the refactor plan at the repo root.
