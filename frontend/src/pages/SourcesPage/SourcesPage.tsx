/**
 * @fileoverview Sources page — research bibliography + project credits.
 *
 * All text content is housed within frosted-glass index cards so no prose
 * floats uncontained against the animated canvas backdrop. Three structural
 * layers compose the page:
 *
 *   1. A full-width hero glass card introducing the page's scholarly purpose.
 *   2. A left-to-right organisation logo marquee.
 *   3. The academic-references card carousel, preceded by a glass section-header
 *      card and grouped into categories.
 *
 * Cards scale + spread via CSS custom properties set each frame by useCarouselScroll,
 * so the card nearest the viewport centre grows while its neighbours open away from
 * it. Research references render in AMA (11th ed.) style from `references.ts`.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactElement, RefObject } from 'react';
import { useStringsAnimation } from '../../components/StringsAnimation/useStringsAnimation';
import { ICONS, LordIcon } from '../../icons';
import { GlassCard } from '../../components/GlassCard/GlassCard';
import { useTheme } from '../../lib/ThemeContext';
import { RESEARCH_REFERENCES } from './references';
import './SourcesPage.css';

interface Credit {
  citation: string;
  url: string;
}

interface Organisation {
  name: string;
  logoLight: string;
  logoDark: string;
}

/* ── Organisations behind the cited work ─────────────────────────────────── */

const ORGANISATIONS: Organisation[] = [
  {
    name: 'American Academy of Pediatrics',
    logoLight: '/logos/SourcesPage/AAP-light.png',
    logoDark: '/logos/SourcesPage/AAP-dark.png',
  },
  {
    name: 'American Academy of Sleep Medicine',
    logoLight: '/logos/SourcesPage/AASM-light.png',
    logoDark: '/logos/SourcesPage/AASM-dark.png',
  },
  {
    name: 'American Psychological Association',
    logoLight: '/logos/SourcesPage/APA-light.png',
    logoDark: '/logos/SourcesPage/APA-dark.png',
  },
  {
    name: 'ACM',
    logoLight: '/logos/SourcesPage/ACM-light.png',
    logoDark: '/logos/SourcesPage/ACM-dark.png',
  },
  {
    name: "UK Information Commissioner's Office",
    logoLight: '/logos/SourcesPage/ICO-light.png',
    logoDark: '/logos/SourcesPage/ICO-dark.png',
  },
  {
    name: 'Center for Countering Digital Hate',
    logoLight: '/logos/SourcesPage/CCDH-light.png',
    logoDark: '/logos/SourcesPage/CCDH-dark.png',
  },
  {
    name: 'Common Sense Media',
    logoLight: '/logos/SourcesPage/CSM-light.png',
    logoDark: '/logos/SourcesPage/CSM-dark.png',
  },
  {
    name: 'Harvard Kennedy School — Belfer Center',
    logoLight: '/logos/SourcesPage/Harvard_Belfer-light.png',
    logoDark: '/logos/SourcesPage/Harvard_Belfer-dark.png',
  },
  {
    name: 'Stanford HAI',
    logoLight: '/logos/SourcesPage/HAI-light.png',
    logoDark: '/logos/SourcesPage/HAI-dark.png',
  },
  {
    name: 'IEEE',
    logoLight: '/logos/SourcesPage/IEEE-light.png',
    logoDark: '/logos/SourcesPage/IEEE-dark.png',
  },
  {
    name: 'PNAS',
    logoLight: '/logos/SourcesPage/PNAS-light.png',
    logoDark: '/logos/SourcesPage/PNAS-dark.png',
  },
];

/* ── Scroll engine ──────────────────────────────────────────────────────── */

function useCarouselScroll(rootRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>('.credit-card:not(.credit-card--static)'),
    );
    let centres: { el: HTMLElement; mid: number }[] = [];
    const measure = (): void => {
      centres = cards.map((el) => ({
        el,
        mid: el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2,
      }));
    };

    // Growth + spread tuning.
    const SCALE_MAX = 1.2; // centred card size
    const SCALE_MIN = 0.9; // far-away card size
    const SCALE_FALLOFF = 1500; // px over which scale eases back to the floor
    const SPREAD_K = 0.17; // fraction of a card's distance it's pushed outward
    const SPREAD_MAX = 80; // px cap on the outward push

    const apply = (): void => {
      const vpCentre = window.innerHeight / 2;
      const scrollY = window.scrollY;
      for (const { el, mid } of centres) {
        // Signed distance of this card's centre from the viewport centre.
        const d = mid - scrollY - vpCentre;
        const dist = Math.abs(d);
        // The centred card grows large; neighbours are pushed away from the
        // centre (monotonic in distance, so spacing only ever opens — cards
        // never overlap). Transparency stays constant — recession reads from
        // scale + the spreading gap alone.
        const scale = Math.max(SCALE_MIN, SCALE_MAX - dist / SCALE_FALLOFF);
        const shift = Math.sign(d) * Math.min(dist * SPREAD_K, SPREAD_MAX);
        el.style.setProperty('--card-scale', scale.toFixed(3));
        el.style.setProperty('--card-shift', `${shift.toFixed(1)}px`);
        el.style.zIndex = String(Math.max(0, 1000 - Math.round(dist)));
      }
    };

    measure();
    apply();

    let ticking = false;
    const onScroll = (): void => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        apply();
        ticking = false;
      });
    };

    const remeasure = (): void => {
      measure();
      apply();
    };
    const t1 = window.setTimeout(remeasure, 350);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', remeasure);
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(remeasure);
      ro.observe(root);
    }

    return () => {
      window.clearTimeout(t1);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', remeasure);
      ro?.disconnect();
    };
  }, [rootRef]);
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

/**
 * Continuous logo marquee driven by requestAnimationFrame instead of a CSS
 * keyframe. rAF fixes the three glitches the keyframe version had: it measures
 * the real track width *after* the logos load (eager, no lazy width-pop), wraps
 * the offset at exactly one list-copy width so there is no jump at the loop
 * boundary, and uses a single monotonic translate (no animation restart drift).
 * Hovering the strip eases the scroll to a slow crawl — it never fully stops —
 * and hovering an individual logo grows it (CSS `:hover` on the chip).
 */
function OrgMarquee(): ReactElement {
  const { theme } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const loop = [...ORGANISATIONS, ...ORGANISATIONS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const NORMAL = 55; // px/sec at rest
    const SLOW = 14; // px/sec while hovering the strip (slowed, never stopped)
    let half = track.scrollWidth / 2; // width of one copy of the (doubled) list
    let offset = 0;
    let speed = NORMAL;
    let raf = 0;
    let last = 0;

    const measure = (): void => {
      half = track.scrollWidth / 2;
    };
    // Logos set the track width once decoded — re-measure as each finishes.
    const imgs = Array.from(track.querySelectorAll('img'));
    for (const img of imgs) {
      if (!img.complete) img.addEventListener('load', measure, { once: true });
    }
    measure();

    const step = (t: number): void => {
      raf = requestAnimationFrame(step);
      const dt = last === 0 ? 0 : Math.min((t - last) / 1000, 0.05);
      last = t;
      // Ease the speed toward its target so the hover slow-down is gradual.
      const target = hoverRef.current ? SLOW : NORMAL;
      speed += (target - speed) * Math.min(1, dt * 5);
      if (half > 0) {
        offset += speed * dt;
        if (offset >= 0) offset -= half; // seamless wrap (two identical copies)
        track.style.transform = `translateX(${offset.toFixed(2)}px)`;
      }
    };
    raf = requestAnimationFrame(step);

    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      for (const img of imgs) img.removeEventListener('load', measure);
    };
  }, []);

  return (
    <div
      className="org-marquee"
      aria-label="Organisations behind the cited research"
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
    >
      <div className="org-track" ref={trackRef}>
        {loop.map((org, i) => (
          <div
            key={`${org.name}-${i}`}
            className="org-chip"
            aria-hidden={i >= ORGANISATIONS.length}
          >
            <img
              className="org-logo"
              src={theme === 'light' ? org.logoLight : org.logoDark}
              alt={org.name}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Card({ citation, url }: Credit & { kind: 'reference' | 'credit' }): ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  // 'idle' = hover trigger; 'in' = playing the in-reveal animation
  const [iconPhase, setIconPhase] = useState<'idle' | 'in'>('idle');

  useEffect(() => {
    if (!url) return;
    const el = cardRef.current;
    if (!el) return;

    let fired = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !fired) {
          fired = true;
          observer.disconnect();
          setIconPhase('in');
          // Switch back to hover trigger after the in-reveal animation finishes
          setTimeout(() => {
            setIconPhase('idle');
          }, 1600);
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [url]);

  return (
    <GlassCard
      ref={cardRef}
      className={['credit-card', url ? 'credit-card--linked' : undefined].filter(Boolean).join(' ')}
    >
      <p className="cc-citation">{citation}</p>
      {url ? (
        <a
          className="cc-source-btn"
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label="View source"
        >
          <LordIcon
            key={iconPhase}
            src={ICONS.sourceLink}
            size={30}
            trigger={iconPhase === 'in' ? 'in' : 'hover'}
            state={iconPhase === 'in' ? 'in-reveal' : undefined}
            stroke="bold"
          />
        </a>
      ) : null}
    </GlassCard>
  );
}

function CategoryBlock({
  title,
  items,
  kind,
}: {
  title: string;
  items: Credit[];
  kind: 'reference' | 'credit';
}): ReactElement {
  return (
    <div className="credits-category">
      <div className="credits-list">
        <GlassCard className="credit-card credits-category-card">
          <h3 className="credits-category-title">{title}</h3>
        </GlassCard>
      </div>
      <div className="credits-list credits-list--stack">
        {items.map((it) => (
          <Card key={it.url || it.citation} citation={it.citation} url={it.url} kind={kind} />
        ))}
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */

export function SourcesPage(): ReactElement {
  const pageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useStringsAnimation(canvasRef, theme);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useCarouselScroll(pageRef);

  return (
    <div ref={pageRef} className="sources-page">
      <canvas ref={canvasRef} className="sources-canvas" />

      {/* ── Hero — contained within a glass card ──────────────────────── */}
      <div className="sources-intro">
        <GlassCard className="credit-card credit-card--static sources-hero-card">
          <h1 className="sources-hero-title">
            Scholarly Foundations &amp; Intellectual Attributions
          </h1>
          <p className="sources-hero-sub">
            A curated compendium recognising the researchers, academic institutions, open-source
            stewards, and technological platforms whose seminal contributions undergird this
            project. Each citation reflects a debt of intellectual gratitude owed to the broader
            scientific and engineering communities.
          </p>
        </GlassCard>
      </div>

      <OrgMarquee />

      {/* ── Academic references ────────────────────────────────────────── */}
      <section className="sources-section" aria-labelledby="refs-heading">
        <div className="credits-list">
          <GlassCard className="credit-card sources-section-header">
            <h2 id="refs-heading" className="sources-section-title">
              Peer-Reviewed Sources &amp; Academic References
            </h2>
            <p className="sources-section-sub">
              The scholarly corpus informing this project&rsquo;s foundational premises, rendered in
              accordance with AMA (11th edition) citation standards.
            </p>
          </GlassCard>
        </div>
        {RESEARCH_REFERENCES.map((cat) => (
          <CategoryBlock key={cat.title} title={cat.title} items={cat.items} kind="reference" />
        ))}
      </section>

      {/* ── Disclosure ─────────────────────────────────────────────────── */}
      <div className="credits-list">
        <GlassCard className="credit-card credit-card--static credits-disclaimer">
          <h3>Development Methodology Disclosure</h3>
          <p>
            The research corpus underlying this project was independently conceived, curated, and
            intellectually synthesised by its human author. All scholarly inquiry, source selection,
            analytical reasoning, and critical evaluation reflected herein represent original human
            judgment — no artificial intelligence was employed in the research, literature review,
            or written articulation of ideas.
          </p>
          <p>
            Artificial intelligence tooling was engaged solely as a technical instrument during the
            software implementation phase, augmenting coding velocity, facilitating systematic
            debugging, and accelerating navigation of technical documentation. All architectural
            decisions, aesthetic direction, and ultimate accountability for the system&rsquo;s
            design, implementation, and scholarly integrity reside exclusively with its human
            author. All open-source dependencies are employed in strict accordance with their
            respective licensing agreements.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
