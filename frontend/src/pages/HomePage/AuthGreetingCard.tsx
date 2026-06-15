/**
 * @fileoverview Greeting slide deck shown to authenticated users on the home page.
 *
 * Auto-advances through three slides (4 s hold each). Each slide shows an
 * in-reveal Lordicon above the title that switches to hover after the animation
 * completes. The final slide reveals a "Play with Phil" button that dismisses
 * the card, leaving only the canvas animation.
 * Reuses the same glass-card and explore-button styles as IntroCard.
 */
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { LordIcon, ICONS } from '../../components/LordIcon/LordIcon';
import { FADE_MS } from './useIntroSlides';
import './IntroCard.css';

const HOLD_MS = 4000;
const ICON_REVEAL_MS = 1500;

type Phase = 'entering' | 'visible' | 'exiting';

interface SlideConfig {
  title: string;
  icon: string;
  hoverState: string;
}

interface AuthGreetingCardProps {
  firstName: string;
  onDismiss: () => void;
}

export function AuthGreetingCard({ firstName, onDismiss }: AuthGreetingCardProps): ReactElement {
  const slides: SlideConfig[] = [
    { title: `Hello, ${firstName}!`, icon: ICONS.greetingWave, hoverState: 'hover-wave' },
    {
      title: 'Welcome to Building Better Algorithms',
      icon: ICONS.greetingBrain,
      hoverState: 'hover-pinch',
    },
    { title: 'Click on the Learn Page', icon: ICONS.greetingBulb, hoverState: 'hover-blink' },
  ];

  const [slideIndex, setSlideIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('entering');
  // Tracks the last slide whose in-reveal animation has finished.
  // isRevealing = revealedSlide < slideIndex (derived — no sync setState needed).
  const [revealedSlide, setRevealedSlide] = useState(-1);

  const slide: SlideConfig = slides[slideIndex] ??
    slides[0] ?? {
      title: '',
      icon: ICONS.greetingWave,
      hoverState: 'hover-wave',
    };
  const isLastSlide = slideIndex === slides.length - 1;
  const isRevealing = revealedSlide < slideIndex;
  const contentOpacity = phase === 'visible' ? 1 : 0;

  // After ICON_REVEAL_MS, mark this slide's reveal done → switches to hover trigger
  useEffect(() => {
    const t = setTimeout(() => {
      setRevealedSlide(slideIndex);
    }, ICON_REVEAL_MS);
    return () => {
      clearTimeout(t);
    };
  }, [slideIndex]);

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

  // Auto-advance non-final slides after HOLD_MS
  useEffect(() => {
    if (phase !== 'visible' || isLastSlide) return;
    const t = setTimeout(() => {
      setPhase('exiting');
    }, HOLD_MS);
    return () => {
      clearTimeout(t);
    };
  }, [phase, isLastSlide]);

  // After fade-out completes, move to the next slide
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

  return (
    <GlassCard className="intro-card" perspective={900}>
      <div
        className="intro-slide"
        style={{ opacity: contentOpacity, transition: `opacity ${FADE_MS}ms ease` }}
      >
        {isRevealing ? (
          <LordIcon
            key={`${slideIndex}-in`}
            src={slide.icon}
            trigger="in"
            state="in-reveal"
            size={72}
          />
        ) : (
          <LordIcon
            key={`${slideIndex}-hover`}
            src={slide.icon}
            trigger="hover"
            state={slide.hoverState}
            size={72}
          />
        )}
        <h1 className="intro-title">{slide.title}</h1>
      </div>

      <div className="intro-progress">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`intro-progress__seg${
              i < slideIndex
                ? ' intro-progress__seg--done'
                : i === slideIndex
                  ? ' intro-progress__seg--active'
                  : ''
            }`}
          />
        ))}
      </div>

      {/* Always rendered so the card keeps a consistent height; hidden until last slide */}
      <div
        className="intro-cta"
        style={{
          opacity: isLastSlide ? 1 : 0,
          pointerEvents: isLastSlide ? 'auto' : 'none',
          transition: 'opacity 0.65s ease',
        }}
      >
        <button className="intro-explore-btn" style={{ width: '15rem' }} onClick={onDismiss}>
          <span className="circle" aria-hidden="true">
            <span className="icon arrow" />
          </span>
          <span className="button-text">Play with Phil</span>
        </button>
      </div>
    </GlassCard>
  );
}
