/**
 * @fileoverview Auth panel — the sign-in / sign-up / MFA / forgot flow state machine.
 *
 * Front face: signIn · mfaCode · mfaEmail · totpSetup · phoneConsent · confirmPhone
 *             forgotChoice · forgotEmailPhone · forgotEmailCode
 *             forgotPasswordEmail · forgotPasswordCode
 * Back face:  signUp · confirmSignUp
 */
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { ReactElement } from 'react';
import { useMutation } from 'urql';
import { useTheme } from '../lib/ThemeContext';
import { useCanvasAnimation } from '../components/CanvasAnimation/useCanvasAnimation';
import { useAuth } from './context';
import {
  beginSignIn,
  beginTotpEnrollment,
  confirmForgotPassword,
  confirmPhoneVerification,
  confirmRegistration,
  confirmTotpEnrollment,
  forgotPassword,
  register,
  resendConfirmation,
  selectMfaType,
  sendPhoneVerification,
  submitSignInCode,
  type NextAction,
} from './flow';
import { graphql } from '../gql';
import { LordIcon, ICONS } from '../components/LordIcon/LordIcon';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { CodeForm } from './CodeForm';
import { TotpSetupForm } from './TotpSetupForm';
import {
  ForgotChoice,
  ForgotEmailCode,
  ForgotEmailPhone,
  ForgotPasswordCode,
  ForgotPasswordEmail,
} from './ForgotPanel';
import { SecurityInfo } from '../components/SecurityInfo/SecurityInfo';
import { PhoneConsentForm } from './PhoneConsentForm';
import { useCardTilt } from '../components/GlassIsland/useCardTilt';
import './auth.css';

const FindEmailByPhoneMutation = graphql(`
  mutation FindEmailByPhone($phone: String!) {
    findEmailByPhone(phone: $phone)
  }
`);

type Step =
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

type MfaIconPhase = 'in' | 'idle';

/** Drives the Cognito auth flow and renders the form for the current step. */
export function AuthPanel(): ReactElement {
  const { reload } = useAuth();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasAnimation(canvasRef, theme);

  const [step, setStep] = useState<Step>('signIn');
  const [email, setEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState(''); // email found via phone lookup
  const [totp, setTotp] = useState<{ secret: string; uri: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSecurity, setShowSecurity] = useState(false);
  const [mfaIconPhase, setMfaIconPhase] = useState<MfaIconPhase>('in');
  const mfaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [signUpIconPhase, setSignUpIconPhase] = useState<'in' | 'idle'>('idle');
  const signUpTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [codeAttempts, setCodeAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;
  const [storedAction, setStoredAction] = useState<NextAction | null>(null);
  const [enrollSecret, setEnrollSecret] = useState('');
  const [enrollUri, setEnrollUri] = useState('');

  const [, findEmailByPhone] = useMutation(FindEmailByPhoneMutation);

  useEffect(() => {
    if (step !== 'mfaCode') return;
    mfaTimerRef.current = setTimeout(() => {
      setMfaIconPhase('idle');
    }, 2000);
    return () => {
      if (mfaTimerRef.current !== null) clearTimeout(mfaTimerRef.current);
    };
  }, [step]);

  useEffect(() => {
    if (step !== 'totpEnroll') return;
    void (async () => {
      setError(null);
      setPending(true);
      try {
        const { secret, uri } = await beginTotpEnrollment(email);
        setEnrollSecret(secret);
        setEnrollUri(uri);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Could not start 2FA setup.');
      } finally {
        setPending(false);
      }
    })();
  }, [step, email]);

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

  const { ref: sceneRef, rx, ry, isHovered } = useCardTilt(2);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);
  const [frontHeight, setFrontHeight] = useState(0);
  const [backHeight, setBackHeight] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (frontCardRef.current) setFrontHeight(frontCardRef.current.offsetHeight);
      if (backCardRef.current) setBackHeight(backCardRef.current.offsetHeight);
    };
    measure();
    const obs = new ResizeObserver(measure);
    if (frontCardRef.current) obs.observe(frontCardRef.current);
    if (backCardRef.current) obs.observe(backCardRef.current);
    return () => {
      obs.disconnect();
    };
  }, []);

  const isFlipped = step === 'signUp' || step === 'confirmSignUp';

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

  function handleSignIn(emailValue: string, password: string): void {
    setEmail(emailValue);
    void runStep(() => beginSignIn(emailValue, password));
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
    void reload();
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

  async function handleMfaSubmit(code: string): Promise<void> {
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

  async function handleMfaEmailSubmit(code: string): Promise<void> {
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

  function handleResend(): void {
    void resendConfirmation(email).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    });
  }

  // ── Forgot flows ────────────────────────────────────────────────────────────

  async function handleForgotEmailPhone(phone: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      const result = await findEmailByPhone({ phone });
      const found = result.data?.findEmailByPhone;
      if (!found) {
        setError('No account found with that phone number.');
        return;
      }
      setForgotEmail(found);
      // Trigger a Cognito password-reset code to the found email so the user
      // can prove email ownership and set a new password in the next step.
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

  function goToStep(next: Step): void {
    setError(null);
    setStep(next);
  }

  function renderMfaIcon(): ReactElement {
    if (mfaIconPhase === 'in') {
      return <LordIcon src={ICONS.mfaTwoFactor} trigger="in" state="in-reveal" size={56} />;
    }
    return <LordIcon src={ICONS.mfaTwoFactor} trigger="hover" size={56} />;
  }

  /** Mask an email for display: j***@example.com */
  function maskEmail(e: string): string {
    const [local, domain] = e.split('@');
    if (!local || !domain) return e;
    return `${local[0]}***@${domain}`;
  }

  function renderFront(): ReactElement {
    switch (step) {
      case 'mfaSelect':
        return (
          <div className="auth-form">
            <div className="auth-form-header">
              {renderMfaIcon()}
              <h2>Verify your identity</h2>
            </div>
            <p className="auth-description auth-description--center">
              Choose how you&apos;d like to verify it&apos;s you.
            </p>
            {error !== null && <p className="auth-error">{error}</p>}
            <button
              type="button"
              className="forgot-option-btn"
              disabled={pending}
              onClick={() => {
                handleSelectMfa('TOTP');
              }}
            >
              Authenticator app
            </button>
            <button
              type="button"
              className="forgot-option-btn"
              disabled={pending}
              onClick={() => {
                handleSelectMfa('EMAIL');
              }}
            >
              Email me a code
            </button>
          </div>
        );
      case 'mfaCode':
        return (
          <CodeForm
            key="mfa-totp"
            title="Two-factor code"
            description="Enter the 6-digit code from your authenticator app."
            submitLabel="Verify"
            pending={pending}
            error={error}
            onSubmit={(code) => {
              void handleMfaSubmit(code);
            }}
            icon={renderMfaIcon()}
          />
        );
      case 'mfaEmail':
        return (
          <CodeForm
            key="mfa-email"
            title="Check your email"
            description={`We sent a sign-in code to ${email}.`}
            submitLabel="Verify"
            pending={pending}
            error={error}
            onSubmit={(code) => {
              void handleMfaEmailSubmit(code);
            }}
          />
        );
      case 'totpSetup':
        return (
          <TotpSetupForm
            secret={totp?.secret ?? ''}
            setupUri={totp?.uri ?? ''}
            pending={pending}
            error={error}
            onSubmit={handleTotpSetupSubmit}
          />
        );
      case 'phoneConsent':
        return (
          <PhoneConsentForm
            pending={pending}
            error={error}
            onVerify={() => {
              void handlePhoneConsentVerify();
            }}
            onSkip={handlePhoneConsentSkip}
          />
        );
      case 'totpEnroll':
        return (
          <TotpSetupForm
            secret={enrollSecret}
            setupUri={enrollUri}
            pending={pending}
            error={error}
            onSubmit={handleTotpEnrollSubmit}
            onSkip={handleTotpEnrollSkip}
          />
        );
      case 'confirmPhone':
        return (
          <CodeForm
            key="confirm-phone"
            title="Verify your phone"
            description="Enter the code we texted to your phone number."
            submitLabel="Verify"
            pending={pending}
            error={error}
            onSubmit={(code) => {
              void handleConfirmPhone(code);
            }}
          />
        );
      case 'forgotChoice':
        return (
          <ForgotChoice
            onForgotEmail={() => {
              goToStep('forgotEmailPhone');
            }}
            onForgotPassword={() => {
              goToStep('forgotPasswordEmail');
            }}
            onBack={() => {
              goToStep('signIn');
            }}
          />
        );
      case 'forgotEmailPhone':
        return (
          <ForgotEmailPhone
            pending={pending}
            error={error}
            onSubmit={(phone) => {
              void handleForgotEmailPhone(phone);
            }}
            onBack={() => {
              goToStep('forgotChoice');
            }}
          />
        );
      case 'forgotEmailCode':
        return (
          <ForgotEmailCode
            maskedEmail={maskEmail(forgotEmail)}
            pending={pending}
            error={error}
            onSubmit={(code, pw) => {
              void handleForgotEmailCode(code, pw);
            }}
            onBack={() => {
              goToStep('forgotEmailPhone');
            }}
          />
        );
      case 'forgotPasswordEmail':
        return (
          <ForgotPasswordEmail
            pending={pending}
            error={error}
            onSubmit={(e) => {
              void handleForgotPasswordEmail(e);
            }}
            onBack={() => {
              goToStep('forgotChoice');
            }}
          />
        );
      case 'forgotPasswordCode':
        return (
          <ForgotPasswordCode
            email={email}
            pending={pending}
            error={error}
            onSubmit={(code, pw) => {
              void handleForgotPasswordCode(code, pw);
            }}
            onBack={() => {
              goToStep('forgotPasswordEmail');
            }}
          />
        );
      default:
        return (
          <SignInForm
            initialEmail={email}
            pending={pending}
            error={error}
            onSubmit={handleSignIn}
            onSwitchToSignUp={() => {
              goToStep('signUp');
            }}
            onForgot={() => {
              goToStep('forgotChoice');
            }}
            onLearnMore={() => {
              setShowSecurity(true);
            }}
          />
        );
    }
  }

  function renderBack(): ReactElement {
    if (step === 'confirmSignUp') {
      return (
        <CodeForm
          title="Confirm your email"
          description={`Enter the verification code we sent to ${email}.`}
          submitLabel="Confirm"
          pending={pending}
          error={error}
          onSubmit={(code) => {
            void handleConfirmSignUp(code);
          }}
          onResend={handleResend}
        />
      );
    }
    return (
      <SignUpForm
        pending={pending}
        error={error}
        iconPhase={signUpIconPhase}
        onSubmit={handleSignUp}
        onSwitchToSignIn={() => {
          goToStep('signIn');
        }}
        onLearnMore={() => {
          setShowSecurity(true);
        }}
      />
    );
  }

  return (
    <>
      <div className="auth-panel">
        <canvas ref={canvasRef} className="auth-canvas" />
        <div
          className="auth-flipcard-scene"
          ref={sceneRef}
          style={{
            transform: `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg)`,
            transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s ease-out',
          }}
        >
          <div
            className={`auth-flipcard-inner${isFlipped ? ' is-flipped' : ''}`}
            style={{ height: (isFlipped ? backHeight : frontHeight) || undefined }}
          >
            <div className="auth-card auth-card--front" ref={frontCardRef}>
              {renderFront()}
            </div>
            <div className="auth-card auth-card--back" ref={backCardRef}>
              {renderBack()}
            </div>
          </div>
        </div>
      </div>
      {showSecurity && (
        <SecurityInfo
          onClose={() => {
            setShowSecurity(false);
          }}
        />
      )}
    </>
  );
}
