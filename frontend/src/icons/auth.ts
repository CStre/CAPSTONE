/**
 * @fileoverview Auth-flow icons (sign-in/up, MFA, forgot). JSON files in
 * `public/icons/AuthPage/`. Security shield/close, the QR code, password-
 * strength, and chat-verify icons are cross-page and live in `shared.ts`.
 */
export const AUTH_ICONS = {
  authSignIn: '/icons/AuthPage/wired-outline-44-avatar-user-in-circle-hover-looking-around.json',
  authSignUp: '/icons/AuthPage/wired-outline-307-avatar-icon-calm-plus-hover-click.json',
  passwordEye: '/icons/AuthPage/wired-outline-69-eye-hover-blink.json',
  resendCode: '/icons/AuthPage/wired-outline-194-refresh-hover-pinch.json',
  mfaTwoFactor: '/icons/AuthPage/wired-outline-2604-2-factor-authentication-hover-pinch.json',
  searchAccount: '/icons/AuthPage/search_account.json',
  envelopVerifyEmail: '/icons/AuthPage/envelop_verify_email.json',
  /** Currently unused — kept for reference. */
  emailSend: '/icons/AuthPage/wired-outline-177-envelope-send-in-assembly.json',
} as const;
