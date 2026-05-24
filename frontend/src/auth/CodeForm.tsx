/**
 * @fileoverview Reusable verification-code form (email confirmation + MFA).
 */
import { useState } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';

interface CodeFormProps {
  title: string;
  description: string;
  submitLabel: string;
  pending: boolean;
  error: string | null;
  onSubmit: (code: string) => void;
  onResend?: () => void;
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
}: CodeFormProps): ReactElement {
  const [code, setCode] = useState('');

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit(code.trim());
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      <p className="auth-description">{description}</p>
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
        {pending ? 'Working…' : submitLabel}
      </button>
      {onResend !== undefined && (
        <button type="button" className="auth-link" onClick={onResend} disabled={pending}>
          Resend code
        </button>
      )}
    </form>
  );
}
