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
  /**
   * Icon path. Currently every slide uses `ICONS.slidePlaceholder` (the brain
   * in-reveal); each slide carries a `TODO(icon)` comment with the intended icon.
   */
  icon: string;
  title: string;
  /** Plain string or JSX (for lists / emphasis), matching the original panels. */
  body: string | ReactElement;
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
