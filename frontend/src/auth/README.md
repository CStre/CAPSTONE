# auth

Everything related to the Cognito authentication flow: the state machine, individual form components, the page wrapper, and the security-info overlay trigger.

## Files

| File                   | Purpose                                                                                 |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `LoginPage.tsx`        | Route component — guards the `/login` route, redirects authed users to dashboard        |
| `AuthPanel.tsx`        | State machine — drives the flip-card across all sign-in, sign-up, MFA, and forgot steps |
| `SignInForm.tsx`       | Presentational sign-in form (email + password, eye toggle, confetti on submit)          |
| `SignUpForm.tsx`       | Presentational sign-up form (name + email side-by-side, password strength bar)          |
| `CodeForm.tsx`         | Shared 6-digit code entry (email confirmation, MFA challenge, phone verification)       |
| `TotpSetupForm.tsx`    | TOTP enrollment — QR code display + verification code entry; optional skip button       |
| `PhoneConsentForm.tsx` | TCPA/CTIA SMS disclosure shown after email verification; user verifies or skips phone   |
| `ForgotPanel.tsx`      | Presentational sub-forms for the forgot-email and forgot-password recovery flows        |
| `flow.ts`              | Pure async functions wrapping Amplify Auth calls; return `NextAction` unions            |
| `context.ts`           | `AuthContext` — exposes `status`, `user`, `reload`, `logout`                            |
| `AuthProvider.tsx`     | Provider — wraps the app, checks session on mount                                       |
| `session.ts`           | Low-level session helpers                                                               |
| `types.ts`             | Shared TypeScript types for auth state and flow results                                 |
| `config.ts`            | Amplify configuration (pool ID, client ID, region from env vars)                        |
| `auth.css`             | Flip-card, glass card faces, form layout, inputs, submit button, bottom row             |
| `AuthPanel.test.tsx`   | RTL integration tests for the AuthPanel state machine (sign-in, MFA, forgot flows)      |
| `SignInForm.test.tsx`  | RTL tests for the sign-in form                                                          |
| `context.test.tsx`     | Unit tests for auth context state transitions                                           |

## Page flow

```
/login
  └── LoginPage (loading → Loader, authed → /dashboard, else → AuthPanel)
        └── AuthPanel (flip-card state machine)
              ├── front face (sign-in branch)
              │     signIn
              │       ├─→ mfaCode        (TOTP challenge)
              │       ├─→ mfaEmail       (email OTP challenge)
              │       ├─→ mfaSelect      (user has both; pick TOTP or email)
              │       │     ├─→ mfaCode
              │       │     └─→ mfaEmail
              │       └─→ totpSetup      (Cognito forces TOTP enroll on first sign-in)
              │
              ├── front face (forgot branch — entered via "Forgot?" link)
              │     forgotChoice
              │       ├─→ forgotEmailPhone → forgotEmailCode → signIn
              │       └─→ forgotPasswordEmail → forgotPasswordCode → signIn
              │
              ├── front face (post sign-up branch — entered after email confirmation)
              │     phoneConsent
              │       ├─→ confirmPhone → totpEnroll
              │       └─→ (skip)       → totpEnroll
              │                               ├─→ done  (TOTP enrolled → reload)
              │                               └─→ (skip, sets email MFA preferred → reload)
              │
              └── back face (sign-up branch)
                    signUp → confirmSignUp → (front face: phoneConsent …)
```

When `beginSignIn` returns `done` with no MFA challenge (account has no MFA preference set), `AuthPanel` silently calls `setEmailMfaPreferred` so every subsequent sign-in requires an email OTP.

Clicking the shield button on either sign-in or sign-up form opens `SecurityInfo` (rendered outside the flip-card so it is not clipped).

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
