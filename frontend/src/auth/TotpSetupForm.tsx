/**
 * @fileoverview TOTP enrollment form — QR code + manual secret + a code to verify.
 */
import { useState } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface TotpSetupFormProps {
  secret: string;
  setupUri: string;
  pending: boolean;
  error: string | null;
  onSubmit: (code: string) => void;
}

/** Presentational TOTP-enrollment form; the parent owns the async work. */
export function TotpSetupForm({
  secret,
  setupUri,
  pending,
  error,
  onSubmit,
}: TotpSetupFormProps): ReactElement {
  const [code, setCode] = useState('');

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit(code.trim());
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>Set up two-factor auth</h2>
      <p className="auth-description">
        Scan this code with an authenticator app (Google Authenticator, 1Password, …), then enter
        the 6-digit code it shows.
      </p>
      {setupUri !== '' && <QRCodeSVG value={setupUri} size={180} />}
      <p className="auth-secret">
        Can’t scan? Enter this key manually: <code>{secret}</code>
      </p>
      <label>
        Code
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
        {pending ? 'Verifying…' : 'Verify & finish'}
      </button>
    </form>
  );
}
