/**
 * @fileoverview The ordered list of Learn-page teaching sections.
 *
 * Content is authored in `src/pages/LearnPage/plan/*.md` and transcribed into the
 * per-section modules here. The page renders each section as a pinned
 * horizontal-scroll deck. Section 08 (Travel demo) is deferred until the Travel
 * page is built.
 */
import type { LearnSection } from '../types';
import { orientation } from './00-orientation';
import { howRecommendersWork } from './01-how-recommenders-work';
import { dataAndInference } from './02-data-and-inference';
import { theHumanCost } from './03-the-human-cost';
import { whyItHappens } from './04-why-it-happens';
import { theLawAndInference } from './05-the-law-and-inference';
import { whatUserFirstMeans } from './06-what-user-first-means';
import { buildingItBetter } from './07-building-it-better';
import { travelDemo } from './08-travel-demo';

export const LEARN_SECTIONS: LearnSection[] = [
  orientation,
  howRecommendersWork,
  dataAndInference,
  theHumanCost,
  whyItHappens,
  theLawAndInference,
  whatUserFirstMeans,
  buildingItBetter,
  travelDemo,
];
