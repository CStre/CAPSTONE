# CanvasAnimation

Hook and particle-burst utility for the neural-net / spider canvas animation used on the home page, login page, and 404 page.

## Files

| File                    | Purpose                                                                    |
| ----------------------- | -------------------------------------------------------------------------- |
| `useCanvasAnimation.ts` | Hook — starts animation loop, handles resize + theme, cleans up on unmount |
| `spawnParticles.ts`     | Utility — Web Animations API particle burst fired on button clicks         |

## useCanvasAnimation

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);
useCanvasAnimation(canvasRef, theme);

return <canvas ref={canvasRef} className="my-canvas" />;
```

The `theme` string (`'light'` or `'dark'`) comes from `ThemeContext`. The hook re-runs its `useEffect` whenever `theme` changes so colors update without a page reload.

Style the canvas as `position: fixed; inset: 0; z-index: 0` so it sits behind all page content.

### How it works

**1 000 `Tentacle` objects** are scattered across the canvas. Each tentacle is an inverse-kinematics chain of 30 `Segment` objects that all reach toward the current target point.

The **target** follows the mouse while it is over the canvas. When the mouse leaves, the target auto-orbits on a superellipse path centered on the viewport — exponent `p = 8` gives a rounded-rectangle orbit that frames the glass card.

Each animation frame:

1. All tentacles update their segment chain (`move`).
2. Nodes (dots) are drawn first.
3. Tentacle strokes are drawn as smooth quadratic-bezier curves through segment midpoints (no kinks).
4. A glowing head circle is drawn last, on top of everything.

Up to `maxConnections = 20` tentacles draw their strokes per frame — the rest are capped so dense areas don't over-render.

**Device pixel ratio** — the canvas is scaled by `window.devicePixelRatio` so lines and dots are crisp on retina displays.

### Color palette

Colors are read from CSS custom properties at initialization time:

| Theme | Variables used               |
| ----- | ---------------------------- |
| dark  | `--dp-3`, `--dp-4`, `--dp-5` |
| light | `--lp-1`, `--lp-2`, `--lp-3` |

## spawnParticles

```ts
spawnParticles(x, y, theme);
```

Spawns a shockwave ring and 80 mixed dot/spark particles that burst outward from `(x, y)` using the Web Animations API. Uses the same CSS palette variables as `useCanvasAnimation` so the burst feels cohesive with the canvas.

All DOM elements self-remove via `animation.onfinish` — no caller cleanup needed.

No-ops silently in jsdom (test environments) where `Element.prototype.animate` is absent.

### Where it is used

| Call site    | Trigger                             |
| ------------ | ----------------------------------- |
| `HomePage`   | "Get Started" / "Explore" CTA click |
| `SignInForm` | Sign-in submit button click         |
| `SignUpForm` | Create account submit button click  |
