/**
 * @fileoverview Learn section 02 — Your Behavior Becomes the Algorithm.
 * Copy: ../plan/02-data-and-inference.md (Synthesis 02).
 */
import { ICONS } from '../../../icons';
import type { LearnSection } from '../types';

export const dataAndInference: LearnSection = {
  id: 'data-and-inference',
  number: '02',
  title: 'Your Behavior Becomes the Algorithm',
  subtitle: 'Personalization data is surveillance data.',
  slides: [
    {
      icon: ICONS.learn02Hose,
      title: 'Total capture, by default',
      body: `The industry's default posture is to capture everything — every click, dwell, scroll, and hover is treated as a training label. Platforms choose implicit behavioral data precisely because there is vastly more of it than anything you'd consciously volunteer. You are not occasionally measured; you are continuously logged.`,
    },
    {
      icon: ICONS.learn02Portrait,
      hoverState: 'hover-pinch',
      title: 'Every interaction rewrites a model of you',
      body: `That captured behavior doesn't sit in a log — it's written into the machine. Each thing you do indexes and updates a row in an "embedding table," a learned vector that literally represents you, rewritten by gradient descent on every interaction. Your behavioral exhaust isn't merely collected; it continuously becomes the model's picture of who you are.`,
    },
    {
      icon: ICONS.learn02Puzzle,
      hoverState: 'hover-detach',
      title: "Sensitivity is emergent — you can't hide it",
      body: `From Facebook "Likes" alone — nothing explicitly sensitive — researchers predicted sexual orientation (88% accuracy in men), ethnicity (95%), Democrat vs. Republican (85%), Christian vs. Muslim (82%), and even whether your parents separated during your childhood (~60%). As they warned, "merely avoiding explicitly homosexual content may be insufficient to prevent others from discovering one's sexual orientation." You cannot withhold a trait the model reconstructs from a thousand unrelated signals.`,
    },
    {
      icon: ICONS.learn02Heartbeat,
      title: 'From trait to diagnosis: depression, before onset',
      body: `The most consequential trait to infer is health. From public Twitter behavior alone — posting volume, late-night "insomnia" patterns, self-focused language — researchers predicted major depression at roughly 70% accuracy before users reported its onset, and proposed an explicit "MDD risk score." The behavioral exhaust that personalizes a feed doubles as an early-warning psychiatric screen.`,
    },
    {
      icon: ICONS.learn02Medical,
      title: 'Validated against actual medical records',
      body: `This isn't a lab curiosity. Among patients who shared both their Facebook and their medical records, their language predicted depression up to three months before the documented diagnosis, with accuracy "comparable to validated self-report depression scales." The same machine that ranks your feed is, unmodified, a clinical-grade depression screen — the platform just isn't using it for your care.`,
    },
    {
      icon: ICONS.learn02Business,
      title: 'An economy that trades your inferences',
      body: `Inference isn't confined to the platforms you use. Data brokers hold "billions of data elements covering nearly every U.S. consumer" — one keeps "3000 data segments for nearly every U.S. consumer" — and sell health-adjacent categories with names like "Diabetes Interest," "Cholesterol Focus," and "Expectant Parent." Most of this runs in the dark, off-platform, feeding the same ad ecosystem.`,
    },
    {
      icon: ICONS.learn02Camera,
      title: 'Consent collapses at scale: Cambridge Analytica',
      body: `A single personality-quiz app harvested up to 87 million Facebook profiles — overwhelmingly people who never touched the app, exposed through their friends' permissions — to build psychographic profiles for political micro-targeting. The fine that followed, £500,000, was the pre-GDPR maximum and so trivial it became the argument for stronger law. The lesson is structural: consent is broken at the root when your data is emitted by the people around you.`,
    },
    {
      icon: ICONS.learn02Scan,
      title: "Why it's relentless: surveillance capitalism",
      body: `Why is capture total and inference relentless? Because, in one scholar's framing, this is "surveillance capitalism" — a logic of accumulation whose raw material is your behavior and whose product is prediction, operating with "formal indifference" to the people it monetizes. Under that lens, engagement optimization and trait inference aren't bugs or excesses — they are the core revenue activity. That's why "just collect less" is hard: it cuts the business model.`,
    },
    {
      icon: ICONS.learn02FolderLock,
      title: 'But total capture is a choice, not a necessity',
      body: `The "we must centralize everything" premise is economic, not technical. Federated learning trains good personalization models while leaving the data "distributed on the mobile devices," sharing only aggregated updates — and with differential privacy, it bounds what any update can leak. Data minimization and real personalization can coexist; this project is built on exactly that bet.`,
    },
  ],
};
