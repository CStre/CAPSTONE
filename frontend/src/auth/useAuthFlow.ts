/**
 * @fileoverview State machine hook for the auth panel.
 *
 * All auth state, side effects, and handler functions live here so that
 * AuthPanel can be a thin render shell. This hook has no JSX dependency —
 * AuthPanel owns all refs, layout effects, and React element rendering.
 */
import { useEffect, useRef, useState } from 'react';
import { useMutation } from 'urql';
import { graphql } from '../gql';
import {
  beginSignIn,
  beginTotpEnrollment,
  confirmForgotPassword,
  confirmPhoneVerification,
  confirmRegistration,
  confirmTotpEnrollment,
  forgotPassword,
  register,
  requestEmailMfa,
  resendConfirmation,
  selectMfaType,
  sendPhoneVerification,
  setEmailMfaPreferred,
  submitSignInCode,
  type NextAction,
} from './flow';

export type Step =
  | 'signIn'
  | 'signUp'
  | 'confirmSignUp'
  | 'phoneConsent'
  | 'confirmPhone'
  | 'totpSetup'
  | 'totpEnroll'
  | 'mfaCode'
  | 'mfaSelect'
  | 'mfaEmail'
  | 'forgotChoice'
  | 'forgotEmailPhone'
  | 'forgotEmailCode'
  | 'forgotPasswordEmail'
  | 'forgotPasswordCode';

export type MfaIconPhase = 'in' | 'idle';

const FindEmailByPhoneMutation = graphql(`
  mutation FindEmailByPhone($phone: String!) {
    findEmailByPhone(phone: $phone)
  }
`);

const MAX_ATTEMPTS = 3;

/** Everything AuthPanel needs to render the current auth step. */
export interface AuthFlowReturn {
  step: Step;
  email: string;
  forgotEmail: string;
  totp: { secret: string; uri: string } | null;
  enroll: { secret: string; uri: string };
  pending: boolean;
  error: string | null;
  showSecurity: boolean;
  mfaIconPhase: MfaIconPhase;
  signUpIconPhase: 'in' | 'idle';
  isFlipped: boolean;
  setShowSecurity: (v: boolean) => void;
  goToStep: (next: Step) => void;
  handleSignIn: (email: string, password: string) => void;
  handleSignUp: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ) => void;
  handleConfirmSignUp: (code: string) => Promise<void>;
  handlePhoneConsentVerify: () => Promise<void>;
  handlePhoneConsentSkip: () => void;
  handleTotpEnrollSubmit: (code: string) => void;
  handleTotpEnrollSkip: () => void;
  handleConfirmPhone: (code: string) => Promise<void>;
  handleSelectMfa: (type: 'TOTP' | 'EMAIL') => void;
  handleRequestEmailMfa: () => void;
  handleMfaSelectTotpSubmit: (code: string) => Promise<void>;
  handleMfaCodeSubmit: (code: string) => Promise<void>;
  handleTotpSetupSubmit: (code: string) => void;
  handleResend: () => void;
  handleForgotEmailPhone: (phone: string) => Promise<void>;
  handleForgotEmailCode: (code: string, newPassword: string) => Promise<void>;
  handleForgotPasswordEmail: (email: string) => Promise<void>;
  handleForgotPasswordCode: (code: string, newPassword: string) => Promise<void>;
  maskEmail: (e: string) => string;
}

export function useAuthFlow(reload: () => Promise<void>): AuthFlowReturn {
  const [step, setStep] = useState<Step>('signIn');
  const [email, setEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [totp, setTotp] = useState<{ secret: string; uri: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSecurity, setShowSecurity] = useState(false);
  const [mfaIconPhase, setMfaIconPhase] = useState<MfaIconPhase>('in');
  const mfaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [signUpIconPhase, setSignUpIconPhase] = useState<'in' | 'idle'>('idle');
  const signUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [codeAttempts, setCodeAttempts] = useState(0);
  const [storedAction, setStoredAction] = useState<NextAction | null>(null);
  const [enroll, setEnroll] = useState({ secret: '', uri: '' });

  const [, findEmailByPhone] = useMutation(FindEmailByPhoneMutation);

  // Animate the MFA icon on entry; idle after 2 s so hover-trigger takes over
  useEffect(() => {
    if (step !== 'mfaCode') return;
    mfaTimerRef.current = setTimeout(() => {
      setMfaIconPhase('idle');
    }, 2000);
    return () => {
      if (mfaTimerRef.current !== null) clearTimeout(mfaTimerRef.current);
    };
  }, [step]);

  // Fetch TOTP enrollment data when the enroll step becomes active
  useEffect(() => {
    if (step !== 'totpEnroll') return;
    void (async () => {
      setError(null);
      setPending(true);
      try {
        const { secret, uri } = await beginTotpEnrollment(email);
        setEnroll({ secret, uri });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not start 2FA setup.');
      } finally {
        setPending(false);
      }
    })();
  }, [step, email]);

  // Delay the sign-up icon animation until after the card flip completes
  useEffect(() => {
    if (step !== 'signUp') return;
    const flipTimer = setTimeout(() => {
      setSignUpIconPhase('in');
      signUpTimerRef.current = setTimeout(() => {
        setSignUpIconPhase('idle');
      }, 3000);
    }, 250);
    return () => {
      clearTimeout(flipTimer);
      if (signUpTimerRef.current !== null) clearTimeout(signUpTimerRef.current);
    };
  }, [step]);

  // ── Internal helpers ───────────────────────────────────────────────────────

  function applyAction(action: NextAction): void {
    switch (action.kind) {
      case 'done':
        void reload();
        break;
      case 'signIn':
        setStep('signIn');
        break;
      case 'confirmSignUp':
        setCodeAttempts(0);
        setStep('confirmSignUp');
        break;
      case 'confirmPhone':
        setStep('confirmPhone');
        break;
      case 'selectMfa':
        setStep('mfaSelect');
        break;
      case 'mfaCode':
        setCodeAttempts(0);
        setMfaIconPhase('in');
        setStep('mfaCode');
        break;
      case 'emailCode':
        setCodeAttempts(0);
        setStep('mfaEmail');
        break;
      case 'totpSetup':
        setTotp({ secret: action.secret, uri: action.setupUri });
        setStep('totpSetup');
        break;
    }
  }

  function handleCodeFailure(err: unknown): void {
    const next = codeAttempts + 1;
    if (next >= MAX_ATTEMPTS) {
      setCodeAttempts(0);
      setError('Too many failed attempts. Please sign in again.');
      setStep('signIn');
    } else {
      setCodeAttempts(next);
      setError(err instanceof Error ? err.message : 'Incorrect code. Please try again.');
    }
  }

  async function runStep(call: () => Promise<NextAction>): Promise<void> {
    setError(null);
    setPending(true);
    try {
      applyAction(await call());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleSignIn(emailValue: string, password: string): void {
    setEmail(emailValue);
    void runStep(async () => {
      const action = await beginSignIn(emailValue, password);
      // If Cognito issued no MFA challenge the user has no preference set.
      // Silently register email OTP so every future sign-in requires it.
      if (action.kind === 'done') {
        await setEmailMfaPreferred().catch(() => undefined);
      }
      return action;
    });
  }

  function handleSignUp(
    emailValue: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ): void {
    setEmail(emailValue);
    void runStep(() => register(emailValue, password, firstName, lastName, phone));
  }

  async function handleConfirmSignUp(code: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      const action = await confirmRegistration(email, code);
      setStoredAction(action);
      setStep('phoneConsent');
    } catch (err: unknown) {
      handleCodeFailure(err);
    } finally {
      setPending(false);
    }
  }

  async function handlePhoneConsentVerify(): Promise<void> {
    setError(null);
    setPending(true);
    try {
      await sendPhoneVerification();
      setStep('confirmPhone');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not send verification code.');
    } finally {
      setPending(false);
    }
  }

  function handlePhoneConsentSkip(): void {
    // If Cognito requires TOTP during auto sign-in, apply that challenge.
    // Otherwise offer optional TOTP enrollment before entering the app.
    if (storedAction?.kind === 'totpSetup') {
      applyAction(storedAction);
    } else {
      setStep('totpEnroll');
    }
  }

  function handleTotpEnrollSubmit(code: string): void {
    void runStep(async () => {
      await confirmTotpEnrollment(code);
      return { kind: 'done' };
    });
  }

  function handleTotpEnrollSkip(): void {
    // Register email OTP as the fallback MFA method before entering the app.
    void setEmailMfaPreferred()
      .catch(() => undefined)
      .then(() => reload());
  }

  async function handleConfirmPhone(code: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      await confirmPhoneVerification(code);
      if (storedAction?.kind === 'totpSetup') {
        applyAction(storedAction);
      } else {
        setStep('totpEnroll');
      }
    } catch (err: unknown) {
      handleCodeFailure(err);
    } finally {
      setPending(false);
    }
  }

  function handleSelectMfa(type: 'TOTP' | 'EMAIL'): void {
    void runStep(() => selectMfaType(type, email));
  }

  function handleRequestEmailMfa(): void {
    void runStep(() => requestEmailMfa(email));
  }

  // Called from the mfaSelect screen when the user submits a TOTP code directly.
  // Selects TOTP as the method first, then immediately submits the code — two
  // confirmSignIn calls back-to-back; Amplify holds the session between them.
  async function handleMfaSelectTotpSubmit(code: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      await selectMfaType('TOTP', email);
      applyAction(await submitSignInCode(code, email));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Incorrect code. Please sign in again.');
      setStep('signIn');
    } finally {
      setPending(false);
    }
  }

  // Handles both TOTP and email OTP MFA code challenges — behaviour is identical.
  async function handleMfaCodeSubmit(code: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      applyAction(await submitSignInCode(code, email));
    } catch (err: unknown) {
      setCodeAttempts(0);
      setError(err instanceof Error ? err.message : 'Incorrect code. Please sign in again.');
      setStep('signIn');
    } finally {
      setPending(false);
    }
  }

  function handleTotpSetupSubmit(code: string): void {
    void runStep(() => submitSignInCode(code, email));
  }

  function handleResend(): void {
    void resendConfirmation(email).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    });
  }

  // ── Forgot flows ───────────────────────────────────────────────────────────

  async function handleForgotEmailPhone(phone: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      const result = await findEmailByPhone({ phone });
      if (result.error) {
        setError(result.error.message || 'Something went wrong. Please try again.');
        return;
      }
      const found = result.data?.findEmailByPhone;
      if (!found) {
        setError('No account found with that phone number.');
        return;
      }
      setForgotEmail(found);
      await forgotPassword(found);
      setStep('forgotEmailCode');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  async function handleForgotEmailCode(code: string, newPassword: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      await confirmForgotPassword(forgotEmail, code, newPassword);
      setEmail(forgotEmail);
      setError(null);
      setStep('signIn');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.');
    } finally {
      setPending(false);
    }
  }

  async function handleForgotPasswordEmail(emailValue: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      await forgotPassword(emailValue);
      setEmail(emailValue);
      setStep('forgotPasswordCode');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  }

  async function handleForgotPasswordCode(code: string, newPassword: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      await confirmForgotPassword(email, code, newPassword);
      setStep('signIn');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.');
    } finally {
      setPending(false);
    }
  }

  // ── Navigation helper ──────────────────────────────────────────────────────

  function goToStep(next: Step): void {
    setError(null);
    setStep(next);
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  /** Mask an email for display: j***@example.com */
  function maskEmail(e: string): string {
    const [local, domain] = e.split('@');
    if (!local || !domain) return e;
    return `${local[0]}***@${domain}`;
  }

  const isFlipped = step === 'signUp' || step === 'confirmSignUp';

  return {
    step,
    email,
    forgotEmail,
    totp,
    enroll,
    pending,
    error,
    showSecurity,
    setShowSecurity,
    mfaIconPhase,
    signUpIconPhase,
    isFlipped,
    goToStep,
    handleSignIn,
    handleSignUp,
    handleConfirmSignUp,
    handlePhoneConsentVerify,
    handlePhoneConsentSkip,
    handleTotpEnrollSubmit,
    handleTotpEnrollSkip,
    handleConfirmPhone,
    handleSelectMfa,
    handleRequestEmailMfa,
    handleMfaSelectTotpSubmit,
    handleMfaCodeSubmit,
    handleTotpSetupSubmit,
    handleResend,
    handleForgotEmailPhone,
    handleForgotEmailCode,
    handleForgotPasswordEmail,
    handleForgotPasswordCode,
    maskEmail,
  };
}
