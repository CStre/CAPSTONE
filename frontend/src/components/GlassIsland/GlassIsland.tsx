/**
 * @fileoverview Reusable frosted-glass pill ("island") with mouse elasticity,
 * gooey squash-and-stretch, and a ripple effect on press.
 *
 * Renders a pill-shaped div with:
 *   - a frosted backdrop-filter glass layer (.gi-glass)
 *   - a gentle elastic pull toward the cursor (useElasticOffset)
 *   - a spring squash-and-stretch deformation toward the cursor (useGooeyEffect)
 *   - a ripple spawned inside .gi-glass on mousedown (clipped to pill shape)
 *
 * IMPORTANT: Do not apply CSS `transform` to this element or any ancestor —
 * transform creates an isolated compositing layer that breaks backdrop-filter
 * on the .gi-glass child. The elastic motion uses top/left offsets instead.
 * The gooey effect applies transform to the island itself and accepts the
 * brief degradation of backdrop-filter during active deformation.
 */
import type { CSSProperties, ReactNode, ReactElement, MouseEvent } from 'react';
import { useRef } from 'react';
import { useElasticOffset } from './useElasticOffset';
import { useGooeyEffect } from './useGooeyEffect';
import './GlassIsland.css';

interface GlassIslandProps {
  children: ReactNode;
  /** Extra class(es) applied alongside gi-island (e.g. layout variant classes). */
  className?: string;
  /** How strongly the island follows the cursor. Default: 0.18 */
  elasticStrength?: number;
  /** Mouse proximity radius (px) that triggers the pull. Default: 180 */
  elasticRange?: number;
  style?: CSSProperties;
}

export function GlassIsland({
  children,
  className,
  elasticStrength,
  elasticRange,
  style,
}: GlassIslandProps): ReactElement {
  const { ref, tx, ty } = useElasticOffset(elasticStrength, elasticRange);
  useGooeyEffect(ref);

  const glassRef = useRef<HTMLSpanElement | null>(null);

  function spawnRipple(e: MouseEvent<HTMLDivElement>): void {
    const glass = glassRef.current;
    const island = ref.current;
    if (!glass || !island) return;

    const rect = island.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ripple = document.createElement('span');
    ripple.className = 'gi-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    glass.appendChild(ripple);
    ripple.addEventListener(
      'animationend',
      () => {
        ripple.remove();
      },
      { once: true },
    );
  }

  const classes = ['gi-island', className].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{ left: tx, top: ty, ...style }}
      onMouseDown={spawnRipple}
    >
      <span ref={glassRef} className="gi-glass" aria-hidden="true" />
      {children}
    </div>
  );
}
