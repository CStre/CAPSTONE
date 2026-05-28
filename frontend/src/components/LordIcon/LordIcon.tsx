/* eslint-disable react-refresh/only-export-components -- icon registry and hook are intentionally co-located */
/**
 * @fileoverview Centralized Lordicon wrapper and icon registry.
 *
 * All locally hosted icon paths live in ICONS so no component needs to know
 * the raw ID string. Drop an updated .json into public/icons/ and update
 * the entry here — one place to change.
 */
import type { CSSProperties, ReactElement } from 'react';
import { useTheme } from '../../lib/ThemeContext';

/** Paths to every locally cached Lordicon JSON file. */
export const ICONS = {
  // ── Navigation ──────────────────────────────────────────────────────────
  aiHeader: '/icons/wired-outline-2511-artificial-intelligence-ai-loop-cycle.json',
  learn: '/icons/wired-outline-36-bulb-hover-blink.json',
  travel: '/icons/gjhbhscz.json',
  sources: '/icons/wired-outline-994-sticky-notes-hover-pinch.json',
  account: '/icons/teofqznt.json',
  dashboard: '/icons/pbkmxonw.json',
  signIn: '/icons/wired-outline-2129-login-hover-pinch.json',
  signOut: '/icons/wired-outline-2185-logout-hover-pinch.json',
  chevronRight: '/icons/wired-outline-31-chevron-right-hover-scale.json',

  // ── Page-level ────────────────────────────────────────────────────────────
  accountPage: '/icons/pwpcutcz.json',
  notFound: '/icons/usownftb.json',
  home: '/icons/pbbsmkso.json',
  travelDone: '/icons/ymsapbnv.json',

  // ── Learn — tech section ─────────────────────────────────────────────────
  learnTech: '/icons/jdalicnn.json',

  // ── Learn — essay panels (in order) ─────────────────────────────────────
  learnPanel1: '/icons/piakqbri.json',
  learnPanel2: '/icons/oilwhjud.json',
  learnPanel3: '/icons/unukghxb.json',
  learnPanel4: '/icons/pjkwunvs.json',
  learnPanel5: '/icons/auvlcjep.json',
  learnPanel6: '/icons/qqzotrmm.json',
  learnPanel7: '/icons/eulazqty.json',
  learnPanel8: '/icons/ynijyuos.json',
  learnPanel9: '/icons/uktwwckg.json',
  learnPanel10: '/icons/rqdzxkkr.json',
  learnPanel11: '/icons/kzmcbjzi.json',

  // ── Password strength ────────────────────────────────────────────────────
  passwordWeak: '/icons/wired-outline-25-error-cross-hover-loading.json',
  passwordStrong: '/icons/wired-outline-24-approved-checked-hover-loading.json',

  // ── Auth & security ──────────────────────────────────────────────────────
  securityClose: '/icons/wired-outline-25-error-cross-hover-pinch.json',
  securityShield: '/icons/wired-outline-3280-shield-lock-hover-pinch.json',
  authSignIn: '/icons/wired-outline-44-avatar-user-in-circle-hover-looking-around.json',
  authSignUp: '/icons/wired-outline-307-avatar-icon-calm-plus-hover-click.json',
  passwordEye: '/icons/wired-outline-69-eye-hover-blink.json',
  emailSend: '/icons/wired-outline-177-envelope-send-in-assembly.json',
  qrCode: '/icons/wired-outline-1335-qr-code-hover-pinch.json',
  resendCode: '/icons/wired-outline-194-refresh-hover-pinch.json',
  mfaTwoFactor: '/icons/wired-outline-2604-2-factor-authentication-hover-pinch.json',
  mailShield: '/icons/wired-outline-3640-mail-shield-in-assembly.json',
  fingerprint: '/icons/wired-outline-500-fingerprint-security-hover-pinch.json',
  trashBin: '/icons/wired-outline-185-trash-bin-morph-trash-in.json',

  // ── Forgot flow ───────────────────────────────────────────────────────────
  searchAccount: '/icons/search_account.json',
  chatVerify: '/icons/chat_verify.json',
  envelopVerifyEmail: '/icons/envelop_verify_email.json',
} as const;

interface LordIconProps {
  src: string;
  /** Uniform width and height in pixels (default 40). */
  size?: number;
  trigger?: 'hover' | 'loop' | 'loop-on-hover' | 'click' | 'morph' | 'boomerang' | 'in';
  stroke?: 'bold' | 'regular' | 'light';
  colors?: string;
  state?: string;
  /** CSS selector for the hover target (lordicon `target` attribute). */
  target?: string;
  delay?: string | number;
  className?: string;
  style?: CSSProperties;
}

/** Returns palette-correct hex colors for the current theme. */
export function useLordIconColors(): { primary: string; secondary: string } {
  const { theme } = useTheme();
  return theme === 'dark'
    ? { primary: '#D3D9D4', secondary: '#748D92' }
    : { primary: '#3D52A0', secondary: '#7091E6' };
}

/** Typed React wrapper around the `<lord-icon>` custom element. */
export function LordIcon({
  src,
  size = 40,
  trigger = 'hover',
  stroke = 'bold',
  colors,
  state,
  target,
  delay,
  className,
  style,
}: LordIconProps): ReactElement {
  const { primary, secondary } = useLordIconColors();
  const resolvedColors = colors ?? `primary:${primary},secondary:${secondary}`;
  return (
    <lord-icon
      src={src}
      trigger={trigger}
      stroke={stroke}
      colors={resolvedColors}
      state={state}
      target={target}
      delay={delay}
      className={className}
      style={{ width: size, height: size, flexShrink: 0, ...style }}
    />
  );
}
