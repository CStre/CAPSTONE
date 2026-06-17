/**
 * @fileoverview Phone consent step — shown after email verification during sign-up.
 *
 * Displays TCPA/CTIA-required SMS disclosure and lets the user choose to verify
 * their phone now or continue without verifying. No SMS is sent until the user
 * explicitly acknowledges the terms and submits.
 */
import { useState, useEffect, useRef } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { LordIcon, ICONS } from '../icons';
import { GooeyButton } from '../components/GooeyButton/GooeyButton';
import { SmsConsent } from '../components/SmsConsent/SmsConsent';

interface PhoneConsentFormProps {
  pending: boolean;
  error: string | null;
  onVerify: () => void;
  onSkip: () => void;
}

export function PhoneConsentForm({
  pending,
  error,
  onVerify,
  onSkip,
}: PhoneConsentFormProps): ReactElement {
  const [iconPhase, setIconPhase] = useState<'in' | 'idle'>('in');
  const [acknowledged, setAcknowledged] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIconPhase('idle');
    }, 2000);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault();
    if (acknowledged) {
      onVerify();
    } else {
      onSkip();
    }
  }

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-header">
          {iconPhase === 'in' ? (
            <LordIcon
              key="phone-consent-in"
              src={ICONS.chatVerify}
              size={56}
              trigger="in"
              state="in-reveal"
              stroke="bold"
            />
          ) : (
            <LordIcon
              key="phone-consent-idle"
              src={ICONS.chatVerify}
              size={56}
              trigger="hover"
              stroke="bold"
            />
          )}
          <h2>Verify your phone?</h2>
        </div>

        <p className="auth-description">
          We would like to send a one-time code to confirm your phone number. However, you can skip
          for now and confirm later in settings.
        </p>

        <div className="auth-sms-consent-row">
          <button
            type="button"
            className={`auth-sms-circle-btn${acknowledged ? ' is-checked' : ''}`}
            aria-label={acknowledged ? 'Unacknowledge terms' : 'Acknowledge terms'}
            onClick={() => {
              setAcknowledged((v) => !v);
            }}
          >
            {acknowledged ? '✓' : ''}
          </button>
          <span className="auth-sms-acknowledge-label">Acknowledge &amp; verify</span>
          <GooeyButton
            className="auth-link"
            style={{ marginLeft: 'auto' }}
            onClick={() => {
              setShowTerms(true);
            }}
          >
            Messaging terms
          </GooeyButton>
        </div>

        {error !== null && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={pending}>
          {pending ? 'Sending code…' : acknowledged ? 'Verify' : 'Verify later'}
        </button>
      </form>

      {showTerms && (
        <SmsConsent
          onClose={() => {
            setShowTerms(false);
          }}
        />
      )}
    </>
  );
}
