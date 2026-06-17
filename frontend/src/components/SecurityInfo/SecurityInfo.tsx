/**
 * @fileoverview SecurityInfo overlay — full-page blurred backdrop with a card
 * explaining how passwords and preference data are protected, in plain language.
 *
 * Sits at z-index 900 (below the fixed header at 1000) so the header remains
 * visible and navigable while the overlay is open. Click the backdrop or the
 * close button to dismiss.
 *
 * Used on the login page (auth forms) and the account page.
 */
import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { LordIcon, ICONS } from '../../icons';
import { GlassCard } from '../GlassCard/GlassCard';
import './SecurityInfo.css';

interface SecurityInfoProps {
  onClose: () => void;
}

export function SecurityInfo({ onClose }: SecurityInfoProps): ReactElement {
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

  return (
    <div
      className="si-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Security information"
      onClick={handleBackdropClick}
    >
      <GlassCard className="si-card" maxDeg={1.5}>
        <button
          type="button"
          className="si-close"
          onClick={onClose}
          aria-label="Close security info"
        >
          <LordIcon src={ICONS.securityClose} size={50} trigger="hover" stroke="bold" />
        </button>

        <div className="si-header">
          {iconPhase === 'in' ? (
            <LordIcon
              key="shield-in"
              src={ICONS.securityShield}
              size={64}
              trigger="in"
              state="in-reveal"
              stroke="bold"
            />
          ) : (
            <LordIcon
              key="shield-idle"
              src={ICONS.securityShield}
              size={64}
              trigger="hover"
              stroke="bold"
            />
          )}
          <h2 className="si-heading">How your data is protected</h2>
        </div>

        <section className="si-section">
          <h3>Your password</h3>
          <p>
            Your password is never seen or stored by us. It is encrypted before it ever leaves your
            device and handled entirely by a dedicated authentication service — we have zero access
            to it.
          </p>
        </section>

        <section className="si-section">
          <h3>Two-step verification</h3>
          <p>
            Every account requires a second sign-in step using an authenticator app on your phone.
            Even if your password were somehow compromised, your account stays safe behind that
            independent second factor.
          </p>
        </section>

        <section className="si-section">
          <h3>What we store</h3>
          <p>
            The only data we keep is your travel preference scores — the per-country ratings that
            shift from your likes and dislikes on the Travel page. Nothing else: no payment
            information, no browsing history, no personal details beyond your name and email used to
            sign in.
          </p>
        </section>

        <section className="si-section">
          <h3>Your session</h3>
          <p>
            After you sign in, your session is held in a secure cookie that cannot be read by
            scripts on the page. This protects you from common web attacks that try to hijack active
            sessions.
          </p>
        </section>

        <section className="si-section">
          <h3>Deleting your account</h3>
          <p>
            Deleting your account removes your preference scores <em>and</em> your sign-in identity
            in one step. No leftover data remains anywhere in the system.
          </p>
        </section>
      </GlassCard>
    </div>
  );
}
