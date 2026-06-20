/**
 * @fileoverview Learn section 05 — The Law's Blind Spot: Inference & the HIPAA Gap.
 * Copy: ../plan/05-the-law-and-inference.md (Synthesis 04). Placeholder icons.
 */
import { ICONS } from '../../../icons';
import type { LearnSection } from '../types';

export const theLawAndInference: LearnSection = {
  id: 'the-law-and-inference',
  number: '05',
  title: "The Law's Blind Spot",
  subtitle: 'HIPAA protects the holder, not the fact.',
  slides: [
    {
      // TODO(icon): a gavel with a visible gap beneath it / an open padlock
      icon: ICONS.slidePlaceholder,
      title: 'A platform can diagnose you — legally',
      body: `Recall the capability: a platform can hold what is, functionally, a psychiatric assessment of you — derived from your posts, with no clinician, no consent form, and no diagnosis code. So if a model effectively detects your depression, is that protected health information? It feels like it should be — but under U.S. law the answer turns on a surprising question.`,
    },
    {
      // TODO(icon): a hospital building vs. a smartphone, a line between them
      icon: ICONS.slidePlaceholder,
      title: 'HIPAA protects the holder, not the fact',
      body: `HIPAA binds only "covered entities" — your doctor, your insurer, and their business partners — not the apps and platforms inferring things about you. So the identical fact, "this person has depression," is rigorously protected in your clinician's records and entirely unprotected when a social platform infers it from your posts. Same fact, same sensitivity, opposite legal status — determined solely by the holder.`,
    },
    {
      // TODO(icon): a tiny pixel/beacon sending an arrow off a webpage
      icon: ICONS.slidePlaceholder,
      title: 'The leak, in action: tracking pixels',
      body: `This isn't hypothetical plumbing. A "tracking pixel" — a snippet a website embeds to report your actions to a third party — is how ostensibly neutral web behavior turns into health data somewhere else. The Markup found the Meta Pixel on 33 of the top 100 U.S. hospitals' sites, quietly sending Facebook the condition, doctor, and appointment a visitor selected — and, on some patient portals, medications and answers about sexuality. The hospital thought it shipped analytics; an ad platform received a de-facto medical record. HIPAA reaches neither in the way you'd expect.`,
    },
    {
      // TODO(icon): a document stamped "health" carrying its own shield
      icon: ICONS.slidePlaceholder,
      title: 'Could the line be the data itself?',
      body: `One candidate: protect health information because of what it is, regardless of who holds it. The U.S. doesn't do this — but Europe does. GDPR protects "data concerning health" by its nature, and the EU's Digital Services Act bans using such special-category data for ad targeting. So a data-based line is coherent and already exists; America simply hasn't drawn it.`,
    },
    {
      // TODO(icon): a magnifying glass over scattered dots / an "everything is inferable" cloud
      icon: ICONS.slidePlaceholder,
      title: 'Could the line be the possibility of inference?',
      body: `Another candidate: trigger protection the moment a health state could be inferred. But this collapses as a sole rule — almost everything is now inferable from behavior, so attaching protection to mere inferability would either sweep in all data or break under its own breadth. Possibility names the danger, but it can't, alone, be the legal line.`,
    },
    {
      // TODO(icon): three nested boundary lines / a layered shield
      icon: ICONS.slidePlaceholder,
      title: 'The fix: three coordinated lines',
      body: `The honest answer is to replace HIPAA's single misplaced line with three. Treat inferred health data as health data (the floor); forbid specific harmful uses like health-targeted ads or eligibility decisions (the wrong); and let the mere possibility of inference trigger duties such as disclosure, consent, and security (the duty). The data defines the floor, the use defines the wrong, the possibility defines the duty.`,
    },
    {
      // TODO(icon): a globe with boundary lines already drawn on it
      icon: ICONS.slidePlaceholder,
      title: 'Abroad, the lines already exist',
      body: `None of this is utopian — other countries already draw these lines. On the use side: the United States and New Zealand are the only two developed nations that even permit direct-to-consumer prescription-drug advertising; most of the world bans it outright, so the antidepressant ad at the end of this pipeline would itself be unlawful. On the data side: Europe's GDPR protects "data concerning health" by its nature regardless of who holds it, and makes the data's controller accountable — selling it on doesn't wash your hands. America simply hasn't chosen to draw either line.`,
    },
    {
      // TODO(icon): an arrow nudging a boundary post / scales re-balancing
      icon: ICONS.slidePlaceholder,
      title: 'Enforcement is already migrating',
      body: `Because HIPAA can't reach these holders, regulators have improvised toward the use line: the FTC fined BetterHelp $7.8 million for disclosing mental-health intake data to ad platforms, and penalized GoodRx for sharing health data with Facebook and Google. The toothless alternative is instructive — Cambridge Analytica's £500,000 cap changed nothing. The center of gravity is shifting from who holds it to what is done with it, backed by penalties large enough to matter.`,
    },
  ],
};
