# GlassIsland

Reusable frosted-glass pill used in the `Header` and anywhere a glass surface is needed.

## Files

| File                  | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `GlassIsland.tsx`     | Component — elastic pull, gooey stretch, and ripple on press          |
| `GlassIsland.css`     | Glass surface, pill shape, dark/light theme variants, ripple keyframe |
| `useElasticOffset.ts` | Hook — gentle `top`/`left` offset toward the cursor within a radius   |
| `useGooeyEffect.ts`   | Hook — spring squash-and-stretch `transform` toward the cursor        |
| `useCardTilt.ts`      | Hook — 3-D `rotateX`/`rotateY` tilt for the home-page intro card      |

## Usage

```tsx
<GlassIsland className="my-variant">{children}</GlassIsland>
```

Props:

| Prop              | Type            | Default | Description                                          |
| ----------------- | --------------- | ------- | ---------------------------------------------------- |
| `className`       | `string`        | —       | Extra class applied alongside `gi-island`            |
| `elasticStrength` | `number`        | `0.18`  | Fraction of cursor distance to follow (0 = no pull)  |
| `elasticRange`    | `number`        | `180`   | Mouse proximity radius in px that activates the pull |
| `style`           | `CSSProperties` | —       | Inline styles merged onto the island                 |

## Effects

### Elastic offset (`useElasticOffset`)

Moves the island toward the cursor using `top`/`left` offsets (not `transform`). The offset is applied only while the cursor is within `elasticRange` px and snaps back to zero on mouse leave. Returns `tx`/`ty` pixel values applied via `style.left`/`style.top`.

### Gooey squash-and-stretch (`useGooeyEffect`)

Spring-physics deformation toward the cursor. When the mouse is within 260 px, the island elongates up to 9% along the cursor axis and compresses ~4% on the perpendicular, creating a cartoon squash-and-stretch feel. The spring (K=0.2, damping=0.55) provides a visible bounce on engage and disengage. Runs in a `requestAnimationFrame` loop writing `transform: scaleX() scaleY()` directly to the DOM — zero React re-renders. The loop pauses automatically when settled.

### Ripple on press

`mousedown` spawns a `.gi-ripple` span inside `.gi-glass`, which clips it to the pill shape via `overflow: hidden`. The ripple scales from 12 px to 22× over 0.65 s and fades out, then self-removes via `animationend`.

## `backdrop-filter` note

`useElasticOffset` uses `top`/`left` offsets instead of `transform` to avoid breaking `backdrop-filter` on the `.gi-glass` child (a Chrome/Safari compositing constraint). `useGooeyEffect` does apply `transform` to the island and briefly degrades the glass blur during active deformation; modern browsers (Chrome 120+, Safari 17+) handle this well.

`useCardTilt` (used by `IntroCard`) is safe because `backdrop-filter` lives on that same element, not on a child.

## `useCardTilt`

Normalises cursor position to `−1 … 1` relative to the element center and maps it to `rotateX`/`rotateY` (default max `3°`). Returns `ref`, `rx`, `ry`, and `isHovered`. Used by `IntroCard` and `SecurityInfo`.
