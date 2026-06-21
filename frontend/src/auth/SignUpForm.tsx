/**
 * @fileoverview Sign-up form — first/last name + email + phone + password with strength indicator.
 *
 * Validation: names max 20 chars (first letter auto-capitalized), email/password max 50 chars,
 * phone via PhoneInput (max 10 local digits, E.164 output).
 */
import { useState } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import {
  PasswordStrength,
  PasswordStrengthBar,
  getStrength,
} from '../components/PasswordStrength/PasswordStrength';
import { LordIcon, ICONS } from '../icons';
import { GooeyButton } from '../components/GooeyButton/GooeyButton';
import { PhoneInput } from '../components/PhoneInput/PhoneInput';
import { TermsOfServiceModal } from './TermsOfServiceModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
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
}: SignUpFormProps): ReactElement {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [smsConsent, setSmsConsent] = useState(false);
  const [tosConsent, setTosConsent] = useState(false);
  const [showTos, setShowTos] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
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
            onFocus={() => {
              setPasswordFocused(true);
            }}
            onBlur={() => {
              setPasswordFocused(false);
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
          {passwordFocused && <PasswordStrengthBar password={password} />}
        </div>
      </label>
      {passwordFocused && <PasswordStrength password={password} />}

      <div className="auth-consent-group">
        <div className="auth-consent-row-wrap">
          <button
            type="button"
            className={`auth-sms-circle-btn${smsConsent ? ' is-checked' : ''}`}
            aria-label={smsConsent ? 'Remove SMS consent' : 'Consent to SMS verification'}
            onClick={() => {
              setSmsConsent((v) => !v);
            }}
          >
            {smsConsent ? '✓' : ''}
          </button>
          <div className="auth-consent-body">
            <span className="auth-consent-label">
              By checking, you consent to receive one-time passcodes and verification codes from
              Building Better Algorithms. Message frequency may vary. Message and data rates may
              apply. Reply HELP for help or STOP to opt-out.
            </span>
          </div>
        </div>

        <div className="auth-consent-row-wrap">
          <button
            type="button"
            className={`auth-sms-circle-btn${tosConsent ? ' is-checked' : ''}`}
            aria-label={
              tosConsent ? 'Remove acceptance' : 'Accept Terms of Service and Privacy Policy'
            }
            onClick={() => {
              setTosConsent((v) => !v);
            }}
          >
            {tosConsent ? '✓' : ''}
          </button>
          <div className="auth-consent-body">
            <span className="auth-consent-label">By checking, I accept the</span>
            <GooeyButton
              className="auth-link auth-consent-pill"
              onClick={() => {
                setShowTos(true);
              }}
            >
              Terms of Service
            </GooeyButton>
            <span className="auth-consent-label">and</span>
            <GooeyButton
              className="auth-link auth-consent-pill"
              onClick={() => {
                setShowPrivacy(true);
              }}
            >
              Privacy Policy
            </GooeyButton>
          </div>
        </div>
      </div>

      {error !== null && <p className="auth-error">{error}</p>}
      <button
        type="submit"
        disabled={
          pending || getStrength(password) === 'weak' || !password || !smsConsent || !tosConsent
        }
        onClick={handleSubmitClick}
      >
        {pending ? 'Creating...' : 'Create account'}
      </button>
      <div className="auth-bottom-row">
        <GooeyButton className="auth-link" onClick={onSwitchToSignIn}>
          Sign in
        </GooeyButton>
      </div>

      {showTos && (
        <TermsOfServiceModal
          onClose={() => {
            setShowTos(false);
          }}
        />
      )}
      {showPrivacy && (
        <PrivacyPolicyModal
          onClose={() => {
            setShowPrivacy(false);
          }}
        />
      )}
    </form>
  );
}
