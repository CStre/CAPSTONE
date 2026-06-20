/**
 * @fileoverview Three-island floating header — liquid-glass Dynamic Island style.
 *
 * Grid layout (1fr / auto / 1fr) keeps the center island truly page-centred
 * regardless of how wide the flanking islands are.
 *
 * During the home-page intro sequence the header builds up progressively:
 *   Stage 0–1 : center island shows Brand + Sign In together; left hidden; right visible
 *   Stage 2   : left island fades in; Brand slides out of center; Learn slides in
 *   Stage 3   : Sources slides in
 */
import { NavLink, useNavigate } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useAuth } from '../../auth/context';
import { useLearnProgressOptional } from '../../pages/LearnPage/LearnProgressContext';
import { ICONS, LordIcon } from '../../icons';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { useTheme } from '../../lib/ThemeContext';
import { useIntroStage } from '../../lib/IntroContext';
import { GlassIsland } from '../GlassIsland/GlassIsland';
import { DropdownMenu } from '../DropdownMenu/DropdownMenu';
import './Header.css';

function Icon({
  src,
  small = false,
  danger = false,
  phase = 'idle',
  replayKey = 0,
  hoverState,
}: {
  src: string;
  small?: boolean;
  danger?: boolean;
  /**
   * `'in'` plays the icon's in-reveal once (e.g. when the account dropdown opens),
   * then the parent flips to `'idle'` so hover takes over. Defaults to `'idle'`.
   */
  phase?: 'in' | 'idle';
  /** Bumped by the parent to force the in-reveal to replay on each open. */
  replayKey?: number;
  /** Hover marker to use in the idle phase, for icons whose default isn't a hover. */
  hoverState?: string;
}): ReactElement {
  const { theme } = useTheme();
  const primary = theme === 'dark' ? '#D3D9D4' : '#3D52A0';
  const secondary = theme === 'dark' ? '#748D92' : '#7091E6';
  const dangerCol = theme === 'dark' ? '#748D92' : '#3D52A0';
  const className = small ? 'di-icon di-icon--sm' : 'di-icon';
  const colors = danger
    ? `primary:${dangerCol},secondary:${dangerCol}`
    : `primary:${primary},secondary:${secondary}`;

  // Reveal phase: play in-reveal on mount (keyed so it replays each open).
  if (phase === 'in') {
    return (
      <lord-icon
        key={`in-${replayKey}`}
        className={className}
        src={src}
        trigger="in"
        state="in-reveal"
        stroke="bold"
        colors={colors}
      />
    );
  }

  // Idle phase: hover-driven (the default everywhere else).
  return (
    <lord-icon
      key="idle"
      className={className}
      src={src}
      trigger="hover"
      state={hoverState}
      target={small ? '.di-menu-link' : '.di-nav-item'}
      stroke="bold"
      colors={colors}
    />
  );
}

/**
 * Delay (ms) before a center nav icon plays its in-reveal — long enough that the
 * island has opened the space / the item's content has begun to appear, so the icon
 * arrives *after* the expansion rather than during the pop. Tunable.
 */
const NAV_REVEAL_DELAY_MS = 450;

/**
 * A center-island nav icon that plays its in-reveal then hands off to hover. It
 * runs the sequence on mount, so the parent replays it by changing the icon's
 * `key` (on page load / loader-disappear, and when the tab itself appears).
 */
function NavIcon({
  src,
  revealState = 'in-reveal',
  hoverState,
}: {
  src: string;
  revealState?: string;
  /** Hover marker for the idle phase, for icons whose default marker isn't a hover. */
  hoverState?: string;
}): ReactElement {
  const { theme } = useTheme();
  const primary = theme === 'dark' ? '#D3D9D4' : '#3D52A0';
  const secondary = theme === 'dark' ? '#748D92' : '#7091E6';
  const colors = `primary:${primary},secondary:${secondary}`;
  const [phase, setPhase] = useState<'pre' | 'in' | 'idle'>('pre');

  useEffect(() => {
    const toIn = setTimeout(() => {
      setPhase('in');
    }, NAV_REVEAL_DELAY_MS);
    const toIdle = setTimeout(() => {
      setPhase('idle');
    }, NAV_REVEAL_DELAY_MS + 1900);
    return () => {
      clearTimeout(toIn);
      clearTimeout(toIdle);
    };
  }, []);

  // Hold the icon's space (but draw nothing) until the reveal fires, so the space
  // opens first and the icon then draws into it.
  if (phase === 'pre') {
    return <span className="di-icon" aria-hidden="true" />;
  }
  if (phase === 'in') {
    return (
      <lord-icon
        className="di-icon"
        src={src}
        trigger="in"
        state={revealState || undefined}
        stroke="bold"
        colors={colors}
      />
    );
  }
  return (
    <lord-icon
      className="di-icon"
      src={src}
      trigger="hover"
      state={hoverState}
      target=".di-nav-item"
      stroke="bold"
      colors={colors}
    />
  );
}

export function Header(): ReactElement {
  const { status, logout } = useAuth();
  const navigate = useNavigate();
  const authenticated = status === 'authenticated';
  // The Travel tab unlocks only once the user has completed the Learn demo chapter.
  const demoComplete = useLearnProgressOptional()?.demoComplete ?? false;
  const [menuOpen, setMenuOpen] = useState(false);
  // Account-dropdown icons: play in-reveal on open, then hand off to hover.
  const [menuIconPhase, setMenuIconPhase] = useState<'in' | 'idle'>('idle');
  const [menuOpenSeq, setMenuOpenSeq] = useState(0);
  const menuIconTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { introStage } = useIntroStage();

  // Clear any pending icon-phase timer on unmount.
  useEffect(
    () => () => {
      if (menuIconTimer.current) clearTimeout(menuIconTimer.current);
    },
    [],
  );

  // Toggle the account menu; on open, replay the menu icons' in-reveal then hand
  // off to hover after the reveal completes.
  function toggleMenu(): void {
    if (menuIconTimer.current) clearTimeout(menuIconTimer.current);
    setMenuOpen((open) => !open);
    if (!menuOpen) {
      setMenuOpenSeq((n) => n + 1);
      setMenuIconPhase('in');
      menuIconTimer.current = setTimeout(() => {
        setMenuIconPhase('idle');
      }, 2000);
    }
  }

  const isMinimal = introStage === -2; // 404 page: right island only
  const inIntro = introStage >= 0;

  // ── Visibility logic ────────────────────────────────────────────────────────
  // Left island (brand): hidden on 404, hidden stages 0–1, always visible otherwise
  const showLeft = !isMinimal && (!inIntro || introStage >= 2);
  // Center island: hidden entirely on 404
  const showCenter = !isMinimal;
  // Brand inside the center island: only shown stages 0–1
  const showBrandInCenter = inIntro && introStage < 2;
  // Nav items reveal one by one
  const showLearn = !inIntro || introStage >= 2;
  const showSources = !inIntro || introStage >= 3;
  // Sign In / Account and theme toggle: always visible
  const showTravel = !inIntro || introStage >= 2;
  // Travel only once signed in AND the Learn demo is complete. Always rendered (not
  // conditionally) so it can animate out — fade, then the island shrinks back.
  const travelVisible = authenticated && demoComplete && showTravel;

  // Key for a center nav icon: changes when the loader clears (status leaves
  // 'loading' — i.e. page load / reload) and when the item appears, remounting the
  // icon so it replays its in-reveal in both cases.
  function iconKey(shown: boolean): string {
    return status === 'loading' ? 'load' : `r-${shown ? 1 : 0}`;
  }

  function handleLogout(): void {
    void logout().finally(() => {
      void navigate('/');
    });
  }

  // Expands/collapses a nav item, two-phase so it reads cleanly:
  //  • Show → the island opens the space (max-width) first, THEN the content fades in.
  //  • Hide → the content fades out first, THEN the space closes (island shrinks).
  function navReveal(show: boolean, baseDelay = 0): React.CSSProperties {
    const ease = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    const transition = show
      ? `max-width 0.5s ${ease} ${baseDelay}s, padding 0.5s ease ${baseDelay}s, opacity 0.35s ease ${baseDelay + 0.45}s`
      : `opacity 0.28s ease 0s, max-width 0.5s ${ease} 0.28s, padding 0.5s ease 0.28s`;
    return {
      maxWidth: show ? '160px' : '0px',
      overflow: 'hidden',
      opacity: show ? 1 : 0,
      padding: show ? undefined : '0',
      pointerEvents: show ? 'auto' : 'none',
      transition,
      flexShrink: 0,
    };
  }

  // Opacity-only reveal (for the account dropdown, to avoid clipping the menu)
  function accountReveal(show: boolean): React.CSSProperties {
    return {
      opacity: show ? 1 : 0,
      pointerEvents: show ? 'auto' : 'none',
      transition: 'opacity 0.45s ease',
    };
  }

  // The brand group inside the center island collapses when left island takes over
  const brandInCenterStyle: React.CSSProperties = {
    maxWidth: showBrandInCenter ? '320px' : '0px',
    overflow: 'hidden',
    opacity: showBrandInCenter ? 1 : 0,
    padding: showBrandInCenter ? '0.4rem 0.8rem 0.4rem 0.5rem' : '0',
    transition: 'max-width 0.5s ease, opacity 0.45s ease, padding 0.4s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flexShrink: 0,
  };

  const sepStyle: React.CSSProperties = {
    width: '1px',
    alignSelf: 'stretch',
    margin: '0.6rem 0',
    background: 'var(--color-border)',
    opacity: showBrandInCenter ? 0.5 : 0,
    maxWidth: showBrandInCenter ? '1px' : '0px',
    overflow: 'hidden',
    flexShrink: 0,
    transition: 'opacity 0.4s ease, max-width 0.4s ease',
  };

  return (
    <header className="di-header">
      {/* ── Left island: brand (fades in at stage 2) ──────────────────── */}
      <GlassIsland
        className="di-island--left"
        style={{
          opacity: showLeft ? 1 : 0,
          pointerEvents: showLeft ? 'auto' : 'none',
          transition: 'opacity 0.5s ease',
        }}
      >
        <LordIcon src={ICONS.aiHeader} trigger="loop" state="loop-cycle" size={36} />
        <NavLink to="/" className="di-brand">
          <span className="di-brand__full">Building Better Algorithms</span>
          <span className="di-brand__abbr">B.B.A.</span>
        </NavLink>
      </GlassIsland>

      {/* ── Center island: navigation (always present) ────────────────── */}
      {/* While the account menu is open, freeze the island's elastic drift (keep its
          gooey) so only the popped-out dropdown flows around the cursor — not both. */}
      <GlassIsland
        className="di-island--center"
        elasticStrength={menuOpen ? 0 : undefined}
        style={{
          opacity: showCenter ? 1 : 0,
          pointerEvents: showCenter ? 'auto' : 'none',
          transition: 'opacity 0.4s ease',
        }}
      >
        {/* Brand group — visible only stages 0–1, then slides away */}
        <div style={brandInCenterStyle}>
          <LordIcon src={ICONS.aiHeader} trigger="loop" state="loop-cycle" size={36} />
          <NavLink to="/" className="di-brand">
            Building Better Algorithms
          </NavLink>
        </div>

        {/* Separator between brand and sign-in during intro */}
        <div style={sepStyle} />

        {/* Nav items — each slides in at its own stage */}
        <NavLink to="/learn" className="di-nav-item" style={navReveal(showLearn, 0.12)}>
          <NavIcon key={iconKey(showLearn)} src={ICONS.learn} />
          <span>Learn</span>
        </NavLink>

        {/* Always rendered so it can animate out when demo progress is reset. */}
        <NavLink to="/travel" className="di-nav-item" style={navReveal(travelVisible, 0.12)}>
          <NavIcon key={iconKey(travelVisible)} src={ICONS.travel} hoverState="hover-roll" />
          <span>Travel</span>
        </NavLink>

        <NavLink to="/sources" className="di-nav-item" style={navReveal(showSources, 0.12)}>
          <NavIcon key={iconKey(showSources)} src={ICONS.sources} />
          <span>Sources</span>
        </NavLink>

        {/* Sign In / Account — always visible */}
        {authenticated ? (
          <DropdownMenu
            open={menuOpen}
            onClose={() => {
              setMenuOpen(false);
            }}
            align="center"
            ariaLabel="Account menu"
            trigger={
              <span
                className="di-nav-item di-nav-account-trigger"
                style={accountReveal(true)}
                role="button"
                tabIndex={0}
                onClick={toggleMenu}
              >
                <span className="di-nav-item-face">
                  <NavIcon key={iconKey(true)} src={ICONS.account} />
                  <span>Account</span>
                </span>
              </span>
            }
          >
            <NavLink
              to="/account"
              className="di-menu-link"
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              <Icon src={ICONS.settings} small phase={menuIconPhase} replayKey={menuOpenSeq} />
              Settings
            </NavLink>
            <NavLink
              to="/dashboard"
              className="di-menu-link"
              onClick={() => {
                setMenuOpen(false);
              }}
            >
              <Icon
                src={ICONS.brochure}
                small
                phase={menuIconPhase}
                replayKey={menuOpenSeq}
                hoverState="hover-pinch"
              />
              Brochure
            </NavLink>
            <button
              type="button"
              className="di-menu-link di-menu-logout"
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              <Icon
                src={ICONS.signOut}
                small
                danger
                phase={menuIconPhase}
                replayKey={menuOpenSeq}
              />
              Sign out
            </button>
          </DropdownMenu>
        ) : (
          <NavLink to="/login" className="di-nav-item" style={navReveal(true)}>
            <NavIcon key={iconKey(true)} src={ICONS.signIn} />
            <span>Sign in</span>
          </NavLink>
        )}
      </GlassIsland>

      {/* ── Right island: theme toggle (always visible) ───────────────── */}
      <GlassIsland className="di-island--right">
        <ThemeToggle />
      </GlassIsland>
    </header>
  );
}
