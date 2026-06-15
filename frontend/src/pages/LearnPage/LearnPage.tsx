/**
 * @fileoverview Learn page — the project's educational course.
 *
 * A hero banner sits above a single active **section deck** (a controlled
 * horizontal carousel). The reader moves between sections with the progress menu
 * (top-centre); a "back to the beginning" button (bottom-right) returns to the
 * banner and Section 00.
 *
 * Slide copy is authored in `plan/*.md`; every slide currently uses a single
 * placeholder icon (see the `TODO(icon)` comments in each `sections/*.tsx`).
 *
 * The whole page sits over a fixed parallax `StarfieldAnimation`; the banner, deck,
 * and panels are transparent so the field shows through. The active carousel slide
 * drives `hScrollRef` for the field's horizontal parallax (vertical uses scrollY).
 */
import { useCallback, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { GooeyButton } from '../../components/GooeyButton/GooeyButton';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { StarfieldAnimation } from '../../components/StarfieldAnimation/StarfieldAnimation';
import { useTheme } from '../../lib/ThemeContext';
import { LEARN_SECTIONS } from './sections';
import { LearnDeck } from './components/LearnDeck';
import { LearnProgressMenu } from './components/LearnProgressMenu';
import { LearnProgressProvider } from './LearnProgressContext';
import './LearnPage.css';

// Pixels of horizontal parallax per slide advanced — bolder stars drift more.
const PARALLAX_PER_SLIDE = 70;

// Cumulative slide index where each section begins, so navigating forward through
// the whole course moves the starfield monotonically (no jump-back between sections).
const SECTION_BASE: Record<string, number> = (() => {
  const base: Record<string, number> = {};
  let acc = 0;
  for (const s of LEARN_SECTIONS) {
    base[s.id] = acc;
    acc += s.slides.length + 1; // + the outro slide
  }
  return base;
})();

function LearnPageInner(): ReactElement {
  const firstId = LEARN_SECTIONS[0]?.id ?? '';
  const [activeId, setActiveId] = useState(firstId);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useTheme();

  // Drives the starfield's horizontal parallax (mutated, never triggers a render).
  const hScrollRef = useRef(0);
  const handleSlideChange = useCallback(
    (slideIndex: number) => {
      hScrollRef.current = ((SECTION_BASE[activeId] ?? 0) + slideIndex) * PARALLAX_PER_SLIDE;
    },
    [activeId],
  );

  const activeSection = LEARN_SECTIONS.find((s) => s.id === activeId) ?? LEARN_SECTIONS[0];

  function goToSection(id: string): void {
    setActiveId(id);
    setMenuOpen(false);
    // Wait for the new deck to render, then scroll it into view.
    requestAnimationFrame(() => {
      document.getElementById('learn-deck')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function goToStart(): void {
    setActiveId(firstId);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="learn">
      <StarfieldAnimation theme={theme} offsetRef={hScrollRef} />

      <LearnProgressMenu
        activeSectionId={activeId}
        onSelect={goToSection}
        open={menuOpen}
        setOpen={setMenuOpen}
      />

      {/* Hero banner — a glass index card matching the rest of the site */}
      <section className="learn-banner">
        <GlassCard className="learn-banner-card">
          <p className="learn-banner-kicker hover-grow">An interactive course</p>
          <h1 className="hover-grow">Building Better Algorithms</h1>
          <p className="learn-banner-sub hover-grow">
            Recommendation systems quietly shape what billions of people watch, buy, and believe.
            This course examines how they actually work, the documented harms of optimizing for
            engagement, and — most importantly — how the same technology can be rebuilt to put the
            user first. Scroll down to begin, or jump to any section from the menu.
          </p>
        </GlassCard>
      </section>

      {/* The active section deck (remounts per section for clean slide state) */}
      {activeSection ? (
        <LearnDeck
          key={activeSection.id}
          section={activeSection}
          onOpenMenu={() => {
            setMenuOpen(true);
          }}
          onSlideChange={handleSlideChange}
        />
      ) : null}

      <GooeyButton
        className="learn-to-start"
        aria-label="Back to the beginning"
        onClick={goToStart}
      >
        ↑
      </GooeyButton>
    </div>
  );
}

/** The Learn page educational course. */
export function LearnPage(): ReactElement {
  return (
    <LearnProgressProvider>
      <LearnPageInner />
    </LearnProgressProvider>
  );
}
