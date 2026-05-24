/**
 * @fileoverview 404 page — glass card, spider canvas, 5-second auto-redirect.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { LordIcon, ICONS } from '../../components/LordIcon/LordIcon';
import { useCardTilt } from '../../components/GlassIsland/useCardTilt';
import { useCanvasAnimation } from '../../components/CanvasAnimation/useCanvasAnimation';
import { useTheme } from '../../lib/ThemeContext';
import { useIntroStage } from '../../lib/IntroContext';
import './NotFoundPage.css';

export function NotFoundPage(): ReactElement {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);
  const { theme } = useTheme();
  const { setIntroStage } = useIntroStage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref: cardRef, rx, ry, isHovered } = useCardTilt(4);

  useCanvasAnimation(canvasRef, theme);

  useEffect(() => {
    setIntroStage(-2);
    return () => {
      setIntroStage(-1);
    };
  }, [setIntroStage]);

  useEffect(() => {
    const ticker = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    const redirect = setTimeout(() => {
      void navigate('/');
    }, 5000);

    return () => {
      clearInterval(ticker);
      clearTimeout(redirect);
    };
  }, [navigate]);

  return (
    <div className="nf-page">
      <canvas ref={canvasRef} className="nf-canvas" />

      <div className="nf-panel">
        <div
          ref={cardRef}
          className="nf-card"
          style={{
            transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`,
            transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s ease-out',
          }}
        >
          <LordIcon src={ICONS.notFound} size={160} trigger="loop" delay="1500" stroke="bold" />
          <span className="nf-code">Error 404</span>
          <p className="nf-message">
            Page not found! Looks like the URL went on a vacation without leaving a forwarding
            address. Let&apos;s hope it&apos;s enjoying some sunny beaches and will be back soon!
          </p>
          <p className="nf-sub">You will be redirected to the homepage.</p>
          <p className="nf-countdown">{countdown > 0 ? String(countdown) : 'Blast Off'}</p>
        </div>
      </div>
    </div>
  );
}
