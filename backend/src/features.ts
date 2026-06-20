/**
 * @fileoverview The curated feature taxonomy — the abstract dimensions both
 * recommendation algorithms reason over.
 *
 * An image's Unsplash `tags` + dominant `color` are mapped to a fixed-length,
 * index-aligned **feature vector**. This is the shared substrate of the A/B demo:
 * preferences are inferred from these abstract features, never from the literal
 * country/location (see TravelPage/plan/DEVELOPMENT-PLAN.md §2c).
 *
 * The taxonomy is deliberately *broad and fine-grained* — Algorithm A's whole point
 * is to harvest as much abstract signal as possible from a single image. ~150
 * tag-derived axes (terrain, water, coast, vegetation/biome, climate, urban/built,
 * architectural style, light/time, weather, activity, mood, composition, season,
 * wildlife, heritage) plus ~15 colour-derived axes (warmth, tone, saturation, hue
 * family). Each axis is still individually *declared and legible*, so Algorithm B
 * can use a small subset and "show its work".
 *
 * Pure and deterministic — no I/O, table-driven. `extractFeatures` returns raw
 * nonnegative counts; normalization/cosine live with the scoring step.
 *
 * **Append-only.** Stored taste vectors and country signatures are index-aligned to
 * `FEATURE_KEYS` (= the key order of `TAG_KEYWORDS` then `COLOR_FEATURE_KEYS`). Add
 * new axes at the end; never reorder or remove.
 */

/**
 * Tag→feature keyword table. A feature is credited once per tag word that *starts
 * with* any of its keywords (prefix match) — so "mountains" matches "mountain" and
 * "coastal" matches "coast", while avoiding mid-word collisions ("alpine" does not
 * match "pine", "waterfall" does not match "fall"). Grouped by category for
 * readability; insertion order is the vector order, so only ever append.
 */
const TAG_KEYWORDS = {
  // ── Terrain / landform ────────────────────────────────────────────────
  mountain: ['mountain', 'peak', 'alps', 'alpine', 'summit', 'highland'],
  hills: ['hill', 'rolling', 'knoll'],
  cliff: ['cliff', 'crag', 'escarpment', 'precipice'],
  valley: ['valley', 'vale', 'dale', 'glen'],
  canyon: ['canyon', 'gorge', 'ravine'],
  plateau: ['plateau', 'tableland', 'highplain'],
  volcano: ['volcano', 'volcanic', 'caldera', 'lava'],
  glacierTerrain: ['glacier', 'glacial', 'icefield', 'crevasse'],
  fjord: ['fjord', 'fiord'],
  cave: ['cave', 'cavern', 'grotto'],
  dune: ['dune', 'erg'],
  mesa: ['mesa', 'butte', 'badlands'],
  ridge: ['ridge', 'crest', 'arete'],
  crater: ['crater', 'sinkhole'],
  rockFormation: ['rock', 'boulder', 'monolith', 'pinnacle', 'stack'],

  // ── Water bodies ──────────────────────────────────────────────────────
  ocean: ['ocean', 'oceanic'],
  seaWater: ['seascape', 'seaside', 'seawater'],
  lake: ['lake', 'loch', 'lagoon', 'tarn'],
  river: ['river', 'riverbank', 'stream', 'creek', 'brook'],
  waterfall: ['waterfall', 'cascade', 'cataract'],
  rapids: ['rapid', 'whitewater', 'torrent'],
  bay: ['bay', 'cove', 'inlet', 'gulf'],
  harborWater: ['harbor', 'harbour', 'marina', 'estuary'],
  hotSpring: ['hotspring', 'geyser', 'thermal', 'onsen'],
  pond: ['pond', 'pool', 'basin'],
  wetland: ['wetland', 'marsh', 'swamp', 'bog', 'mangrove', 'delta'],
  reflectionWater: ['reflection', 'mirror', 'still'],

  // ── Coast / shore ─────────────────────────────────────────────────────
  beach: ['beach', 'shore', 'shoreline', 'coast', 'coastline', 'coastal'],
  sand: ['sand', 'sandy'],
  tideSurf: ['tide', 'surf', 'wave', 'breaker', 'foam'],
  cape: ['cape', 'headland', 'promontory', 'peninsula'],
  islandTerrain: ['island', 'isle', 'archipelago', 'atoll', 'islet'],
  reef: ['reef', 'coral'],

  // ── Vegetation / biome ────────────────────────────────────────────────
  forest: ['forest', 'woodland', 'woods', 'grove'],
  rainforest: ['rainforest', 'jungle'],
  conifer: ['conifer', 'pine', 'spruce', 'fir', 'cedar', 'taiga'],
  deciduous: ['deciduous', 'oak', 'birch', 'maple', 'beech'],
  palm: ['palm', 'coconut'],
  bamboo: ['bamboo'],
  vineyard: ['vineyard', 'orchard', 'plantation'],
  garden: ['garden', 'park', 'botanical'],
  flowers: ['flower', 'bloom', 'blossom', 'wildflower', 'lavender', 'tulip', 'poppy'],
  meadow: ['meadow', 'grassland', 'pasture', 'prairie', 'savanna', 'steppe'],
  moss: ['moss', 'fern', 'lichen', 'undergrowth'],
  cactus: ['cactus', 'succulent', 'saguaro'],
  tundraVeg: ['tundra', 'heath', 'moorland'],
  cropField: ['field', 'farm', 'farmland', 'crop', 'terrace', 'rice'],

  // ── Climate / temperature ─────────────────────────────────────────────
  tropical: ['tropical', 'tropics', 'equatorial'],
  arid: ['arid', 'desert', 'drought', 'parched'],
  polar: ['polar', 'arctic', 'antarctic', 'iceberg'],
  snow: ['snow', 'snowy', 'snowfall', 'snowcapped'],
  ice: ['ice', 'icy', 'frozen', 'frost'],
  humid: ['humid', 'monsoon', 'tropic'],

  // ── Urban / built environment ─────────────────────────────────────────
  city: ['city', 'metropolis', 'urban', 'downtown'],
  skyline: ['skyline', 'cityscape', 'skyscraper'],
  street: ['street', 'alley', 'avenue', 'boulevard', 'lane', 'sidewalk'],
  plaza: ['plaza', 'square', 'piazza', 'courtyard'],
  market: ['market', 'bazaar', 'souk', 'stall'],
  bridge: ['bridge', 'viaduct', 'aqueduct'],
  tower: ['tower', 'spire', 'belfry'],
  building: ['building', 'facade', 'highrise', 'apartment'],
  ruins: ['ruin', 'ancient', 'archaeolog', 'excavation'],
  castle: ['castle', 'fortress', 'citadel', 'rampart', 'fort'],
  palace: ['palace', 'mansion', 'chateau', 'manor'],
  church: ['church', 'cathedral', 'chapel', 'basilica'],
  mosque: ['mosque', 'minaret'],
  temple: ['temple', 'shrine', 'pagoda', 'stupa', 'monastery'],
  lighthouse: ['lighthouse', 'beacon'],
  windmill: ['windmill', 'mill'],
  monument: ['monument', 'memorial', 'statue', 'obelisk', 'fountain'],
  stairs: ['stair', 'staircase', 'steps'],
  rooftop: ['rooftop', 'roof', 'terrace', 'balcony'],
  village: ['village', 'hamlet', 'town', 'cottage'],
  port: ['port', 'pier', 'dock', 'wharf', 'jetty', 'quay'],
  railway: ['railway', 'railroad', 'train', 'tram', 'station'],
  road: ['road', 'highway', 'motorway', 'pathway', 'trail', 'route'],
  tunnel: ['tunnel', 'underpass'],
  neon: ['neon', 'signage', 'billboard'],
  graffiti: ['graffiti', 'mural', 'streetart'],
  cafe: ['cafe', 'restaurant', 'bistro', 'tavern'],

  // ── Architectural style / era ─────────────────────────────────────────
  gothic: ['gothic'],
  baroque: ['baroque', 'rococo'],
  modernArch: ['modern', 'contemporary', 'glass', 'steel'],
  medieval: ['medieval', 'romanesque'],
  colonial: ['colonial', 'victorian', 'georgian'],
  artDeco: ['deco', 'nouveau'],
  minimalistArch: ['minimalist', 'minimal', 'clean'],
  brutalist: ['brutalist', 'concrete', 'modernist'],
  classical: ['classical', 'roman', 'greek', 'column', 'colonnade'],
  traditionalArch: ['traditional', 'vernacular', 'rustic', 'timber'],

  // ── Light / time of day ───────────────────────────────────────────────
  sunrise: ['sunrise', 'dawn', 'daybreak'],
  sunset: ['sunset', 'dusk', 'sundown'],
  goldenHour: ['golden', 'goldenhour'],
  blueHour: ['bluehour', 'twilight'],
  midday: ['midday', 'noon', 'overhead'],
  daylight: ['daylight', 'daytime', 'sunny', 'sunshine', 'sunlit'],
  night: ['night', 'nighttime', 'nocturnal', 'midnight'],
  stars: ['star', 'starry', 'milky', 'astrophoto', 'constellation'],
  aurora: ['aurora', 'northernlight'],
  moonlight: ['moon', 'moonlit', 'lunar'],
  silhouetteLight: ['silhouette', 'backlit', 'backlight'],

  // ── Weather / atmosphere ──────────────────────────────────────────────
  clearSky: ['clearsky', 'cloudless', 'azure'],
  cloudy: ['cloud', 'cloudy', 'cumulus'],
  overcast: ['overcast', 'gloomy', 'grey', 'gray'],
  fog: ['fog', 'foggy', 'mist', 'misty', 'haze', 'hazy'],
  rain: ['rain', 'rainy', 'drizzle', 'wet', 'puddle'],
  storm: ['storm', 'stormy', 'thunder', 'lightning', 'tempest'],
  wind: ['wind', 'windy', 'breeze', 'gust'],
  rainbow: ['rainbow'],

  // ── Human presence / activity ─────────────────────────────────────────
  people: ['people', 'person', 'human', 'portrait', 'figure'],
  crowd: ['crowd', 'crowded', 'busy', 'bustling', 'throng'],
  solitude: ['solitude', 'lonely', 'alone', 'isolated', 'empty', 'deserted', 'serene'],
  remoteness: ['remote', 'wilderness', 'untouched', 'secluded', 'vast'],
  tourist: ['tourist', 'tourism', 'sightseeing', 'landmark', 'attraction'],
  local: ['local', 'culture', 'cultural', 'authentic'],
  festival: ['festival', 'parade', 'celebration', 'carnival', 'fireworks'],
  nightlife: ['nightlife', 'bar', 'club', 'pub'],
  hiking: ['hike', 'hiking', 'trek', 'trekking', 'backpack'],
  climbing: ['climb', 'climbing', 'mountaineer', 'bouldering'],
  skiing: ['ski', 'skiing', 'snowboard', 'slope'],
  watersport: [
    'surf',
    'surfing',
    'kayak',
    'paddle',
    'sail',
    'sailing',
    'dive',
    'diving',
    'snorkel',
  ],
  swimming: ['swim', 'swimming', 'bathing'],
  camping: ['camp', 'camping', 'tent', 'campfire', 'bonfire'],
  cycling: ['cycle', 'cycling', 'bike', 'bicycle'],
  roadTrip: ['roadtrip', 'journey', 'expedition', 'voyage'],
  adventure: ['adventure', 'explore', 'exploration', 'discovery'],
  relaxation: ['relax', 'relaxation', 'resort', 'spa', 'leisure', 'vacation', 'holiday'],
  streetFood: ['food', 'cuisine', 'streetfood', 'culinary'],

  // ── Mood / aesthetic ──────────────────────────────────────────────────
  serene: ['serene', 'calm', 'peaceful', 'tranquil', 'quiet', 'zen'],
  dramatic: ['dramatic', 'epic', 'majestic', 'grand', 'sublime'],
  moody: ['moody', 'mysterious', 'eerie', 'somber', 'melancholy'],
  vast: ['vast', 'expansive', 'boundless', 'endless', 'sweeping'],
  intimate: ['intimate', 'cozy', 'quaint', 'charming'],
  rugged: ['rugged', 'harsh', 'wild', 'raw', 'untamed'],
  lush: ['lush', 'verdant', 'green', 'fertile', 'overgrown'],
  barren: ['barren', 'desolate', 'bleak', 'bare', 'sparse'],
  pristine: ['pristine', 'untouched', 'unspoiled', 'immaculate'],
  vibrantMood: ['vibrant', 'colorful', 'colourful', 'lively', 'energetic'],

  // ── Composition / scale ───────────────────────────────────────────────
  aerial: ['aerial', 'drone', 'birdseye', 'overhead', 'topdown'],
  panorama: ['panorama', 'panoramic', 'vista', 'wideangle'],
  horizon: ['horizon', 'skyfield', 'distant'],
  closeup: ['closeup', 'macro', 'detail', 'texture'],
  longExposure: ['longexposure', 'motionblur', 'silky'],
  symmetry: ['symmetry', 'symmetric', 'pattern', 'geometric'],
  leadingLines: ['leadingline', 'perspective', 'vanishing'],

  // ── Season ────────────────────────────────────────────────────────────
  spring: ['spring', 'springtime'],
  summer: ['summer', 'summertime'],
  autumn: ['autumn', 'fall', 'foliage'],
  winterSeason: ['winter', 'wintry'],

  // ── Wildlife / fauna ──────────────────────────────────────────────────
  wildlife: ['wildlife', 'animal', 'fauna', 'safari'],
  birds: ['bird', 'avian', 'flock', 'eagle', 'seagull'],
  marineLife: ['marine', 'fish', 'whale', 'dolphin', 'turtle'],

  // ── Culture / heritage ────────────────────────────────────────────────
  heritage: ['heritage', 'historic', 'historical', 'landmark'],
  religious: ['religious', 'sacred', 'spiritual', 'pilgrimage'],
  indigenous: ['indigenous', 'tribal', 'native', 'ancestral'],
} satisfies Record<string, string[]>;

export type TagFeatureKey = keyof typeof TAG_KEYWORDS;

/** Colour-derived feature axes (from the dominant `color`, not from tags). */
export const COLOR_FEATURE_KEYS = [
  'warmPalette',
  'coolPalette',
  'neutralPalette',
  'darkTone',
  'brightTone',
  'mutedTone',
  'vividTone',
  'monochrome',
  'redHue',
  'orangeHue',
  'yellowHue',
  'greenHue',
  'tealHue',
  'blueHue',
  'purpleHue',
] as const;

export type ColorFeatureKey = (typeof COLOR_FEATURE_KEYS)[number];

export type FeatureKey = TagFeatureKey | ColorFeatureKey;

/**
 * The fixed, ordered feature axes. A feature vector has one component per key in
 * this exact order. Append-only (see file header).
 */
export const FEATURE_KEYS: FeatureKey[] = [
  ...(Object.keys(TAG_KEYWORDS) as TagFeatureKey[]),
  ...COLOR_FEATURE_KEYS,
];

/** A feature vector — index-aligned to {@link FEATURE_KEYS}. */
export type FeatureVector = number[];

/** The metadata an image contributes — the subset of the Unsplash photo we use. */
export interface ImageFeatureInput {
  /** Unsplash tag titles (any case). */
  tags: string[];
  /** Dominant colour as a hex string (e.g. "#6E633A"). Optional/sparse. */
  color?: string;
}

const KEY_INDEX: Record<FeatureKey, number> = Object.fromEntries(
  FEATURE_KEYS.map((k, i) => [k, i]),
) as Record<FeatureKey, number>;

/** Parse a hex colour to HSL. Returns null for missing/invalid input. */
export function hexToHsl(hex?: string): { h: number; s: number; l: number } | null {
  if (!hex) return null;
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  const hex6 = m?.[1];
  if (!hex6) return null;
  const int = parseInt(hex6, 16);
  const r = ((int >> 16) & 0xff) / 255;
  const g = ((int >> 8) & 0xff) / 255;
  const b = (int & 0xff) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  let h = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/**
 * Colour-derived features for a dominant colour: warmth, tone (light/dark),
 * saturation (muted/vivid/monochrome), and hue family. A single colour credits
 * several axes. Empty when no/invalid colour.
 */
export function colorFeatures(color?: string): ColorFeatureKey[] {
  const hsl = hexToHsl(color);
  if (!hsl) return [];
  const out: ColorFeatureKey[] = [];
  const { h, s, l } = hsl;

  // Warmth
  if (s < 0.12) out.push('neutralPalette');
  else if (h < 70 || h >= 290) out.push('warmPalette');
  else out.push('coolPalette');

  // Tone
  if (l < 0.3) out.push('darkTone');
  else if (l > 0.7) out.push('brightTone');

  // Saturation
  if (s < 0.08) out.push('monochrome');
  else if (s < 0.25) out.push('mutedTone');
  else if (s > 0.65) out.push('vividTone');

  // Hue family (only meaningful when there is colour)
  if (s >= 0.12) {
    if (h < 20 || h >= 340) out.push('redHue');
    else if (h < 45) out.push('orangeHue');
    else if (h < 70) out.push('yellowHue');
    else if (h < 160) out.push('greenHue');
    else if (h < 200) out.push('tealHue');
    else if (h < 260) out.push('blueHue');
    else out.push('purpleHue');
  }

  return out;
}

/**
 * Map an image's tags + colour to a feature vector (raw nonnegative counts),
 * index-aligned to {@link FEATURE_KEYS}.
 */
export function extractFeatures(input: ImageFeatureInput): FeatureVector {
  const vec = new Array<number>(FEATURE_KEYS.length).fill(0);
  const words = input.tags.flatMap((t) =>
    t
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter(Boolean),
  );

  for (const [feature, keywords] of Object.entries(TAG_KEYWORDS)) {
    const idx = KEY_INDEX[feature as TagFeatureKey];
    for (const word of words) {
      if (keywords.some((kw) => word.startsWith(kw))) {
        vec[idx] = (vec[idx] ?? 0) + 1;
      }
    }
  }

  for (const cf of colorFeatures(input.color)) {
    const idx = KEY_INDEX[cf];
    vec[idx] = (vec[idx] ?? 0) + 1;
  }

  return vec;
}

/** View a feature vector as a `{ key: value }` record (omitting zeros) — for tests/UI. */
export function featuresToRecord(vec: FeatureVector): Partial<Record<FeatureKey, number>> {
  const out: Partial<Record<FeatureKey, number>> = {};
  FEATURE_KEYS.forEach((k, i) => {
    const v = vec[i] ?? 0;
    if (v !== 0) out[k] = v;
  });
  return out;
}
