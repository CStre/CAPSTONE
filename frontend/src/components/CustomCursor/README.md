# CustomCursor

Replaces the OS cursor with a styled circle that reacts to hover, click, and page leave.

## Files

| File               | Purpose                                                                     |
| ------------------ | --------------------------------------------------------------------------- |
| `CustomCursor.tsx` | Component — renders one `div` and manages all cursor state via DOM events   |
| `CustomCursor.css` | Circle styles, hover scale, click bounce, bubble-pop leave/enter animations |

## Usage

Mounted once in `App.tsx` inside the shared `Layout` wrapper — present on every route.

```tsx
<CustomCursor />
```

## Behaviour

- **Follows the mouse** — `left`/`top` are updated directly on the DOM ref inside `mousemove` (no `setState`, so the component never re-renders after mount).
- **Grows on hover** — when the cursor passes over any `a`, `button`, `input`, `select`, `textarea`, `label`, `[role="button"]`, or focusable element, the `.cc-hover` class is added for a CSS scale-up to 40 px.
- **Bounces on click** — `mousedown` toggles the `.cc-click` class (with a forced reflow between removes so rapid clicks each restart the animation).
- **Bubble-pop on leave** — when the mouse exits the page (`mouseleave` on `document.documentElement`):
  1. The circle plays `cc-pop-out`: grows to ~2.6× then collapses to scale 0.
  2. `spawnPopBurst` fires 8 thin radial lines from the cursor's last position using the Web Animations API — the lines travel outward and fade, like a bubble bursting. Lines match the theme colour and self-remove via `animation.onfinish`.
- **Spring-pop on re-entry** — the first `mousemove` after the cursor was hidden plays `cc-pop-in`: the circle springs in from scale 0, overshoots to 1.35×, then settles at 1.
- **Theme** — `data-theme` is set from `ThemeContext` so CSS colours the circle per theme. Dark mode uses `#d3d9d4` (`--dp-5`); light mode uses `#3d52a0` (`--lp-1`).

## Color

| Theme | Cursor colour | Variable |
| ----- | ------------- | -------- |
| dark  | `#d3d9d4`     | `--dp-5` |
| light | `#3d52a0`     | `--lp-1` |

Mouse events attach to `document` / `document.documentElement` (not the div itself) so the cursor tracks the full viewport regardless of what DOM elements are underneath.
