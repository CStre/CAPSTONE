/**
 * @fileoverview Terms of Service modal — shown when a user clicks "Terms of
 * Service" on the sign-up consent row. Uses the same portal + GlassCard shell
 * as SmsConsent so no additional styles are needed.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactElement } from 'react';
import { LordIcon, ICONS } from '../icons';
import { GlassCard } from '../components/GlassCard/GlassCard';
import '../components/SecurityInfo/SecurityInfo.css';

interface TermsOfServiceModalProps {
  onClose: () => void;
}

export function TermsOfServiceModal({ onClose }: TermsOfServiceModalProps): ReactElement {
  const [iconPhase, setIconPhase] = useState<'in' | 'idle'>('in');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIconPhase('idle');
    }, 2000);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) onClose();
  }

  return createPortal(
    <div
      className="si-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Terms of Service"
      onClick={handleBackdropClick}
    >
      <GlassCard className="si-card" maxDeg={1.5} style={{ maxWidth: '52rem' }}>
        <button
          type="button"
          className="si-close"
          onClick={onClose}
          aria-label="Close Terms of Service"
        >
          <LordIcon src={ICONS.securityClose} size={50} trigger="hover" stroke="bold" />
        </button>

        <div className="si-header">
          {iconPhase === 'in' ? (
            <LordIcon
              key="tos-in"
              src={ICONS.securityShield}
              size={64}
              trigger="in"
              state="in-reveal"
              stroke="bold"
            />
          ) : (
            <LordIcon
              key="tos-idle"
              src={ICONS.securityShield}
              size={64}
              trigger="hover"
              stroke="bold"
            />
          )}
          <h2 className="si-heading">Terms of Service</h2>
        </div>

        <section className="si-section">
          <h3>The Service</h3>
          <p>
            Building Better Algorithms is a <strong>free, non-commercial educational app</strong> —
            no fees, no paid tiers, no purchases. By creating an account you agree to these Terms.
            You must be 13 or older to use the service.
          </p>
        </section>

        <section className="si-section">
          <h3>Your Account &amp; Acceptable Use</h3>
          <p>
            You are responsible for keeping your credentials secure and providing accurate
            information. Please don&apos;t attempt to reverse-engineer, disrupt, or misuse the
            service or use it for any unlawful purpose.
          </p>
        </section>

        <section className="si-section">
          <h3>Your Data</h3>
          <p>
            You retain ownership of any personal data you provide. Course content, design, and
            branding belong to Building Better Algorithms. Travel photos are sourced from Unsplash
            under the Unsplash License.
          </p>
        </section>

        <section className="si-section">
          <h3>Disclaimers &amp; Liability</h3>
          <p>
            The service is provided &ldquo;as is&rdquo; without warranty of any kind. We are not
            liable for indirect or consequential damages. We may update these Terms at any time —
            continued use constitutes acceptance.
          </p>
        </section>

        <section className="si-section">
          <h3>Leaving</h3>
          <p>
            You may delete your account at any time through Account Settings, which permanently
            removes all your data. Questions? <strong>hello@buildbetteralgorithms.com</strong>
          </p>
        </section>
      </GlassCard>
    </div>,
    document.body,
  );
}
