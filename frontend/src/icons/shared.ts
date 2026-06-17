/**
 * @fileoverview Icon paths used across more than one page or by shared
 * components (PasswordStrength, SecurityInfo, SmsConsent). The JSON files live
 * in `public/icons/shared/`.
 */
export const SHARED_ICONS = {
  securityShield: '/icons/shared/wired-outline-3280-shield-lock-hover-pinch.json',
  securityClose: '/icons/shared/wired-outline-25-error-cross-hover-pinch.json',
  chatVerify: '/icons/shared/chat_verify.json',
  qrCode: '/icons/shared/wired-outline-1335-qr-code-hover-pinch.json',
  passwordWeak: '/icons/shared/wired-outline-25-error-cross-hover-loading.json',
  passwordStrong: '/icons/shared/wired-outline-24-approved-checked-hover-loading.json',
  /** Brochure (Dashboard) page. Markers: in-reveal (default), hover-pinch. */
  brochure: '/icons/shared/wired-outline-2292-brochure-in-reveal.json',
} as const;
