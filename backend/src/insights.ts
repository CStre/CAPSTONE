/**
 * @fileoverview Human-readable interpretation of a taste vector — Algorithm A's
 * "Inferred about you" panel and the driver-aware "Why this card?" reveal.
 *
 * `inferTraits` deliberately *over-reaches* (the surveillance demo) — so every trait
 * is flagged with {@link INFERENCE_DISCLAIMER} and the rules stay on aesthetic /
 * activity preferences, never protected or health categories (the depression /
 * orientation inferences in the research are cited as the *warning*, never output as
 * if true). See TravelPage/plan/DEVELOPMENT-PLAN.md §1b/§2c.
 *
 * `reasonForCard` is truthful by construction: it reads the same taste/feature data
 * the recommender used. B shows its work; A gives the platitude a real platform would
 * (Layer 1) plus the hidden truth it would never reveal (Layer 2).
 *
 * Pure and deterministic.
 */
import { FEATURE_KEYS, type FeatureKey, type FeatureVector } from './features';
import { normalize } from './scoring';
import type { Driver } from './recommender';

export const INFERENCE_DISCLAIMER =
  'Illustrative of what engagement systems attempt — not a real diagnosis.';

/** Nicer labels for a few axes; everything else falls back to a humanized key. */
const LABELS: Partial<Record<FeatureKey, string>> = {
  // Terrain / water — readable names for the compound/awkward keys.
  glacierTerrain: 'glaciers',
  rockFormation: 'rock formations',
  seaWater: 'open sea',
  harborWater: 'harbors',
  hotSpring: 'hot springs',
  reflectionWater: 'still reflections',
  tideSurf: 'surf and waves',
  islandTerrain: 'islands',
  cropField: 'farmland',
  tundraVeg: 'tundra',
  remoteness: 'remote, untouched places',
  beach: 'coastlines',
  mountain: 'mountains',
  city: 'cities',
  heritage: 'historic places',
  // Architecture / built
  modernArch: 'modern architecture',
  minimalistArch: 'minimalist architecture',
  traditionalArch: 'traditional architecture',
  // Light / atmosphere
  goldenHour: 'golden-hour light',
  blueHour: 'blue-hour light',
  silhouetteLight: 'silhouettes',
  clearSky: 'clear skies',
  // Activity / mood
  streetFood: 'street food',
  vibrantMood: 'vibrant scenes',
  leadingLines: 'leading lines',
  winterSeason: 'winter',
  // Colour
  warmPalette: 'warm tones',
  coolPalette: 'cool tones',
  neutralPalette: 'neutral tones',
  darkTone: 'dark tones',
  brightTone: 'bright tones',
  mutedTone: 'muted tones',
  vividTone: 'vivid colour',
  monochrome: 'monochrome',
  redHue: 'reds',
  orangeHue: 'oranges',
  yellowHue: 'yellows',
  greenHue: 'greens',
  tealHue: 'teals',
  blueHue: 'blues',
  purpleHue: 'purples',
};

/** "warmPalette" → "warm palette", "goldenHour" → "golden hour". */
function humanize(key: FeatureKey): string {
  return (
    LABELS[key] ??
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .toLowerCase()
  );
}

const indexOf = (key: FeatureKey): number => FEATURE_KEYS.indexOf(key);

export interface RankedFeature {
  key: FeatureKey;
  value: number;
}

/** The strongest positive axes of a taste vector, highest first. */
export function topFeatures(taste: FeatureVector, n = 3): RankedFeature[] {
  return FEATURE_KEYS.map((key, i) => ({ key, value: taste[i] ?? 0 }))
    .filter((f) => f.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

// ── Inferred traits (illustrative over-reach) ───────────────────────────────

export interface InferredTrait {
  trait: string;
  basis: string;
  /** 0–1 — how strongly the taste leans this way. */
  confidence: number;
}

interface BehaviorMetrics {
  avgDwellMs?: number;
  skipRate?: number;
}

interface TraitRule {
  axes: FeatureKey[];
  trait: string;
}

// Rules collectively span the whole taxonomy — Algorithm A leaves no axis unused.
export const TRAIT_RULES: TraitRule[] = [
  // Landscape preference
  {
    axes: ['mountain', 'hills', 'cliff', 'ridge', 'plateau', 'volcano'],
    trait: 'Drawn to mountains and high places',
  },
  {
    axes: ['arid', 'dune', 'mesa', 'canyon', 'cactus', 'cave', 'crater', 'rockFormation'],
    trait: 'Drawn to stark, geological landscapes',
  },
  {
    axes: ['beach', 'ocean', 'seaWater', 'bay', 'islandTerrain', 'tideSurf', 'cape', 'sand'],
    trait: 'Coastal and water-loving',
  },
  {
    axes: [
      'lake',
      'river',
      'waterfall',
      'pond',
      'reflectionWater',
      'rapids',
      'hotSpring',
      'wetland',
    ],
    trait: 'Drawn to lakes, rivers and waterfalls',
  },
  {
    axes: ['forest', 'rainforest', 'conifer', 'deciduous', 'bamboo', 'moss', 'lush', 'greenHue'],
    trait: 'Forest- and woodland-oriented',
  },
  {
    axes: ['valley', 'meadow', 'cropField', 'vineyard', 'garden'],
    trait: 'Pastoral; loves gentle countryside',
  },
  {
    axes: ['snow', 'ice', 'polar', 'glacierTerrain', 'fjord', 'tundraVeg', 'winterSeason'],
    trait: 'Drawn to cold, frozen places',
  },
  {
    axes: ['tropical', 'palm', 'reef', 'humid', 'marineLife'],
    trait: 'Tropical, warm-climate seeker',
  },
  // Built environment
  {
    axes: [
      'city',
      'skyline',
      'street',
      'plaza',
      'building',
      'neon',
      'graffiti',
      'cafe',
      'tunnel',
      'railway',
      'road',
    ],
    trait: 'City-oriented and urban',
  },
  {
    axes: [
      'heritage',
      'ruins',
      'castle',
      'palace',
      'church',
      'mosque',
      'temple',
      'monument',
      'classical',
      'medieval',
      'gothic',
      'baroque',
      'colonial',
      'traditionalArch',
      'indigenous',
      'religious',
    ],
    trait: 'Drawn to history and heritage',
  },
  {
    axes: [
      'modernArch',
      'minimalistArch',
      'brutalist',
      'bridge',
      'tower',
      'rooftop',
      'artDeco',
      'stairs',
    ],
    trait: 'Appreciates modern architecture and design',
  },
  {
    axes: ['village', 'windmill', 'lighthouse', 'port', 'harborWater'],
    trait: 'Drawn to quaint villages and rural life',
  },
  // Light, colour, weather, mood
  {
    axes: ['goldenHour', 'sunset', 'sunrise', 'warmPalette', 'orangeHue', 'redHue', 'yellowHue'],
    trait: 'Prefers warm, golden light',
  },
  {
    axes: [
      'coolPalette',
      'blueHour',
      'moody',
      'darkTone',
      'blueHue',
      'tealHue',
      'purpleHue',
      'silhouetteLight',
    ],
    trait: 'Prefers cool, moody scenes',
  },
  { axes: ['night', 'stars', 'aurora', 'moonlight'], trait: 'Fascinated by night skies' },
  {
    axes: ['daylight', 'clearSky', 'brightTone', 'vividTone', 'vibrantMood', 'midday', 'rainbow'],
    trait: 'Likes bright, vivid, sunny imagery',
  },
  {
    axes: ['fog', 'overcast', 'cloudy', 'storm', 'rain', 'wind', 'dramatic'],
    trait: 'Drawn to moody, atmospheric weather',
  },
  // Activity & social
  {
    axes: [
      'hiking',
      'climbing',
      'skiing',
      'watersport',
      'swimming',
      'camping',
      'cycling',
      'roadTrip',
      'adventure',
    ],
    trait: 'Adventurous and active',
  },
  { axes: ['relaxation', 'garden', 'beach', 'summer'], trait: 'Leisure- and comfort-seeking' },
  {
    axes: ['streetFood', 'market', 'festival', 'local', 'cafe', 'tourist'],
    trait: 'Culture- and food-curious traveler',
  },
  { axes: ['wildlife', 'birds', 'marineLife', 'reef'], trait: 'Wildlife and nature enthusiast' },
  {
    axes: ['remoteness', 'solitude', 'barren', 'serene', 'pristine', 'rugged'],
    trait: 'Values solitude — possibly introverted',
  },
  {
    axes: ['people', 'crowd', 'nightlife', 'festival', 'market'],
    trait: 'Sociable, draws toward people',
  },
  // Aesthetic / composition / season
  {
    axes: ['minimalistArch', 'symmetry', 'monochrome', 'mutedTone', 'neutralPalette'],
    trait: 'Minimalist aesthetic',
  },
  {
    axes: ['vast', 'dramatic', 'panorama', 'aerial', 'horizon'],
    trait: 'Drawn to grand, sweeping vistas',
  },
  {
    axes: ['closeup', 'intimate', 'longExposure', 'leadingLines'],
    trait: 'Notices intimate detail and craft',
  },
  { axes: ['spring', 'flowers', 'garden'], trait: 'Drawn to spring blooms and gardens' },
  { axes: ['autumn'], trait: 'Autumn-season affinity' },
];

const TRAIT_THRESHOLD = 0.2;

/**
 * Infer illustrative personality/aesthetic traits from a taste vector (+ optional
 * behavioral metrics). Each carries a basis and a confidence; see
 * {@link INFERENCE_DISCLAIMER}.
 */
export function inferTraits(taste: FeatureVector, metrics?: BehaviorMetrics): InferredTrait[] {
  const unit = normalize(taste);
  const out: InferredTrait[] = [];

  for (const rule of TRAIT_RULES) {
    const present = rule.axes.filter((a) => (unit[indexOf(a)] ?? 0) > 0);
    const strength = present.reduce((s, a) => s + (unit[indexOf(a)] ?? 0), 0);
    const confidence = Math.min(0.95, strength * 1.5);
    if (confidence >= TRAIT_THRESHOLD) {
      out.push({
        trait: rule.trait,
        basis: `you favor ${present.map(humanize).join(', ')}`,
        confidence,
      });
    }
  }

  if (metrics?.avgDwellMs !== undefined) {
    if (metrics.avgDwellMs > 3000) {
      out.push({
        trait: 'Deliberative decision-maker',
        basis: 'you study images before deciding',
        confidence: 0.6,
      });
    } else if (metrics.avgDwellMs < 1200) {
      out.push({
        trait: 'Quick, decisive',
        basis: 'you decide in a glance',
        confidence: 0.6,
      });
    }
  }

  return out.sort((a, b) => b.confidence - a.confidence);
}

// ── "Why this card?" ────────────────────────────────────────────────────────

const A_PLATITUDES = ['Picked for you ✨', 'Because you liked similar', 'Recommended for you'];

export interface ReasonInput {
  driver: Driver;
  imageFeatures: FeatureVector;
  taste: FeatureVector;
  /** A only: current confidence (0–1) for Layer 2. */
  confidence?: number;
  /** A only: rotates the Layer 1 platitude. */
  variant?: number;
}

export type CardReason =
  | { driver: 'B'; reason: string; matchedAxes: string[] }
  | { driver: 'A'; layer1: string; layer2: string };

/**
 * Explain why a card was shown.
 *
 * - **B** — the legible, honest reason: the axes the image shares with your top
 *   taste ("warm tones + coastlines"). The caller reveals the country after.
 * - **A** — Layer 1 is the platitude a real platform shows; Layer 2 is the hidden
 *   truth (the real axes that drove the pick, confidence, and the inferred traits).
 */
export function reasonForCard(input: ReasonInput): CardReason {
  if (input.driver === 'B') {
    const matchedAxes = FEATURE_KEYS.map((key, i) => ({
      key,
      img: input.imageFeatures[i] ?? 0,
      t: input.taste[i] ?? 0,
    }))
      .filter((f) => f.img > 0 && f.t > 0)
      .sort((a, b) => b.t - a.t)
      .slice(0, 3)
      .map((f) => humanize(f.key));
    const reason = matchedAxes.length
      ? `Matches your taste for ${matchedAxes.join(' + ')}`
      : 'Something new for you to explore';
    return { driver: 'B', reason, matchedAxes };
  }

  const layer1 = A_PLATITUDES[(input.variant ?? 0) % A_PLATITUDES.length] ?? 'Picked for you ✨';
  const tops = topFeatures(input.taste, 3).map((f) => humanize(f.key));
  const conf = Math.round((input.confidence ?? 0) * 100);
  let layer2 = tops.length
    ? `Because you engaged with ${tops.join(', ')} (${conf}% confident).`
    : `Building your profile (${conf}% confident).`;
  const traits = inferTraits(input.taste)
    .slice(0, 2)
    .map((t) => t.trait);
  if (traits.length) layer2 += ` Also inferred: ${traits.join('; ')}.`;
  return { driver: 'A', layer1, layer2 };
}
