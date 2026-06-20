# StringsAnimation

Canvas animation for the Sources page: rope-like strands and floating specks wander the viewport randomly, and are drawn toward the cursor by simulated gravity when it comes within range.

## Files

| File                     | Purpose                                       |
| ------------------------ | --------------------------------------------- |
| `useStringsAnimation.ts` | Hook — animation loop, physics, theme colours |

## Usage

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);
useStringsAnimation(canvasRef, theme);

return <canvas ref={canvasRef} className="my-canvas" />;
```

Style the canvas as `position: fixed; inset: 0; z-index: 0` so it sits behind all page content. Theme changes **recolour entities in-place** without restarting the animation.

## What's on screen

| Layer   | Count | Description                                                                                             |
| ------- | ----- | ------------------------------------------------------------------------------------------------------- |
| Strands | 22    | Rope-like chains (6–32 segments × 18 px each, ~108–576 px long) drawn as smooth quadratic bezier curves |
| Specks  | 60    | Independent floating dots (1–3.2 px radius)                                                             |

Both layers share the same physics and colour palette.

## Physics

All values are **delta-time normalised to 60 fps** so the animation runs identically on 60 Hz and 120 Hz displays.

### Idle wandering

Each entity's head accumulates a slowly-rotating random heading (`WANDER_DRIFT = 0.62 rad/frame`) and a constant push in that direction (`WANDER_FORCE = 0.38`). Soft wall repulsion (`WALL_MARGIN = 90 px`) keeps them distributed across the page.

### Mouse gravity (`GRAVITY_RADIUS = 320 px`)

When the cursor enters the gravity radius, nearby entities are pulled toward it with inverse-square attraction (`GRAVITY = 5500`). Entities outside the radius keep wandering freely.

### Orbital mode (`ORBIT_RADIUS = 95 px`)

Once a head is within 95 px of the cursor, the radial force is replaced by a tangential push (`ORBIT_FORCE = 2.0`) perpendicular to the cursor vector. Each entity has a random orbit direction (CW or CCW) assigned at construction, so the swarm mixes both directions. A small outward nudge prevents collapse to the centre.

### Rope constraint (strands only)

After each head update, all subsequent segment points are pulled toward their predecessor to maintain `SEG_LEN = 18 px` spacing. This creates the rope/string trailing effect.

### Damping

`Math.pow(DAMPING, dt)` — frame-rate-independent energy decay. At 60 fps `dt = 1` (identity); at 120 fps `dt = 0.5` (same total decay per second).

## Colour palette

Same CSS variables as `useCanvasAnimation`. Each entity stores a `colorIndex` (0–2) so the theme-sync effect patches colours without knowing the random pick.

| Theme | Variables                    |
| ----- | ---------------------------- |
| dark  | `--dp-3`, `--dp-4`, `--dp-5` |
| light | `--lp-1`, `--lp-2`, `--lp-3` |

## Mouse tracking

Tracked on `window` (not the canvas) so events fire even though the canvas is at z-index 0 behind all page content. A viewport bounds check in `mousemove` and a `mouseleave` on `document.documentElement` both clear the mouse, returning all entities to free wandering.

## Where it is used

| Page          | Canvas class     |
| ------------- | ---------------- |
| `SourcesPage` | `sources-canvas` |
