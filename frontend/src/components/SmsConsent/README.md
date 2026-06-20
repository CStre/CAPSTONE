# SmsConsent

TCPA/CTIA-required SMS terms disclosure modal shown before a user opts in to phone verification.

## Files

| File             | Purpose                                                     |
| ---------------- | ----------------------------------------------------------- |
| `SmsConsent.tsx` | Component — glass card modal portalled into `document.body` |

No dedicated CSS file — reuses `SecurityInfo/SecurityInfo.css` (`.si-overlay`, `.si-card`, `.si-header`, `.si-section`).

## Usage

```tsx
{
  showSmsConsent && <SmsConsent onClose={() => setShowSmsConsent(false)} />;
}
```

## Props

| Prop      | Type         | Description                              |
| --------- | ------------ | ---------------------------------------- |
| `onClose` | `() => void` | Called on close button or backdrop click |

## Behaviour

- Rendered via `createPortal` into `document.body` so it escapes any CSS transform stacking context (the auth card's 3-D tilt would otherwise trap `position: fixed` children).
- Clicking the backdrop (outside the card) calls `onClose`.
- The `<lord-icon>` plays a `"in"` animation for 2 s on mount, then switches to `"hover"` trigger for ongoing interaction.
- `useCardTilt(1.5)` applies a subtle mouse-reactive 3-D tilt (max 1.5°) matching the `SecurityInfo` pattern.

## Content

Six sections covering TCPA/CTIA requirements:

1. **What we send** — one-time verification codes only; no marketing
2. **Message frequency** — only on explicit user request
3. **Rates** — carrier message and data rates may apply
4. **Opt out** — reply STOP, or skip verification entirely
5. **Help** — reply HELP or use in-app contact
6. **Carriers** — not liable for delayed/undelivered messages

## Dependencies

- `useCardTilt` from `GlassIsland` — mouse-reactive 3-D tilt
- `LordIcon` / `ICONS` — chat-verify icon (header) and close icon
- `SecurityInfo/SecurityInfo.css` — overlay and card glass styles (shared)
