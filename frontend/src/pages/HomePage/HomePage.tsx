/**
 * @fileoverview Home page — canvas neural-net hero + particle-burst CTA.
 *
 * Unauthenticated visitors see a glass card that cycles through intro slides
 * (manually advanced via a chevron button) before revealing the CTA.
 * Authenticated visitors see a personalised greeting card that auto-advances
 * and can be dismissed to leave only the canvas animation.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { Loader } from '../../components/Loader/Loader';
import { useCanvasAnimation } from '../../components/CanvasAnimation/useCanvasAnimation';
import { useAuth } from '../../auth/context';
import { useTheme } from '../../lib/ThemeContext';
import { useIntroStage } from '../../lib/IntroContext';
import { useIntroSlides } from './useIntroSlides';
import { spawnParticles } from '../../components/CanvasAnimation/spawnParticles';
import { IntroCard } from './IntroCard';
import { AuthGreetingCard } from './AuthGreetingCard';
import './HomePage.css';

/** Landing page with the canvas neural-net hero. */
export function HomePage(): ReactElement {
  const { status, user } = useAuth();
  const authenticated = status === 'authenticated';
  const [showGreeting, setShowGreeting] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { setIntroStage } = useIntroStage();
  const { slide, slideIndex, contentOpacity, isLastSlide, showButton, advance } = useIntroSlides();

  // Authenticated users skip the intro entirely — header shows all items
  useEffect(() => {
    if (authenticated) setIntroStage(-1);
  }, [authenticated, setIntroStage]);

  // Keep the shared header stage in sync with the current slide (unauthenticated only)
  useEffect(() => {
    if (!authenticated) setIntroStage(slideIndex);
  }, [slideIndex, setIntroStage, authenticated]);

  // Reset header to full when leaving this page
  useEffect(
    () => () => {
      setIntroStage(-1);
    },
    [setIntroStage],
  );

  useCanvasAnimation(canvasRef, theme);

  useEffect(() => {
    const id = setTimeout(() => {
      setShowLoader(false);
    }, 3000);
    return () => {
      clearTimeout(id);
    };
  }, []);

  function handleExplore(e: React.MouseEvent<HTMLButtonElement>): void {
    setIntroStage(-1);
    spawnParticles(e.clientX, e.clientY, theme);
    setTimeout(() => {
      void navigate(authenticated ? '/travel' : '/login');
    }, 900);
  }

  return (
    <div className="home">
      {showLoader && (
        <div className="home-loader">
          <Loader />
        </div>
      )}

      <canvas ref={canvasRef} className="home-canvas" />

      {authenticated && showGreeting && !showLoader && (
        <AuthGreetingCard
          firstName={user?.firstName ?? ''}
          onDismiss={() => {
            setShowGreeting(false);
          }}
        />
      )}

      {!authenticated && (
        <IntroCard
          slideIndex={slideIndex}
          slide={slide}
          contentOpacity={contentOpacity}
          isLastSlide={isLastSlide}
          showButton={showButton}
          onNext={advance}
          onExplore={handleExplore}
        />
      )}
    </div>
  );
}
