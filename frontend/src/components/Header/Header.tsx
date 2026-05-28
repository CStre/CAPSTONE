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
import { useState, useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { useAuth } from '../../auth/context';
import { ICONS, LordIcon } from '../LordIcon/LordIcon';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { useTheme } from '../../lib/ThemeContext';
import { useIntroStage } from '../../lib/IntroContext';
import { GlassIsland } from '../GlassIsland/GlassIsland';
import './Header.css';

function Icon({
  src,
  small = false,
  danger = false,
}: {
  src: string;
  small?: boolean;
  danger?: boolean;
}): ReactElement {
  const { theme } = useTheme();
  const primary = theme === 'dark' ? '#D3D9D4' : '#3D52A0';
  const secondary = theme === 'dark' ? '#748D92' : '#7091E6';
  const dangerCol = theme === 'dark' ? '#748D92' : '#3D52A0';

  return (
    <lord-icon
      className={small ? 'di-icon di-icon--sm' : 'di-icon'}
      src={src}
      trigger="hover"
      target={small ? '.di-menu-link' : '.di-nav-item'}
      stroke="bold"
      colors={
        danger
          ? `primary:${dangerCol},secondary:${dangerCol}`
          : `primary:${primary},secondary:${secondary}`
      }
    />
  );
}

export function Header(): ReactElement {
  const { status, logout } = useAuth();
  const navigate = useNavigate();
  const authenticated = status === 'authenticated';
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
    };
  }, [menuOpen]);
  const { introStage } = useIntroStage();
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

  function handleLogout(): void {
    void logout().finally(() => {
      void navigate('/');
    });
  }

  // Collapses/expands a nav item in the center island
  function navReveal(show: boolean, delay = '0s'): React.CSSProperties {
    return {
      maxWidth: show ? '160px' : '0px',
      overflow: 'hidden',
      opacity: show ? 1 : 0,
      padding: show ? undefined : '0',
      pointerEvents: show ? 'auto' : 'none',
      transition: `max-width 0.5s ease ${show ? delay : '0s'}, opacity 0.4s ease ${show ? delay : '0s'}, padding 0.4s ease`,
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
      <GlassIsland
        className="di-island--center"
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
        <NavLink to="/learn" className="di-nav-item" style={navReveal(showLearn, '0.12s')}>
          <Icon src={ICONS.learn} />
          <span>Learn</span>
        </NavLink>

        {authenticated && (
          <NavLink to="/travel" className="di-nav-item" style={navReveal(showTravel, '0.12s')}>
            <Icon src={ICONS.travel} />
            <span>Travel</span>
          </NavLink>
        )}

        <NavLink to="/sources" className="di-nav-item" style={navReveal(showSources, '0.12s')}>
          <Icon src={ICONS.sources} />
          <span>Sources</span>
        </NavLink>

        {/* Sign In / Account — always visible */}
        {authenticated ? (
          <div
            ref={accountRef}
            className={`di-nav-item di-nav-account${menuOpen ? ' is-open' : ''}`}
            style={accountReveal(true)}
            onClick={() => {
              setMenuOpen((o) => !o);
            }}
          >
            <span className="di-nav-item-face">
              <Icon src={ICONS.account} />
              <span>Account</span>
            </span>
            <div className="di-menu">
              <NavLink
                to="/account"
                className="di-menu-link"
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                <Icon src={ICONS.account} small />
                Account
              </NavLink>
              <NavLink
                to="/dashboard"
                className="di-menu-link"
                onClick={() => {
                  setMenuOpen(false);
                }}
              >
                <Icon src={ICONS.dashboard} small />
                Dashboard
              </NavLink>
              <button
                type="button"
                className="di-menu-link di-menu-logout"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                <Icon src={ICONS.signOut} small danger />
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <NavLink to="/login" className="di-nav-item" style={navReveal(true)}>
            <Icon src={ICONS.signIn} />
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
