/**
 * @fileoverview Learn page — the project's educational essay.
 *
 * Two GSAP ScrollTrigger horizontal-scroll containers: one for the essay
 * panels (lordicons + text) and one for the new-stack technology panels.
 * The About the Creator section closes the page.
 */
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LordIcon, ICONS } from '../../components/LordIcon/LordIcon';
import githubIcon from '../../assets/learn/GitHub.svg';
import linkedinIcon from '../../assets/learn/LinkedIn.svg';
import websiteIcon from '../../assets/learn/Website.svg';
import './LearnPage.css';

const ESSAY_PANELS: {
  icon: string;
  title: string;
  body: string | ReactElement;
  stroke?: 'bold' | 'regular' | 'light';
  trigger?: 'hover' | 'loop' | 'loop-on-hover' | 'click' | 'morph' | 'boomerang' | 'in';
  state?: string;
  delay?: number;
  width?: number;
  height?: number;
}[] = [
  {
    icon: ICONS.learnPanel1,
    title: 'What is this project?',
    body: 'This website is designed to serve as a resource for exploring the applications of algorithms, with a particular emphasis on recommendation algorithms. It examines their benefits, their potential adverse effects, and the possibilities for practical and beneficial implementations of what is termed "ethical algorithms" — illuminating the nuanced interplay between algorithmic design and ethical considerations in modern computing.',
  },
  {
    icon: ICONS.learnPanel2,
    title: 'Three major benefits of recommendation algorithms',
    body: (
      <>
        <strong>1. E-Commerce:</strong> Suggesting products based on browsing and purchase history —
        showing you more of what you like.
        <br />
        <br />
        <strong>2. Content Streaming:</strong> Platforms like Netflix and Spotify curate
        personalized lists from your viewing and listening histories.
        <br />
        <br />
        <strong>3. Healthcare and Wellness:</strong> Recommending personalized wellness programs,
        diet plans, and medical check-ups from user health data.
      </>
    ),
  },
  {
    icon: ICONS.learnPanel3,
    title: 'The duality of "user-focused"',
    body: 'Many perceive recommendation algorithms as quintessentially user-centric technologies; however, a distinction must be made between being user-focused and user-centered. Many of these algorithms are primarily designed to align with the interests of their makers, prioritizing corporate objectives over optimizing user benefit — leaving users with a misleading sense of security regarding the true intent of the systems they use.',
  },
  {
    icon: ICONS.learnPanel4,
    title: 'Why we must consult ethics',
    body: 'Developing products that incorporate personalized recommendation algorithms necessitates a rigorous evaluation of the ethical implications and unintended consequences these technologies may exert on users. This is especially critical given the substantial amount of time people spend interacting with social platforms daily — an assessment ensures these systems align with ethical standards and mitigate adverse effects on behavior and societal norms.',
  },
  {
    icon: ICONS.learnPanel5,
    title: 'Consider this…',
    body: "In psychology, it is well documented that the subconscious mind frequently operates autonomously, executing thoughts and actions without our conscious awareness. This is particularly pronounced during interactions with social media, where users often engage passively out of comfort. A user mindlessly scrolling through a feed is still interacting — and the platform's algorithms are actively gathering data from those interactions to tailor and enhance content delivery.",
  },
  {
    icon: ICONS.learnPanel6,
    title: 'The unintentional harm',
    body: 'A significant portion of the information derived from user interactions remains opaque to the individuals themselves. Regulatory frameworks draw lines between private, protected information and data collected under consent — yet the volume harvested substantially exceeds common awareness. Advances in data utilization have even enabled researchers to diagnose conditions such as schizophrenia through analysis of user-generated data.',
  },
  {
    icon: ICONS.learnPanel7,
    title: 'Digital phenotyping',
    body: 'Digital phenotyping, while not widely recognized by the general public, is an advanced analytical technique that draws accurate conclusions from a wide-ranging and ostensibly disparate collection of user data. One notable example: researchers developed a mobile application that collected data from Instagram, with participant consent, and was able to diagnose depression with roughly 95% accuracy among the subjects.',
  },
  {
    icon: ICONS.learnPanel8,
    title: 'Revenue over safety',
    body: 'Software development is heavily driven by revenue. Companies, often motivated by financial incentives, engage in extensive data collection as a primary revenue stream — capitalizing not through the mere collection of data but through its monetization via sales to third parties. The ethical implications of such data utilization by third parties remain largely obscure and unmonitored.',
  },
  {
    icon: ICONS.learnPanel9,
    title: 'The user-centered design',
    body: "Such an algorithm is crafted with the consumer's priorities foremost. It is built from the outset to be responsive and adaptive, with each data point and interaction methodically analyzed, and every aspect of its functionality scrutinized for its ethical implications — so that it adheres to the highest standards of user-centric ethics.",
  },
  {
    icon: ICONS.learnPanel10,
    title: 'Ethical algorithms from the ground up',
    body: 'This website serves not only to educate about user-centered algorithms but also to demonstrate a practical implementation. While no algorithm is flawless, the adaptive qualities and streamlined design of the algorithm showcased here exemplify the core principles of a user-centered approach.',
  },
  {
    icon: ICONS.learnPanel11,
    title: 'Check out the prototype!',
    body: (
      <>
        Below are three methodologies that keep this algorithm user-centric:
        <br />
        <br />
        1. All data is encrypted in transit and kept separate from user identifiers.
        <br />
        <br />
        2. Feedback is given in discrete batches — no endless scroll, no addictive unlimited stream.
        <br />
        <br />
        3. The algorithm avoids a feedback loop of only preferred content, updating preferences only
        from explicit interactions.
      </>
    ),
  },
];

const TECH_PANELS: { name: string; role: string }[] = [
  { name: 'TypeScript', role: 'End-to-end type safety' },
  { name: 'React', role: 'Frontend UI library' },
  { name: 'Vite', role: 'Build tool & dev server' },
  { name: 'GraphQL', role: 'API layer — Yoga + Pothos' },
  { name: 'urql', role: 'GraphQL client' },
  { name: 'AWS Lambda', role: 'Serverless compute' },
  { name: 'DynamoDB', role: 'NoSQL database' },
  { name: 'Amazon Cognito', role: 'Auth + TOTP MFA' },
  { name: 'S3 + CloudFront', role: 'Static hosting + CDN' },
  { name: 'Terraform', role: 'Infrastructure as code' },
  { name: 'Unsplash API', role: 'Travel photo source' },
  { name: 'GitHub Actions', role: 'CI / CD pipeline' },
];

const PALETTE_DOT_CLASSES = ['palette-1', 'palette-2', 'palette-3'] as const;

/** Registers GSAP ScrollTrigger and pins a horizontal-scroll container. */
function useHorizontalScroll(
  containerRef: React.RefObject<HTMLDivElement | null>,
  panelSelector: string,
): void {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(el.querySelectorAll(panelSelector));
      if (panels.length < 2) return;

      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          pin: true,
          scrub: 1,
          snap: 1 / (panels.length - 1),
          end: () => '+=' + String(el.offsetWidth),
        },
      });
    }, el);

    return () => {
      ctx.revert();
    };
  }, [containerRef, panelSelector]);
}

/** The Learn page educational essay with GSAP horizontal-scroll panels. */
export function LearnPage(): ReactElement {
  const essayRef = useRef<HTMLDivElement>(null);
  const techRef = useRef<HTMLDivElement>(null);

  useHorizontalScroll(essayRef, '.learn-panel');
  useHorizontalScroll(techRef, '.learn-tech-panel');

  return (
    <div className="learn">
      {/* Hero banner */}
      <section className="learn-banner">
        <div className="learn-banner-content">
          <p className="learn-banner-kicker">Welcome to</p>
          <h1>Building Better Algorithms</h1>
          <p className="learn-banner-sub">Scroll to learn more about this project</p>
        </div>
      </section>

      {/* Essay horizontal scroll */}
      <div ref={essayRef} className="learn-container">
        {/* First panel — logo/intro */}
        <section className="learn-panel learn-panel--intro">
          <div className="learn-panel-logo">BBA</div>
          <p className="learn-panel-logo-sub">Building Better Algorithms</p>
        </section>

        {ESSAY_PANELS.map((panel) => (
          <section className="learn-panel" key={panel.title}>
            <LordIcon
              src={panel.icon}
              size={panel.width ?? 180}
              trigger={panel.trigger ?? 'in'}
              state={panel.state ?? 'in-reveal'}
              stroke={panel.stroke ?? 'bold'}
              delay={panel.delay}
            />
            <h2>{panel.title}</h2>
            <p>{panel.body}</p>
            {panel.title === 'Check out the prototype!' && (
              <Link className="learn-cta" to="/travel">
                Try Travel
              </Link>
            )}
          </section>
        ))}
      </div>

      {/* Technology stack intro — between the two scroll containers */}
      <section className="learn-tech-intro">
        <LordIcon src={ICONS.learnTech} size={180} trigger="in" state="in-reveal" stroke="bold" />
        <h2>Technology Stack</h2>
        <p>
          This project was rebuilt from a Django monolith into a serverless, type-safe application
          on the AWS free tier. Scroll to explore the technologies used.
        </p>
      </section>

      {/* Tech horizontal scroll */}
      <div ref={techRef} className="learn-container learn-container--tech">
        {TECH_PANELS.map((tech, i) => (
          <section className="learn-tech-panel" key={tech.name}>
            <div
              className={`learn-tech-accent ${PALETTE_DOT_CLASSES[i % PALETTE_DOT_CLASSES.length]}`}
            />
            <h2 className="learn-tech-name">{tech.name}</h2>
            <p className="learn-tech-role">{tech.role}</p>
          </section>
        ))}
      </div>

      {/* About the Creator */}
      <section className="learn-creator">
        <h1>About the Creator</h1>
        <h2>Collin Streitman</h2>
        <p>
          Hi, I&rsquo;m Collin Streitman — a curious, passionate developer with interests in design,
          user experience, travel, photography, leadership, and full-stack development. My hobbies
          include backpacking and skiing.
        </p>
        <div className="learn-connect">
          <h3>Connect with me:</h3>
          <div className="learn-social">
            <a href="https://github.com/CStre" target="_blank" rel="noopener noreferrer">
              <img src={githubIcon} alt="GitHub" />
            </a>
            <a
              href="https://www.linkedin.com/in/collin.streitman"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={linkedinIcon} alt="LinkedIn" />
            </a>
            <a href="https://www.collinstreitman.com" target="_blank" rel="noopener noreferrer">
              <img src={websiteIcon} alt="Website" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
