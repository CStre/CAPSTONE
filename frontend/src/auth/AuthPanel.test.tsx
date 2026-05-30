/**
 * @fileoverview AuthPanel sign-in flow integration tests.
 *
 * Uses jest.unstable_mockModule + dynamic imports (the correct pattern for
 * ts-jest in ESM mode) so that the AuthPanel component picks up the mocked
 * flow.ts functions instead of the real Amplify wrappers.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'urql';
import { createMockClient } from '../test/urql';
import type { NextAction } from './flow';
import type { AuthContextValue } from './types';
import type { ReactElement, Context } from 'react';

// ── Mock functions declared before unstable_mockModule so tests can access ───

const mockBeginSignIn = jest.fn<(email: string, password: string) => Promise<NextAction>>();
const mockSubmitSignInCode = jest.fn<(code: string, email: string) => Promise<NextAction>>();
const mockSelectMfaType = jest.fn<(type: 'TOTP' | 'EMAIL', email: string) => Promise<NextAction>>();
const mockBeginTotpEnrollment =
  jest.fn<(email: string) => Promise<{ secret: string; uri: string }>>();
const mockConfirmTotpEnrollment = jest.fn<(code: string) => Promise<void>>();
const mockRegister =
  jest.fn<
    (
      email: string,
      password: string,
      firstName: string,
      lastName: string,
      phone: string,
    ) => Promise<NextAction>
  >();
const mockConfirmRegistration = jest.fn<(email: string, code: string) => Promise<NextAction>>();
const mockResendConfirmation = jest.fn<(email: string) => Promise<void>>();
const mockSendPhoneVerification = jest.fn<() => Promise<void>>();
const mockConfirmPhoneVerification = jest.fn<(code: string) => Promise<void>>();
const mockForgotPassword = jest.fn<(email: string) => Promise<void>>();
const mockConfirmForgotPassword =
  jest.fn<(email: string, code: string, newPassword: string) => Promise<void>>();
const mockSetEmailMfaPreferred = jest.fn<() => Promise<void>>();

// ── Module mocks (must precede the dynamic imports below) ────────────────────

jest.unstable_mockModule('./flow', () => ({
  beginSignIn: mockBeginSignIn,
  submitSignInCode: mockSubmitSignInCode,
  selectMfaType: mockSelectMfaType,
  beginTotpEnrollment: mockBeginTotpEnrollment,
  confirmTotpEnrollment: mockConfirmTotpEnrollment,
  register: mockRegister,
  confirmRegistration: mockConfirmRegistration,
  resendConfirmation: mockResendConfirmation,
  sendPhoneVerification: mockSendPhoneVerification,
  confirmPhoneVerification: mockConfirmPhoneVerification,
  forgotPassword: mockForgotPassword,
  confirmForgotPassword: mockConfirmForgotPassword,
  setTotpPreferred: jest.fn(),
  setEmailMfaPreferred: mockSetEmailMfaPreferred,
  requestEmailMfa: jest.fn(),
}));

jest.unstable_mockModule('../lib/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark' as const }),
}));

jest.unstable_mockModule('../components/CanvasAnimation/useCanvasAnimation', () => ({
  useCanvasAnimation: () => undefined,
}));

jest.unstable_mockModule('../components/GlassIsland/useCardTilt', () => ({
  useCardTilt: () => ({ ref: { current: null }, rx: 0, ry: 0, isHovered: false }),
}));

jest.unstable_mockModule('../components/LordIcon/LordIcon', () => ({
  LordIcon: () => null,
  ICONS: new Proxy({}, { get: () => '' }),
}));

jest.unstable_mockModule('../components/SecurityInfo/SecurityInfo', () => ({
  SecurityInfo: () => null,
}));

jest.unstable_mockModule('../components/CanvasAnimation/spawnParticles', () => ({
  spawnParticles: () => undefined,
}));

jest.unstable_mockModule('../gql', () => ({
  graphql: () => ({}),
}));

// ── Dynamic imports after mocks are registered ────────────────────────────────

let AuthPanel: () => ReactElement;
let AuthContext: Context<AuthContextValue | null>;

beforeAll(async () => {
  // ResizeObserver is used by AuthPanel for card height sync; jsdom doesn't have it.
  /* eslint-disable @typescript-eslint/no-empty-function */
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  /* eslint-enable @typescript-eslint/no-empty-function */

  ({ AuthPanel } = await import('./AuthPanel'));
  ({ AuthContext } = await import('./context'));
});

afterAll(() => {
  delete (global as Record<string, unknown>).ResizeObserver;
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    status: 'unauthenticated',
    user: null,
    reload: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    logout: jest.fn<() => Promise<void>>().mockResolvedValue(undefined),
    ...overrides,
  };
}

function renderPanel(authOverrides: Partial<AuthContextValue> = {}) {
  const authValue = buildAuthValue(authOverrides);
  const { client } = createMockClient();
  const view = render(
    <Provider value={client}>
      <AuthContext.Provider value={authValue}>
        <AuthPanel />
      </AuthContext.Provider>
    </Provider>,
  );
  // Both front and back cards are in the DOM (CSS flip card). Scope queries to
  // the front face to avoid ambiguous label matches (both forms have "Email").
  const frontCard = view.container.querySelector<HTMLElement>('.auth-card--front');
  if (!frontCard) throw new Error('.auth-card--front not found');
  return { ...view, authValue, front: within(frontCard) };
}

async function fillAndSubmitSignIn(
  front: ReturnType<typeof within>,
  email = 'user@example.com',
  password = 'Password1!',
): Promise<void> {
  const user = userEvent.setup();
  // within() returns BoundFunctions whose method types resolve as `any` in ts-eslint;
  // the calls are correct at runtime — suppress the false positives.
  /* eslint-disable @typescript-eslint/no-unsafe-call */
  await user.type(front.getByLabelText('Email') as HTMLElement, email);
  await user.type(front.getByLabelText('Password') as HTMLElement, password);
  await user.click(front.getByRole('button', { name: 'Sign in' }) as HTMLElement);
  /* eslint-enable @typescript-eslint/no-unsafe-call */
}

// ── sign-in → email OTP (happy path — no TOTP enrolled) ─────────────────────

describe('sign-in → email OTP', () => {
  beforeEach(() => {
    mockBeginSignIn.mockResolvedValue({ kind: 'emailCode' });
  });

  it('calls beginSignIn with the entered credentials', async () => {
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front, 'traveler@example.com', 'SecurePass1!');
    expect(mockBeginSignIn).toHaveBeenCalledWith('traveler@example.com', 'SecurePass1!');
  });

  it('renders the email code form after beginSignIn resolves', async () => {
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });
  });

  it("shows the user's email in the email code description", async () => {
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front, 'me@example.com');
    await waitFor(() => {
      expect(screen.getByText(/me@example\.com/)).toBeInTheDocument();
    });
  });

  it('calls reload when the email OTP code is verified successfully', async () => {
    mockSubmitSignInCode.mockResolvedValue({ kind: 'done' });
    const { authValue, front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => screen.getByText('Check your email'));

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Code'), '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(authValue.reload).toHaveBeenCalled();
    });
  });
});

// ── sign-in → TOTP code (TOTP-enrolled user) ────────────────────────────────

describe('sign-in → TOTP code', () => {
  beforeEach(() => {
    mockBeginSignIn.mockResolvedValue({ kind: 'mfaCode' });
  });

  it('renders the TOTP code form', async () => {
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => {
      expect(screen.getByText('Two-factor code')).toBeInTheDocument();
    });
  });

  it('calls reload when the TOTP code is verified successfully', async () => {
    mockSubmitSignInCode.mockResolvedValue({ kind: 'done' });
    const { authValue, front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => screen.getByText('Two-factor code'));

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Code'), '654321');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(authValue.reload).toHaveBeenCalled();
    });
  });

  it('returns to sign-in and shows an error on wrong TOTP code', async () => {
    mockSubmitSignInCode.mockRejectedValue(new Error('Invalid code'));
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => screen.getByText('Two-factor code'));

    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Code'), '000000');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(front.getByText('Invalid code')).toBeInTheDocument();
    });
    expect(front.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});

// ── sign-in → MFA selection (user has both TOTP and email MFA) ──────────────

describe('sign-in → MFA selection', () => {
  beforeEach(() => {
    mockBeginSignIn.mockResolvedValue({ kind: 'selectMfa' });
  });

  it('renders the MFA selection screen', async () => {
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => {
      expect(screen.getByText('Verify your identity')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: 'Authenticator app' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Email me a code' })).toBeInTheDocument();
  });

  it('advances to TOTP code form when Authenticator app is chosen', async () => {
    mockSelectMfaType.mockResolvedValue({ kind: 'mfaCode' });
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);

    await waitFor(() => screen.getByRole('button', { name: 'Authenticator app' }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Authenticator app' }));

    await waitFor(() => {
      expect(screen.getByText('Two-factor code')).toBeInTheDocument();
    });
    expect(mockSelectMfaType).toHaveBeenCalledWith('TOTP', 'user@example.com');
  });

  it('advances to email code form when Email me a code is chosen', async () => {
    mockSelectMfaType.mockResolvedValue({ kind: 'emailCode' });
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);

    await waitFor(() => screen.getByRole('button', { name: 'Email me a code' }));
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Email me a code' }));

    await waitFor(() => {
      expect(screen.getByText('Check your email')).toBeInTheDocument();
    });
    expect(mockSelectMfaType).toHaveBeenCalledWith('EMAIL', 'user@example.com');
  });
});

// ── sign-in → immediate done (no MFA challenge) ──────────────────────────────

describe('sign-in → done', () => {
  beforeEach(() => {
    mockSetEmailMfaPreferred.mockResolvedValue(undefined);
  });

  it('calls reload when beginSignIn resolves with done', async () => {
    mockBeginSignIn.mockResolvedValue({ kind: 'done' });
    const { authValue, front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => {
      expect(authValue.reload).toHaveBeenCalled();
    });
  });

  it('sets email MFA preferred when beginSignIn resolves with done', async () => {
    mockBeginSignIn.mockResolvedValue({ kind: 'done' });
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => {
      expect(mockSetEmailMfaPreferred).toHaveBeenCalled();
    });
  });

  it('still reloads even if setEmailMfaPreferred rejects', async () => {
    mockBeginSignIn.mockResolvedValue({ kind: 'done' });
    mockSetEmailMfaPreferred.mockRejectedValue(new Error('pref failed'));
    const { authValue, front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => {
      expect(authValue.reload).toHaveBeenCalled();
    });
  });
});

// ── sign-in error handling ───────────────────────────────────────────────────

describe('sign-in error', () => {
  it('shows the error message when beginSignIn rejects', async () => {
    mockBeginSignIn.mockRejectedValue(new Error('Incorrect username or password.'));
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => {
      expect(front.getByText('Incorrect username or password.')).toBeInTheDocument();
    });
  });

  it('stays on the sign-in form after an error', async () => {
    mockBeginSignIn.mockRejectedValue(new Error('Network error'));
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);
    await waitFor(() => front.getByText('Network error'));
    expect(front.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });
});

// ── TOTP setup during sign-in (CONTINUE_SIGN_IN_WITH_TOTP_SETUP) ─────────────

describe('sign-in → forced TOTP setup', () => {
  it('renders TotpSetupForm without a skip button when Cognito requires TOTP setup', async () => {
    mockBeginSignIn.mockResolvedValue({
      kind: 'totpSetup',
      secret: 'ABCDEFG',
      setupUri: 'otpauth://totp/Example?secret=ABCDEFG',
    });
    const { front } = renderPanel();
    await fillAndSubmitSignIn(front);

    await waitFor(() => {
      expect(screen.getByText(/scan the QR code/i)).toBeInTheDocument();
    });

    // totpSetup (sign-in challenge) has no skip; only totpEnroll (post-signup, optional) does.
    expect(screen.queryByRole('button', { name: /set up later/i })).not.toBeInTheDocument();
  });
});
