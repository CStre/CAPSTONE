/**
 * @fileoverview SMS messaging terms modal — TCPA/CTIA-required disclosure shown
 * before a user opts in to phone verification. Reuses the SecurityInfo glass card
 * pattern (si-overlay / si-card CSS) so no additional styles are needed.
 *
 * Rendered via createPortal so it escapes any CSS transform stacking context
 * (the auth card's 3-D tilt would otherwise trap position:fixed children).
 */
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ReactElement } from 'react';
import { LordIcon, ICONS } from '../../icons';
import { GlassCard } from '../GlassCard/GlassCard';
import '../SecurityInfo/SecurityInfo.css';

interface SmsConsentProps {
  onClose: () => void;
}

export function SmsConsent({ onClose }: SmsConsentProps): ReactElement {
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
      aria-label="SMS messaging terms"
      onClick={handleBackdropClick}
    >
      <GlassCard className="si-card" maxDeg={1.5} style={{ maxWidth: '52rem' }}>
        <button type="button" className="si-close" onClick={onClose} aria-label="Close SMS terms">
          <LordIcon src={ICONS.securityClose} size={50} trigger="hover" stroke="bold" />
        </button>

        <div className="si-header">
          {iconPhase === 'in' ? (
            <LordIcon
              key="sms-in"
              src={ICONS.chatVerify}
              size={64}
              trigger="in"
              state="in-reveal"
              stroke="bold"
            />
          ) : (
            <LordIcon
              key="sms-idle"
              src={ICONS.chatVerify}
              size={64}
              trigger="hover"
              stroke="bold"
            />
          )}
          <h2 className="si-heading">SMS messaging terms</h2>
        </div>

        <section className="si-section">
          <h3>What we send</h3>
          <p>
            Building Better Algorithms sends one-time verification codes to confirm your phone
            number. We do not send marketing, promotional, or any other messages to your number.
          </p>
        </section>

        <section className="si-section">
          <h3>Message frequency</h3>
          <p>
            Message frequency varies. You will only receive a code when you explicitly request one —
            at account creation, when updating your phone number, or when re-verifying from your
            account settings.
          </p>
        </section>

        <section className="si-section">
          <h3>Rates</h3>
          <p>Message and data rates may apply depending on your mobile carrier and plan.</p>
        </section>

        <section className="si-section">
          <h3>Opt out</h3>
          <p>
            Reply <strong>STOP</strong> to any message to opt out of future verification texts at
            any time. You may also choose <em>Verify later</em> to skip phone verification entirely
            — your account will remain fully functional.
          </p>
        </section>

        <section className="si-section">
          <h3>Help</h3>
          <p>
            Reply <strong>HELP</strong> to any message for assistance, or contact us through the
            application.
          </p>
        </section>

        <section className="si-section">
          <h3>Carriers</h3>
          <p>Carriers are not liable for delayed or undelivered messages.</p>
        </section>
      </GlassCard>
    </div>,
    document.body,
  );
}
