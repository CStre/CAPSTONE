# Scrollbar

Global themed scrollbar styles. Renders nothing — imported for its CSS side-effect only.

## Files

| File            | Purpose                                       |
| --------------- | --------------------------------------------- |
| `Scrollbar.tsx` | Null-rendering component — CSS import carrier |
| `Scrollbar.css` | WebKit + Firefox scrollbar styles             |

## Usage

Mount once in `App.tsx` alongside `<CustomCursor />`:

```tsx
<Scrollbar />
```

## Design

**Floating pill** — a `3 px solid transparent` border on the thumb creates a visible gap between the thumb and the track. `background-clip: padding-box` stops the gradient from bleeding into that gap, so the thumb appears to float inside the track.

**Gradient thumb** — uses the same palette variables as the canvas animations:

| Theme | Gradient                                                                    |
| ----- | --------------------------------------------------------------------------- |
| dark  | `--color-border` (#124e66 teal) → `--color-accent` (#748d92 blue-grey)      |
| light | `--color-border` (#8697c4 soft blue) → `--color-accent` (#3d52a0 deep blue) |

**Grow on hover** — border shrinks from `3 px` to `1 px` on hover, expanding the visible pill from 4 px to 8 px (within a 10 px track) without any CSS transitions on pseudo-elements (which are unreliable in WebKit).

**Firefox** — `scrollbar-width: thin` + `scrollbar-color` using the same palette variables.

**Theme transitions** — transparent borders avoid the colour flash that occurs when `border: N px solid var(--color-bg)` is used and the background variable changes on theme switch.
