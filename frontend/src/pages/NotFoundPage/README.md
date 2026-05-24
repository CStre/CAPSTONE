# NotFoundPage

Full-page 404 experience with the spider canvas animation and a glass card — auto-redirects to `/` after 5 seconds. Shows only the theme toggle in the header while on-screen.

## Files

| File                    | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| `NotFoundPage.tsx`      | Component — canvas, glass card, countdown, redirect  |
| `NotFoundPage.css`      | Canvas, page wrapper, glass card, content styles     |
| `NotFoundPage.test.tsx` | RTL test: error heading and redirect message present |

## Behaviour

- Mounts → sets `introStage = -2`, hiding the header's left and center islands (only the theme toggle remains).
- Unmounts → resets `introStage = -1` so the full header comes back after the redirect fires.
- A `setInterval` ticks `countdown` down from 4 each second.
- A `setTimeout` calls `navigate('/')` at 5 000 ms.

## Layout

```
[ canvas — full viewport, z-index 0 ]
[ auth-panel-style wrapper, z-index 1 ]
  └── [ glass card, max-width 44rem ]
        [ LordIcon notFound — loop animation ]
        [ Error 404 ]
        [ humorous message ]
        [ redirect sub-text ]
        [ countdown / "Blast Off" ]
```

## Styling

The card uses the exact same glass recipe as `auth-card` and `si-card`:
`background: rgba(255,255,255,0.06); backdrop-filter: blur(18px) saturate(180%)`.

`useCardTilt(4)` applies mouse-reactive 3-D tilt. An `nf-slide-up` keyframe animates the card in on mount.

## Dependencies

- `useCanvasAnimation` + canvas — spider animation background
- `useCardTilt` from `GlassIsland` — mouse-reactive tilt
- `useIntroStage` from `IntroContext` — hides header islands while on-screen
- `LordIcon` / `ICONS.notFound` — animated 404 illustration
