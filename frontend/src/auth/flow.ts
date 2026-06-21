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
  setUpTOTP,
  signIn,
  signOut,
  signUp,
  updateMFAPreference,
  verifyTOTPSetup,
  type SignInOutput,
} from 'aws-amplify/auth';

const APP_NAME = 'Building Better Algorithms';

// Dev-only tracer — Vite tree-shakes this in production builds.
// Logs the function name, result, and any error to the browser console.
function traced<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!import.meta.env.DEV) return fn();
  console.group(`[auth] ${label}`);
  return fn().then(
    (result) => {
      console.log('←', result);
      console.groupEnd();
      return result;
    },
    (err: unknown) => {
      console.error('✗', err);
      console.groupEnd();
      throw err;
    },
  );
}

/** What the auth UI should do once a flow call returns. */
export type NextAction =
  | { kind: 'done' }
  | { kind: 'signIn' }
  | { kind: 'confirmSignUp' }
  | { kind: 'confirmPhone' }
  | { kind: 'mfaCode' }
  | { kind: 'emailCode' }
  | { kind: 'selectMfa' }
  | { kind: 'totpSetup'; secret: string; setupUri: string };

function interpretSignIn(nextStep: SignInOutput['nextStep'], email: string): NextAction {
  switch (nextStep.signInStep) {
    case 'DONE':
      return { kind: 'done' };
    case 'CONFIRM_SIGN_IN_WITH_TOTP_CODE':
      return { kind: 'mfaCode' };
    case 'CONFIRM_SIGN_IN_WITH_EMAIL_CODE':
      return { kind: 'emailCode' };
    case 'CONTINUE_SIGN_IN_WITH_MFA_SELECTION':
      return { kind: 'selectMfa' };
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

/** Respond to a SELECT_MFA_TYPE challenge by choosing TOTP or EMAIL. */
export function selectMfaType(type: 'TOTP' | 'EMAIL', email: string): Promise<NextAction> {
  return traced(`selectMfaType(${type})`, async () => {
    const { nextStep } = await confirmSignIn({ challengeResponse: type });
    return interpretSignIn(nextStep, email);
  });
}

/** Begin sign-in with email + password. */
export function beginSignIn(email: string, password: string): Promise<NextAction> {
  return traced(`beginSignIn(${email})`, async () => {
    const attempt = async (): Promise<NextAction> => {
      const { nextStep } = await signIn({
        username: email,
        password,
        options: { authFlowType: 'USER_AUTH', preferredChallenge: 'PASSWORD_SRP' },
      });
      return interpretSignIn(nextStep, email);
    };
    try {
      return await attempt();
    } catch (err: unknown) {
      // autoSignIn after email confirmation leaves a stale Amplify session.
      // Clear it and retry once rather than surfacing a confusing error.
      if (err instanceof Error && err.name === 'UserAlreadyAuthenticatedException') {
        await signOut();
        return attempt();
      }
      throw err;
    }
  });
}

/** Submit a TOTP / email OTP code for the in-progress sign-in. */
export function submitSignInCode(code: string, email: string): Promise<NextAction> {
  return traced(`submitSignInCode`, async () => {
    const { nextStep } = await confirmSignIn({ challengeResponse: code });
    return interpretSignIn(nextStep, email);
  });
}

/** Switch the active sign-in challenge from TOTP to email OTP. */
export function requestEmailMfa(email: string): Promise<NextAction> {
  return traced(`requestEmailMfa`, async () => {
    const { nextStep } = await confirmSignIn({ challengeResponse: 'EMAIL' });
    return interpretSignIn(nextStep, email);
  });
}

/** Register a new account (firstName, lastName, email, phone in E.164, password). */
export function register(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone: string,
): Promise<NextAction> {
  return traced(`register(${email})`, async () => {
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
    return nextStep.signUpStep === 'CONFIRM_SIGN_UP'
      ? { kind: 'confirmSignUp' }
      : { kind: 'signIn' };
  });
}

/** Confirm a new account with the emailed verification code, then auto sign-in. */
export function confirmRegistration(email: string, code: string): Promise<NextAction> {
  return traced(`confirmRegistration(${email})`, async () => {
    await confirmSignUp({ username: email, confirmationCode: code });
    try {
      const { nextStep } = await autoSignIn();
      return interpretSignIn(nextStep, email);
    } catch {
      return { kind: 'signIn' };
    }
  });
}

/** Re-send the account-verification email. */
export function resendConfirmation(email: string): Promise<void> {
  return traced(`resendConfirmation(${email})`, async () => {
    await resendSignUpCode({ username: email });
  });
}

/** Send an SMS code to verify the phone_number attribute (called after sign-in at sign-up). */
export function sendPhoneVerification(): Promise<void> {
  return traced(`sendPhoneVerification`, async () => {
    await sendUserAttributeVerificationCode({ userAttributeKey: 'phone_number' });
  });
}

/** Confirm the phone_number attribute with the SMS code. */
export function confirmPhoneVerification(code: string): Promise<void> {
  return traced(`confirmPhoneVerification`, async () => {
    await confirmUserAttribute({ userAttributeKey: 'phone_number', confirmationCode: code });
  });
}

/** Begin optional post-sign-in TOTP enrollment; returns the secret and QR URI. */
export function beginTotpEnrollment(email: string): Promise<{ secret: string; uri: string }> {
  return traced(`beginTotpEnrollment(${email})`, async () => {
    const output = await setUpTOTP();
    return {
      secret: output.sharedSecret,
      uri: output.getSetupUri(APP_NAME, email).toString(),
    };
  });
}

/** Confirm optional TOTP enrollment.
 *  Both methods are marked ENABLED (neither PREFERRED) so Cognito issues
 *  SELECT_MFA_TYPE at every subsequent sign-in, giving the user the choice. */
export function confirmTotpEnrollment(code: string): Promise<void> {
  return traced(`confirmTotpEnrollment`, async () => {
    await verifyTOTPSetup({ code });
    await updateMFAPreference({ totp: 'ENABLED', email: 'ENABLED' });
  });
}

/** Initiate a password reset — Cognito sends a code to the user's email. */
export function forgotPassword(email: string): Promise<void> {
  return traced(`forgotPassword(${email})`, async () => {
    await resetPassword({ username: email });
  });
}

/** Complete a password reset with the emailed code and the new password. */
export function confirmForgotPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  return traced(`confirmForgotPassword(${email})`, async () => {
    await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
  });
}

/**
 * Called after Account-page TOTP re-enrollment to mark both methods ENABLED.
 * Neither is set as PREFERRED — this keeps Cognito in the SELECT_MFA_TYPE branch
 * so the user always chooses their method at sign-in.
 */
export function setTotpPreferred(): Promise<void> {
  return traced(`setTotpPreferred`, async () => {
    await updateMFAPreference({ totp: 'ENABLED', email: 'ENABLED' });
  });
}

/**
 * Set email OTP as the sole MFA method for users who skip or haven't enrolled TOTP.
 *
 * Called when a sign-in completes with no MFA challenge (the user has no
 * preference set yet) and when a user skips TOTP enrollment post-registration.
 * Once TOTP is enrolled later (via Account Settings), both methods are set to
 * ENABLED so Cognito presents SELECT_MFA_TYPE at sign-in instead.
 */
export function setEmailMfaPreferred(): Promise<void> {
  return traced(`setEmailMfaPreferred`, async () => {
    await updateMFAPreference({ email: 'PREFERRED' });
  });
}
