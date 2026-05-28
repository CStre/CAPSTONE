/**
 * @fileoverview Auth flow steps.
 *
 * Wraps Amplify Auth calls and collapses their `nextStep` unions into a small
 * NextAction value the AuthPanel state machine can switch on.
 */
import {
  autoSignIn,
  confirmResetPassword,
  confirmSignIn,
  confirmSignUp,
  confirmUserAttribute,
  resendSignUpCode,
  resetPassword,
  sendUserAttributeVerificationCode,
  signIn,
  signUp,
  updateMFAPreference,
  type SignInOutput,
} from 'aws-amplify/auth';

const APP_NAME = 'Building Better Algorithms';

/** What the auth UI should do once a flow call returns. */
export type NextAction =
  | { kind: 'done' }
  | { kind: 'signIn' }
  | { kind: 'confirmSignUp' }
  | { kind: 'confirmPhone' }
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

/** Submit a TOTP / email OTP code for the in-progress sign-in. */
export async function submitSignInCode(code: string, email: string): Promise<NextAction> {
  const { nextStep } = await confirmSignIn({ challengeResponse: code });
  return interpretSignIn(nextStep, email);
}

/** Switch the active sign-in challenge from TOTP to email OTP. */
export async function requestEmailMfa(email: string): Promise<NextAction> {
  const { nextStep } = await confirmSignIn({ challengeResponse: 'EMAIL' });
  return interpretSignIn(nextStep, email);
}

/** Register a new account (firstName, lastName, email, phone in E.164, password). */
export async function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
): Promise<NextAction> {
  const { nextStep } = await signUp({
    username: email,
    password,
    options: {
      userAttributes: {
        email,
        name: `${firstName} ${lastName}`,
        given_name: firstName,
        family_name: lastName,
        phone_number: phone,
      },
      autoSignIn: true,
    },
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

/** Send an SMS code to verify the phone_number attribute (called after sign-in at sign-up). */
export async function sendPhoneVerification(): Promise<void> {
  await sendUserAttributeVerificationCode({ userAttributeKey: 'phone_number' });
}

/** Confirm the phone_number attribute with the SMS code. */
export async function confirmPhoneVerification(code: string): Promise<void> {
  await confirmUserAttribute({ userAttributeKey: 'phone_number', confirmationCode: code });
}

/** Initiate a password reset — Cognito sends a code to the user's email. */
export async function forgotPassword(email: string): Promise<void> {
  await resetPassword({ username: email });
}

/** Complete a password reset with the emailed code and the new password. */
export async function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
}

/**
 * Mark TOTP as the preferred MFA method after successful enrollment.
 * Without this, Cognito knows TOTP is verified but doesn't set it as preferred,
 * causing fetchMFAPreference() to show "not enrolled" after re-login.
 */
export async function setTotpPreferred(): Promise<void> {
  await updateMFAPreference({ totp: 'PREFERRED' });
}
