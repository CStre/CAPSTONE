/**
 * @fileoverview Full-screen loading overlay that randomly picks one of five
 * animation variants on mount.
 *
 * To add / replace an animation:
 *   1. Edit the markup in loaders/LoaderVariantN.tsx
 *   2. Edit the styles in loaders/LoaderVariantN.css
 *
 * The wrapper (.spinner-box) and all screen-covering behaviour live in
 * Loader.css — the variant components only render the animation itself.
 */
import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactElement } from 'react';
import { LoaderVariant1 } from './loaders/LoaderVariant1';
import { LoaderVariant2 } from './loaders/LoaderVariant2';
import { LoaderVariant3 } from './loaders/LoaderVariant3';
import { LoaderVariant4 } from './loaders/LoaderVariant4';
import { LoaderVariant5 } from './loaders/LoaderVariant5';
import './Loader.css';

const VARIANTS = [
  LoaderVariant1,
  LoaderVariant2,
  LoaderVariant3,
  LoaderVariant4,
  LoaderVariant5,
] as const;

/** Full-screen loading overlay — random variant chosen once on mount. */
export function Loader(): ReactElement {
  const [Variant] = useState(
    () => VARIANTS[Math.floor(Math.random() * VARIANTS.length)] ?? VARIANTS[0],
  );

  return createPortal(
    <div className="spinner-box" role="status" aria-label="Loading">
      <Variant />
    </div>,
    document.body,
  );
}
