/**
 * @fileoverview One section shown as a controlled horizontal carousel.
 *
 * Only one deck is on the page at a time (the active section). Slides advance via
 * the mouse wheel / trackpad (accumulated, so a deliberate gesture moves one or
 * more slides but a light touch doesn't blow through), the arrow keys, or the
 * dash-bar arrows. The page stays locked to the deck while navigating, releasing
 * at the first/last slide. A slide completes once its typewriter finishes; a final
 * outro slide closes every (non-deferred) section, reflecting whether it's done.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { LordIcon, ICONS } from '../../../components/LordIcon/LordIcon';
import { GooeyButton } from '../../../components/GooeyButton/GooeyButton';
import type { LearnSection } from '../types';
import { useLearnProgress } from '../LearnProgressContext';
import { LearnSlide } from './LearnSlide';

// Wheel / trackpad tuning — higher THRESHOLD = less sensitive (more deliberate).
const WHEEL_THRESHOLD = 140;
const WHEEL_COOLDOWN_MS = 420;
const WHEEL_GESTURE_GAP_MS = 180;

function OutroSlide({
  completed,
  onOpenMenu,
}: {
  completed: boolean;
  onOpenMenu: () => void;
}): ReactElement {
  return (
    <section className="learn-panel learn-outro">
      <LordIcon
        key={completed ? 'complete' : 'incomplete'}
        src={completed ? ICONS.slideComplete : ICONS.slideIncomplete}
        size={96}
        trigger="in"
        state="in-reveal"
        stroke="bold"
      />
      <h2 className="hover-grow">{completed ? 'Section complete' : 'Section incomplete'}</h2>
      <p className="hover-grow">
        {completed
          ? 'Nicely done. Pick the next section from the menu to keep learning.'
          : 'You skipped ahead — go back and finish the earlier slides to complete this section. The menu is always here when you want the next one.'}
      </p>
      <GooeyButton className="learn-progress-toggle learn-outro-btn" onClick={onOpenMenu}>
        Open the menu
      </GooeyButton>
    </section>
  );
}

function DashBar({
  count,
  current,
  onGo,
}: {
  count: number;
  current: number;
  onGo: (delta: number) => void;
}): ReactElement {
  return (
    <div className="learn-dashbar">
      <div className="learn-dash-track">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={`learn-dash${i === current ? ' is-current' : ''}`}>
            {i === current ? <span className="learn-dash-num">{i + 1}</span> : null}
          </span>
        ))}
      </div>
      <div className="learn-dash-arrows">
        <GooeyButton
          aria-label="Previous slide"
          disabled={current === 0}
          onClick={() => {
            onGo(-1);
          }}
        >
          ‹
        </GooeyButton>
        <GooeyButton
          aria-label="Next slide"
          disabled={current === count - 1}
          onClick={() => {
            onGo(1);
          }}
        >
          ›
        </GooeyButton>
      </div>
    </div>
  );
}

export function LearnDeck({
  section,
  onOpenMenu,
  onSlideChange,
}: {
  section: LearnSection;
  onOpenMenu: () => void;
  /** Reports the active slide index (for the background's horizontal parallax). */
  onSlideChange?: (slideIndex: number) => void;
}): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const { markViewed, status } = useLearnProgress();

  const realCount = section.slides.length;
  // Non-deferred sections get a trailing outro slide; deferred ("coming soon") don't.
  const count = section.deferred ? realCount : realCount + 1;
  const last = count - 1;
  const sectionComplete = status[section.id]?.completed ?? false;

  const go = useCallback(
    (delta: number) => {
      setSlide((s) => Math.max(0, Math.min(last, s + delta)));
    },
    [last],
  );

  // Latest slide index for the closure-captured wheel handler.
  const slideRef = useRef(slide);
  useEffect(() => {
    slideRef.current = slide;
  }, [slide]);

  // Report the active slide upward (drives the starfield's horizontal parallax).
  useEffect(() => {
    onSlideChange?.(slide);
  }, [slide, onSlideChange]);

  // Keyboard navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
    };
  }, [go]);

  // Wheel / trackpad navigation: capture only while the deck fills the viewport,
  // accumulate delta so casual scrolling doesn't over-advance, and release at the
  // boundaries so the page can scroll back to the banner.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // Capture the wheel only once the deck FULLY fills the viewport (the user has
    // scrolled all the way down past the banner) — never while it's half on-screen.
    let deckActive = false;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        deckActive = !!entry && entry.intersectionRatio >= 0.95;
      },
      { threshold: [0, 0.95, 1] },
    );
    io.observe(el);

    let accum = 0;
    let cooling = false;
    let lastTs = 0;
    const onWheel = (e: WheelEvent): void => {
      if (!deckActive) return;
      const dir = e.deltaY > 0 ? 1 : -1;
      const atStart = slideRef.current === 0;
      const atEnd = slideRef.current === last;
      if ((dir > 0 && atEnd) || (dir < 0 && atStart)) {
        accum = 0;
        return; // release to page scroll
      }
      e.preventDefault();
      const now = e.timeStamp;
      if (now - lastTs > WHEEL_GESTURE_GAP_MS) accum = 0; // a pause starts a fresh gesture
      lastTs = now;
      if (cooling) return;
      accum += e.deltaY;
      if (Math.abs(accum) >= WHEEL_THRESHOLD) {
        go(accum > 0 ? 1 : -1);
        accum = 0;
        cooling = true;
        setTimeout(() => {
          cooling = false;
        }, WHEEL_COOLDOWN_MS);
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      io.disconnect();
      el.removeEventListener('wheel', onWheel);
    };
  }, [go, last]);

  return (
    <div id="learn-deck" ref={rootRef} className="learn-deck">
      <div className="learn-deck-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
        {section.slides.map((sl, i) => (
          <LearnSlide
            key={sl.title}
            slide={sl}
            index={i}
            sectionId={section.id}
            active={!section.deferred && i === slide}
            onComplete={() => {
              markViewed(section.id, i);
            }}
          />
        ))}
        {section.deferred ? null : (
          <OutroSlide completed={sectionComplete} onOpenMenu={onOpenMenu} />
        )}
      </div>
      <DashBar count={count} current={slide} onGo={go} />
    </div>
  );
}
