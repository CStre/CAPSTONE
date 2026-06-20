# Loader

Full-screen loading overlay with five animation variants — one is chosen randomly on mount.

## Files

| File                           | Purpose                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------- |
| `Loader.tsx`                   | Component — picks a variant, renders it via `createPortal` into `document.body` |
| `Loader.css`                   | `.spinner-box` wrapper (fixed, full-screen, centered)                           |
| `loaders/LoaderVariant1–5.tsx` | Individual animation components (markup only)                                   |
| `loaders/LoaderVariant1–5.css` | Keyframe animations for each variant                                            |

## Usage

```tsx
{
  isLoading && <Loader />;
}
```

The overlay is portalled into `document.body` so it always sits above all other content regardless of stacking context. The variant is frozen on the first render via `useState` initializer — it never changes while the overlay is visible.

## Adding a variant

1. Create `loaders/LoaderVariantN.tsx` with the animation markup.
2. Create `loaders/LoaderVariantN.css` with the keyframes.
3. Add `LoaderVariantN` to the `VARIANTS` tuple in `Loader.tsx`.

The wrapper (`.spinner-box`) and screen-covering behaviour stay in `Loader.css` — variant files only render the animation itself.

## Where it's used

- `App.tsx` — shown globally while `AuthContext` resolves the initial session (`status === 'loading'`).
- `HomePage.tsx` — shown for 3 seconds during the canvas animation startup.
