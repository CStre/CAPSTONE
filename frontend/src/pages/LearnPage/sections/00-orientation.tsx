/**
 * @fileoverview Learn section 00 — Orientation: What This Project Is.
 * Copy: ../plan/00-orientation.md.
 */
import { ICONS } from '../../../components/LordIcon/LordIcon';
import type { LearnSection } from '../types';

export const orientation: LearnSection = {
  id: 'orientation',
  number: '00',
  title: 'What This Project Is',
  subtitle: 'The question this site exists to answer.',
  slides: [
    {
      icon: ICONS.learn00Question,
      inState: 'in-oscillate',
      hoverState: 'hover-wiggle',
      title: "Why you're here",
      body: `Almost everything you watch, buy, or scroll is chosen for you by a recommendation algorithm. This site exists to explain how those systems actually work, where they quietly cause harm, and — most importantly — how the same technology can be rebuilt to genuinely serve you. Think of it as a short, honest course, ending in a working example you can try yourself.`,
    },
    {
      icon: ICONS.learn00Gift,
      title: 'They are genuinely useful',
      body: `Recommendation algorithms are not villains — at their best they are remarkably helpful. They surface products you'll actually want, curate music and film to your taste, and can even personalize wellness and care. Holding that benefit honestly is the only fair starting point for criticizing their costs.`,
    },
    {
      icon: ICONS.learn00Crowdfunding,
      title: 'The distinction that changes everything',
      body: `Most people assume these systems are built for them. But there is a crucial difference between being user-focused and user-centered: many algorithms are tuned to their makers' interests — time-on-app, ad revenue — while feeling like they serve you. That gap between how a system feels and what it optimizes is the subject of this entire course.`,
    },
    {
      icon: ICONS.learn00Hourglass,
      title: 'Why this is worth your attention',
      body: `This isn't an abstract concern — these systems mediate hours of nearly everyone's day, and the same machinery that recommends a movie can infer your mental-health state or quietly narrow what you ever see. Authoritative bodies from the U.S. Surgeon General to the American Academy of Pediatrics have issued formal advisories about that design. The stakes are real, which is exactly why it's worth understanding how the machine actually works.`,
    },
    {
      icon: ICONS.learn00Books,
      hoverState: 'hover-hit',
      title: 'Explainer and proof',
      body: `This project does two things at once. It teaches what a user-centered algorithm is and how one is built — and then it shows you, with a real, transparent preference algorithm you can interact with on the Travel page. No algorithm is flawless, but ours is designed from the ground up to put you first, and to let you watch it learn.`,
    },
  ],
};
