# StarfieldAnimation

A fixed full-viewport background canvas: a parallax field of stars with occasional
shooting stars. Built for the Learn page but reusable behind any page.

## Files

| File                     | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `StarfieldAnimation.tsx` | Component — the canvas + the whole animation loop in one effect. |
| `StarfieldAnimation.css` | Fixed, full-viewport, `z-index: 0`, `pointer-events: none`.      |

## Usage

```tsx
const hScrollRef = useRef(0); // optional horizontal parallax driver
<StarfieldAnimation theme={theme} offsetRef={hScrollRef} />;
```

| Prop        | Type                 | Description                                                            |
| ----------- | -------------------- | ---------------------------------------------------------------------- |
| `theme`     | `string`             | `'light'` / `'dark'` — selects the palette tier colors.                |
| `offsetRef` | `RefObject<number>?` | Horizontal parallax offset in px. Mutate `.current`; never re-renders. |

The consumer's content must sit **above** the canvas — give the page's layers
`position: relative; z-index: 1` and transparent backgrounds so the field shows
through.

## How it works

- **Stars** — 150 dots with randomized depth. Depth drives size, base opacity,
  parallax factor, and color tier. The palette matches `useCanvasAnimation` /
  `useStringsAnimation`: dark `--dp-3/4/5`, light `--lp-3/2/1` (faint → bold).
- **Parallax / depth** — each star's screen position is offset by
  `scrollY * parallax` (vertical, from `window.scrollY`) and `offsetRef.current *
parallax` (horizontal). Bolder/closer stars have a larger parallax factor, so they
  drift faster than faint ones; positions wrap modulo the viewport for an endless
  field.
- **Cursor brightening** — stars within `STAR_PROXIMITY` px of the cursor brighten
  and swell, the same idea as the spider canvas's active nodes.
- **Shooting stars** — spawned on a randomized cadence from the top-left region,
  heading bottom-right at ~45° ± ~20° (each one slightly different). Drawn as a
  fading line trail (the strings-animation look). When the cursor is within
  `SHOOT_ORBIT` px, a **capped** gravitational pull bends the streak's path slightly
  toward the cursor — never fully capturing it.

Frame-rate normalized to 60fps (delta-time scaled, capped) so motion matches across
browsers. Mouse tracking is on `window`; the field clears the cursor when it leaves
the viewport.

## Where it's used

- `LearnPage` — the page background. The deck/banner/panels are transparent over it,
  and the active carousel slide drives `offsetRef` for horizontal parallax.
