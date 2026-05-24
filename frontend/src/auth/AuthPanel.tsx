/**
 * @fileoverview Auth panel — the sign-in / sign-up / MFA flow state machine.
 *
 * The sign-in and sign-up forms live on opposite faces of a 3-D flip card.
 * Clicking "Create one" / "Sign in" flips the card; all other step transitions
 * (email confirmation, TOTP setup, MFA code) replace the visible face content
 * without flipping.
 *
 * Front face: signIn · mfaCode · totpSetup
 * Back face:  signUp · confirmSignUp
 */
import { useState, useRef, useLayoutEffect } from 'react';
import type { ReactElement } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { useCanvasAnimation } from '../components/CanvasAnimation/useCanvasAnimation';
import { useAuth } from './context';
import {
  beginSignIn,
  confirmRegistration,
  register,
  resendConfirmation,
  submitSignInCode,
  type NextAction,
} from './flow';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { CodeForm } from './CodeForm';
import { TotpSetupForm } from './TotpSetupForm';
import { SecurityInfo } from '../components/SecurityInfo/SecurityInfo';
import { useCardTilt } from '../components/GlassIsland/useCardTilt';
import './auth.css';

type Step = 'signIn' | 'signUp' | 'confirmSignUp' | 'totpSetup' | 'mfaCode';

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
        setStep('confirmSignUp');
        break;
      case 'mfaCode':
        setStep('mfaCode');
        break;
      case 'totpSetup':
        setTotp({ secret: action.secret, uri: action.setupUri });
        setStep('totpSetup');
        break;
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

  function handleConfirmSignUp(code: string): void {
    void runStep(() => confirmRegistration(email, code));
  }

  function handleSignInCode(code: string): void {
    void runStep(() => submitSignInCode(code, email));
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

  /** Content rendered on the front face: sign-in, MFA steps. */
  function renderFront(): ReactElement {
    switch (step) {
      case 'mfaCode':
        return (
          <CodeForm
            title="Two-factor code"
            description="Enter the 6-digit code from your authenticator app."
            submitLabel="Verify"
            pending={pending}
            error={error}
            onSubmit={handleSignInCode}
          />
        );
      case 'totpSetup':
        return (
          <TotpSetupForm
            secret={totp?.secret ?? ''}
            setupUri={totp?.uri ?? ''}
            pending={pending}
            error={error}
            onSubmit={handleSignInCode}
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
          onSubmit={handleConfirmSignUp}
          onResend={handleResend}
        />
      );
    }
    return (
      <SignUpForm
        pending={pending}
        error={error}
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
