/**
 * @fileoverview Spring-based squash-and-stretch hook for GlassIsland.
 *
 * Accepts the island's existing DOM ref and adds a gooey deformation effect:
 * when the cursor is within `range` px of the island centre, the island
 * elongates toward the cursor and compresses slightly on the perpendicular
 * axis (classic cartoon squash-and-stretch). Spring physics drive the
 * transition so arriving, moving, and leaving all feel bouncy.
 *
 * The effect is applied via direct `el.style.transform` mutations inside a
 * requestAnimationFrame loop — no React state is touched, so the component
 * never re-renders just because the mouse moved.
 */
import { type RefObject, useEffect } from 'react';

/** Spring stiffness — higher snaps back faster. */
const K = 0.2;
/** Spring damping — lower = more bounce overshoot on engage/disengage. */
const DAMP = 0.55;
/** Stop the RAF loop when both axes are this close to settled. */
const EPSILON = 0.0004;

export function useGooeyEffect<T extends HTMLElement>(
  ref: RefObject<T | null>,
  range = 260,
  maxStretch = 0.09,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Non-null capture so the hoisted helper functions below keep the narrowed
    // type (hoisted `function` declarations don't inherit control-flow narrowing).
    const node: T = el;

    // Spring state — mutable locals shared between mouse handler and RAF.
    let tSx = 1,
      tSy = 1; // targets
    let cSx = 1,
      cSy = 1; // current positions
    let vSx = 0,
      vSy = 0; // velocities
    let rafId = 0;
    let running = false;

    function tick(): void {
      vSx += (tSx - cSx) * K - vSx * DAMP;
      cSx += vSx;
      vSy += (tSy - cSy) * K - vSy * DAMP;
      cSy += vSy;

      node.style.transform = `scaleX(${cSx.toFixed(4)}) scaleY(${cSy.toFixed(4)})`;

      const settled =
        Math.abs(tSx - cSx) < EPSILON &&
        Math.abs(tSy - cSy) < EPSILON &&
        Math.abs(vSx) < EPSILON &&
        Math.abs(vSy) < EPSILON;

      if (settled) {
        running = false;
        node.style.transform = tSx === 1 && tSy === 1 ? '' : `scaleX(${tSx}) scaleY(${tSy})`;
      } else {
        rafId = requestAnimationFrame(tick);
      }
    }

    function wake(): void {
      if (!running) {
        running = true;
        rafId = requestAnimationFrame(tick);
      }
    }

    function onMove(e: MouseEvent): void {
      const rect = node.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist >= range) {
        tSx = 1;
        tSy = 1;
        wake();
        return;
      }

      // Factor 0 (far edge) → 1 (center).
      const f = 1 - dist / range;
      // Unit vector toward cursor.
      const nx = dist > 0 ? dx / dist : 0;
      const ny = dist > 0 ? dy / dist : 0;

      // Elongate along the cursor axis; compress ~40% on the perpendicular.
      tSx = 1 + f * maxStretch * nx * nx - f * maxStretch * 0.4 * ny * ny;
      tSy = 1 + f * maxStretch * ny * ny - f * maxStretch * 0.4 * nx * nx;
      wake();
    }

    function onLeave(): void {
      tSx = 1;
      tSy = 1;
      wake();
    }

    window.addEventListener('mousemove', onMove);
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      node.style.transform = '';
    };
  }, [ref, range, maxStretch]);
}
