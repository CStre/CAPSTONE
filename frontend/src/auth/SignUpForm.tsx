/**
 * @fileoverview Sign-up form — first/last name + email + phone + password with strength indicator.
 *
 * Validation: names max 20 chars (first letter auto-capitalized), email/password max 50 chars,
 * phone via PhoneInput (max 10 local digits, E.164 output).
 */
import { useState } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { PasswordStrength, getStrength } from '../components/PasswordStrength/PasswordStrength';
import { LordIcon, ICONS } from '../components/LordIcon/LordIcon';
import { PhoneInput } from '../components/PhoneInput/PhoneInput';
import { useTheme } from '../lib/ThemeContext';
import { spawnParticles } from '../components/CanvasAnimation/spawnParticles';

interface SignUpFormProps {
  pending: boolean;
  error: string | null;
  iconPhase: 'in' | 'idle';
  onSubmit: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ) => void;
  onSwitchToSignIn: () => void;
  onLearnMore: () => void;
}

function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Presentational sign-up form; the parent owns the async work. */
export function SignUpForm({
  pending,
  error,
  iconPhase,
  onSubmit,
  onSwitchToSignIn,
  onLearnMore,
}: SignUpFormProps): ReactElement {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { theme } = useTheme();

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault();
    onSubmit(email.trim(), password, firstName.trim(), lastName.trim(), phone);
  }

  function handleSubmitClick(e: React.MouseEvent<HTMLButtonElement>): void {
    if (pending || getStrength(password) === 'weak' || !password) return;
    const rect = e.currentTarget.getBoundingClientRect();
    spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2, theme);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form-header">
        {iconPhase === 'in' ? (
          <LordIcon
            key="icon-in"
            src={ICONS.authSignUp}
            size={56}
            trigger="in"
            state="in-reveal"
            stroke="bold"
          />
        ) : (
          <LordIcon
            key="icon-idle"
            src={ICONS.authSignUp}
            size={56}
            trigger="hover"
            stroke="bold"
          />
        )}
        <h2>Create your account</h2>
      </div>
      <div className="auth-field-row">
        <label>
          First name
          <input
            type="text"
            autoComplete="given-name"
            required
            maxLength={20}
            placeholder="First name"
            value={firstName}
            onChange={(e) => {
              setFirstName(capitalizeFirst(e.target.value.slice(0, 20)));
            }}
          />
        </label>
        <label>
          Last name
          <input
            type="text"
            autoComplete="family-name"
            required
            maxLength={20}
            placeholder="Last name"
            value={lastName}
            onChange={(e) => {
              setLastName(capitalizeFirst(e.target.value.slice(0, 20)));
            }}
          />
        </label>
      </div>
      <label>
        Email
        <input
          type="email"
          autoComplete="email"
          required
          maxLength={50}
          placeholder="Email address"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value.slice(0, 50));
          }}
        />
      </label>
      <label>
        Phone number
        <PhoneInput value={phone} onChange={setPhone} required />
      </label>
      <label>
        Password
        <div className="auth-input-wrap">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={50}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value.slice(0, 50));
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
