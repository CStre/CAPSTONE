/**
 * @fileoverview Hook that applies a subtle 3-D tilt to a card element,
 * pivoting around its center as if the cursor has slight gravitational weight.
 *
 * Unlike useElasticOffset (which uses top/left to preserve backdrop-filter on
 * a .gi-glass child), this hook uses transform: rotateX/rotateY directly.
 * It is safe to use when backdrop-filter lives on the SAME element as the
 * transform — only the "child backdrop-filter inside transformed ancestor"
 * pattern breaks Chrome/Safari compositing.
 */
import { useEffect, useRef, useState, type RefObject } from 'react';

export interface CardTilt {
  ref: RefObject<HTMLDivElement | null>;
  rx: number;
  ry: number;
  isHovered: boolean;
}

export function useCardTilt(maxDeg = 3, perspective = 900): CardTilt {
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, isHovered: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const node: HTMLDivElement = el;

    function onMove(e: MouseEvent): void {
      const rect = node.getBoundingClientRect();
      // Normalise to -1…1 relative to element center
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setTilt({ rx: -ny * maxDeg, ry: nx * maxDeg, isHovered: true });
    }

    function onLeave(): void {
      setTilt({ rx: 0, ry: 0, isHovered: false });
    }

    node.addEventListener('mousemove', onMove);
    node.addEventListener('mouseleave', onLeave);
    return () => {
      node.removeEventListener('mousemove', onMove);
      node.removeEventListener('mouseleave', onLeave);
    };
  }, [maxDeg, perspective]);

  return { ref, rx: tilt.rx, ry: tilt.ry, isHovered: tilt.isHovered };
}
