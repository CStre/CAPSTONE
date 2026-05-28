/**
 * @fileoverview Sign-in form — email + password with eye toggle and confetti.
 */
import { useState, useEffect, useRef } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { LordIcon, ICONS } from '../components/LordIcon/LordIcon';
import { useTheme } from '../lib/ThemeContext';
import { spawnParticles } from '../components/CanvasAnimation/spawnParticles';

interface SignInFormProps {
  initialEmail: string;
  pending: boolean;
  error: string | null;
  onSubmit: (email: string, password: string) => void;
  onSwitchToSignUp: () => void;
  onLearnMore: () => void;
}

/** Presentational sign-in form; the parent owns the async work. */
export function SignInForm({
  initialEmail,
  pending,
  error,
  onSubmit,
  onSwitchToSignUp,
  onLearnMore,
}: SignInFormProps): ReactElement {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [iconPhase, setIconPhase] = useState<'in' | 'idle'>('in');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setIconPhase('idle');
    }, 2000);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit(email.trim(), password);
  }

  function handleSubmitClick(e: React.MouseEvent<HTMLButtonElement>): void {
    if (pending) return;
    const rect = e.currentTarget.getBoundingClientRect();
    spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, theme);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        {iconPhase === 'in' ? (
          <LordIcon key="icon-in" src={ICONS.authSignIn} size={56} trigger="in" state="in-reveal" stroke="bold" />
        ) : (
          <LordIcon key="icon-idle" src={ICONS.authSignIn} size={56} trigger="hover" stroke="bold" />
        )}
        <h2>Sign in</h2>
      </div>
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
          }}
        />
      </label>
      <label>
        Password
        <div className="auth-input-wrap">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            placeholder="Password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
          />
          <button
            type="button"
            className="auth-eye-btn"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => {
              setShowPassword((v) => !v);
            }}
          >
            <LordIcon
              src={ICONS.passwordEye}
              size={22}
              trigger="hover"
              stroke="bold"
              state={showPassword ? undefined : 'hover-cross'}
            />
          </button>
        </div>
      </label>
      {error !== null && <p className="auth-error">{error}</p>}
      <button type="submit" disabled={pending} onClick={handleSubmitClick}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
      <div className="auth-bottom-row">
        <button type="button" className="auth-link" onClick={onSwitchToSignUp}>
          Sign up
        </button>
        <button
          type="button"
          className="auth-security-btn"
          onClick={onLearnMore}
          aria-label="How is my data protected?"
        >
          <LordIcon src={ICONS.securityShield} size={22} trigger="hover" stroke="bold" />
        </button>
      </div>
    </form>
  );
}
