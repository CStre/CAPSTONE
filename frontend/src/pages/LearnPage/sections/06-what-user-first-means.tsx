/**
 * @fileoverview Learn section 06 — What "User-First" Actually Means.
 * Copy: ../plan/06-what-user-first-means.md (Synthesis 05). Placeholder icons.
 */
import { ICONS } from '../../../icons';
import type { LearnSection } from '../types';

export const whatUserFirstMeans: LearnSection = {
  id: 'what-user-first-means',
  number: '06',
  title: 'What "User-First" Actually Means',
  subtitle: 'Treating the user as an end, not a means.',
  slides: [
    {
      // TODO(icon): a person at the center of concentric rings vs. a person as one cog
      icon: ICONS.slidePlaceholder,
      title: 'The one axis that matters: end vs. means',
      body: `Every ethical framework converges on a single axis. A user-first system treats you as an end — your flourishing is the goal — while an engagement system treats you as a means, a source of behavioral surplus whose attention is the product. Today's feeds are structurally the latter, relating to people with what one scholar calls "formal indifference." User-first design is simply the inversion: make the person's flourishing the objective, even though it's harder to measure.`,
    },
    {
      // TODO(icon): a person standing behind a number that the system "sees" instead
      icon: ICONS.slidePlaceholder,
      title: 'Why a surrogate is indifference',
      body: `This isn't name-calling — it's structural. Because a platform "rarely obtains the ground truth of user satisfaction," it optimizes a surrogate it can measure, and a surrogate-optimizing system is by construction indifferent to the un-measured person behind the proxy. The indifference is built into the math, not the malice. Which is also why the fix is mathematical: change what's measured and optimized.`,
    },
    {
      // TODO(icon): a blueprint with a heart drawn into it / scaffolding around values
      icon: ICONS.slidePlaceholder,
      title: 'Ethics is a method, not a PR layer',
      body: `The industry's failure mode is to ship for engagement and react to harm afterward — Meta launched a feature despite its own data showing it "didn't move overall well-being," because it "could make them look good." The alternative, Value-Sensitive Design, bakes named human values into the objective and architecture from the start, through a conceptual → empirical → technical loop. Ethics-as-PR is the disease; ethics-as-method is the cure.`,
    },
    {
      // TODO(icon): a spotlight finding a figure standing outside the frame
      icon: ICONS.slidePlaceholder,
      title: 'Center the people the objective never sees',
      body: `Value-Sensitive Design's sharpest demand: model the indirect stakeholders, not just the engaged user. Engagement optimization represents only the person clicking — never the depressed teen funneled self-harm content, never the ~87 million non-consenting Facebook friends. The corpus's worst harms fall on exactly the people the objective doesn't even include in its math.`,
    },
    {
      // TODO(icon): a compass whose needle wavers / a target that breathes
      icon: ICONS.slidePlaceholder,
      title: 'Aim at well-being — but humbly',
      body: `Platforms have already changed objectives — YouTube added "user satisfaction" surveys; Facebook reweighted toward "meaningful social interactions," deliberately cutting roughly 50 million hours of use a day. But well-being is "a theoretical construct, not an observable property," and a naive proxy just becomes the next thing gamed — that same reweighting later amplified divisive content. The commitment isn't a slogan; it's a disciplined, participatory, transparent process.`,
    },
    {
      // TODO(icon): a balance scale tipping decisively to one side
      icon: ICONS.slidePlaceholder,
      title: 'The argument that makes change obligatory',
      body: `Here is the premise that turns "nice to have" into "must": the addictive mechanisms are not necessary to provide the communicative benefits. If you can strip out the slot-machine mechanics without destroying connection and information, then those mechanics are gratuitous harm — and gratuitous harm to the vulnerable is impermissible. This dissolves the "but people love it" defense: keep the benefits, drop the exploitation.`,
    },
    {
      // TODO(icon): a small set of pillars / a tidy checklist
      icon: ICONS.slidePlaceholder,
      title: 'The principles, in one breath',
      body: `A user-first philosophy, distilled: the user is the end; the vulnerable are centered rather than the median engaged user; real autonomy and honest defaults replace dark patterns; ranking is transparent enough to inspect and contest; well-being is measured, but humbly; and the burden of proof sits with the designer, not the user. These are the standards our own algorithm is built to meet — and the next section shows exactly how.`,
    },
  ],
};
