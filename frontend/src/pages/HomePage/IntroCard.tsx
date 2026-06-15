/**
 * @fileoverview Frosted-glass intro card for the home page.
 *
 * Renders the sliding title/subtitle content, progress timeline, next-chevron
 * button, and Get Started CTA. The 3-D tilt effect is self-contained via
 * useCardTilt — the caller only supplies derived state and callbacks.
 */
import type { ReactElement } from 'react';
import { SLIDES, FADE_MS } from './useIntroSlides';
import type { IntroSlidesState } from './useIntroSlides';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { ICONS, LordIcon } from '../../components/LordIcon/LordIcon';
import './IntroCard.css';

interface IntroCardProps {
  slideIndex: IntroSlidesState['slideIndex'];
  slide: IntroSlidesState['slide'];
  contentOpacity: IntroSlidesState['contentOpacity'];
  isLastSlide: IntroSlidesState['isLastSlide'];
  showButton: IntroSlidesState['showButton'];
  onNext: IntroSlidesState['advance'];
  onExplore: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function IntroCard({
  slideIndex,
  slide,
  contentOpacity,
  isLastSlide,
  showButton,
  onNext,
  onExplore,
}: IntroCardProps): ReactElement {
  return (
    <GlassCard className="intro-card" perspective={900}>
      <div
        className="intro-slide"
        style={{ opacity: contentOpacity, transition: `opacity ${FADE_MS}ms ease` }}
      >
        <h1 className="intro-title">{slide.title}</h1>
        {slide.subtitle != null && <p className="intro-subtitle">{slide.subtitle}</p>}
      </div>

      <div className="intro-progress">
        {SLIDES.map((_, i) => (
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

      {!isLastSlide && (
        <div className="intro-cta">
          <button type="button" className="intro-next-btn" onClick={onNext} aria-label="Next">
            <LordIcon
              src={ICONS.chevronRight}
              trigger="hover"
              size={28}
              colors="primary:#ffffff,secondary:#ffffff"
            />
          </button>
        </div>
      )}

      {isLastSlide && (
        <div
          className="intro-cta"
          style={{
            opacity: showButton ? 1 : 0,
            pointerEvents: showButton ? 'auto' : 'none',
            transition: 'opacity 0.65s ease',
          }}
        >
          <button className="intro-explore-btn" onClick={onExplore}>
            <span className="circle" aria-hidden="true">
              <span className="icon arrow" />
            </span>
            <span className="button-text">Get Started</span>
          </button>
        </div>
      )}
    </GlassCard>
  );
}
