# SecurityInfo

Glass overlay card that explains how user data is protected, in plain language — no technical service names. Triggered from the shield button on the sign-in and sign-up forms.

## Files

| File               | Purpose                                                    |
| ------------------ | ---------------------------------------------------------- |
| `SecurityInfo.tsx` | Component — tilt-animated glass card with five sections    |
| `SecurityInfo.css` | Overlay, card glass recipe, close button, header, sections |

## Usage

```tsx
{
  showSecurity && <SecurityInfo onClose={() => setShowSecurity(false)} />;
}
```

Rendered outside the flip-card DOM so it is not clipped by the card's `backface-visibility`. Clicking the backdrop (outside the card) also calls `onClose`.

## Layout

```
[ × close ]
[ shield icon ]
[ How your data is protected ]
─────────────────────────────
Your password
Two-step verification
What we store
Your session
Deleting your account
```

## Styling

- **Overlay** — `position: fixed; inset: 0; z-index: 900` (below the header at 1000, above all page content). No background tint or blur — the card itself provides the visual separation.
- **Card** — exact glass recipe matching `auth-card` and the header islands: `background: rgba(255,255,255,0.06); backdrop-filter: blur(18px) saturate(180%)`.
- **Tilt** — `useCardTilt(4)` applies the same mouse-reactive 3-D tilt as other glass cards.
- **Entrance** — `si-slide-up` keyframe animation on mount.

## Dependencies

- `useCardTilt` from `GlassIsland` — mouse-reactive 3-D tilt
- `LordIcon` / `ICONS` — shield icon (header) and cross icon (close button)
