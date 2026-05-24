# CustomCursor

Replaces the OS cursor with a styled circle that reacts to hover and click.

## Files

| File               | Purpose                                                                   |
| ------------------ | ------------------------------------------------------------------------- |
| `CustomCursor.tsx` | Component — renders one `div` and manages all cursor state via DOM events |
| `CustomCursor.css` | Circle styles, hover scale, click bounce animation                        |

## Usage

Mounted once in `App.tsx` inside the shared `Layout` wrapper — present on every route.

```tsx
<CustomCursor />
```

## Behaviour

- **Follows the mouse** — `left`/`top` are updated directly on the DOM ref inside `mousemove` (no `setState`, so the component never re-renders after mount).
- **Grows on hover** — when the cursor passes over any `a`, `button`, `input`, `select`, `textarea`, `label`, `[role="button"]`, or focusable element, the `.cc-hover` class is added for a CSS scale-up.
- **Bounces on click** — `mousedown` toggles the `.cc-click` class (with a forced reflow between removes so rapid clicks each restart the animation).
- **Hides at viewport edge** — `mouseleave` on `document` sets `opacity: 0`.
- **Theme** — `data-theme` is set from `ThemeContext` so CSS can color the circle per theme.

All event listeners attach to `document` (not the div) so the cursor tracks the full viewport.
