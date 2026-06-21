/**
 * @fileoverview Privacy Policy modal — shown when a user clicks "Privacy Policy"
 * on the sign-up consent row. Uses the same portal + GlassCard shell as
 * SmsConsent and TermsOfServiceModal.
 */
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ReactElement } from 'react';
import { LordIcon, ICONS } from '../icons';
import { GlassCard } from '../components/GlassCard/GlassCard';
import '../components/SecurityInfo/SecurityInfo.css';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export function PrivacyPolicyModal({ onClose }: PrivacyPolicyModalProps): ReactElement {
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
      aria-label="Privacy Policy"
      onClick={handleBackdropClick}
    >
      <GlassCard className="si-card" maxDeg={1.5} style={{ maxWidth: '52rem' }}>
        <button
          type="button"
          className="si-close"
          onClick={onClose}
          aria-label="Close Privacy Policy"
        >
          <LordIcon src={ICONS.securityClose} size={50} trigger="hover" stroke="bold" />
        </button>

        <div className="si-header">
          {iconPhase === 'in' ? (
            <LordIcon
              key="pp-in"
              src={ICONS.securityShield}
              size={64}
              trigger="in"
              state="in-reveal"
              stroke="bold"
            />
          ) : (
            <LordIcon
              key="pp-idle"
              src={ICONS.securityShield}
              size={64}
              trigger="hover"
              stroke="bold"
            />
          )}
          <h2 className="si-heading">Privacy Policy</h2>
        </div>

        <section className="si-section">
          <h3>What we collect</h3>
          <p>
            When you create an account we collect your{' '}
            <strong>name, email, and phone number</strong> for authentication and verification. Your
            password is hashed by AWS Cognito — we never see or store it. We also store your{' '}
            <strong>travel photo ratings</strong> and the per-country preference scores the
            algorithm derives from them.
          </p>
        </section>

        <section className="si-section">
          <h3>What we never do</h3>
          <p>
            We <strong>do not sell your data</strong>, use it for advertising, or send marketing
            emails or SMS of any kind. Your data is only used to authenticate you, run the
            preference-learning demo, and send one-time verification codes you explicitly consented
            to.
          </p>
        </section>

        <section className="si-section">
          <h3>Infrastructure &amp; security</h3>
          <p>
            Your data lives on <strong>AWS</strong> (Cognito, DynamoDB, S3) in us-east-1. All data
            is encrypted at rest and in transit (TLS 1.2+, HTTPS-only). Session tokens are stored in
            secure HttpOnly cookies — never localStorage. Travel photos come from{' '}
            <strong>Unsplash</strong>; your identity is never shared with them.
          </p>
        </section>

        <section className="si-section">
          <h3>Your rights &amp; deletion</h3>
          <p>
            You can delete your account at any time through Account Settings. Deletion is{' '}
            <strong>permanent and immediate</strong> — all your data is removed from our systems
            with no backups retained. Questions? <strong>hello@buildbetteralgorithms.com</strong>
          </p>
        </section>
      </GlassCard>
    </div>,
    document.body,
  );
}
