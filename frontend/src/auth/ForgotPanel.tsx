/**
 * @fileoverview Forgot-email and forgot-password sub-forms.
 *
 * All four steps share the same glass card style as the rest of the auth flow.
 * The parent (AuthPanel) owns all async work and state; these are purely presentational.
 */
import { useState, useEffect, useRef } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { LordIcon, ICONS } from '../components/LordIcon/LordIcon';
import { PhoneInput } from '../components/PhoneInput/PhoneInput';

interface ForgotChoiceProps {
  onForgotEmail: () => void;
  onForgotPassword: () => void;
  onBack: () => void;
}

/** Step 1 of the forgot flow — choose what was forgotten. */
export function ForgotChoice({
  onForgotEmail,
  onForgotPassword,
  onBack,
}: ForgotChoiceProps): ReactElement {
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

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        {iconPhase === 'in' ? (
          <LordIcon
            key="forgot-in"
            src={ICONS.searchAccount}
            size={56}
            trigger="in"
            stroke="bold"
          />
        ) : (
          <LordIcon
            key="forgot-idle"
            src={ICONS.searchAccount}
            size={56}
            trigger="hover"
            stroke="bold"
          />
        )}
        <h2>Forgot something?</h2>
      </div>
      <p className="auth-description auth-description--center">What do you need help with?</p>
      <button type="button" className="forgot-option-btn" onClick={onForgotEmail}>
        I forgot my email address
      </button>
      <button type="button" className="forgot-option-btn" onClick={onForgotPassword}>
        I forgot my password
      </button>
      <div className="auth-bottom-row">
        <button type="button" className="auth-link" onClick={onBack}>
          Back to sign in
        </button>
      </div>
    </div>
  );
}

interface ForgotEmailPhoneProps {
  pending: boolean;
  error: string | null;
  onSubmit: (phone: string) => void;
  onBack: () => void;
}

/** Step 2a — enter phone number to look up the associated email. */
export function ForgotEmailPhone({
  pending,
  error,
  onSubmit,
  onBack,
}: ForgotEmailPhoneProps): ReactElement {
  const [phone, setPhone] = useState('');
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

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault();
    onSubmit(phone.trim());
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        {iconPhase === 'in' ? (
          <LordIcon key="fephone-in" src={ICONS.chatVerify} size={56} trigger="in" stroke="bold" />
        ) : (
          <LordIcon
            key="fephone-idle"
            src={ICONS.chatVerify}
            size={56}
            trigger="hover"
            stroke="bold"
          />
        )}
        <h2>Find your account</h2>
      </div>
      <p className="auth-description auth-description--center">
        Enter the phone number on your account. We&rsquo;ll send a reset code to the associated
        email.
      </p>
      <label>Phone number</label>
      <PhoneInput value={phone} onChange={setPhone} required autoFocus />
      {error !== null && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Searching…' : 'Find account'}
      </button>
      <div className="auth-bottom-row">
        <button type="button" className="auth-link" onClick={onBack} disabled={pending}>
          Back
        </button>
      </div>
    </form>
  );
}

interface ForgotEmailCodeProps {
  maskedEmail: string;
  pending: boolean;
  error: string | null;
  onSubmit: (code: string, newPassword: string) => void;
  onBack: () => void;
}

/** Step 3a — enter the code sent to the found email + choose a new password. */
export function ForgotEmailCode({
  maskedEmail,
  pending,
  error,
  onSubmit,
  onBack,
}: ForgotEmailCodeProps): ReactElement {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
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

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault();
    const trimmed = code.trim();
    setCode('');
    onSubmit(trimmed, password);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        {iconPhase === 'in' ? (
          <LordIcon
            key="fecode-in"
            src={ICONS.envelopVerifyEmail}
            size={56}
            trigger="in"
            stroke="bold"
          />
        ) : (
          <LordIcon
            key="fecode-idle"
            src={ICONS.envelopVerifyEmail}
            size={56}
            trigger="hover"
            stroke="bold"
          />
        )}
        <h2>Check your email</h2>
      </div>
      <p className="auth-description auth-description--center">
        We sent a reset code to <strong>{maskedEmail}</strong>. Enter it below along with your new
        password.
      </p>
      <label>
        Code
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        />
      </label>
      <label>
        New password
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </label>
      {error !== null && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Resetting…' : 'Reset password'}
      </button>
      <div className="auth-bottom-row">
        <button type="button" className="auth-link" onClick={onBack} disabled={pending}>
          Back
        </button>
      </div>
    </form>
  );
}

interface ForgotPasswordEmailProps {
  pending: boolean;
  error: string | null;
  onSubmit: (email: string) => void;
  onBack: () => void;
}

/** Step 2b — enter email to receive a password-reset code. */
export function ForgotPasswordEmail({
  pending,
  error,
  onSubmit,
  onBack,
}: ForgotPasswordEmailProps): ReactElement {
  const [email, setEmail] = useState('');
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

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault();
    onSubmit(email.trim());
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        {iconPhase === 'in' ? (
          <LordIcon
            key="fpemail-in"
            src={ICONS.envelopVerifyEmail}
            size={56}
            trigger="in"
            stroke="bold"
          />
        ) : (
          <LordIcon
            key="fpemail-idle"
            src={ICONS.envelopVerifyEmail}
            size={56}
            trigger="hover"
            stroke="bold"
          />
        )}
        <h2>Reset password</h2>
      </div>
      <p className="auth-description auth-description--center">
        Enter your email and we&rsquo;ll send a reset code.
      </p>
      <label>
        Email address
        <input
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          autoFocus
        />
      </label>
      {error !== null && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Sending…' : 'Send reset code'}
      </button>
      <div className="auth-bottom-row">
        <button type="button" className="auth-link" onClick={onBack} disabled={pending}>
          Back
        </button>
      </div>
    </form>
  );
}

interface ForgotPasswordCodeProps {
  email: string;
  pending: boolean;
  error: string | null;
  onSubmit: (code: string, newPassword: string) => void;
  onBack: () => void;
}

/** Step 3b — enter the reset code + new password. */
export function ForgotPasswordCode({
  email,
  pending,
  error,
  onSubmit,
  onBack,
}: ForgotPasswordCodeProps): ReactElement {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
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

  function handleSubmit(e: SyntheticEvent<HTMLFormElement>): void {
    e.preventDefault();
    const trimmed = code.trim();
    setCode('');
    onSubmit(trimmed, password);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        {iconPhase === 'in' ? (
          <LordIcon
            key="fpcode-in"
            src={ICONS.envelopVerifyEmail}
            size={56}
            trigger="in"
            stroke="bold"
          />
        ) : (
          <LordIcon
            key="fpcode-idle"
            src={ICONS.envelopVerifyEmail}
            size={56}
            trigger="hover"
            stroke="bold"
          />
        )}
        <h2>Check your email</h2>
      </div>
      <p className="auth-description auth-description--center">
        We sent a reset code to <strong>{email}</strong>.
      </p>
      <label>
        Code
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          autoFocus
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        />
      </label>
      <label>
        New password
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
      </label>
      {error !== null && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? 'Resetting…' : 'Reset password'}
      </button>
      <div className="auth-bottom-row">
        <button type="button" className="auth-link" onClick={onBack} disabled={pending}>
          Back
        </button>
      </div>
    </form>
  );
}
