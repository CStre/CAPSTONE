/**
 * @fileoverview Reusable typewriter hook.
 *
 * Reveals a string one character at a time. Global + framework-agnostic so it can
 * drive the Learn-page slides today and any other typed text later. When
 * `enabled` is false the hook is inert (it reports the full text as shown but does
 * NOT fire `onDone`), so callers can decide what to render in the idle state.
 */
import { useEffect, useRef, useState } from 'react';

export interface TypewriterOptions {
  /** Milliseconds per character. */
  speed?: number;
  /** When false, the animation does not run and `onDone` never fires. */
  enabled?: boolean;
  /** Called once the full string has been revealed. */
  onDone?: () => void;
}

export interface TypewriterState {
  /** The substring revealed so far. */
  shown: string;
  /** True once the whole string is revealed. */
  done: boolean;
}

/** Progress is keyed to its text so a render in between text changes shows '' (not stale text). */
interface Progress {
  text: string;
  count: number;
}

export function useTypewriter(text: string, options: TypewriterOptions = {}): TypewriterState {
  const { speed = 22, enabled = true, onDone } = options;
  const [progress, setProgress] = useState<Progress>({ text, count: 0 });

  // Keep the latest onDone without re-running the animation when it changes.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!enabled) return;
    if (text.length === 0) {
      onDoneRef.current?.();
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setProgress({ text, count: i });
      if (i >= text.length) {
        clearInterval(id);
        onDoneRef.current?.();
      }
    }, speed);
    return () => {
      clearInterval(id);
    };
  }, [text, speed, enabled]);

  if (!enabled) return { shown: text, done: true };
  // Until the interval reports progress for the current text, show nothing.
  const count = progress.text === text ? progress.count : 0;
  return { shown: text.slice(0, count), done: count >= text.length };
}
