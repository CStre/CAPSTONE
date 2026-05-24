# LordIcon

Typed React wrapper around the Lordicon `<lord-icon>` custom element, plus the app-wide icon registry.

## Files

| File           | Purpose                                                          |
| -------------- | ---------------------------------------------------------------- |
| `LordIcon.tsx` | `LordIcon` component, `ICONS` registry, `useLordIconColors` hook |

## Usage

```tsx
import { ICONS, LordIcon } from '../LordIcon/LordIcon';

<LordIcon src={ICONS.learn} trigger="hover" size={32} />;
```

All icon paths live in the `ICONS` constant — no component hardcodes a raw filename. To swap or add an icon, drop the updated JSON into `public/icons/` and update the `ICONS` entry.

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

All `.json` files are committed to `public/icons/`. The `wired-outline-*` files were saved manually from the Lordicon site. Obfuscated-name files (e.g. `gjhbhscz.json`) are Lordicon exports — the `ICONS` keys give them readable names.
