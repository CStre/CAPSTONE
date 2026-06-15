/**
 * @fileoverview Auth panel — flip-card render shell for the sign-in / sign-up
 * / MFA / forgot flows.
 *
 * All auth state and handler logic lives in useAuthFlow. This component owns
 * the canvas, card-tilt, flip-card layout, and step-to-component mapping.
 *
 * Front face: signIn · mfaCode · mfaEmail · mfaSelect · totpSetup · phoneConsent
 *             · confirmPhone · totpEnroll · forgotChoice · forgotEmailPhone
 *             · forgotEmailCode · forgotPasswordEmail · forgotPasswordCode
 * Back face:  signUp · confirmSignUp
 */
import { useState, useRef, useLayoutEffect } from 'react';
import type { ReactElement } from 'react';
import { useTheme } from '../lib/ThemeContext';
import { useCanvasAnimation } from '../components/CanvasAnimation/useCanvasAnimation';
import { useAuth } from './context';
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
import { MfaSelectForm } from './MfaSelectForm';
import { useCardTilt } from '../components/GlassIsland/useCardTilt';
import { useAuthFlow } from './useAuthFlow';
import type { MfaIconPhase } from './useAuthFlow';
import './auth.css';

function renderMfaIcon(phase: MfaIconPhase): ReactElement {
  if (phase === 'in') {
    return <LordIcon src={ICONS.mfaTwoFactor} trigger="in" state="in-reveal" size={56} />;
  }
  return <LordIcon src={ICONS.mfaTwoFactor} trigger="hover" size={56} />;
}

/** Drives the Cognito auth flow and renders the form for the current step. */
export function AuthPanel(): ReactElement {
  const { reload } = useAuth();
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvasAnimation(canvasRef, theme);

  const flow = useAuthFlow(reload);

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

  function renderFront(): ReactElement {
    switch (flow.step) {
      case 'mfaSelect':
        return (
          <MfaSelectForm
            pending={flow.pending}
            error={flow.error}
            icon={renderMfaIcon(flow.mfaIconPhase)}
            onSelectTotp={() => {
              flow.handleSelectMfa('TOTP');
            }}
            onSelectEmail={() => {
              flow.handleSelectMfa('EMAIL');
            }}
          />
        );
      case 'mfaCode':
        return (
          <CodeForm
            key="mfa-totp"
            title="Two-factor code"
            description="Enter the 6-digit code from your authenticator app."
            submitLabel="Verify"
            pending={flow.pending}
            error={flow.error}
            onSubmit={(code) => {
              void flow.handleMfaCodeSubmit(code);
            }}
            icon={renderMfaIcon(flow.mfaIconPhase)}
          />
        );
      case 'mfaEmail':
        return (
          <CodeForm
            key="mfa-email"
            title="Check your email"
            description={`We sent a sign-in code to ${flow.email}.`}
            submitLabel="Verify"
            pending={flow.pending}
            error={flow.error}
            onSubmit={(code) => {
              void flow.handleMfaCodeSubmit(code);
            }}
          />
        );
      case 'totpSetup':
        return (
          <TotpSetupForm
            secret={flow.totp?.secret ?? ''}
            setupUri={flow.totp?.uri ?? ''}
            pending={flow.pending}
            error={flow.error}
            onSubmit={flow.handleTotpSetupSubmit}
            showHeader
          />
        );
      case 'phoneConsent':
        return (
          <PhoneConsentForm
            pending={flow.pending}
            error={flow.error}
            onVerify={() => {
              void flow.handlePhoneConsentVerify();
            }}
            onSkip={flow.handlePhoneConsentSkip}
          />
        );
      case 'totpEnroll':
        return (
          <TotpSetupForm
            secret={flow.enroll.secret}
            setupUri={flow.enroll.uri}
            pending={flow.pending}
            error={flow.error}
            onSubmit={flow.handleTotpEnrollSubmit}
            onSkip={flow.handleTotpEnrollSkip}
            showHeader
          />
        );
      case 'confirmPhone':
        return (
          <CodeForm
            key="confirm-phone"
            title="Verify your phone"
            description="Enter the code we texted to your phone number."
            submitLabel="Verify"
            pending={flow.pending}
            error={flow.error}
            onSubmit={(code) => {
              void flow.handleConfirmPhone(code);
            }}
          />
        );
      case 'forgotChoice':
        return (
          <ForgotChoice
            onForgotEmail={() => {
              flow.goToStep('forgotEmailPhone');
            }}
            onForgotPassword={() => {
              flow.goToStep('forgotPasswordEmail');
            }}
            onBack={() => {
              flow.goToStep('signIn');
            }}
          />
        );
      case 'forgotEmailPhone':
        return (
          <ForgotEmailPhone
            pending={flow.pending}
            error={flow.error}
            onSubmit={(phone) => {
              void flow.handleForgotEmailPhone(phone);
            }}
            onBack={() => {
              flow.goToStep('forgotChoice');
            }}
          />
        );
      case 'forgotEmailCode':
        return (
          <ForgotEmailCode
            maskedEmail={flow.maskEmail(flow.forgotEmail)}
            pending={flow.pending}
            error={flow.error}
            onSubmit={(code, pw) => {
              void flow.handleForgotEmailCode(code, pw);
            }}
            onBack={() => {
              flow.goToStep('forgotEmailPhone');
            }}
          />
        );
      case 'forgotPasswordEmail':
        return (
          <ForgotPasswordEmail
            pending={flow.pending}
            error={flow.error}
            onSubmit={(e) => {
              void flow.handleForgotPasswordEmail(e);
            }}
            onBack={() => {
              flow.goToStep('forgotChoice');
            }}
          />
        );
      case 'forgotPasswordCode':
        return (
          <ForgotPasswordCode
            email={flow.email}
            pending={flow.pending}
            error={flow.error}
            onSubmit={(code, pw) => {
              void flow.handleForgotPasswordCode(code, pw);
            }}
            onBack={() => {
              flow.goToStep('forgotPasswordEmail');
            }}
          />
        );
      default:
        return (
          <SignInForm
            initialEmail={flow.email}
            pending={flow.pending}
            error={flow.error}
            onSubmit={flow.handleSignIn}
            onSwitchToSignUp={() => {
              flow.goToStep('signUp');
            }}
            onForgot={() => {
              flow.goToStep('forgotChoice');
            }}
            onLearnMore={() => {
              flow.setShowSecurity(true);
            }}
          />
        );
    }
  }

  function renderBack(): ReactElement {
    if (flow.step === 'confirmSignUp') {
      return (
        <CodeForm
          title="Confirm your email"
          description={`Enter the verification code we sent to ${flow.email}.`}
          submitLabel="Confirm"
          pending={flow.pending}
          error={flow.error}
          onSubmit={(code) => {
            void flow.handleConfirmSignUp(code);
          }}
          onResend={flow.handleResend}
        />
      );
    }
    return (
      <SignUpForm
        pending={flow.pending}
        error={flow.error}
        iconPhase={flow.signUpIconPhase}
        onSubmit={flow.handleSignUp}
        onSwitchToSignIn={() => {
          flow.goToStep('signIn');
        }}
        onLearnMore={() => {
          flow.setShowSecurity(true);
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
            className={`auth-flipcard-inner${flow.isFlipped ? ' is-flipped' : ''}`}
            style={{ height: (flow.isFlipped ? backHeight : frontHeight) || undefined }}
          >
            <div className="glass-card auth-card auth-card--front" ref={frontCardRef}>
              {renderFront()}
            </div>
            <div className="glass-card auth-card auth-card--back" ref={backCardRef}>
              {renderBack()}
            </div>
          </div>
        </div>
      </div>
      {flow.showSecurity && (
        <SecurityInfo
          onClose={() => {
            flow.setShowSecurity(false);
          }}
        />
      )}
    </>
  );
}
