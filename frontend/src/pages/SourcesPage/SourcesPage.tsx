/**
 * @fileoverview Sources page — research bibliography + project credits.
 *
 * All text content is housed within frosted-glass index cards so no prose
 * floats uncontained against the animated canvas backdrop. Three structural
 * layers compose the page:
 *
 *   1. A full-width hero glass card introducing the page's scholarly purpose.
 *   2. A left-to-right organisation logo marquee.
 *   3. Two card-carousel sections — academic references then technical credits —
 *      each preceded by a glass section-header card.
 *
 * Cards scale/fade via CSS custom properties set each frame by useCarouselScroll,
 * so cards near the viewport centre read at full size and recede gracefully above
 * and below. Research references render in AMA (11th ed.) style from `references.ts`.
 */
import { useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode, RefObject } from 'react';
import { useStringsAnimation } from '../../components/StringsAnimation/useStringsAnimation';
import { ICONS, LordIcon } from '../../components/LordIcon/LordIcon';
import { useCardTilt } from '../../components/GlassIsland/useCardTilt';
import { useTheme } from '../../lib/ThemeContext';
import { RESEARCH_REFERENCES } from './references';
import './SourcesPage.css';

interface Credit {
  citation: string;
  url: string;
}

interface CreditCategory {
  title: string;
  items: Credit[];
}

interface Organisation {
  name: string;
  logoLight: string;
  logoDark: string;
}

/* ── Tooling & platform credits ──────────────────────────────────────────── */

const ALGORITHM: Credit[] = [
  {
    citation: '"Recommendation system in Python." GeeksforGeeks.',
    url: 'https://www.geeksforgeeks.org/recommendation-system-in-python/',
  },
  {
    citation: '"Build a recommendation engine with collaborative filtering." Real Python.',
    url: 'https://realpython.com/build-recommendation-engine-collaborative-filtering/',
  },
  {
    citation: '"Recommender Systems in Python." DataCamp.',
    url: 'https://www.datacamp.com/tutorial/recommender-systems-python',
  },
  {
    citation: 'Moreira, G. S. P. "Recommender Systems in Python 101." Kaggle.',
    url: 'https://www.kaggle.com/code/gspmoreira/recommender-systems-in-python-101',
  },
  {
    citation: 'Unsplash API documentation — photo search and download-tracking protocols.',
    url: 'https://unsplash.com/documentation',
  },
];

const FRONTEND: Credit[] = [
  { citation: 'React — declarative component-based UI library.', url: 'https://react.dev' },
  {
    citation: 'React Router — declarative client-side routing for single-page applications.',
    url: 'https://reactrouter.com',
  },
  {
    citation: 'Vite — next-generation frontend build tooling with native ESM support.',
    url: 'https://vite.dev',
  },
  {
    citation:
      'TypeScript — statically typed superset of JavaScript enabling end-to-end type safety.',
    url: 'https://www.typescriptlang.org',
  },
  {
    citation:
      'React Google Charts — GeoChart world-map visualisation of preference scores on the Dashboard.',
    url: 'https://www.react-google-charts.com/',
  },
  {
    citation:
      'AWS Amplify Auth — Cognito-backed sign-up, sign-in, and TOTP multi-factor authentication.',
    url: 'https://docs.amplify.aws/react/build-a-backend/auth/',
  },
  {
    citation: 'urql — lightweight, extensible GraphQL client with first-class TypeScript support.',
    url: 'https://commerce.nearform.com/open-source/urql/',
  },
  {
    citation:
      'GraphQL Code Generator — emits fully-typed client operations from the backend schema.',
    url: 'https://the-guild.dev/graphql/codegen',
  },
];

const INFRASTRUCTURE: Credit[] = [
  {
    citation:
      'GraphQL Yoga — standards-compliant GraphQL server running within the AWS Lambda execution environment.',
    url: 'https://the-guild.dev/graphql/yoga-server',
  },
  {
    citation:
      'Pothos — code-first, type-safe GraphQL schema builder eliminating schema-code divergence.',
    url: 'https://pothos-graphql.dev',
  },
  {
    citation: 'AWS Lambda — serverless compute substrate underpinning the GraphQL API layer.',
    url: 'https://docs.aws.amazon.com/lambda/',
  },
  {
    citation:
      'Amazon DynamoDB — fully managed, multi-region NoSQL database for per-user preference storage.',
    url: 'https://docs.aws.amazon.com/dynamodb/',
  },
  {
    citation:
      'Amazon Cognito — managed identity provider handling user-pool authentication and TOTP MFA.',
    url: 'https://docs.aws.amazon.com/cognito/',
  },
  {
    citation:
      'Amazon S3 — object-storage origin for the compiled React SPA, served via CloudFront.',
    url: 'https://docs.aws.amazon.com/s3/',
  },
  {
    citation:
      'Amazon CloudFront — global content-delivery network and reverse-proxy routing traffic between the SPA and the Lambda function URL.',
    url: 'https://docs.aws.amazon.com/cloudfront/',
  },
  {
    citation:
      'AWS IAM — identity and access management, including OIDC federation for GitHub Actions CI/CD.',
    url: 'https://docs.aws.amazon.com/iam/',
  },
  {
    citation:
      'AWS SSM Parameter Store — encrypted secrets management precluding plaintext credentials in source control.',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html',
  },
  {
    citation:
      'Terraform — declarative infrastructure-as-code provisioning all AWS resources across three isolated environments.',
    url: 'https://www.terraform.io',
  },
  {
    citation:
      'aws-jwt-verify — AWS-authored library for offline Cognito JWT verification within the Lambda runtime.',
    url: 'https://github.com/awslabs/aws-jwt-verify',
  },
];

const VISUAL: Credit[] = [
  {
    citation:
      'GSAP (GreenSock Animation Platform) — ScrollTrigger-driven horizontal-scroll progression on the Learn page.',
    url: 'https://gsap.com',
  },
  {
    citation:
      'Lordicon — Lottie-based animated icon library providing expressive iconography throughout the interface.',
    url: 'https://lordicon.com',
  },
  {
    citation:
      'canvas-confetti — lightweight particle-celebration effect deployed on the Home page call-to-action.',
    url: 'https://github.com/catdad/canvas-confetti',
  },
  {
    citation:
      'X. Israeluni, "Monster Eléctrico" — the canvas neural-net tentacle animation underlying the Home and Login pages.',
    url: 'https://gist.github.com/xisraeluni/b96df9d820c19dcfbf705af8bd74a41f',
  },
  {
    citation: 'MDN Web Docs — authoritative CSS animations specification and reference.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations',
  },
];

const TECH_CREDITS: CreditCategory[] = [
  { title: 'Recommendation Methodology', items: ALGORITHM },
  { title: 'Frontend Architecture & User Interface', items: FRONTEND },
  { title: 'Backend Architecture & Cloud Infrastructure', items: INFRASTRUCTURE },
  { title: 'Visual Design & Animation Systems', items: VISUAL },
];

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

    const apply = (): void => {
      const vpCentre = window.innerHeight / 2;
      const scrollY = window.scrollY;
      for (const { el, mid } of centres) {
        const dist = Math.abs(mid - scrollY - vpCentre);
        // Wider scale range so the centred card grows large enough to overlay its
        // neighbours; opacity is deliberately left untouched (transparency stays
        // constant) — recession is conveyed by scale + z-index stacking alone.
        const scale = Math.max(0.74, 1.12 - dist / 1500);
        el.style.setProperty('--card-scale', scale.toFixed(3));
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

function OrgMarquee(): ReactElement {
  const { theme } = useTheme();
  const loop = [...ORGANISATIONS, ...ORGANISATIONS];
  return (
    <div className="org-marquee" aria-label="Organisations behind the cited research">
      <div className="org-track">
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
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Glass card with a cursor-reactive 3-D tilt matching the login card.
 *
 * The carousel scale/fade is driven by the scroll engine via the independent
 * `scale:` + `opacity:` CSS properties (set per-frame), while the cursor tilt
 * lives on the `transform` property with its own transition. Keeping the two on
 * separate CSS properties means the tilt can ease smoothly without the scroll
 * scaling lagging — and, critically, the scale is no longer a transform on an
 * ancestor, so the card's `backdrop-filter` glass renders (a transformed
 * ancestor silently disables it). Static cards opt out of the scroll scale.
 */
function TiltCard({
  className,
  innerRef,
  staticCard,
  children,
}: {
  className?: string;
  innerRef?: (node: HTMLDivElement | null) => void;
  /** Opt out of the scroll-driven carousel scale/fade (the scroll engine skips it). */
  staticCard?: boolean;
  children: ReactNode;
}): ReactElement {
  const { ref, rx, ry, isHovered } = useCardTilt(4);
  const setRef = (node: HTMLDivElement | null): void => {
    ref.current = node;
    innerRef?.(node);
  };
  return (
    <div
      ref={setRef}
      className={['credit-card', staticCard && 'credit-card--static', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`,
        transition: isHovered ? 'transform 0.12s ease-out' : 'transform 0.5s ease-out',
      }}
    >
      {children}
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
    <TiltCard
      className={url ? 'credit-card--linked' : undefined}
      innerRef={(node) => {
        cardRef.current = node;
      }}
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
    </TiltCard>
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
        <TiltCard className="credits-category-card">
          <h3 className="credits-category-title">{title}</h3>
        </TiltCard>
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
        <TiltCard className="sources-hero-card" staticCard>
          <h1 className="sources-hero-title">
            Scholarly Foundations &amp; Intellectual Attributions
          </h1>
          <p className="sources-hero-sub">
            A curated compendium recognising the researchers, academic institutions, open-source
            stewards, and technological platforms whose seminal contributions undergird this
            project. Each citation reflects a debt of intellectual gratitude owed to the broader
            scientific and engineering communities.
          </p>
        </TiltCard>
      </div>

      <OrgMarquee />

      {/* ── Academic references ────────────────────────────────────────── */}
      <section className="sources-section" aria-labelledby="refs-heading">
        <div className="credits-list">
          <TiltCard className="sources-section-header">
            <h2 id="refs-heading" className="sources-section-title">
              Peer-Reviewed Sources &amp; Academic References
            </h2>
            <p className="sources-section-sub">
              The scholarly corpus informing this project&rsquo;s foundational premises, rendered in
              accordance with AMA (11th edition) citation standards.
            </p>
          </TiltCard>
        </div>
        {RESEARCH_REFERENCES.map((cat) => (
          <CategoryBlock key={cat.title} title={cat.title} items={cat.items} kind="reference" />
        ))}
      </section>

      {/* ── Technical credits ──────────────────────────────────────────── */}
      <section className="sources-section" aria-labelledby="credits-heading">
        <div className="credits-list">
          <TiltCard className="sources-section-header">
            <h2 id="credits-heading" className="sources-section-title">
              Technical Attributions &amp; Open-Source Acknowledgements
            </h2>
            <p className="sources-section-sub">
              The open-source libraries, architectural frameworks, cloud infrastructure platforms,
              and developer tooling upon which this application is architecturally founded. Each
              dependency represents a collective contribution to the broader software engineering
              commons.
            </p>
          </TiltCard>
        </div>
        {TECH_CREDITS.map((cat) => (
          <CategoryBlock key={cat.title} title={cat.title} items={cat.items} kind="credit" />
        ))}
      </section>

      {/* ── Disclosure ─────────────────────────────────────────────────── */}
      <div className="credits-list">
        <TiltCard className="credits-disclaimer" staticCard>
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
        </TiltCard>
      </div>
    </div>
  );
}
