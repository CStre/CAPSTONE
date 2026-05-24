/**
 * @fileoverview Global custom cursor — a circle that follows the mouse,
 * grows on hover over interactive elements, and bounces on click.
 *
 * All mouse tracking is done via direct DOM manipulation on the ref so
 * the component never re-renders after mount (no mousemove setState).
 * Theme changes are handled by React re-rendering the data-theme attribute.
 */
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { useTheme } from '../../lib/ThemeContext';
import './CustomCursor.css';

const INTERACTIVE = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  'label',
  '[role="button"]',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export function CustomCursor(): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cursor: HTMLDivElement = el;

    function onMove(e: MouseEvent): void {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
      cursor.style.opacity = '1';
    }

    function onOver(e: MouseEvent): void {
      if ((e.target as Element | null)?.closest(INTERACTIVE)) {
        cursor.classList.add('cc-hover');
      }
    }

    function onOut(e: MouseEvent): void {
      if (!(e.relatedTarget as Element | null)?.closest(INTERACTIVE)) {
        cursor.classList.remove('cc-hover');
      }
    }

    function onDown(): void {
      // Remove + reflow so rapid clicks each restart the animation
      cursor.classList.remove('cc-click');
      void cursor.offsetWidth;
      cursor.classList.add('cc-click');
    }

    function onAnimEnd(): void {
      cursor.classList.remove('cc-click');
    }

    function onLeave(): void {
      cursor.style.opacity = '0';
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('mouseleave', onLeave);
    cursor.addEventListener('animationend', onAnimEnd);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('mouseleave', onLeave);
      cursor.removeEventListener('animationend', onAnimEnd);
    };
  }, []);

  return <div ref={ref} className="cc" data-theme={theme} />;
}
