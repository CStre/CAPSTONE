/**
 * @fileoverview Account page — profile and account management.
 *
 * Identity (name, email, password, MFA) lives in Cognito, so display-name and
 * password changes go through Amplify Auth. Deleting the account runs the
 * `deleteAccount` mutation, which removes both the DynamoDB record and the
 * Cognito user; the local session is then cleared.
 */
import { useState } from 'react';
import type { ReactElement, SyntheticEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useMutation } from 'urql';
import { updatePassword, updateUserAttributes } from 'aws-amplify/auth';
import { graphql } from '../../gql';
import { useAuth } from '../../auth/context';
import { Loader } from '../../components/Loader/Loader';
import { LordIcon, ICONS } from '../../components/LordIcon/LordIcon';
import { PasswordStrength } from '../../components/PasswordStrength/PasswordStrength';
import { SecurityInfo } from '../../components/SecurityInfo/SecurityInfo';
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

  const [name, setName] = useState('');
  const [nameStatus, setNameStatus] = useState<Status>(null);
  const [savingName, setSavingName] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<Status>(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

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

  /** Permanently delete the account, then sign out. */
  async function removeAccount(): Promise<void> {
    const confirmed = window.confirm(
      'Delete your account? This permanently removes your data and cannot be undone.',
    );
    if (!confirmed) return;

    const result = await deleteAccount({});
    if (result.error) return;
    await logout();
    void navigate('/');
  }

  return (
    <section className="page account">
      <div className="account-header">
        <LordIcon src={ICONS.accountPage} size={80} trigger="hover" stroke="bold" />
        <h1>Account Details</h1>
      </div>

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
        Email and two-factor authentication are managed through Cognito sign-in.{' '}
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
          {savingName ? 'Saving...' : 'Update name'}
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
          {savingPassword ? 'Saving...' : 'Update password'}
        </button>
        {passwordStatus && (
          <p className={`account-status account-status--${passwordStatus.tone}`}>
            {passwordStatus.message}
          </p>
        )}
      </form>

      {showSecurity && (
        <SecurityInfo
          onClose={() => {
            setShowSecurity(false);
          }}
        />
      )}

      <div className="account-card account-card--danger">
        <h2>Delete account</h2>
        <p>This erases your preference data and Cognito account for good.</p>
        <button
          type="button"
          className="account-btn account-btn--danger"
          disabled={deletion.fetching}
          onClick={() => void removeAccount()}
        >
          {deletion.fetching ? 'Deleting...' : 'Delete my account'}
        </button>
        {deletion.error && (
          <p className="account-status account-status--error">{deletion.error.message}</p>
        )}
      </div>
    </section>
  );
}
