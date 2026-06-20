/**
 * @fileoverview MFA method selector — shown when the user has both TOTP and
 * email OTP available and Cognito issues a SELECT_MFA_TYPE challenge.
 */
import type { ReactElement } from 'react';

interface MfaSelectFormProps {
  pending: boolean;
  error: string | null;
  icon: ReactElement;
  onSelectTotp: () => void;
  onSelectEmail: () => void;
}

export function MfaSelectForm({
  pending,
  error,
  icon,
  onSelectTotp,
  onSelectEmail,
}: MfaSelectFormProps): ReactElement {
  return (
    <div className="auth-form">
      <div className="auth-form-header">
        {icon}
        <h2>Verify your identity</h2>
      </div>
      <p className="auth-description auth-description--center">
        Choose how you&apos;d like to verify it&apos;s you.
      </p>
      {error !== null && <p className="auth-error">{error}</p>}
      <button type="button" className="forgot-option-btn" disabled={pending} onClick={onSelectTotp}>
        Authenticator app
      </button>
      <button
        type="button"
        className="forgot-option-btn"
        disabled={pending}
        onClick={onSelectEmail}
      >
        Email me a code
      </button>
    </div>
  );
}
