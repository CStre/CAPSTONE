/**
 * @fileoverview Reusable frosted-glass pill ("island") with mouse elasticity.
 *
 * Renders a pill-shaped div with:
 *   - a frosted backdrop-filter glass layer (.gi-glass)
 *   - a gentle elastic pull toward the cursor (useElasticOffset)
 *
 * Usage:
 *   <GlassIsland className="my-island--variant">…children…</GlassIsland>
 *
 * IMPORTANT: Do not apply CSS `transform` to this element or any ancestor —
 * transform creates an isolated compositing layer that breaks backdrop-filter
 * on the .gi-glass child. The elastic motion uses top/left offsets instead.
 */
import type { CSSProperties, ReactNode, ReactElement } from 'react';
import { useElasticOffset } from './useElasticOffset';
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

  const classes = ['gi-island', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} style={{ left: tx, top: ty, ...style }}>
      <span className="gi-glass" aria-hidden="true" />
      {children}
    </div>
  );
}
