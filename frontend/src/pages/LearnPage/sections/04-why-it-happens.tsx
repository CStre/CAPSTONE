/**
 * @fileoverview Learn section 04 — Why It Happens: The Mechanism Chain.
 * Copy: ../plan/04-why-it-happens.md (Synthesis 07). Placeholder icons.
 */
import { ICONS } from '../../../components/LordIcon/LordIcon';
import type { LearnSection } from '../types';

export const whyItHappens: LearnSection = {
  id: 'why-it-happens',
  number: '04',
  title: 'Why It Happens',
  subtitle: 'A traceable mechanism, not a mystery.',
  slides: [
    {
      // TODO(icon): a connected chain / a clean left-to-right flow diagram
      icon: ICONS.slidePlaceholder,
      title: 'The harm is a mechanism, not a mystery',
      body: `The link from algorithm to harm is often waved away as vague or merely correlational. It isn't. It's a traceable chain — data injection, an engagement proxy, feedback loops, harmful selection, reward circuitry, and measured decline — where each link rests on peer-reviewed technical or clinical evidence. Naming the mechanism is what lets us interrupt it.`,
    },
    {
      // TODO(icon): a click flowing into a glowing table row
      icon: ICONS.slidePlaceholder,
      title: 'Link 1: your behavior is injected as data',
      body: `First, behavior physically enters the model: every action updates an embedding row, a memorized cross-feature, or an online reward signal — relentless and continuous. None of these mechanisms carry a term for whether the interaction was good for you; they carry only the label the platform optimizes. The injection is value-free, which is exactly the problem.`,
    },
    {
      // TODO(icon): a target labeled "clicks" standing in front of a faint "well-being"
      icon: ICONS.slidePlaceholder,
      title: 'Link 2: it optimizes a proxy, not welfare',
      body: `All of those injection mechanisms serve one target. DLRM predicts click-through; bandits maximize clicks; YouTube optimizes watch time then retention — none contains a term for the user's welfare. As YouTube concedes, it "rarely obtains the ground truth of user satisfaction," so it optimizes the measurable surrogate. This proxy–welfare gap is the origin of every downstream harm.`,
    },
    {
      // TODO(icon): a spiral tightening inward / a fan of options collapsing to one
      icon: ICONS.slidePlaceholder,
      title: 'Link 3: feedback loops narrow what you see',
      body: `Because the system retrains on behavior its own recommendations shaped, the data is confounded — and the loop "homogenizes user behavior without increasing utility," while a user's interests can "degenerate" into echo chambers. Once a vulnerable user drifts toward distressing content, the loop's natural tendency is to narrow them into it. This is the formal mechanism behind the funnel a coroner tied to a death.`,
    },
    {
      // TODO(icon): a sieve catching sharp/comparison content, passing calm content through
      icon: ICONS.slidePlaceholder,
      title: 'Link 4: the objective selects the harm',
      body: `An engagement-maximizing ranker promotes whatever maximizes engagement — and the evidence says that is often harmful by arithmetic. It surfaces outrage (out-group animosity, the strongest predictor of sharing), idealized appearance-content that drives comparison, and reward-bait. Optimizing engagement is, in practice, optimizing for the very content that hurts.`,
    },
    {
      // TODO(icon): a brain with a glowing reward center / a "like" lighting a neuron
      icon: ICONS.slidePlaceholder,
      title: 'Link 5a: it lands on evolved reward circuitry',
      body: `The selected content meets biology. fMRI shows social "likes" activate the brain's dopaminergic reward center (the nucleus accumbens), and the adolescent striatum is hypersensitive to it — which is why the harm concentrates in teens. Broader neuroscience maps how social media instruments three systems at once: reward, self-referential thinking, and "mentalizing" about others.`,
    },
    {
      // TODO(icon): two gears meshing / a feedback arrow between a phone and a brain
      icon: ICONS.slidePlaceholder,
      title: 'Link 5b: two coupled optimizers',
      body: `Here is the decisive insight. Across more than a million posts, people behave as reward-maximizing agents, spacing posts to maximize the rate of likes — researchers literally call it "a Skinner Box," confirmed when lowering the reward rate reduced posting. So the platform (a reward-maximizer over clicks) and the human (a reward-maximizer over social approval) become two coupled optimizers — and the algorithm effectively programs your reinforcement schedule. Compulsion is engineered, not chosen.`,
    },
    {
      // TODO(icon): a descending well-being line with a confidence band / a balanced scale
      icon: ICONS.slidePlaceholder,
      title: 'Link 6: measurable decline — with discipline',
      body: `The coupled loop expresses itself as compulsion, social comparison, and a corrosive climate — and these produce measurable harm: within-person mood decline with use, causal deterioration when Facebook arrived, improvement on deactivation, depression detectable in the exhaust itself. But state it with discipline: effects are modest on average and severe in the vulnerable tail, and amplification is selective, not blanket. The chain is real, mechanistic, and honestly bounded.`,
    },
  ],
};
