# Header

Three-island floating header in the Dynamic Island style, with progressive reveal during the home page intro sequence and a minimal mode for the 404 page.

## Files

| File              | Purpose                                                                 |
| ----------------- | ----------------------------------------------------------------------- |
| `Header.tsx`      | Component — three `GlassIsland` pills in a CSS grid                     |
| `Header.css`      | Grid layout, nav item styles, account dropdown, brand, responsive rules |
| `Header.test.tsx` | RTL tests: nav links present, dropdown accessible                       |

## Layout

```
[ Brand (left) ]   [ Learn · Travel · Sources · Sign In/Account (center) ]   [ ThemeToggle (right) ]
```

CSS grid `1fr auto 1fr` keeps the center island truly page-centred regardless of the flanking island widths.

## Intro-stage integration

`IntroContext` provides `introStage`. The Header reads it to decide which islands and nav items are visible:

| Stage | Left island   | Center island                               | Right island |
| ----- | ------------- | ------------------------------------------- | ------------ |
| −2    | hidden        | hidden                                      | visible      |
| −1    | visible       | all items visible                           | visible      |
| 0–1   | hidden        | Brand + Sign In (no nav items)              | visible      |
| 2     | Brand visible | Learn, Travel (if authed), Sources slide in | visible      |
| 3+    | —             | Sources slides in                           | visible      |

**Stage −2** is set by `NotFoundPage` on mount and reset to −1 on unmount, leaving only the theme toggle visible while the 404 card is on screen.

Nav items use `max-width: 0 → 160px` + `overflow: hidden` with a CSS transition to slide in without affecting the surrounding layout. The center island uses `opacity` + `pointerEvents` for its all-or-nothing hide. The account dropdown uses opacity-only reveal to avoid clipping its menu.

## Account dropdown

The Account nav item is a hover dropdown (`di-nav-account`) containing links to `/account`, `/dashboard`, and a Sign Out button. Sign Out calls `logout()` from `AuthContext` and navigates to `/`.

## Dependencies

- `GlassIsland` — all three islands
- `LordIcon` / `ICONS` — nav icons
- `ThemeToggle` — right island content
- `useIntroStage` from `IntroContext` — progressive reveal and 404 minimal mode
- `useAuth` from auth context — authenticated vs. unauthenticated state
