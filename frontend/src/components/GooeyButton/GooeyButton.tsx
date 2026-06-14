/**
 * @fileoverview Reusable gooey button — the header-island feel (spring
 * squash-and-stretch toward the cursor + a ripple on press) applied to a real
 * <button>. Visual styling (glass background, shape) is left to the consumer's
 * className; this component only adds the motion + ripple + clipping.
 */
import { useRef } from 'react';
import type { ButtonHTMLAttributes, MouseEvent, ReactElement } from 'react';
import { useGooeyEffect } from '../GlassIsland/useGooeyEffect';
import './GooeyButton.css';

export function GooeyButton({
  className,
  children,
  onMouseDown,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>): ReactElement {
  const ref = useRef<HTMLButtonElement>(null);
  useGooeyEffect(ref, 160, 0.12);

  function handleMouseDown(e: MouseEvent<HTMLButtonElement>): void {
    const btn = ref.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'gooey-ripple';
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      btn.appendChild(ripple);
      ripple.addEventListener(
        'animationend',
        () => {
          ripple.remove();
        },
        { once: true },
      );
    }
    onMouseDown?.(e);
  }

  return (
    <button
      ref={ref}
      type="button"
      className={['gooey-btn', className].filter(Boolean).join(' ')}
      onMouseDown={handleMouseDown}
      {...rest}
    >
      {children}
    </button>
  );
}
