/**
 * @fileoverview Account page — profile and account management, all in one card.
 *
 * Email/TOTP changes open a shared glass popup that reuses the same CodeForm
 * and TotpSetupForm components from the auth flow. Account deletion uses a
 * separate danger-styled confirmation modal.
 */
import React, { useState, useEffect, useRef } from 'react';
import type { ReactElement, ReactNode, SyntheticEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useMutation } from 'urql';
import {
  confirmUserAttribute,
  fetchMFAPreference,
  sendUserAttributeVerificationCode,
  setUpTOTP,
  updatePassword,
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
import { PasswordStrength } from '../../components/PasswordStrength/PasswordStrength';
import { SecurityInfo } from '../../components/SecurityInfo/SecurityInfo';
import { CodeForm } from '../../auth/CodeForm';
import { TotpSetupForm } from '../../auth/TotpSetupForm';
import './AccountPage.css';

const DeleteAccountMutation = graphql(`
  mutation DeleteAccount {
    deleteAccount
  }
`);

type Status = { tone: 'ok' | 'error'; message: string } | null;
type Popup = 'emailVerify' | 'totp' | 'delete' | null;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

/** Glass popup overlay — matches SecurityInfo exactly, including card tilt. */
function AccountPopup({
  onClose,
  danger,
  icon,
  iconTrigger,
  title,
  children,
}: {
  onClose: () => void;
  danger?: boolean;
  icon?: string;
  iconTrigger?: 'hover' | 'loop' | 'loop-on-hover' | 'click' | 'in';
  title?: string;
  children: ReactNode;
}): ReactElement {
  const { ref, rx, ry, isHovered } = useCardTilt(4);

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
            <LordIcon src={icon} size={64} trigger={iconTrigger ?? 'hover'} stroke="bold" />
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

  // ── Display name ─────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [nameStatus, setNameStatus] = useState<Status>(null);
  const [savingName, setSavingName] = useState(false);

  // ── Email ─────────────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<Status>(null);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailCodePending, setEmailCodePending] = useState(false);
  const [emailCodeError, setEmailCodeError] = useState<string | null>(null);

  // ── Password ─────────────────────────────────────────────────────────────
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [savingPassword, setSavingPassword] = useState(false);

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

  async function saveName(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSavingName(true);
    setNameStatus(null);
    try {
      await updateUserAttributes({ userAttributes: { name } });
      await reload();
      setName('');
      setNameStatus({ tone: 'ok', message: 'Display name updated.' });
    } catch (error) {
      setNameStatus({ tone: 'error', message: errorMessage(error) });
    } finally {
      setSavingName(false);
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

  async function savePassword(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSavingPassword(true);
    setPasswordStatus(null);
    try {
      await updatePassword({ oldPassword, newPassword });
      setOldPassword('');
      setNewPassword('');
      setPasswordStatus({ tone: 'ok', message: 'Password updated.' });
    } catch (error) {
      setPasswordStatus({ tone: 'error', message: errorMessage(error) });
    } finally {
      setSavingPassword(false);
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
              onClick={() => { setShowSecurity(true); }}
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
                <dd>{user.name || '—'}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>
          </div>

          {/* ── Display name ─────────────────────────────────────────── */}
          <div className="account-section">
            <h2>Display name</h2>
            <form className="account-form" onSubmit={(e) => void saveName(e)}>
              <label>
                New display name
                <input
                  type="text"
                  value={name}
                  required
                  autoComplete="name"
                  onChange={(e) => { setName(e.target.value); }}
                />
              </label>
              <button type="submit" disabled={savingName}>
                {savingName ? 'Saving…' : 'Update name'}
              </button>
              {nameStatus && (
                <p className={`account-status account-status--${nameStatus.tone}`}>
                  {nameStatus.message}
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
                  autoComplete="email"
                  onChange={(e) => { setEmail(e.target.value); }}
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
            <form className="account-form" onSubmit={(e) => void savePassword(e)}>
              <label>
                Current password
                <input
                  type="password"
                  value={oldPassword}
                  required
                  autoComplete="current-password"
                  onChange={(e) => { setOldPassword(e.target.value); }}
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  value={newPassword}
                  required
                  autoComplete="new-password"
                  onChange={(e) => { setNewPassword(e.target.value); }}
                />
              </label>
              <PasswordStrength password={newPassword} />
              <button type="submit" disabled={savingPassword}>
                {savingPassword ? 'Saving…' : 'Update password'}
              </button>
              {passwordStatus && (
                <p className={`account-status account-status--${passwordStatus.tone}`}>
                  {passwordStatus.message}
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
          icon={ICONS.emailSend}
          iconTrigger="in"
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
