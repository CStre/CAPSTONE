/**
 * @fileoverview Learn page data model — sections and slides.
 *
 * The Learn page is driven by this structure rather than hard-coded markup. Each
 * section becomes a pinned horizontal-scroll deck; each slide is one icon + title
 * + 3–4 sentences. Content is authored in `src/pages/LearnPage/plan/*.md` and
 * transcribed into the `sections/` modules.
 */
import type { ReactElement } from 'react';

export interface Slide {
  /** Path to the Lordicon JSON file. */
  icon: string;
  title: string;
  /** Plain string or JSX (for lists / emphasis), matching the original panels. */
  body: string | ReactElement;
  /**
   * Lordicon state to play on initial reveal. Defaults to 'in-reveal', which
   * all icons support. Use 'in-oscillate' for the question-bubble icon.
   */
  inState?: string;
  /**
   * Lordicon state to activate on hover after the reveal. Omit to use the
   * icon's default hover animation. Must be specified for icons whose default
   * animation is 'in-reveal' (books, stairs, portrait-photo, puzzle) — otherwise
   * they would replay the reveal animation on every hover.
   */
  hoverState?: string;
  /**
   * Lordicon colors override (e.g. 'primary:#8930e8,secondary:#16a9c7').
   * Omit to use the palette-correct theme colors from useLordIconColors.
   */
  colors?: string;
}

export interface LearnSection {
  /** Stable id (e.g. 'how-recommenders-work') — used by progress tracking. */
  id: string;
  /** Two-digit number for the heading / progress menu (e.g. '01'). */
  number: string;
  /** Section heading shown before the deck. */
  title: string;
  /** Optional one-line subtitle under the heading. */
  subtitle?: string;
  slides: Slide[];
  /** Deferred sections render a "coming soon" card instead of slides (Section 08). */
  deferred?: boolean;
}
