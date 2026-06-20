/**
 * @fileoverview Global custom cursor — a circle that follows the mouse,
 * grows on hover over interactive elements, bounces on click, and plays a
 * bubble-pop burst when the mouse leaves the page, springing back in on re-entry.
 *
 * All mouse tracking is done via direct DOM manipulation on the ref so
 * the component never re-renders after mount (no mousemove setState).
 * Theme changes are handled by React re-rendering the data-theme attribute.
 */
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { useTheme } from '../../lib/ThemeContext';
import { clientToFixed } from '../../lib/pointer';
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

/** Spawns 8 radial line segments bursting outward from (x, y) — the bubble-pop effect. */
function spawnPopBurst(x: number, y: number, theme: string): void {
  if (typeof Element.prototype.animate !== 'function') return;
  const color = theme === 'dark' ? '#d3d9d4' : '#3d52a0';
  const count = 8;
  for (let i = 0; i < count; i++) {
    const angleDeg = (i / count) * 360;
    const len = 7 + Math.random() * 9;
    const travel = 20 + Math.random() * 18;
    const duration = 260 + Math.random() * 130;

    const line = document.createElement('div');
    document.body.appendChild(line);
    line.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 1.5px;
      height: ${len}px;
      background: ${color};
      border-radius: 1px;
      pointer-events: none;
      z-index: 99998;
      transform-origin: 50% 50%;
    `;

    const anim = line.animate(
      [
        {
          transform: `translate(-50%, -50%) rotate(${angleDeg}deg) translateY(0)`,
          opacity: 0.88,
        },
        {
          transform: `translate(-50%, -50%) rotate(${angleDeg}deg) translateY(-${travel}px)`,
          opacity: 0,
        },
      ],
      { duration, easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)', fill: 'forwards' },
    );
    anim.onfinish = () => {
      line.remove();
    };
  }
}

export function CustomCursor(): ReactElement {
  const ref = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cursor: HTMLDivElement = el;

    // Tracks whether the cursor is currently visible so we can avoid
    // double-triggering pop-in / pop-out and spawn the burst once per leave.
    let visible = false;

    function onMove(e: MouseEvent): void {
      // Convert to layout coords so the dot tracks the pointer under pinch-zoom on
      // Safari (no-op on Chrome/Firefox — see clientToFixed).
      const p = clientToFixed(e.clientX, e.clientY);
      cursor.style.left = `${p.x}px`;
      cursor.style.top = `${p.y}px`;
      if (!visible) {
        visible = true;
        cursor.style.opacity = '';
        cursor.classList.remove('cc-popping', 'cc-click');
        void cursor.offsetWidth;
        cursor.classList.add('cc-popping-in');
      }
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
      cursor.classList.remove('cc-click');
      void cursor.offsetWidth;
      cursor.classList.add('cc-click');
    }

    function onAnimEnd(e: AnimationEvent): void {
      if (e.animationName === 'cc-bounce') cursor.classList.remove('cc-click');
      if (e.animationName === 'cc-pop-in') {
        cursor.classList.remove('cc-popping-in');
        cursor.style.opacity = '1';
      }
    }

    function onLeave(): void {
      if (!visible) return;
      visible = false;
      const x = parseFloat(cursor.style.left) || 0;
      const y = parseFloat(cursor.style.top) || 0;
      cursor.style.opacity = '';
      cursor.classList.remove('cc-click', 'cc-hover', 'cc-popping-in');
      void cursor.offsetWidth;
      cursor.classList.add('cc-popping');
      spawnPopBurst(x, y, cursor.dataset.theme ?? 'dark');
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    document.addEventListener('mousedown', onDown);
    document.documentElement.addEventListener('mouseleave', onLeave);
    cursor.addEventListener('animationend', onAnimEnd);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      document.removeEventListener('mousedown', onDown);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      cursor.removeEventListener('animationend', onAnimEnd);
    };
  }, []);

  return <div ref={ref} className="cc" data-theme={theme} />;
}
