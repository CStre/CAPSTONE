# PhoneInput

Country-code + local-number phone field that emits E.164 (`+{code}{digits}`) via `onChange`.

## Files

| File             | Purpose                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `PhoneInput.tsx` | Component — country code field + auto-formatted local number field |
| `PhoneInput.css` | Side-by-side layout, separator, field sizing                       |

## Usage

```tsx
<PhoneInput
  value={e164} // e.g. "+15550001234"
  onChange={setE164}
  required
/>
```

## Props

| Prop        | Type                     | Default | Description                                         |
| ----------- | ------------------------ | ------- | --------------------------------------------------- |
| `value`     | `string`                 | `''`    | Current E.164 value (`+{code}{digits}`)             |
| `onChange`  | `(e164: string) => void` | —       | Called with the new E.164 string on every keystroke |
| `required`  | `boolean`                | —       | Passed to the local number `<input>`                |
| `disabled`  | `boolean`                | —       | Disables both fields                                |
| `autoFocus` | `boolean`                | —       | Auto-focuses the local number field                 |

## Two-field design

**Country code** — free-text `+{1–2 digit}` input (e.g. `+1`, `+44`). Digits only; non-numeric characters are stripped. Max 2 digits.

**Local number** — auto-formats up to 10 digits as `(NXX) NXX-XXXX` while the user types. Raw digits are extracted before formatting to keep the E.164 emission clean.

**E.164 output** — `+{countryCode}{digits}` is emitted via `onChange` on every change. An empty number field emits an empty string.

## Parsing

`parseE164` hydrates the two internal fields from an incoming `value`. A 12-character E.164 string is assumed to be a 2-digit country code + 10-digit local number; anything else is treated as a 1-digit country code.

## Where it's used

- `auth/` sign-up flow — phone number collection step
- `AccountPage` — phone number update form
