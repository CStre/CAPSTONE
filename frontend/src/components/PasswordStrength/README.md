# PasswordStrength

Password strength bar + label + disappearing rules checklist — shows nothing when the field is empty.

## Files

| File                   | Purpose                                                           |
| ---------------------- | ----------------------------------------------------------------- |
| `PasswordStrength.tsx` | Component + `getStrength` helper                                  |
| `PasswordStrength.css` | Bar fill/color transitions, label colors, rule collapse animation |

## Usage

```tsx
<PasswordStrength password={passwordValue} />
```

Renders a filled bar, a strength label, and a list of unmet rules beneath it. All three are suppressed when `password` is empty.

## Two-phase evaluation

### Required rules

Shown individually below the label as bullet items. Each collapses and fades out (`max-height` + `opacity` transition) as the user satisfies it. The whole section unmounts once all five pass.

| Rule      | Requirement                    |
| --------- | ------------------------------ |
| Length    | At least 8 characters          |
| Uppercase | One uppercase letter (A–Z)     |
| Lowercase | One lowercase letter (a–z)     |
| Number    | One digit (0–9)                |
| Special   | One non-alphanumeric character |

### Suggestions

Appear (with a fade-in animation) once all required rules pass. Collapse individually the same way. The whole section unmounts once all three pass.

| Suggestion    | Requirement                             |
| ------------- | --------------------------------------- |
| Length+       | 16 or more characters                   |
| Multi-special | Two or more special characters          |
| No repeats    | No character repeated 3+ times in a row |

## Strength levels

| State               | Label           | Icon                   | Bar color       | Bar fill |
| ------------------- | --------------- | ---------------------- | --------------- | -------- |
| Required unmet      | Weak password   | error-cross (red)      | red `#ef4444`   | 0–70%    |
| All required met    | Okay password   | _(none)_               | amber `#f59e0b` | 70%      |
| All suggestions met | Strong password | approved-check (green) | green `#22c55e` | 100%     |

The bar fills 0–70% across the five required rules, then 70–100% across the three suggestions. The label and icon update in real time using `trigger="in"` for an entrance animation on each transition.

## Where it's used

- `auth/` sign-up form (new account creation)
- `AccountPage` password change form
