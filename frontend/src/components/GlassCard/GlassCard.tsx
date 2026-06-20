/**
 * @fileoverview Unified frosted-glass card with cursor-reactive 3-D tilt.
 *
 * Applies the site-wide `.glass-card` CSS utility (defined in index.css) and
 * wires up useCardTilt so callers get the tilt for free. Pass a `className`
 * for per-card border-radius, padding, and layout overrides. Pass `maxDeg={0}`
 * to render the glass surface without any tilt (useful for modal / overlay cards
 * where tilting feels distracting).
 *
 * Uses forwardRef so callers that need the DOM node directly — e.g. the
 * SourcesPage scroll engine that sets --card-scale on each frame — can still
 * grab it via a ref prop.
 */
import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import type { ReactElement } from 'react';
import { useCardTilt } from '../GlassIsland/useCardTilt';

interface GlassCardProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max tilt angle in degrees. Default 4. Pass 0 to skip the tilt transform. */
  maxDeg?: number;
  /** CSS perspective distance for the 3-D tilt. Default 1000. */
  perspective?: number;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(function GlassCard(
  { children, className, style, maxDeg = 4, perspective = 1000 },
  fwdRef,
): ReactElement {
  const { ref: tiltRef, rx, ry, isHovered } = useCardTilt(maxDeg);

  function setRef(node: HTMLDivElement | null): void {
    tiltRef.current = node;
    if (typeof fwdRef === 'function') {
      fwdRef(node);
    } else if (fwdRef) {
      fwdRef.current = node;
    }
  }

  const tiltStyle: CSSProperties =
    maxDeg > 0
      ? {
          transform: `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s ease-out',
        }
      : {};

  return (
    <div
      ref={setRef}
      className={['glass-card', className].filter(Boolean).join(' ')}
      style={{ ...tiltStyle, ...style }}
    >
      {children}
    </div>
  );
});
