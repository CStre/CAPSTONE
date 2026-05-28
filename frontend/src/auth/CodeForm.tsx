/**
 * @fileoverview Reusable verification-code form (email confirmation + MFA).
 */
import { useState } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { LordIcon, ICONS } from '../components/LordIcon/LordIcon';

interface CodeFormProps {
  title?: string;
  description: string;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  onSubmit: (code: string) => void;
  onResend?: () => void;
  /** Optional icon rendered above the title in a centred header. */
  icon?: ReactElement;
  /** Optional content rendered below the submit button. */
  footer?: ReactElement;
}

/** Presentational single-code form; the parent owns the async work. */
export function CodeForm({
  title,
  description,
  submitLabel,
  pending,
  error,
  onSubmit,
  onResend,
  icon,
  footer,
}: CodeFormProps): ReactElement {
  const [code, setCode] = useState('');

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    const trimmed = code.trim();
    setCode('');
    onSubmit(trimmed);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {(icon ?? title) && (
        <div className="auth-form-header">
          {icon}
          {title && <h2>{title}</h2>}
        </div>
      )}
      <p className="auth-description auth-description--center">{description}</p>
      <label>
        Code
        <div className="auth-input-wrap">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
            }}
          />
          {onResend !== undefined && (
            <button
              type="button"
              className="auth-resend-btn"
              onClick={onResend}
              disabled={pending}
              aria-label="Resend code"
            >
              <LordIcon src={ICONS.resendCode} size={26} trigger="hover" stroke="bold" />
            </button>
          )}
        </div>
      </label>
      {error !== null && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Working…' : submitLabel}
      </button>
      {footer}
    </form>
  );
}
