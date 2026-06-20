# GooeyButton

A real `<button>` with the header-island feel — spring squash-and-stretch toward
the cursor plus a ripple on press. Visual styling (glass background, shape) is left
to the consumer's `className`; this component only adds the motion, ripple, and
clipping.

## Files

| File              | Purpose                                                         |
| ----------------- | --------------------------------------------------------------- |
| `GooeyButton.tsx` | Component — wraps `<button>` with `useGooeyEffect` + ripple.    |
| `GooeyButton.css` | `.gooey-btn` scaffolding (position/overflow) + ripple keyframe. |

## Usage

```tsx
<GooeyButton className="my-glass-pill" aria-label="Next" onClick={next}>
  ›
</GooeyButton>
```

All standard `<button>` props pass through (`onClick`, `disabled`, `aria-*`, …).
It defaults to `type="button"`.

## How it works

- **Squash-and-stretch:** reuses `GlassIsland/useGooeyEffect` (now generic over any
  `HTMLElement`) — the button elongates toward the cursor and springs back. Because
  it writes `transform` directly, avoid a conflicting `transform` on `:hover` in the
  consumer's styles.
- **Ripple:** `mousedown` spawns a `.gooey-ripple` span clipped to the button by
  `overflow: hidden`; it self-removes on `animationend`. Hidden under
  `prefers-reduced-motion`.

## Where it's used

- `LearnPage` — the progress-menu toggle, the dash-bar ‹ › arrows, and the
  back-to-the-beginning button.
