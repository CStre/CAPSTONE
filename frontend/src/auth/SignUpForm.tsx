/**
 * @fileoverview Sign-up form — name + email + password with strength indicator.
 */
import { useState } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { PasswordStrength, getStrength } from '../components/PasswordStrength/PasswordStrength';
import { LordIcon, ICONS } from '../components/LordIcon/LordIcon';
import { useTheme } from '../lib/ThemeContext';
import { spawnParticles } from '../components/CanvasAnimation/spawnParticles';

interface SignUpFormProps {
  pending: boolean;
  error: string | null;
  onSubmit: (email: string, password: string, name: string) => void;
  onSwitchToSignIn: () => void;
  onLearnMore: () => void;
}

/** Presentational sign-up form; the parent owns the async work. */
export function SignUpForm({
  pending,
  error,
  onSubmit,
  onSwitchToSignIn,
  onLearnMore,
}: SignUpFormProps): ReactElement {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit(email.trim(), password, name.trim());
  }

  function handleSubmitClick(e: React.MouseEvent<HTMLButtonElement>): void {
    if (pending || getStrength(password) === 'weak' || !password) return;
    const rect = e.currentTarget.getBoundingClientRect();
    spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, theme);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        <LordIcon src={ICONS.authSignUp} size={56} trigger="hover" stroke="bold" />
        <h2>Create your account</h2>
      </div>
      <div className="auth-field-row">
        <label>
          Name
          <input
            type="text"
            autoComplete="name"
            required
            placeholder="Your name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </label>
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
      </div>
      <label>
        Password
        <div className="auth-input-wrap">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
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
      <PasswordStrength password={password} />
      {error !== null && <p className="auth-error">{error}</p>}
      <button
        type="submit"
        disabled={pending || getStrength(password) === 'weak' || !password}
        onClick={handleSubmitClick}
      >
        {pending ? 'Creating...' : 'Create account'}
      </button>
      <div className="auth-bottom-row">
        <button type="button" className="auth-link" onClick={onSwitchToSignIn}>
          Sign in
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
