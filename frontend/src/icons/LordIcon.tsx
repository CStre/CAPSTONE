/* eslint-disable react-refresh/only-export-components -- the hook is intentionally co-located with the component */
/**
 * @fileoverview Typed wrapper around the `<lord-icon>` custom element plus the
 * theme-aware color hook.
 *
 * The icon path registry lives in the per-page modules under `src/icons/`
 * (header.ts, auth.ts, …) and is aggregated as `ICONS` in `index.ts`. Import
 * everything from the folder barrel: `import { LordIcon, ICONS } from '.../icons'`.
 */
import type { CSSProperties, ReactElement } from 'react';
import { useTheme } from '../lib/ThemeContext';

interface LordIconProps {
  src: string;
  /** Uniform width and height in pixels (default 40). */
  size?: number;
  trigger?:
    | 'hover'
    | 'hover-blocking'
    | 'loop'
    | 'loop-on-hover'
    | 'click'
    | 'morph'
    | 'boomerang'
    | 'in';
  stroke?: 'bold' | 'regular' | 'light';
  colors?: string;
  state?: string;
  /** CSS selector for the hover target (lordicon `target` attribute). */
  target?: string;
  delay?: string | number;
  className?: string;
  style?: CSSProperties;
}

/** Returns palette-correct hex colors for the current theme. */
export function useLordIconColors(): { primary: string; secondary: string } {
  const { theme } = useTheme();
  return theme === 'dark'
    ? { primary: '#D3D9D4', secondary: '#748D92' }
    : { primary: '#3D52A0', secondary: '#7091E6' };
}

/** Typed React wrapper around the `<lord-icon>` custom element. */
export function LordIcon({
  src,
  size = 40,
  trigger = 'hover',
  stroke = 'bold',
  colors,
  state,
  target,
  delay,
  className,
  style,
}: LordIconProps): ReactElement {
  const { primary, secondary } = useLordIconColors();
  const resolvedColors = colors ?? `primary:${primary},secondary:${secondary}`;
  return (
    <lord-icon
      src={src}
      trigger={trigger}
      stroke={stroke}
      colors={resolvedColors}
      state={state}
      target={target}
      delay={delay}
      className={className}
      style={{ width: size, height: size, flexShrink: 0, ...style }}
    />
  );
}
