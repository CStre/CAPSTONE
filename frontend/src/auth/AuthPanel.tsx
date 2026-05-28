/**
 * @fileoverview Auth panel — the sign-in / sign-up / MFA flow state machine.
 *
 * The sign-in and sign-up forms live on opposite faces of a 3-D flip card.
 * Clicking "Sign up" / "Sign in" flips the card; all other step transitions
 * (email confirmation, TOTP setup, MFA code) replace the visible face content
 * without flipping.
 *
 * Front face: signIn · mfaCode · mfaEmail · totpSetup
 * Back face:  signUp · confirmSignUp
 */
import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import type { ReactElement } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { useCanvasAnimation } from '../components/CanvasAnimation/useCanvasAnimation';
import { useAuth } from './context';
import {
  beginSignIn,
  confirmRegistration,
  register,
  requestEmailMfa,
  resendConfirmation,
  submitSignInCode,
  type NextAction,
} from './flow';
import { LordIcon, ICONS } from '../components/LordIcon/LordIcon';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { CodeForm } from './CodeForm';
import { TotpSetupForm } from './TotpSetupForm';
import { SecurityInfo } from '../components/SecurityInfo/SecurityInfo';
import { useCardTilt } from '../components/GlassIsland/useCardTilt';
import './auth.css';

type Step = 'signIn' | 'signUp' | 'confirmSignUp' | 'totpSetup' | 'mfaCode' | 'mfaEmail';

/** Animation phase for the TOTP icon while the mfaCode step is active. */
type MfaIconPhase = 'in' | 'idle' | 'success';

/** Drives the Cognito auth flow and renders the form for the current step. */
export function AuthPanel(): ReactElement {
  const { reload } = useAuth();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasAnimation(canvasRef, theme);
  const [step, setStep] = useState<Step>('signIn');
  const [email, setEmail] = useState('');
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

  // Only the timer lives in the effect — avoids synchronous setState-in-effect lint error.
  // The 'in' phase is set in applyAction / goToStep when the step transitions.
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
    if (step !== 'signUp') return;
    // Wait for the 720ms flip animation to finish before starting the reveal.
    const flipTimer = setTimeout(() => {
      setSignUpIconPhase('in');
      signUpTimerRef.current = setTimeout(() => {
        setSignUpIconPhase('idle');
      }, 2000);
    }, 200);
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

  // Back face is visible for the sign-up + email-confirmation steps
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

  /** Increments the attempt counter; redirects to sign-in after MAX_ATTEMPTS failures. */
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

  function handleSignUp(emailValue: string, password: string, name: string): void {
    setEmail(emailValue);
    void runStep(() => register(emailValue, password, name));
  }

  async function handleConfirmSignUp(code: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      applyAction(await confirmRegistration(email, code));
    } catch (err: unknown) {
      handleCodeFailure(err);
    } finally {
      setPending(false);
    }
  }

  /** TOTP MFA submit — plays the morph-open animation before reloading.
   *  Any failure redirects immediately to sign-in: Amplify v6 clears the
   *  challenge session on error, making retries impossible regardless. */
  async function handleMfaSubmit(code: string): Promise<void> {
    setError(null);
    setPending(true);
    try {
      const action = await submitSignInCode(code, email);
      if (action.kind === 'done') {
        setMfaIconPhase('success');
        await new Promise<void>((resolve) => setTimeout(resolve, 900));
        void reload();
      } else {
        applyAction(action);
      }
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

  function handleRequestEmailMfa(): void {
    void runStep(() => requestEmailMfa(email));
  }

  /** Email OTP submit — same Amplify session constraint as TOTP; any failure
   *  redirects to sign-in immediately. */
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

  function handleResendEmailMfa(): void {
    void requestEmailMfa(email).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    });
  }

  function handleResend(): void {
    void resendConfirmation(email).catch((err: unknown) => {
      setError(err instanceof Error ? err.message : 'Could not resend the code.');
    });
  }

  function goToStep(next: Step): void {
    setError(null);
    setStep(next);
  }

  /** Resolves the right LordIcon element for the TOTP icon based on animation phase. */
  function renderMfaIcon(): ReactElement {
    if (mfaIconPhase === 'in') {
      return <LordIcon src={ICONS.mfaTwoFactor} trigger="in" state="in-reveal" size={56} />;
    }
    return <LordIcon src={ICONS.mfaTwoFactor} trigger="hover" size={56} />;
  }

  /** Content rendered on the front face: sign-in, MFA steps. */
  function renderFront(): ReactElement {
    switch (step) {
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
            footer={
              <div className="auth-email-fallback">
                <button
                  type="button"
                  className="auth-link"
                  onClick={handleRequestEmailMfa}
                  disabled={pending}
                >
                  Use email instead
                </button>
              </div>
            }
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
            onResend={handleResendEmailMfa}
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
            onLearnMore={() => {
              setShowSecurity(true);
            }}
          />
        );
    }
  }

  /** Content rendered on the back face: sign-up, email confirmation. */
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
