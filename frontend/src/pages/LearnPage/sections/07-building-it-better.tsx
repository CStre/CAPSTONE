/**
 * @fileoverview Learn section 07 — Building It Better: The Engineering Playbook.
 * Copy: ../plan/07-building-it-better.md (Synthesis 06 + 08). Placeholder icons.
 */
import { ICONS } from '../../../components/LordIcon/LordIcon';
import type { LearnSection } from '../types';

export const buildingItBetter: LearnSection = {
  id: 'building-it-better',
  number: '07',
  title: 'Building It Better',
  subtitle: 'A stack of levers, each already working or mandated.',
  slides: [
    {
      // TODO(icon): a dial/knob being turned from "engagement" to "welfare"
      icon: ICONS.slidePlaceholder,
      title: 'Lever 1: change the objective',
      body: `The single highest-leverage fix is to stop maximizing engagement. Instead of maximizing engagement, solve a constrained problem — roughly relevance minus harm-risk minus over-use plus diversity — so welfare terms enter the ranking score directly, not as an afterthought. The reward is the ethics: same machinery, different target.`,
    },
    {
      // TODO(icon): two opposing arrows meeting at a shared point / a bridge
      icon: ICONS.slidePlaceholder,
      title: 'Lever 1b: reward agreement across difference',
      body: `One concrete welfare objective already runs at scale. X's Community Notes uses bridging matrix factorization — the exact technique behind ordinary recommenders — to elevate content rated helpful by people who usually disagree, directly countering the outrage the engagement objective selects for. Same linear algebra, pro-social target: the clearest proof that the technique is neutral.`,
    },
    {
      // TODO(icon): a closed loop with a clean cut in it
      icon: ICONS.slidePlaceholder,
      title: 'Lever 2: break the feedback loop',
      body: `Models retrain on logs their own past recommendations shaped, which homogenizes users "without increasing utility." Counter it with off-policy correction — re-weight each logged interaction by one over its probability of being shown (inverse propensity scoring) so the model learns true preference rather than its own echo. This directly attacks the confounding that biases naive training.`,
    },
    {
      // TODO(icon): a collapsing fan being pushed back open / an entropy gauge
      icon: ICONS.slidePlaceholder,
      title: 'Lever 2b: actively fight narrowing',
      body: `Exploration alone isn't enough — even random exploration can degenerate a user's interests into an echo chamber. So monitor the narrowing: track the entropy of what a user is shown over time, and when it collapses, inject breadth and cap the reinforcement of any single attractor. The system "can only slow down or accelerate" degeneration — so make it actively slow it.`,
    },
    {
      // TODO(icon): a small lock / a shrinking data footprint
      icon: ICONS.slidePlaceholder,
      title: 'Lever 3: minimize the data',
      body: `Train on-device and share only aggregated model updates (federated learning, bounded by differential privacy), so personalization needs no central behavioral hoard. Never derive sensitive traits for ranking or ads; if you derive them for safety, wall them off from monetization. Offer a genuine non-profiling mode — and prefer protective defaults, because defaults dominate options.`,
    },
    {
      // TODO(icon): a pause/stop symbol / a calm "you're caught up" checkmark
      icon: ICONS.slidePlaceholder,
      title: 'Lever 4: remove the slot machine',
      body: `The user is a reward-maximizing agent on evolved circuitry, and variable-ratio reward is the compulsion engine — so de-randomize the schedule. Batch notifications on a schedule, drop autoplay and infinite-scroll defaults, and add natural stopping cues like "you're caught up." The addictive mechanics are not necessary for the benefits, so they can go.`,
    },
    {
      // TODO(icon): a shield over a young figure / a guardrail
      icon: ICONS.slidePlaceholder,
      title: 'Lever 4b: safety and developmental defaults',
      body: `Because harm is concentrated, protection should be too. Use high-recall classifiers to down-rank and rate-limit self-harm, pro-eating-disorder, and crisis content, with circuit-breakers that interrupt the narrowing funnel. For minors, default to no engagement-max feed, profiling off, and conservative time and notification limits — sized to the heightened adolescent reward sensitivity.`,
    },
    {
      // TODO(icon): a ruler/scale with a small heart on it
      icon: ICONS.slidePlaceholder,
      title: 'Lever 5: measure welfare honestly',
      body: `Stop trusting offline accuracy computed on confounded logs — it's biased toward the algorithm that produced them; use counterfactual evaluation instead. Instrument real well-being endpoints — experience sampling, regret, "time well spent" versus time spent — and hold welfare outside the optimizer as a guardrail, so it can't be gamed. A metric you maximize gets gamed; a guardrail you respect does not.`,
    },
    {
      // TODO(icon): an open panel with visible dials / a magnifying glass with a checkmark
      icon: ICONS.slidePlaceholder,
      title: 'Lever 6: transparency, audits, governance',
      body: `Bake accountability in rather than bolting it on. Expose the main ranking parameters "in plain and intelligible language" with real controls (as the EU's DSA already requires), and open the system to independent researcher audits — large platform RCTs prove rigorous internal audits are possible. Run Value-Sensitive Design from the start, centering the indirect stakeholders the engagement objective never modeled.`,
    },
    {
      // TODO(icon): a keystone locking an arch / a signature
      icon: ICONS.slidePlaceholder,
      title: 'The throughline',
      body: `There is no silver bullet — only a stack of levers, and every one is grounded in something already working or already mandated, not speculation. Across all of them, one lesson repeats: the technique is neutral; the objective, the data, and the loop are the ethics. The next section shows this stack, in miniature, actually running.`,
    },
  ],
};
