/**
 * @fileoverview State machine for the home page intro slide sequence.
 *
 * Manages the entering → visible → exiting phase cycle and exposes a single
 * `advance()` function for the chevron button to call. The caller never
 * touches phase directly — only the returned derived state.
 */
import { useEffect, useState } from 'react';

export const SLIDES = [
  { title: 'Hello!', subtitle: null },
  {
    title: 'Welcome',
    subtitle:
      'An interactive research platform exploring how preference-learning algorithms can be made more transparent, adaptive, and genuinely useful.',
  },
  {
    title: 'The Research Focus',
    subtitle:
      'We investigate how real-time feedback can shift recommendations away from pure engagement toward authentic, lasting user preferences.',
  },
  {
    title: 'The Problem',
    subtitle:
      'Most recommendation systems optimize for clicks, not satisfaction — amplifying bias and trapping users in feedback loops over time.',
  },
  {
    title: 'Our Approach',
    subtitle:
      'By rating travel photos you teach the algorithm your preferences, country by country. Your world map evolves as the system learns.',
  },
  { title: 'Building Better Algorithms', subtitle: null },
] as const;

export type Slide = (typeof SLIDES)[number];

type Phase = 'entering' | 'visible' | 'exiting';

/** ms for the slide fade-in / fade-out transition. */
export const FADE_MS = 400;

export interface IntroSlidesState {
  slide: { title: string; subtitle: string | null };
  /** 0-based index of the current slide — used for the progress bar. */
  slideIndex: number;
  /** 0 when entering/exiting, 1 when fully visible. */
  contentOpacity: number;
  isLastSlide: boolean;
  /** True once the last slide has been fully visible long enough to show the CTA. */
  showButton: boolean;
  /** Trigger an exit transition to advance to the next slide. */
  advance: () => void;
}

export function useIntroSlides(): IntroSlidesState {
  const [slideIndex, setSlideIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('entering');
  const [showButton, setShowButton] = useState(false);
  const isLastSlide = slideIndex === SLIDES.length - 1;

  // Double-rAF: paint opacity:0 first so the browser has a frame to start from
  useEffect(() => {
    if (phase !== 'entering') return;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        setPhase('visible');
      });
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, [phase]);

  // Reveal CTA button after the last slide has been fully visible
  useEffect(() => {
    if (phase !== 'visible' || !isLastSlide) return;
    const t = setTimeout(() => {
      setShowButton(true);
    }, FADE_MS + 100);
    return () => {
      clearTimeout(t);
    };
  }, [phase, isLastSlide]);

  // After fade-out completes, advance to the next slide
  useEffect(() => {
    if (phase !== 'exiting') return;
    const t = setTimeout(() => {
      setSlideIndex((i) => i + 1);
      setPhase('entering');
    }, FADE_MS);
    return () => {
      clearTimeout(t);
    };
  }, [phase]);

  function advance(): void {
    if (phase !== 'visible') return;
    setPhase('exiting');
  }

  const slide: { title: string; subtitle: string | null } = SLIDES[slideIndex] ?? {
    title: '',
    subtitle: null,
  };

  return {
    slide,
    slideIndex,
    contentOpacity: phase === 'visible' ? 1 : 0,
    isLastSlide,
    showButton,
    advance,
  };
}
