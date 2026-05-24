/**
 * @fileoverview Ambient JSX type for the <lord-icon> custom element.
 *
 * The element is registered at runtime by @lordicon/element (see main.tsx);
 * this declaration lets TSX reference <lord-icon> with type checking.
 */
import type { HTMLAttributes } from 'react';

/** Attributes accepted by the lordicon web component. */
interface LordIconProps extends HTMLAttributes<HTMLElement> {
  src?: string;
  trigger?: string;
  state?: string;
  stroke?: string;
  colors?: string;
  delay?: string | number;
  target?: string;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': LordIconProps;
    }
  }
}
