/**
 * @fileoverview Account page — profile and account management, all in one card.
 *
 * Email/TOTP/phone changes open a shared glass popup that reuses the same CodeForm
 * and TotpSetupForm components from the auth flow. Account deletion uses a
 * separate danger-styled confirmation modal.
 *
 * Validation: names max 20 chars (first letter auto-capitalized), email/password
 * max 50 chars, phone via PhoneInput (max 10 local digits).
 */
import React, { useState, useEffect, useRef } from 'react';
import type { ReactElement, ReactNode, SyntheticEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useMutation } from 'urql';
import {
  confirmResetPassword,
  confirmUserAttribute,
  fetchMFAPreference,
  resetPassword,
  sendUserAttributeVerificationCode,
  setUpTOTP,
  updateMFAPreference,
  updateUserAttributes,
  verifyTOTPSetup,
} from 'aws-amplify/auth';
import { graphql } from '../../gql';
import { useAuth } from '../../auth/context';
import { useTheme } from '../../lib/ThemeContext';
import { useCanvasAnimation } from '../../components/CanvasAnimation/useCanvasAnimation';
import { Loader } from '../../components/Loader/Loader';
import { LordIcon, ICONS } from '../../components/LordIcon/LordIcon';
import { useCardTilt } from '../../components/GlassIsland/useCardTilt';
import '../../components/SecurityInfo/SecurityInfo.css';
import { PasswordStrength, getStrength } from '../../components/PasswordStrength/PasswordStrength';
import { SecurityInfo } from '../../components/SecurityInfo/SecurityInfo';
import { CodeForm } from '../../auth/CodeForm';
import { TotpSetupForm } from '../../auth/TotpSetupForm';
import { PhoneInput } from '../../components/PhoneInput/PhoneInput';
import './AccountPage.css';

const DeleteAccountMutation = graphql(`
  mutation DeleteAccount {
    deleteAccount
  }
`);

type Status = { tone: 'ok' | 'error'; message: string } | null;
type Popup = 'emailVerify' | 'totp' | 'delete' | 'passwordReset' | 'phoneVerify' | null;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** Glass popup overlay — matches SecurityInfo exactly, including card tilt. */
function AccountPopup({
  onClose,
  danger,
  icon,
  title,
  children,
}: {
  onClose: () => void;
  danger?: boolean;
  icon?: string;
  title?: string;
  children: ReactNode;
}): ReactElement {
  const { ref, rx, ry, isHovered } = useCardTilt(1.5);
  const [iconPhase, setIconPhase] = useState<'in' | 'idle'>('in');
  const iconTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    iconTimerRef.current = setTimeout(() => {
      setIconPhase('idle');
    }, 2000);
    return () => {
      if (iconTimerRef.current !== null) clearTimeout(iconTimerRef.current);
    };
  }, []);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>): void {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="account-popup-overlay" onClick={handleBackdropClick}>
      <div
        ref={ref}
        className={`account-popup-card${danger ? ' account-popup-card--danger' : ''}`}
        style={{
          transform: `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`,
          transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s ease-out',
        }}
      >
        <button type="button" className="si-close" onClick={onClose} aria-label="Close">
          <LordIcon src={ICONS.securityClose} size={50} trigger="hover" stroke="bold" />
        </button>
        {icon && title && (
          <div className="si-header">
            {iconPhase === 'in' ? (
              <LordIcon
                key="popup-icon-in"
                src={icon}
                size={64}
                trigger="in"
                state="in-reveal"
                stroke="bold"
              />
            ) : (
              <LordIcon key="popup-icon-idle" src={icon} size={64} trigger="hover" stroke="bold" />
            )}
            <h2 className="si-heading">{title}</h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function AccountPage(): ReactElement {
  const { status, user, reload, logout } = useAuth();
  const navigate = useNavigate();
  const [deletion, deleteAccount] = useMutation(DeleteAccountMutation);
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasAnimation(canvasRef, theme);

  const [popup, setPopup] = useState<Popup>(null);
  const [showSecurity, setShowSecurity] = useState(false);
  const [iconPhase, setIconPhase] = useState<'in' | 'idle'>('in');
  const iconTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── First name ────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState('');
  const [firstNameStatus, setFirstNameStatus] = useState<Status>(null);
  const [savingFirstName, setSavingFirstName] = useState(false);

  // ── Last name ─────────────────────────────────────────────────────────────
  const [lastName, setLastName] = useState('');
  const [lastNameStatus, setLastNameStatus] = useState<Status>(null);
  const [savingLastName, setSavingLastName] = useState(false);

  // ── Email ─────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<Status>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailCodePending, setEmailCodePending] = useState(false);
  const [emailCodeError, setEmailCodeError] = useState<string | null>(null);

  // ── Password ─────────────────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [sendingResetCode, setSendingResetCode] = useState(false);
  const [resetCodePending, setResetCodePending] = useState(false);
  const [resetCodeError, setResetCodeError] = useState<string | null>(null);

  // ── Phone ─────────────────────────────────────────────────────────────────
  const [phone, setPhone] = useState('');
  const [phoneStatus, setPhoneStatus] = useState<Status>(null);
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneCodePending, setPhoneCodePending] = useState(false);
  const [phoneCodeError, setPhoneCodeError] = useState<string | null>(null);

  // ── TOTP ──────────────────────────────────────────────────────────────────
  const [totpEnrolled, setTotpEnrolled] = useState<boolean | null>(null);
  const [totpSetupDetails, setTotpSetupDetails] = useState<{
    secret: string;
    uri: string;
  } | null>(null);
  const [totpPending, setTotpPending] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpSuccess, setTotpSuccess] = useState(false);

  // ── Delete ────────────────────────────────────────────────────────────────
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    iconTimerRef.current = setTimeout(() => {
      setIconPhase('idle');
    }, 2000);
    return () => {
      if (iconTimerRef.current !== null) clearTimeout(iconTimerRef.current);
    };
  }, []);

  useEffect(() => {
    void fetchMFAPreference()
      .then((pref) => {
        setTotpEnrolled(pref.enabled?.includes('TOTP') ?? false);
      })
      .catch(() => {
        setTotpEnrolled(null);
      });
  }, []);

  if (status === 'loading') return <Loader />;
  if (status === 'unauthenticated' || !user) return <Navigate to="/login" replace />;

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function saveFirstName(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!user) return;
    setSavingFirstName(true);
    setFirstNameStatus(null);
    try {
      const fullName = `${firstName.trim()} ${user.lastName}`;
      await updateUserAttributes({
        userAttributes: { given_name: firstName.trim(), name: fullName },
      });
      await reload();
      setFirstName('');
      setFirstNameStatus({ tone: 'ok', message: 'First name updated.' });
    } catch (error) {
      setFirstNameStatus({ tone: 'error', message: errorMessage(error) });
    } finally {
      setSavingFirstName(false);
    }
  }

  async function saveLastName(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!user) return;
    setSavingLastName(true);
    setLastNameStatus(null);
    try {
      const fullName = `${user.firstName} ${lastName.trim()}`;
      await updateUserAttributes({
        userAttributes: { family_name: lastName.trim(), name: fullName },
      });
      await reload();
      setLastName('');
      setLastNameStatus({ tone: 'ok', message: 'Last name updated.' });
    } catch (error) {
      setLastNameStatus({ tone: 'error', message: errorMessage(error) });
    } finally {
      setSavingLastName(false);
    }
  }

  async function saveEmail(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSavingEmail(true);
    setEmailStatus(null);
    try {
      await updateUserAttributes({ userAttributes: { email } });
      setPopup('emailVerify');
    } catch (error) {
      setEmailStatus({ tone: 'error', message: errorMessage(error) });
    } finally {
      setSavingEmail(false);
    }
  }

  async function confirmEmail(code: string): Promise<void> {
    setEmailCodePending(true);
    setEmailCodeError(null);
    try {
      await confirmUserAttribute({ userAttributeKey: 'email', confirmationCode: code });
      await reload();
      setEmail('');
      setPopup(null);
      setEmailStatus({ tone: 'ok', message: 'Email updated.' });
    } catch (error) {
      setEmailCodeError(errorMessage(error));
    } finally {
      setEmailCodePending(false);
    }
  }

  async function resendEmailCode(): Promise<void> {
    try {
      await sendUserAttributeVerificationCode({ userAttributeKey: 'email' });
    } catch (error) {
      setEmailCodeError(errorMessage(error));
    }
  }

  async function sendPasswordResetCode(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!user) return;
    setSendingResetCode(true);
    setPasswordStatus(null);
    try {
      await resetPassword({ username: user.email });
      setPopup('passwordReset');
    } catch (error) {
      setPasswordStatus({ tone: 'error', message: errorMessage(error) });
    } finally {
      setSendingResetCode(false);
    }
  }

  async function confirmPasswordReset(code: string): Promise<void> {
    if (!user) return;
    setResetCodePending(true);
    setResetCodeError(null);
    try {
      await confirmResetPassword({ username: user.email, confirmationCode: code, newPassword });
      setNewPassword('');
      setPopup(null);
      setPasswordStatus({ tone: 'ok', message: 'Password updated.' });
    } catch (error) {
      setResetCodeError(errorMessage(error));
    } finally {
      setResetCodePending(false);
    }
  }

  async function savePhone(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSavingPhone(true);
    setPhoneStatus(null);
    try {
      await updateUserAttributes({ userAttributes: { phone_number: phone } });
      await sendUserAttributeVerificationCode({ userAttributeKey: 'phone_number' });
      setPopup('phoneVerify');
    } catch (error) {
      setPhoneStatus({ tone: 'error', message: errorMessage(error) });
    } finally {
      setSavingPhone(false);
    }
  }

  async function confirmPhone(code: string): Promise<void> {
    setPhoneCodePending(true);
    setPhoneCodeError(null);
    try {
      await confirmUserAttribute({ userAttributeKey: 'phone_number', confirmationCode: code });
      await reload();
      setPhone('');
      setPopup(null);
      setPhoneStatus({ tone: 'ok', message: 'Phone number updated.' });
    } catch (error) {
      setPhoneCodeError(errorMessage(error));
    } finally {
      setPhoneCodePending(false);
    }
  }

  async function openTotpSetup(): Promise<void> {
    if (!user) return;
    setTotpPending(true);
    setTotpError(null);
    try {
      const details = await setUpTOTP();
      setTotpSetupDetails({
        secret: details.sharedSecret,
        uri: details.getSetupUri('Building Better Algorithms', user.email).toString(),
      });
      setPopup('totp');
    } catch (err) {
      setTotpError(errorMessage(err));
    } finally {
      setTotpPending(false);
    }
  }

  async function confirmTotpSetup(code: string): Promise<void> {
    setTotpPending(true);
    setTotpError(null);
    try {
      await verifyTOTPSetup({ code });
      await updateMFAPreference({ totp: 'PREFERRED' });
      setTotpEnrolled(true);
      setTotpSuccess(true);
      setTotpSetupDetails(null);
      setPopup(null);
    } catch (err) {
      setTotpError(errorMessage(err));
    } finally {
      setTotpPending(false);
    }
  }

  async function removeAccount(): Promise<void> {
    setDeleteError(null);
    const result = await deleteAccount({});
    if (result.error) {
      setDeleteError(
        result.error.networkError ? 'Network error. Please try again.' : result.error.message,
      );
      return;
    }
    setPopup(null);
    await logout();
    void navigate('/');
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="account-panel">
      <canvas ref={canvasRef} className="auth-canvas" />

      <section className="page account">
        <div className="account-card">
          {/* ── Card header ──────────────────────────────────────────── */}
          <div className="account-card-header">
            {iconPhase === 'in' ? (
              <LordIcon
                key="acct-icon-in"
                src={ICONS.accountPage}
                size={64}
                trigger="in"
                state="in-reveal"
                stroke="bold"
              />
            ) : (
              <LordIcon
                key="acct-icon-idle"
                src={ICONS.accountPage}
                size={64}
                trigger="hover"
                stroke="bold"
              />
            )}
            <h1>Account</h1>
            <button
              type="button"
              className="auth-security-btn"
              onClick={() => {
                setShowSecurity(true);
              }}
              aria-label="How is my data protected?"
            >
              <LordIcon src={ICONS.securityShield} size={22} trigger="hover" stroke="bold" />
            </button>
          </div>

          {/* ── Profile ──────────────────────────────────────────────── */}
          <div className="account-section">
            <h2>Profile</h2>
            <dl className="account-profile">
              <div>
                <dt>Name</dt>
                <dd>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{user.phone || '—'}</dd>
              </div>
            </dl>
          </div>

          {/* ── First name ───────────────────────────────────────────── */}
          <div className="account-section">
            <h2>First name</h2>
            <form className="account-form" onSubmit={(e) => void saveFirstName(e)}>
              <label>
                New first name
                <input
                  type="text"
                  value={firstName}
                  required
                  maxLength={20}
                  autoComplete="given-name"
                  onChange={(e) => {
                    setFirstName(capitalizeFirst(e.target.value.slice(0, 20)));
                  }}
                />
              </label>
              <button type="submit" disabled={savingFirstName}>
                {savingFirstName ? 'Saving…' : 'Update first name'}
              </button>
              {firstNameStatus && (
                <p className={`account-status account-status--${firstNameStatus.tone}`}>
                  {firstNameStatus.message}
                </p>
              )}
            </form>
          </div>

          {/* ── Last name ────────────────────────────────────────────── */}
          <div className="account-section">
            <h2>Last name</h2>
            <form className="account-form" onSubmit={(e) => void saveLastName(e)}>
              <label>
                New last name
                <input
                  type="text"
                  value={lastName}
                  required
                  maxLength={20}
                  autoComplete="family-name"
                  onChange={(e) => {
                    setLastName(capitalizeFirst(e.target.value.slice(0, 20)));
                  }}
                />
              </label>
              <button type="submit" disabled={savingLastName}>
                {savingLastName ? 'Saving…' : 'Update last name'}
              </button>
              {lastNameStatus && (
                <p className={`account-status account-status--${lastNameStatus.tone}`}>
                  {lastNameStatus.message}
                </p>
              )}
            </form>
          </div>

          {/* ── Email ────────────────────────────────────────────────── */}
          <div className="account-section">
            <h2>Email address</h2>
            <form className="account-form" onSubmit={(e) => void saveEmail(e)}>
              <label>
                New email address
                <input
                  type="email"
                  value={email}
                  required
                  maxLength={50}
                  autoComplete="email"
                  onChange={(e) => {
                    setEmail(e.target.value.slice(0, 50));
                  }}
                />
              </label>
              <button type="submit" disabled={savingEmail}>
                {savingEmail ? 'Sending code…' : 'Update email'}
              </button>
              {emailStatus && (
                <p className={`account-status account-status--${emailStatus.tone}`}>
                  {emailStatus.message}
                </p>
              )}
            </form>
          </div>

          {/* ── Password ─────────────────────────────────────────────── */}
          <div className="account-section">
            <h2>Password</h2>
            <form className="account-form" onSubmit={(e) => void sendPasswordResetCode(e)}>
              <label>
                New password
                <input
                  type="password"
                  value={newPassword}
                  required
                  minLength={8}
                  maxLength={50}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setNewPassword(e.target.value.slice(0, 50));
                  }}
                />
              </label>
              <PasswordStrength password={newPassword} />
              <button
                type="submit"
                disabled={sendingResetCode || getStrength(newPassword) === 'weak' || !newPassword}
              >
                {sendingResetCode ? 'Sending code…' : 'Send reset code to email'}
              </button>
              {passwordStatus && (
                <p className={`account-status account-status--${passwordStatus.tone}`}>
                  {passwordStatus.message}
                </p>
              )}
            </form>
          </div>

          {/* ── Phone number ─────────────────────────────────────────── */}
          <div className="account-section">
            <h2>Phone number</h2>
            <form className="account-form" onSubmit={(e) => void savePhone(e)}>
              <label>
                New phone number
                <PhoneInput value={phone} onChange={setPhone} required />
              </label>
              <button type="submit" disabled={savingPhone}>
                {savingPhone ? 'Sending code…' : 'Update phone'}
              </button>
              {phoneStatus && (
                <p className={`account-status account-status--${phoneStatus.tone}`}>
                  {phoneStatus.message}
                </p>
              )}
            </form>
          </div>

          {/* ── Two-factor auth ──────────────────────────────────────── */}
          <div className="account-section">
            <h2>Two-factor authentication</h2>
            {totpEnrolled === null ? (
              <p className="account-note">Checking status…</p>
            ) : (
              <div className="account-totp-row">
                <span
                  className={`account-totp-badge${totpEnrolled ? ' account-totp-badge--on' : ' account-totp-badge--off'}`}
                >
                  {totpEnrolled ? '✓ TOTP enabled' : '✗ Not enrolled'}
                </span>
                {totpSuccess && (
                  <span className="account-status account-status--ok">Authenticator updated.</span>
                )}
                <button
                  type="button"
                  className="account-btn"
                  disabled={totpPending}
                  onClick={() => void openTotpSetup()}
                >
                  {totpPending
                    ? 'Loading…'
                    : totpEnrolled
                      ? 'Re-enroll authenticator'
                      : 'Set up authenticator'}
                </button>
                {totpError && <p className="account-status account-status--error">{totpError}</p>}
              </div>
            )}
          </div>

          {/* ── Delete account ───────────────────────────────────────── */}
          <div className="account-section account-section--danger">
            <h2 className="account-section-title--danger">Delete account</h2>
            <p className="account-note">
              Permanently erases your preference data and Cognito account.
            </p>
            <button
              type="button"
              className="account-btn account-btn--danger"
              onClick={() => {
                setDeleteError(null);
                setPopup('delete');
              }}
            >
              Delete my account
            </button>
          </div>
        </div>
      </section>

      {/* ── Email verification popup ──────────────────────────────────────── */}
      {popup === 'emailVerify' && (
        <AccountPopup
          icon={ICONS.mailShield}
          title="Verify new email"
          onClose={() => {
            setPopup(null);
          }}
        >
          <CodeForm
            description={`Enter the verification code sent to ${email}.`}
            submitLabel="Confirm email"
            pending={emailCodePending}
            error={emailCodeError}
            onSubmit={(code) => void confirmEmail(code)}
            onResend={() => void resendEmailCode()}
          />
        </AccountPopup>
      )}

      {/* ── Password reset code popup ─────────────────────────────────────── */}
      {popup === 'passwordReset' && (
        <AccountPopup
          icon={ICONS.mailShield}
          title="Reset password"
          onClose={() => {
            setPopup(null);
          }}
        >
          <CodeForm
            description={`Enter the reset code we sent to ${user.email}.`}
            submitLabel="Reset password"
            pending={resetCodePending}
            error={resetCodeError}
            onSubmit={(code) => void confirmPasswordReset(code)}
          />
        </AccountPopup>
      )}

      {/* ── Phone verification popup ──────────────────────────────────────── */}
      {popup === 'phoneVerify' && (
        <AccountPopup
          icon={ICONS.fingerprint}
          title="Verify phone number"
          onClose={() => {
            setPopup(null);
          }}
        >
          <CodeForm
            description={`Enter the code we texted to your new number.`}
            submitLabel="Verify phone"
            pending={phoneCodePending}
            error={phoneCodeError}
            onSubmit={(code) => void confirmPhone(code)}
          />
        </AccountPopup>
      )}

      {/* ── TOTP setup popup ─────────────────────────────────────────────── */}
      {popup === 'totp' && totpSetupDetails && (
        <AccountPopup
          icon={ICONS.qrCode}
          title="Set up authenticator"
          onClose={() => {
            setPopup(null);
            setTotpError(null);
          }}
        >
          <TotpSetupForm
            secret={totpSetupDetails.secret}
            setupUri={totpSetupDetails.uri}
            pending={totpPending}
            error={totpError}
            onSubmit={(code) => void confirmTotpSetup(code)}
          />
        </AccountPopup>
      )}

      {/* ── Delete confirmation popup ─────────────────────────────────────── */}
      {popup === 'delete' && (
        <AccountPopup
          danger
          onClose={() => {
            setPopup(null);
          }}
        >
          <div className="auth-form">
            <h2>Delete account?</h2>
            <p className="auth-description">
              This permanently removes your preference data and Cognito account. This action cannot
              be undone.
            </p>
            <button
              type="button"
              className="account-btn account-btn--danger"
              disabled={deletion.fetching}
              onClick={() => void removeAccount()}
            >
              {deletion.fetching ? 'Deleting…' : 'Delete my account'}
            </button>
            {deleteError && <p className="auth-error">{deleteError}</p>}
          </div>
        </AccountPopup>
      )}

      {showSecurity && (
        <SecurityInfo
          onClose={() => {
            setShowSecurity(false);
          }}
        />
      )}
    </div>
  );
}
