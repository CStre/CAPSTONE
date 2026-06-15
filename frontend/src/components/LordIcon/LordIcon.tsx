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
  accountPage: '/icons/wired-outline-1004-management-team-in-reveal.json',
  notFound: '/icons/usownftb.json',
  home: '/icons/pbbsmkso.json',
  travelDone: '/icons/ymsapbnv.json',

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

  // ── Inline status badges ──────────────────────────────────────────────────
  statusVerified: '/icons/wired-outline-210-chat-message-approved-hover-pinch.json',
  statusUnverified: '/icons/wired-outline-209-chat-message-cross-hover-pinch.json',

  // ── Home greeting (authenticated) ────────────────────────────────────────
  greetingWave: '/icons/wired-outline-2319-wave-hello-hand-in-reveal.json',
  greetingBrain: '/icons/wired-outline-426-brain-in-reveal.json',
  greetingBulb: '/icons/wired-outline-36-bulb-in-reveal.json',

  // ── Sources page ─────────────────────────────────────────────────────────
  sourceLink: '/icons/wired-outline-11-link-unlink-hover-bounce.json',

  // ── Learn page ───────────────────────────────────────────────────────────
  slidePlaceholder: '/icons/wired-outline-426-brain-in-reveal.json',
  slideComplete: '/icons/wired-outline-24-approved-checked-in-reveal.json',
  slideIncomplete: '/icons/wired-outline-25-error-cross-hover-pinch.json',

  // ── Lesson 00 — Orientation ───────────────────────────────────────────────
  learn00Question: '/icons/LearnPage/Lesson_0/wired-outline-424-question-bubble-in-oscillate.json',
  learn00Gift: '/icons/LearnPage/Lesson_0/wired-outline-412-gift-hover-squeeze.json',
  learn00Crowdfunding:
    '/icons/LearnPage/Lesson_0/wired-outline-2374-crowdfunding-hover-add-funds.json',
  learn00Hourglass: '/icons/LearnPage/Lesson_0/wired-outline-472-hourglass-hover-rotation.json',
  learn00Books: '/icons/LearnPage/Lesson_0/wired-outline-779-books-in-reveal.json',

  // ── Lesson 01 — How Recommenders Work ────────────────────────────────────
  learn01Abacus:
    '/icons/LearnPage/Lesson_1/wired-outline-1541-education-mathematics-abacus-hover-pinch.json',
  learn01Branches:
    '/icons/LearnPage/Lesson_1/wired-outline-3395-arrows-up-branches-hover-pinch.json',
  learn01Insights: '/icons/LearnPage/Lesson_1/wired-outline-954-customer-insights-hover-pinch.json',
  learn01Network: '/icons/LearnPage/Lesson_1/wired-outline-26-share-network-hover-pinch.json',
  learn01Funnel:
    '/icons/LearnPage/Lesson_1/wired-outline-736-funnel-tools-utensils-hover-pinch.json',
  learn01Target: '/icons/LearnPage/Lesson_1/wired-outline-458-goal-target-hover-hit.json',
  learn01Stairs: '/icons/LearnPage/Lesson_1/wired-outline-1639-stairs-in-reveal.json',
  learn01Arrow: '/icons/LearnPage/Lesson_1/wired-outline-233-arrow-22-hover-cycle.json',
  learn01FlowChart: '/icons/LearnPage/Lesson_1/wired-outline-3510-flow-chart-hover-pinch.json',
  learn01Map: '/icons/LearnPage/Lesson_1/wired-outline-106-map-hover-pinch.json',

  // ── Lesson 02 — Data and Inference ───────────────────────────────────────
  learn02Hose: '/icons/LearnPage/Lesson_2/wired-outline-1859-water-hose-hover-pinch.json',
  learn02Portrait: '/icons/LearnPage/Lesson_2/wired-outline-3099-portrait-photo-in-reveal.json',
  learn02Puzzle: '/icons/LearnPage/Lesson_2/wired-outline-186-puzzle-in-reveal.json',
  learn02Heartbeat: '/icons/LearnPage/Lesson_2/wired-outline-1249-heart-beat-hover-heart-beat.json',
  learn02Medical:
    '/icons/LearnPage/Lesson_2/wired-outline-1254-medical-mobile-app-hover-pinch.json',
  learn02Business: '/icons/LearnPage/Lesson_2/wired-outline-952-business-network-hover-pinch.json',
  learn02Camera: '/icons/LearnPage/Lesson_2/wired-outline-1928-city-camera-hover-pinch.json',
  learn02Scan: '/icons/LearnPage/Lesson_2/wired-outline-1686-scan-qr-code-hover-pinch.json',
  learn02FolderLock:
    '/icons/LearnPage/Lesson_2/wired-outline-122-folder-lock-hover-adding-files.json',

  // ── Lesson 03 — The Human Cost ───────────────────────────────────────────
  learn03Medicine:
    '/icons/LearnPage/Lesson_3/wired-outline-1232-ayurveda-medicine-hover-pinch.json',
  learn03Meter: '/icons/LearnPage/Lesson_3/wired-outline-1758-meter-measure-hover-pinch.json',
  learn03Brain: '/icons/LearnPage/Lesson_3/wired-outline-2468-brain-mental-moody-hover-pinch.json',
  learn03Fastfood: '/icons/LearnPage/Lesson_3/wired-outline-562-fastfood-hover-pinch.json',
  learn03Phone: '/icons/LearnPage/Lesson_3/wired-outline-721-hand-with-phone-hover-scroll.json',
  learn03Ribbon:
    '/icons/LearnPage/Lesson_3/wired-outline-1250-ribbon-death-cancer-hover-pinch.json',
  learn03Sleep:
    '/icons/LearnPage/Lesson_3/wired-outline-668-sleeping-in-bed-sleepy-hover-pinch.json',
  learn03Coffee: '/icons/LearnPage/Lesson_3/wired-outline-239-coffee-hover-cheers.json',
  learn03Temperature:
    '/icons/LearnPage/Lesson_3/wired-outline-822-fahrenheit-temperature-hover-pinch.json',
} as const;

interface LordIconProps {
  src: string;
  /** Uniform width and height in pixels (default 40). */
  size?: number;
  trigger?:
    | 'hover'
    | 'hover-blocking'
    | 'loop'
    | 'loop-on-hover'
    | 'click'
    | 'morph'
    | 'boomerang'
    | 'in';
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
