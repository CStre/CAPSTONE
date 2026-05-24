# auth

Everything related to the Cognito authentication flow: the state machine, individual form components, the page wrapper, and the security-info overlay trigger.

## Files

| File                  | Purpose                                                                            |
| --------------------- | ---------------------------------------------------------------------------------- |
| `LoginPage.tsx`       | Route component — guards the `/login` route, redirects authed users to dashboard   |
| `AuthPanel.tsx`       | State machine — drives the flip-card between sign-in, sign-up, MFA, and TOTP steps |
| `SignInForm.tsx`      | Presentational sign-in form (email + password, eye toggle, confetti on submit)     |
| `SignUpForm.tsx`      | Presentational sign-up form (name + email side-by-side, password strength bar)     |
| `CodeForm.tsx`        | Shared 6-digit code entry (email confirmation and MFA challenge)                   |
| `TotpSetupForm.tsx`   | TOTP enrollment — QR code display + verification code entry                        |
| `flow.ts`             | Pure async functions wrapping Amplify Auth calls; return `NextAction` unions       |
| `context.ts`          | `AuthContext` — exposes `status`, `user`, `reload`, `logout`                       |
| `AuthProvider.tsx`    | Provider — wraps the app, checks session on mount                                  |
| `session.ts`          | Low-level session helpers                                                          |
| `types.ts`            | Shared TypeScript types for auth state and flow results                            |
| `config.ts`           | Amplify configuration (pool ID, client ID, region from env vars)                   |
| `auth.css`            | Flip-card, glass card faces, form layout, inputs, submit button, bottom row        |
| `SignInForm.test.tsx` | RTL tests for the sign-in form                                                     |
| `context.test.tsx`    | Unit tests for auth context state transitions                                      |

## Page flow

```
/login
  └── LoginPage (loading → Loader, authed → /dashboard, else → AuthPanel)
        └── AuthPanel (flip-card state machine)
              ├── front face: SignInForm → CodeForm (MFA) → TotpSetupForm
              └── back face:  SignUpForm → CodeForm (email confirm)
```

Clicking the shield button on either form opens `SecurityInfo` (rendered outside the flip-card so it is not clipped).

## Flip-card

`AuthPanel` renders a 3-D flip card: the front face shows sign-in / MFA steps; the back face shows sign-up / email confirmation. `isFlipped = step === 'signUp' || step === 'confirmSignUp'`.

Card height is **dynamic** — a `ResizeObserver` in `AuthPanel` measures each face's content height and applies it as an inline `height` on the inner div, keeping the glass card tight to its content at all times. The `height` transition is synchronized with the flip rotation (both 0.72 s).

## Visual design

- **Canvas** — `useCanvasAnimation` draws the spider / neural-net animation behind the card.
- **Tilt** — `useCardTilt(2)` on the flip-card scene applies mouse-reactive 3-D tilt.
- **Glass** — `auth-card` uses the exact same glass recipe as the header islands and `SecurityInfo`.
- **Confetti** — `spawnParticles` fires on the submit button click for both sign-in and sign-up.
- **Password strength** — `PasswordStrength` appears as soon as the user starts typing; shows a bar, label, and a 2-column grid of remaining required rules / suggestions.

## Environment variables

| Variable                    | Value                          |
| --------------------------- | ------------------------------ |
| `VITE_COGNITO_USER_POOL_ID` | Cognito user pool ID           |
| `VITE_COGNITO_CLIENT_ID`    | Cognito app client ID          |
| `VITE_GRAPHQL_URL`          | GraphQL endpoint (wired later) |
