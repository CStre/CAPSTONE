# icons

Typed React wrapper around the Lordicon `<lord-icon>` custom element, plus the app-wide icon registry — split by page and re-exported from one barrel.

## Files

| File           | Purpose                                                                   |
| -------------- | ------------------------------------------------------------------------- |
| `index.ts`     | Barrel — re-exports `LordIcon`/`useLordIconColors` and aggregates `ICONS` |
| `LordIcon.tsx` | `LordIcon` component + `useLordIconColors` hook                           |
| `header.ts`    | `HEADER_ICONS` — Header navigation icons                                  |
| `home.ts`      | `HOME_ICONS` — HomePage intro + greeting icons                            |
| `auth.ts`      | `AUTH_ICONS` — sign-in/up, MFA, forgot-flow icons                         |
| `account.ts`   | `ACCOUNT_ICONS` — AccountPage icons                                       |
| `learn.ts`     | `LEARN_ICONS` — deck status + per-lesson slide icons                      |
| `sources.ts`   | `SOURCES_ICONS` — SourcesPage icons                                       |
| `travel.ts`    | `TRAVEL_ICONS` — TravelPage icons                                         |
| `notFound.ts`  | `NOT_FOUND_ICONS` — 404 page icon                                         |
| `shared.ts`    | `SHARED_ICONS` — icons used by 2+ pages or shared components              |

The JSON files mirror this split under `public/icons/<Page>/` (and `public/icons/shared/`).

## Usage

```tsx
import { ICONS, LordIcon } from '../../icons';

<LordIcon src={ICONS.learn} trigger="hover" size={32} />;
```

`ICONS` is the flat aggregate of every per-page registry, so any icon is reachable as `ICONS.<name>` regardless of which module defines it — no component hardcodes a raw filename. To swap or add an icon, drop the JSON into the matching `public/icons/<Page>/` folder and add the entry to that page's registry module (or `shared.ts` if more than one page uses it).

## Props

| Prop      | Type                             | Default   | Description                                                         |
| --------- | -------------------------------- | --------- | ------------------------------------------------------------------- |
| `src`     | `string`                         | required  | Path to the Lordicon JSON file (use `ICONS.*`)                      |
| `size`    | `number`                         | `40`      | Uniform width and height in px                                      |
| `trigger` | string                           | `'hover'` | Lordicon animation trigger                                          |
| `stroke`  | `'bold' \| 'regular' \| 'light'` | `'bold'`  | Stroke weight                                                       |
| `colors`  | `string`                         | auto      | `primary:hex,secondary:hex` — defaults to the current theme palette |
| `state`   | `string`                         | —         | Lordicon state name                                                 |
| `target`  | `string`                         | —         | CSS selector for the hover target element                           |
| `delay`   | `string \| number`               | —         | Animation delay                                                     |

## `useLordIconColors`

Returns `{ primary, secondary }` hex strings for the current theme. Used internally by `LordIcon` when no `colors` prop is passed, and also exported for components that need the raw color values (e.g. `Header` constructs a `colors` string manually for the danger variant).

## Icon files

All `.json` files are committed under `public/icons/`, foldered by page (`Header/`, `HomePage/`, `AuthPage/`, `AccountPage/`, `LearnPage/`, `SourcesPage/`, `TravelPage/`, `NotFoundPage/`) plus `shared/` for files referenced by more than one page. The `wired-outline-*` files were saved manually from the Lordicon site. Obfuscated-name files (e.g. `gjhbhscz.json`) are Lordicon exports — the `ICONS` keys give them readable names. A handful of unused exports remain at the top level of `public/icons/`.
