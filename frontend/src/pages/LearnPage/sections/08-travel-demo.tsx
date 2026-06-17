/**
 * @fileoverview Learn section 08 — The Travel Page: A User-Centered Algorithm in
 * Miniature. The demo chapter. Completing it (viewing every slide) is what unlocks
 * the Travel tab in the header and the Dashboard, so it is a tracked, completable
 * section. The copy is still a placeholder until the full demo is written against
 * the finished Travel page — see ../plan/08-travel-demo-DEFERRED.md.
 */
import { ICONS } from '../../../icons';
import type { LearnSection } from '../types';

export const travelDemo: LearnSection = {
  id: 'travel-demo',
  number: '08',
  title: 'A User-Centered Algorithm in Miniature',
  subtitle: 'Everything above, running — on the Travel page.',
  slides: [
    {
      // TODO(icon): a play button / a small live gear (finalize after Travel ships)
      icon: ICONS.slidePlaceholder,
      title: 'Coming soon',
      body: `This final section will show the project's thesis actually running: the Travel page is a working, minimal instance of the user-first stack — explicit feedback, neutral seeding, transparent scores, minimal data, and no inference. It is written last, against the finished Travel page, so its description is true rather than guessed. For now, head to the Travel page to try it.`,
    },
  ],
};
