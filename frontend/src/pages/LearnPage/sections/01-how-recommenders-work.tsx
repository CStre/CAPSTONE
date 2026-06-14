/**
 * @fileoverview Learn section 01 — How Recommendation Algorithms Actually Work.
 * Copy: ../plan/01-how-recommenders-work.md (Synthesis 01). Placeholder icons;
 * TODO(icon) comments record the intended icon per slide.
 */
import { ICONS } from '../../../components/LordIcon/LordIcon';
import type { LearnSection } from '../types';

export const howRecommendersWork: LearnSection = {
  id: 'how-recommenders-work',
  number: '01',
  title: 'How Recommendation Algorithms Actually Work',
  subtitle: 'The machine is neutral; the objective is the choice.',
  slides: [
    {
      // TODO(icon): two small vectors / a dot-product symbol; or a "match %" meter
      icon: ICONS.slidePlaceholder,
      title: 'A recommender is just a scoring function',
      body: `Underneath the branding, every recommender does one simple thing: it represents you and each item as a list of numbers, scores how well they match, and shows you the highest-scoring few. Netflix-era "matrix factorization" made this literal — a recommendation is the dot product of a learned user-vector and an item-vector, in a shared space of 20–100 hidden "factors." It needs no understanding of the content at all; it learns the vectors from patterns alone.`,
    },
    {
      // TODO(icon): a branching tree from one root / a timeline of three nodes
      icon: ICONS.slidePlaceholder,
      title: 'One lineage: CF → deep learning → RL',
      body: `Collaborative filtering, deep neural networks, and reinforcement learning are not different species — they're one lineage. YouTube describes its deep model as "a non-linear generalization of factorization techniques": it still learns user and item embeddings and serves recommendations as a nearest-neighbor lookup in dot-product space. Deep learning didn't change the shape of the machine, only how expressively it learns the vectors.`,
    },
    {
      // TODO(icon): a trail of footprints / a cursor leaving a dotted path
      icon: ICONS.slidePlaceholder,
      title: 'It learns from your behavior, not your opinions',
      body: `These systems are trained mostly on implicit signals — clicks, watch time, scrolls, even mouse movements — not the ratings you consciously give. Behavior is used because there is "orders of magnitude" more of it, and it can be gathered "regardless of the user's willingness to provide explicit ratings." The feed you see is assembled from a trail you didn't know you were leaving.`,
    },
    {
      // TODO(icon): a click flowing into a grid of numbers / a table cell lighting up
      icon: ICONS.slidePlaceholder,
      title: 'How your behavior physically becomes the model',
      body: `"It learns from you" is concrete, not metaphorical. In production systems every action you take indexes a row in an embedding table that gradient descent rewrites on each interaction; other models add cross-features that memorize co-occurrences ("installed A and viewing B"); online "bandit" systems inject each click as an immediate reward that updates the serving policy. Every interaction updates an embedding, a weight, or a policy — continuously, against an engagement label.`,
    },
    {
      // TODO(icon): a wide funnel narrowing to a few items
      icon: ICONS.slidePlaceholder,
      title: 'The two-stage funnel',
      body: `At scale, recommendation is a funnel. A cheap "candidate generation" stage narrows millions of items down to a few hundred, then a heavier "ranking" model orders those hundreds precisely. This two-stage structure is industry-standard — and it means the system is always running a tournament to decide what wins your next moment of attention.`,
    },
    {
      // TODO(icon): a target where the real bullseye is faint and the arrow hits a nearby ring
      icon: ICONS.slidePlaceholder,
      title: "The catch: it optimizes a stand-in it can't measure",
      body: `A platform can't directly measure whether you're happy, so it optimizes something it can count instead. YouTube calls this the "surrogate problem" and openly admits it "rarely obtains the ground truth of user satisfaction." The paper even warns that the choice of surrogate "has an outsized importance" — a quiet acknowledgement that the proxy is where everything can go wrong.`,
    },
    {
      // TODO(icon): a meter climbing through three notches / an escalator
      icon: ICONS.slidePlaceholder,
      title: 'The surrogate keeps escalating',
      body: `The proxy has a telling history. Ranking by raw clicks "often promotes deceptive videos … ('clickbait')," so YouTube switched to watch time; the frontier then moved to long-term "stickiness" — multi-step retention modeled with reinforcement learning, "far beyond classical instant metrics." Each step makes the system better at keeping you — and, turned on a vulnerable user, better at not letting you leave.`,
    },
    {
      // TODO(icon): two arrows diverging from a common origin (proxy vs. welfare)
      icon: ICONS.slidePlaceholder,
      title: 'Why this produces harm by construction',
      body: `When the measurable proxy (watch time) and the real goal (your well-being) pull apart, the system faithfully optimizes the proxy — straight through the harm. Ranking is also comparative: to lift one post is to bury another, so an engagement feed keeps discovering what holds you specifically. An audit found one feed serving eating-disorder content within ~2.6 minutes and giving "vulnerable" accounts 12× more self-harm recommendations.`,
    },
    {
      // TODO(icon): a circular arrow tightening into a spiral
      icon: ICONS.slidePlaceholder,
      title: 'Feedback loops compound it',
      body: `It gets worse over time, because models retrain on the behavior their own past recommendations shaped — confounded data. Simulations show this loop "homogenizes user behavior without increasing utility," and theory shows a user's interests can "degenerate" into echo chambers, with the recommender able only to "slow down or accelerate" the narrowing. Researchers later watched it happen live — recommended misogynistic content on TikTok climbing from 13% to 56% in five days.`,
    },
    {
      // TODO(icon): a single tool that can build or break / a fork in a path
      icon: ICONS.slidePlaceholder,
      title: 'The hopeful twist: the math is neutral',
      body: `If harm flows from the objective and not the math, then the same math can serve a better objective. X's Community Notes runs the exact matrix-factorization technique — but instead of predicting what you'll engage with, it elevates notes that people who usually disagree both rate helpful. The technique is neutral; the objective and the data practices are the ethics.`,
    },
  ],
};
