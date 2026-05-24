# HomePage

Landing page: canvas neural-net animation + an intro slide sequence for unauthenticated visitors.

## Files

| File                | Purpose                                                                       |
| ------------------- | ----------------------------------------------------------------------------- |
| `HomePage.tsx`      | Page root — orchestrates auth bypass, canvas, loader, and `IntroCard`         |
| `HomePage.css`      | Page-level layout: `.home` wrapper, `.home-canvas`, `.home-loader`            |
| `IntroCard.tsx`     | Frosted-glass card: slide content, progress bar, next button, Get Started CTA |
| `IntroCard.css`     | All card-specific styles (glass, progress timeline, explore button)           |
| `useIntroSlides.ts` | State machine for the 6-slide sequence (entering → visible → exiting phases)  |
| `spawnParticles.ts` | Web Animations API burst effect triggered by the Get Started button           |
| `HomePage.test.tsx` | RTL tests: Next button present for visitors; card absent for authed users     |

## Behaviour

**Unauthenticated** — a frosted-glass `IntroCard` sits in the viewport center. The user manually advances through six slides with a circular chevron button. After the last slide is fully visible, the **Get Started** CTA fades in. Clicking it fires a particle burst then navigates to `/login`.

**Authenticated** — the card is never rendered. The canvas plays on its own; the header shows all nav items immediately.

## Slide sequence

Defined in `useIntroSlides.ts` as a `const` array of `{ title, subtitle | null }` objects. Advancing triggers an _exiting_ fade-out, then the index increments and an _entering_ fade-in begins (double-`requestAnimationFrame` to give the browser a frame at `opacity:0` before animating to `1`).

## Header integration

`IntroContext` (`src/lib/IntroContext.tsx`) holds the current stage number. `HomePage` calls `setIntroStage(slideIndex)` on every slide change so the `Header` can progressively reveal nav items (brand, Learn, Sources) as the user advances. Stage `-1` means intro is off (authenticated users or any other page).

## Canvas animation

`useCanvasAnimation` (in `src/components/CanvasAnimation/`) drives 1 000 tentacle segments that follow the cursor (or auto-orbit on a superellipse path when the mouse is idle). It reinitializes on theme change to pick up the correct CSS palette variables.

## Particle burst

`spawnParticles(x, y, theme)` creates a shockwave ring and 80 dot/spark particles outward from the click point using the Web Animations API. All DOM elements self-remove via `animation.onfinish` — no cleanup needed by the caller. Colors are read from the same CSS palette variables as the canvas.
