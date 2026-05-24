# ThemeToggle

Animated day/night toggle switch. Checkbox `checked` = dark mode.

## Files

| File              | Purpose                                                    |
| ----------------- | ---------------------------------------------------------- |
| `ThemeToggle.tsx` | Component — checkbox + SVG sun/moon/cloud/star decorations |
| `ThemeToggle.css` | Slider animation, sun rays, moon dots, cloud puffs, stars  |

## Usage

```tsx
<ThemeToggle />
```

Theme state lives in `ThemeContext` (`src/lib/ThemeContext.tsx`). The toggle reads `theme` and calls `toggle()` from that context — it has no local state. The `aria-label` on the wrapping `<label>` describes the current action (`"Switch to light mode"` / `"Switch to dark mode"`).

## Where it's used

Mounted in the right island of `Header`, visible on every route.
