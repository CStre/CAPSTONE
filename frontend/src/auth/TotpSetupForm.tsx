/**
 * @fileoverview TOTP enrollment form — QR code + manual secret + a code to verify.
 */
import { useState, useEffect, useRef } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useElasticOffset } from '../components/GlassIsland/useElasticOffset';
import { LordIcon, ICONS } from '../components/LordIcon/LordIcon';

interface TotpSetupFormProps {
  secret: string;
  setupUri: string;
  pending: boolean;
  error: string | null;
  onSubmit: (code: string) => void;
  onSkip?: () => void;
  /** When true, renders the QR-code icon + "Set up authenticator" title above the form. */
  showHeader?: boolean;
}

/** Breaks a secret into space-separated groups of 4 for readability. */
function formatSecret(secret: string): string {
  return secret
    .toUpperCase()
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

/** Presentational TOTP-enrollment form; the parent owns the async work. */
export function TotpSetupForm({
  secret,
  setupUri,
  pending,
  error,
  onSubmit,
  onSkip,
  showHeader = false,
}: TotpSetupFormProps): ReactElement {
  const [code, setCode] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { ref: qrRef, tx, ty } = useElasticOffset(0.12, 220);
  const [iconPhase, setIconPhase] = useState<'in' | 'idle'>('in');
  const iconTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!showHeader) return;
    iconTimerRef.current = setTimeout(() => {
      setIconPhase('idle');
    }, 2000);
    return () => {
      if (iconTimerRef.current !== null) clearTimeout(iconTimerRef.current);
    };
  }, [showHeader]);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit(code.trim());
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {showHeader && (
        <div className="auth-form-header">
          {iconPhase === 'in' ? (
            <LordIcon
              key="totp-icon-in"
              src={ICONS.qrCode}
              size={56}
              trigger="in"
              state="in-reveal"
              stroke="bold"
            />
          ) : (
            <LordIcon
              key="totp-icon-idle"
              src={ICONS.qrCode}
              size={56}
              trigger="hover"
              stroke="bold"
            />
          )}
          <h2>Set up authenticator</h2>
        </div>
      )}
      <p className="totp-description">
        Open your authenticator app and scan the QR code below.
        <span className="totp-description-apps">
          Works with Google Authenticator, Duo, Okta Verify, 1Password, and more.
        </span>
      </p>

      {setupUri !== '' && (
        <div
          ref={qrRef}
          className="totp-qr-box"
          style={{
            position: 'relative',
            left: tx,
            top: ty,
            transition: 'left 0.18s ease-out, top 0.18s ease-out',
          }}
        >
          <QRCodeSVG value={setupUri} size={180} />
        </div>
      )}

      <div className="totp-manual-row">
        <button
          type="button"
          className="auth-link"
          onClick={() => {
            setShowKey((v) => !v);
          }}
        >
          {showKey ? 'Hide manual key' : "Can't scan? Show key"}
        </button>
      </div>

      {showKey && (
        <div className="totp-secret-box">
          <span className="totp-secret-label">Enter this key in your app:</span>
          <code className="totp-secret">{formatSecret(secret)}</code>
        </div>
      )}

      <label>
        6-digit code
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
          }}
        />
      </label>
      {error !== null && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Verifying…' : 'Verify'}
      </button>
      {onSkip !== undefined && (
        <div className="auth-bottom-row">
          <button type="button" className="auth-link" disabled={pending} onClick={onSkip}>
            Set up later
          </button>
        </div>
      )}
    </form>
  );
}
