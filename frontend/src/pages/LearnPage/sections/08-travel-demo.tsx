/**
 * @fileoverview Learn section 08 — The Travel Page: A User-Centered Algorithm in
 * Miniature. DEFERRED until the Travel page is built so the copy is true to the
 * real algorithm. See ../plan/08-travel-demo-DEFERRED.md. Renders a "coming soon"
 * card and is excluded from progress tracking while `deferred` is true.
 */
import { ICONS } from '../../../components/LordIcon/LordIcon';
import type { LearnSection } from '../types';

export const travelDemo: LearnSection = {
  id: 'travel-demo',
  number: '08',
  title: 'A User-Centered Algorithm in Miniature',
  subtitle: 'Everything above, running — on the Travel page.',
  deferred: true,
  slides: [
    {
      // TODO(icon): a play button / a small live gear (finalize after Travel ships)
      icon: ICONS.slidePlaceholder,
      title: 'Coming soon',
      body: `This final section will show the project's thesis actually running: the Travel page is a working, minimal instance of the user-first stack — explicit feedback, neutral seeding, transparent scores, minimal data, and no inference. It is written last, against the finished Travel page, so its description is true rather than guessed. For now, head to the Travel page to try it.`,
    },
  ],
};
