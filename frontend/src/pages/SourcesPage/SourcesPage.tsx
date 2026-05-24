/**
 * @fileoverview Sources page — academic sources and acknowledgements.
 *
 * Each source card scales and fades based on its distance from the centre of
 * the viewport (v1 scroll-scale effect), giving a cinematic parallax feel.
 */
import { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';
import './SourcesPage.css';

interface Source {
  citation: string;
  url: string;
}

/** Academic sources behind the Learn page essay. */
const RESEARCH: Source[] = [
  {
    citation:
      "Qiu, T. (2021). A Psychiatrist's Perspective on Social Media Algorithms and Mental Health. Stanford Institute for Human-Centered Artificial Intelligence (HAI).",
    url: 'https://hai.stanford.edu/news/psychiatrists-perspective-social-media-algorithms-and-mental-health',
  },
  {
    citation:
      'Adam, D. (2020). Machines can spot mental health issues — if you hand over your personal data. MIT Technology Review.',
    url: 'https://www.technologyreview.com/2020/08/13/1006573/digital-psychiatry-phenotyping-schizophrenia-bipolar-privacy/',
  },
  {
    citation:
      'Murdoch, B. (2021). Privacy and artificial intelligence: challenges for protecting health information in a new era. BMC Medical Ethics, 22(122).',
    url: 'https://doi.org/10.1186/s12910-021-00687-3',
  },
  {
    citation:
      'Felzmann, H., & Kennedy, R. (2016). Algorithms, Social Media and Mental Health. Society for Computers and Law (SCL).',
    url: 'https://www.scl.org/articles/3746-algorithms-social-media-and-mental-health',
  },
  {
    citation:
      'Jones, R. B., et al. (2020). A Digital Intervention for Adolescent Depression (MoodHwb): Mixed Methods Feasibility Evaluation. JMIR Mental Health, 7(7).',
    url: 'https://mental.jmir.org/2020/7/e14536',
  },
  {
    citation: 'Uprise Health. (2022). Ethical and Data Privacy Concerns for Mental Health Apps.',
    url: 'https://uprisehealth.com/resources/health-data-privacy-mental-health-app/',
  },
];

/** Recommendation algorithm references (Travel page). */
const ALGORITHM: Source[] = [
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
    citation: 'Unsplash API documentation — photo search and download tracking.',
    url: 'https://unsplash.com/documentation',
  },
];

/** Frontend and UI libraries. */
const FRONTEND: Source[] = [
  { citation: 'React — the UI library.', url: 'https://react.dev' },
  { citation: 'React Router — client-side routing.', url: 'https://reactrouter.com' },
  { citation: 'Vite — the frontend build tool.', url: 'https://vite.dev' },
  { citation: 'TypeScript — end-to-end type safety.', url: 'https://www.typescriptlang.org' },
  {
    citation: 'React Google Charts — GeoChart world map on the Dashboard page.',
    url: 'https://www.react-google-charts.com/',
  },
  {
    citation: 'AWS Amplify Auth — Cognito sign-up, sign-in, and TOTP MFA.',
    url: 'https://docs.amplify.aws/react/build-a-backend/auth/',
  },
  {
    citation: 'urql — the typed GraphQL client.',
    url: 'https://commerce.nearform.com/open-source/urql/',
  },
  {
    citation: 'GraphQL Code Generator — typed operations from the schema.',
    url: 'https://the-guild.dev/graphql/codegen',
  },
];

/** Backend and infrastructure tools. */
const INFRASTRUCTURE: Source[] = [
  {
    citation: 'GraphQL Yoga — the GraphQL server running in AWS Lambda.',
    url: 'https://the-guild.dev/graphql/yoga-server',
  },
  { citation: 'Pothos — code-first GraphQL schema builder.', url: 'https://pothos-graphql.dev' },
  {
    citation: 'AWS Lambda documentation — serverless compute.',
    url: 'https://docs.aws.amazon.com/lambda/',
  },
  {
    citation: 'Amazon DynamoDB documentation — NoSQL database.',
    url: 'https://docs.aws.amazon.com/dynamodb/',
  },
  {
    citation: 'Amazon Cognito documentation — user pool, TOTP MFA.',
    url: 'https://docs.aws.amazon.com/cognito/',
  },
  {
    citation: 'Amazon S3 documentation — static frontend hosting.',
    url: 'https://docs.aws.amazon.com/s3/',
  },
  {
    citation: 'Amazon CloudFront documentation — CDN and origin routing.',
    url: 'https://docs.aws.amazon.com/cloudfront/',
  },
  {
    citation: 'AWS IAM documentation — OIDC roles for GitHub Actions.',
    url: 'https://docs.aws.amazon.com/iam/',
  },
  {
    citation: 'AWS SSM Parameter Store — secrets management.',
    url: 'https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html',
  },
  { citation: 'Terraform — infrastructure as code.', url: 'https://www.terraform.io' },
  {
    citation: 'aws-jwt-verify — Cognito token verification in Lambda.',
    url: 'https://github.com/awslabs/aws-jwt-verify',
  },
];

/** Visual and animation libraries. */
const VISUAL: Source[] = [
  {
    citation:
      'GSAP (GreenSock Animation Platform) — ScrollTrigger horizontal-scroll on the Learn page.',
    url: 'https://gsap.com',
  },
  {
    citation: 'Lordicon — animated icon library used throughout navigation and content panels.',
    url: 'https://lordicon.com',
  },
  {
    citation: 'canvas-confetti — celebration particle effect on the Home page CTA.',
    url: 'https://github.com/catdad/canvas-confetti',
  },
  {
    citation:
      'X. Israeluni, "Monster Eléctrico" — the canvas neural-net tentacle animation on the Home page.',
    url: 'https://gist.github.com/xisraeluni/b96df9d820c19dcfbf705af8bd74a41f',
  },
  {
    citation: 'MDN Web Docs — CSS animations reference.',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations',
  },
];

function SourceList({ sources }: { sources: Source[] }): ReactElement {
  return (
    <div className="credits-sources">
      {sources.map((s) => (
        <div className="source" key={s.url}>
          <span>{s.citation} </span>
          <a href={s.url} target="_blank" rel="noreferrer">
            {s.url}
          </a>
        </div>
      ))}
    </div>
  );
}

export function SourcesPage(): ReactElement {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elOrNull = pageRef.current;
    if (!elOrNull) return;
    const el: HTMLDivElement = elOrNull;

    window.scrollTo(0, 0);

    let rafId = 0;

    // Wait one frame so the browser finishes layout before caching positions.
    rafId = requestAnimationFrame(() => {
      const centerScreen = window.innerHeight / 2;

      // Cache each source's centre position relative to the document (fixed).
      // Using scrollY=0 here since we just reset it above.
      const sourceData = Array.from(el.querySelectorAll<HTMLElement>('.source')).map((s) => ({
        el: s,
        // getBoundingClientRect().top + scrollY = distance from document top.
        docCenterY: s.getBoundingClientRect().top + window.scrollY + s.offsetHeight / 2,
      }));

      let scrollPos = 0;

      function tick(): void {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (scrollPos < maxScroll) {
          scrollPos += 1;
          window.scrollTo(0, scrollPos);
        }

        sourceData.forEach(({ el: source, docCenterY }) => {
          const viewportY = docCenterY - scrollPos;
          const dist = Math.abs(viewportY - centerScreen);
          source.style.transform = `scale(${Math.max(0.75, 1 - 0.0015 * dist)})`;
          source.style.opacity = String(Math.max(0, 1 - 0.002 * dist));
        });

        rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.scrollTo(0, 0);
    };
  }, []);

  return (
    <div ref={pageRef} className="credits">
      <div className="credits-title">
        <h1>Project Sources</h1>
        <h2>
          A thank you to the researchers, open-source maintainers, and platforms behind this
          project.
        </h2>
      </div>

      <div className="credits-section-title">
        <h2>Algorithms &amp; Ethics</h2>
      </div>
      <SourceList sources={RESEARCH} />

      <div className="credits-section-title">
        <h2>Recommendation Algorithm</h2>
      </div>
      <SourceList sources={ALGORITHM} />

      <div className="credits-section-title">
        <h2>Frontend &amp; UI</h2>
      </div>
      <SourceList sources={FRONTEND} />

      <div className="credits-section-title">
        <h2>Backend &amp; Infrastructure</h2>
      </div>
      <SourceList sources={INFRASTRUCTURE} />

      <div className="credits-section-title">
        <h2>Visual &amp; Animation</h2>
      </div>
      <SourceList sources={VISUAL} />

      <div className="credits-sources">
        <div className="source credits-disclaimer">
          <h2>Development Disclaimer</h2>
          <p>
            This project was developed with the assistance of AI tooling to support coding,
            debugging, and the navigation of technical resources. AI helped elevate the efficiency
            of development, but the core architectural decisions, design, and ultimate
            responsibility for the site rest with its human developer. Open-source libraries are
            used in accordance with their licenses.
          </p>
        </div>
      </div>
    </div>
  );
}
