# GlassIsland

Reusable frosted-glass pill used in the `Header` and anywhere a glass surface is needed.

## Files

| File                  | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `GlassIsland.tsx`     | Component — renders the island with an elastic cursor pull          |
| `GlassIsland.css`     | Glass surface, pill shape, dark/light theme variants                |
| `useElasticOffset.ts` | Hook — gentle `top`/`left` offset toward the cursor within a radius |
| `useCardTilt.ts`      | Hook — 3-D `rotateX`/`rotateY` tilt for the home-page intro card    |

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

## `backdrop-filter` constraint

`GlassIsland` uses `useElasticOffset` which moves the element via `top`/`left` offsets — **not `transform`**. This is intentional: applying `transform` to an ancestor of a `backdrop-filter` element breaks the blur in Chrome and Safari. If you need motion on a glass element, use `top`/`left` offsets.

`useCardTilt` (used by `IntroCard`) applies `transform: rotateY` on the card itself and is safe because `backdrop-filter` lives on that same element, not on a child.

## `useElasticOffset`

Tracks mouse position relative to the element, applies the offset only while the cursor is within `elasticRange` pixels, and snaps back to `(0, 0)` when the mouse leaves. The offset is returned as pixel strings (`tx`, `ty`) ready to pass directly to `style.left` / `style.top`.

## `useCardTilt`

Normalises cursor position to `−1 … 1` relative to the element center and maps it to a small `rotateX`/`rotateY` angle (default max `3°`). Returns `rx`, `ry`, `isHovered`, and a `ref` to attach to the target element. Used by `IntroCard` on the home page.
