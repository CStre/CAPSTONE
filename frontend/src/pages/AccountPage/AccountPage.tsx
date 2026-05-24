/**
 * @fileoverview Account page — profile and account management.
 *
 * Identity (name, email, password, MFA) lives in Cognito, so display-name and
 * password changes go through Amplify Auth. Deleting the account runs the
 * `deleteAccount` mutation, which removes both the DynamoDB record and the
 * Cognito user; the local session is then cleared.
 */
import { useState, useEffect, useRef } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useMutation } from 'urql';
import {
  fetchMFAPreference,
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
import { PasswordStrength } from '../../components/PasswordStrength/PasswordStrength';
import { SecurityInfo } from '../../components/SecurityInfo/SecurityInfo';
import { TotpSetupForm } from '../../auth/TotpSetupForm';
import './AccountPage.css';

/** Remove the user's stored data and Cognito account. */
const DeleteAccountMutation = graphql(`
  mutation DeleteAccount {
    deleteAccount
  }
`);

/** Outcome of a form action, shown inline beneath the form. */
type Status = { tone: 'ok' | 'error'; message: string } | null;

/** Pull a human-readable message off an unknown thrown value. */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong. Try again.';
}

export function AccountPage(): ReactElement {
  const { status, user, reload, logout } = useAuth();
  const navigate = useNavigate();
  const [deletion, deleteAccount] = useMutation(DeleteAccountMutation);
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasAnimation(canvasRef, theme);

  const [name, setName] = useState('');
  const [nameStatus, setNameStatus] = useState<Status>(null);
  const [savingName, setSavingName] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [totpEnrolled, setTotpEnrolled] = useState<boolean | null>(null);
  const [showTotpSetup, setShowTotpSetup] = useState(false);
  const [totpSetupDetails, setTotpSetupDetails] = useState<{
    secret: string;
    uri: string;
  } | null>(null);
  const [totpPending, setTotpPending] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpSuccess, setTotpSuccess] = useState(false);

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

  /** Update the Cognito display-name attribute. */
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

  /** Change the Cognito password. */
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

  /** Begin TOTP re-enrollment — fetches a new secret and QR code. */
  async function startTotpSetup(): Promise<void> {
    if (!user) return;
    setTotpPending(true);
    setTotpError(null);
    try {
      const details = await setUpTOTP();
      setTotpSetupDetails({
        secret: details.sharedSecret,
        uri: details.getSetupUri('Building Better Algorithms', user.email).toString(),
      });
      setShowTotpSetup(true);
    } catch (err) {
      setTotpError(errorMessage(err));
    } finally {
      setTotpPending(false);
    }
  }

  /** Confirm the TOTP re-enrollment with the 6-digit code. */
  async function confirmTotpSetup(code: string): Promise<void> {
    setTotpPending(true);
    setTotpError(null);
    try {
      await verifyTOTPSetup({ code });
      setTotpEnrolled(true);
      setTotpSuccess(true);
      setShowTotpSetup(false);
      setTotpSetupDetails(null);
    } catch (err) {
      setTotpError(errorMessage(err));
    } finally {
      setTotpPending(false);
    }
  }

  /** Permanently delete the account, then sign out. */
  async function removeAccount(): Promise<void> {
    setDeleteError(null);
    const result = await deleteAccount({});
    if (result.error) {
      setDeleteError(
        result.error.networkError ? 'Network error. Please try again.' : result.error.message,
      );
      return;
    }
    setShowDeleteModal(false);
    await logout();
    void navigate('/');
  }

  return (
    <div className="account-panel">
      <canvas ref={canvasRef} className="auth-canvas" />

      <section className="page account">
        <div className="account-header">
          <LordIcon src={ICONS.accountPage} size={80} trigger="hover" stroke="bold" />
          <h1>Account Details</h1>
        </div>

        <div className="account-card">
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
          <p className="account-note">
            Email is managed through Cognito sign-in.{' '}
            <button
              type="button"
              className="account-link"
              onClick={() => {
                setShowSecurity(true);
              }}
            >
              How is my data protected?
            </button>
          </p>
        </div>

        <form className="account-card" onSubmit={(e) => void saveName(e)}>
          <h2>Display name</h2>
          <label className="account-field">
            <span>New display name</span>
            <input
              type="text"
              value={name}
              required
              autoComplete="name"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </label>
          <button type="submit" className="account-btn" disabled={savingName}>
            {savingName ? 'Saving…' : 'Update name'}
          </button>
          {nameStatus && (
            <p className={`account-status account-status--${nameStatus.tone}`}>
              {nameStatus.message}
            </p>
          )}
        </form>

        <form className="account-card" onSubmit={(e) => void savePassword(e)}>
          <h2>Password</h2>
          <label className="account-field">
            <span>Current password</span>
            <input
              type="password"
              value={oldPassword}
              required
              autoComplete="current-password"
              onChange={(e) => {
                setOldPassword(e.target.value);
              }}
            />
          </label>
          <label className="account-field">
            <span>New password</span>
            <input
              type="password"
              value={newPassword}
              required
              autoComplete="new-password"
              onChange={(e) => {
                setNewPassword(e.target.value);
              }}
            />
          </label>
          <PasswordStrength password={newPassword} />
          <button type="submit" className="account-btn" disabled={savingPassword}>
            {savingPassword ? 'Saving…' : 'Update password'}
          </button>
          {passwordStatus && (
            <p className={`account-status account-status--${passwordStatus.tone}`}>
              {passwordStatus.message}
            </p>
          )}
        </form>

        <div className="account-card">
          <h2>Two-factor authentication</h2>
          {totpEnrolled === null ? (
            <p className="account-note">Checking 2FA status…</p>
          ) : (
            <>
              <div className="account-totp-status">
                <span
                  className={`account-totp-badge${totpEnrolled ? ' account-totp-badge--on' : ' account-totp-badge--off'}`}
                >
                  {totpEnrolled ? '✓ TOTP enabled' : '✗ TOTP not enrolled'}
                </span>
                {totpSuccess && (
                  <span className="account-status account-status--ok">Authenticator updated.</span>
                )}
              </div>
              {!showTotpSetup ? (
                <button
                  type="button"
                  className="account-btn"
                  disabled={totpPending}
                  onClick={() => void startTotpSetup()}
                >
                  {totpPending
                    ? 'Loading…'
                    : totpEnrolled
                      ? 'Re-enroll authenticator'
                      : 'Set up authenticator'}
                </button>
              ) : totpSetupDetails ? (
                <TotpSetupForm
                  secret={totpSetupDetails.secret}
                  setupUri={totpSetupDetails.uri}
                  pending={totpPending}
                  error={totpError}
                  onSubmit={(code) => void confirmTotpSetup(code)}
                />
              ) : null}
              {totpError && !showTotpSetup && (
                <p className="account-status account-status--error">{totpError}</p>
              )}
            </>
          )}
        </div>

        <div className="account-card account-card--danger">
          <h2>Delete account</h2>
          <p>This erases your preference data and Cognito account for good.</p>
          <button
            type="button"
            className="account-btn account-btn--danger"
            onClick={() => {
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
          >
            Delete my account
          </button>
        </div>
      </section>

      {showSecurity && (
        <SecurityInfo
          onClose={() => {
            setShowSecurity(false);
          }}
        />
      )}

      {showDeleteModal && (
        <div
          className="account-modal-overlay"
          onClick={() => {
            setShowDeleteModal(false);
          }}
        >
          <div
            className="account-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <h2>Delete account?</h2>
            <p>
              This permanently removes your preference data and Cognito account. This action cannot
              be undone.
            </p>
            <div className="account-modal-actions">
              <button
                type="button"
                className="account-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="account-btn account-btn--danger"
                disabled={deletion.fetching}
                onClick={() => void removeAccount()}
              >
                {deletion.fetching ? 'Deleting…' : 'Delete my account'}
              </button>
            </div>
            {deleteError && <p className="account-status account-status--error">{deleteError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
