/**
 * @fileoverview Hook that returns a small (tx, ty) offset for an element,
 * pulling it gently toward the mouse when the cursor is nearby.
 *
 * We deliberately use position offsets (left/top) instead of CSS transform
 * because transform on the island creates an isolated compositing layer,
 * which kills backdrop-filter on the .di-glass child (Chrome/Safari).
 */
import { useEffect, useRef, useState, type RefObject } from 'react';

export interface ElasticOffset {
  ref: RefObject<HTMLDivElement | null>;
  tx: number;
  ty: number;
}

export function useElasticOffset(strength = 0.18, range = 180): ElasticOffset {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState({ tx: 0, ty: 0 });

  useEffect(() => {
    function onMove(e: MouseEvent): void {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist > range) {
        setOffset((prev) => (prev.tx === 0 && prev.ty === 0 ? prev : { tx: 0, ty: 0 }));
        return;
      }

      // Linear falloff: full strength at center, 0 at `range`
      const factor = (1 - dist / range) * strength;
      setOffset({ tx: dx * factor, ty: dy * factor });
    }

    function onLeave(): void {
      setOffset((prev) => (prev.tx === 0 && prev.ty === 0 ? prev : { tx: 0, ty: 0 }));
    }

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [strength, range]);

  // When disabled (e.g. a dropdown opens and we freeze the island's drift), report a
  // zero offset right away — without waiting for the next mousemove — so the element's
  // own top/left CSS transition flows it home instead of leaving it frozen off-centre.
  const disabled = strength === 0 || range === 0;
  return { ref, tx: disabled ? 0 : offset.tx, ty: disabled ? 0 : offset.ty };
}
