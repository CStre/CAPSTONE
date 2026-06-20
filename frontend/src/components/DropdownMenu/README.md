# DropdownMenu

Shared, bouncy dropdown — a glass panel that springs open and staggers its items
in one after another. Used by the Header account menu and the Learn-page progress
menu so both share one format and animation.

## Files

| File               | Purpose                                                              |
| ------------------ | -------------------------------------------------------------------- |
| `DropdownMenu.tsx` | Component — renders trigger + panel, closes on outside click/Escape. |
| `DropdownMenu.css` | Glass panel (header-island recipe), spring open, item stagger.       |

## Usage

Controlled — the consumer owns `open` and wires its own trigger's `onClick`:

```tsx
<DropdownMenu
  open={open}
  onClose={() => setOpen(false)}
  align="left" // | "center" | "right"
  panelClassName="my-width"
  ariaLabel="Sections"
  trigger={<GooeyButton onClick={() => setOpen((o) => !o)}>Menu</GooeyButton>}
>
  <button role="menuitem">One</button>
  <button role="menuitem">Two</button>
</DropdownMenu>
```

| Prop             | Type                            | Default  | Description                                  |
| ---------------- | ------------------------------- | -------- | -------------------------------------------- |
| `open`           | `boolean`                       | —        | Whether the panel is shown.                  |
| `onClose`        | `() => void`                    | —        | Called on outside click or Escape.           |
| `trigger`        | `ReactNode`                     | —        | The clickable trigger (wire its own toggle). |
| `align`          | `'left' \| 'center' \| 'right'` | `'left'` | Panel alignment relative to the trigger.     |
| `panelClassName` | `string`                        | —        | Extra class on the panel (e.g. width).       |
| `ariaLabel`      | `string`                        | —        | `aria-label` on the menu panel.              |

## How it works

- **Spring open:** the panel scales up from its alignment origin with a
  `cubic-bezier(0.34, 1.56, 0.64, 1)` overshoot.
- **Staggered items:** each direct child is wrapped in a `.dropdown-item` carrying
  a `--stagger` index; CSS delays each item's bounce-in by `index * 45ms`.
- **Close behaviour:** the component listens on `document` for an outside
  `mousedown` and the Escape key while open.
- Honors `prefers-reduced-motion` (no spring / stagger).

## Where it's used

- `Header` — the account menu.
- `LearnPage` — the progress / section-navigation menu.
