# Typewriter

Reusable typewriter effect — reveals a string one character at a time. Part of the
"living text" theme (pair it with the global `.hover-grow` utility in `index.css`).

## Files

| File               | Purpose                                         |
| ------------------ | ----------------------------------------------- |
| `useTypewriter.ts` | Hook — returns the revealed substring + `done`. |

## Usage

```tsx
const { shown, done } = useTypewriter(text, { speed: 22, enabled: active, onDone });
```

| Option    | Type         | Default | Description                                                             |
| --------- | ------------ | ------- | ----------------------------------------------------------------------- |
| `speed`   | `number`     | `22`    | Milliseconds per character.                                             |
| `enabled` | `boolean`    | `true`  | When false the hook is inert — reports full text, never fires `onDone`. |
| `onDone`  | `() => void` | —       | Called once the whole string is revealed.                               |

Returns `{ shown, done }`.

## Notes

- **No reflow pattern:** to keep text from shifting as it types, render `shown`
  followed by the untyped remainder (`text.slice(shown.length)`) in an invisible
  span (`opacity: 0`) so the final layout is reserved from the start. See
  `LearnPage/components/LearnSlide.tsx` for the canonical use.
- State only changes inside the interval callback (progress is keyed to its text),
  so it satisfies the `react-hooks/set-state-in-effect` lint rule and a render
  between text changes shows `''` rather than stale text.

## Where it's used

- `LearnPage` slides — the body types out; the slide completes when typing finishes.
