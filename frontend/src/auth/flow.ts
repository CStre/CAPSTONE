/**
 * @fileoverview Auth flow steps.
 *
 * Wraps the Amplify Auth calls and collapses their `nextStep` unions into a
 * small NextAction value the AuthPanel state machine can switch on.
 */
import {
  autoSignIn,
  confirmSignIn,
  confirmSignUp,
  resendSignUpCode,
  signIn,
  signUp,
  type SignInOutput,
} from 'aws-amplify/auth';

const APP_NAME = 'Building Better Algorithms';

/** What the auth UI should do once a flow call returns. */
export type NextAction =
  | { kind: 'done' }
  | { kind: 'signIn' }
  | { kind: 'confirmSignUp' }
  | { kind: 'mfaCode' }
  | { kind: 'emailCode' }
  | { kind: 'totpSetup'; secret: string; setupUri: string };

function interpretSignIn(nextStep: SignInOutput['nextStep'], email: string): NextAction {
  switch (nextStep.signInStep) {
    case 'DONE':
      return { kind: 'done' };
    case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
      return { kind: 'mfaCode' };
    case 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE':
      return { kind: 'emailCode' };
    case 'CONTINUE_SIGN_IN_WITH_TOTP_SETUP':
      return {
        kind: 'totpSetup',
        secret: nextStep.totpSetupDetails.sharedSecret,
        setupUri: nextStep.totpSetupDetails.getSetupUri(APP_NAME, email).toString(),
      };
    case 'CONFIRM_SIGN_UP':
      return { kind: 'confirmSignUp' };
    default:
      throw new Error(`Unsupported sign-in step: ${nextStep.signInStep}`);
  }
}

/** Begin sign-in with email + password. */
export async function beginSignIn(email: string, password: string): Promise<NextAction> {
  const { nextStep } = await signIn({ username: email, password });
  return interpretSignIn(nextStep, email);
}

/** Submit a TOTP / verification code for the in-progress sign-in. */
export async function submitSignInCode(code: string, email: string): Promise<NextAction> {
  const { nextStep } = await confirmSignIn({ challengeResponse: code });
  return interpretSignIn(nextStep, email);
}

/** Register a new account. */
export async function register(email: string, password: string, name: string): Promise<NextAction> {
  const { nextStep } = await signUp({
    username: email,
    password,
    options: { userAttributes: { email, name }, autoSignIn: true },
  });
  return nextStep.signUpStep === 'CONFIRM_SIGN_UP' ? { kind: 'confirmSignUp' } : { kind: 'signIn' };
}

/** Confirm a new account with the emailed verification code, then auto sign-in. */
export async function confirmRegistration(email: string, code: string): Promise<NextAction> {
  await confirmSignUp({ username: email, confirmationCode: code });
  try {
    const { nextStep } = await autoSignIn();
    return interpretSignIn(nextStep, email);
  } catch {
    return { kind: 'signIn' };
  }
}

/** Re-send the account-verification email. */
export async function resendConfirmation(email: string): Promise<void> {
  await resendSignUpCode({ username: email });
}

/**
 * Switch the active sign-in challenge from TOTP to email OTP.
 * Cognito sends a 6-digit code to the user's verified email address.
 * Requires ALLOW_USER_AUTH on the app client and email_mfa_configuration
 * on the user pool (configured in infra/auth.tf).
 */
export async function requestEmailMfa(email: string): Promise<NextAction> {
  const { nextStep } = await confirmSignIn({ challengeResponse: 'EMAIL' });
  return interpretSignIn(nextStep, email);
}
