/**
 * @fileoverview The GraphQL schema, built code-first with Pothos.
 *
 * Resolvers stay thin — the real work lives in db.ts, images.ts, and algorithm.ts.
 * Account management (sign-up, login, password, MFA) is handled by Cognito on the
 * client, so the API only covers app data.
 *
 * Pothos defaults output fields to nullable; fields that always resolve carry an
 * explicit `nullable: false` so the schema (and the generated frontend types)
 * reflect what the resolvers actually guarantee. `Query.me` stays nullable.
 */
import SchemaBuilder from '@pothos/core';
import { GraphQLError } from 'graphql';
import { type AuthUser, deleteCognitoUser, findUserByPhone } from './auth';
import { COUNTRIES, isValidCountryCode, type Country } from './countries';
import { NEUTRAL_PREFERENCE } from './algorithm';
import type { TravelImage } from './images';
import { getImagePool, triggerDownload } from './images';
import { extractFeatures } from './features';
import { scoreCountries } from './scoring';
import { selectNext, explorationFraction } from './recommender';
import {
  emptyDossier,
  applyInteractions,
  derivedMetrics,
  type InteractionInput,
  type DerivedMetrics,
} from './dossier';
import {
  inferTraits,
  topFeatures,
  INFERENCE_DISCLAIMER,
  type InferredTrait,
  type RankedFeature,
} from './insights';
import { getCountrySignatures } from './signatures';
import * as db from './db';

export interface GraphQLContext {
  user: AuthUser | null;
}

interface CountryPreferenceModel {
  country: Country;
  value: number;
}

interface LearnSectionProgressModel {
  sectionId: string;
  viewedSlides: number[];
}

/** The computed view exposed by the `dossier` query (Algorithm A's surveillance profile). */
interface DossierView {
  metrics: DerivedMetrics;
  confidence: number;
  exploration: number;
  traits: InferredTrait[];
  topFeatures: RankedFeature[];
  engagement: CountryPreferenceModel[];
}

const builder = new SchemaBuilder<{
  Context: GraphQLContext;
  Objects: {
    Country: Country;
    CountryPreference: CountryPreferenceModel;
    TravelImage: TravelImage;
    User: AuthUser;
    LearnSectionProgress: LearnSectionProgressModel;
    Dossier: DossierView;
    InferredTrait: InferredTrait;
    TasteFeature: RankedFeature;
  };
}>({});

/** Build the per-country score list (CountryPreference[]) from a taste vector. */
function preferencesFromTaste(taste: number[]): CountryPreferenceModel[] {
  const scores = scoreCountries(taste, getCountrySignatures());
  return COUNTRIES.map((country) => ({
    country,
    value: scores[country.code] ?? NEUTRAL_PREFERENCE,
  }));
}

/** Throw a typed UNAUTHENTICATED error unless the request carries a valid identity. */
function requireUser(ctx: GraphQLContext): AuthUser {
  if (!ctx.user) {
    throw new GraphQLError('Authentication required', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return ctx.user;
}

builder.objectType('Country', {
  description: 'A travel destination in the catalog.',
  fields: (t) => ({
    code: t.exposeID('code', { description: 'ISO 3166-1 alpha-2 code.', nullable: false }),
    name: t.exposeString('name', { nullable: false }),
  }),
});

builder.objectType('CountryPreference', {
  description: "A single country's preference score for a user (0–100).",
  fields: (t) => ({
    country: t.field({ type: 'Country', nullable: false, resolve: (p) => p.country }),
    value: t.exposeInt('value', { nullable: false }),
  }),
});

builder.objectType('TravelImage', {
  description: 'A travel photo for the user to rate.',
  fields: (t) => ({
    country: t.field({ type: 'Country', nullable: false, resolve: (p) => p.country }),
    imageUrl: t.exposeString('imageUrl', { nullable: false }),
    attribution: t.exposeString('attribution', { nullable: false }),
    photographerName: t.exposeString('photographerName', { nullable: false }),
    photographerUrl: t.exposeString('photographerUrl', {
      nullable: false,
      description: "Photographer's Unsplash profile URL (link the credit here).",
    }),
    unsplashUrl: t.exposeString('unsplashUrl', {
      nullable: false,
      description: "The photo's Unsplash page URL.",
    }),
    tags: t.field({
      type: ['String'],
      nullable: false,
      description: 'Unsplash keyword tags — the abstract signal preferences are inferred from.',
      resolve: (p) => p.tags,
    }),
    color: t.string({
      nullable: true,
      description: 'Dominant colour as a hex string, when available.',
      resolve: (p) => p.color ?? null,
    }),
    downloadLocation: t.string({
      nullable: true,
      description: 'Unsplash download-tracking endpoint — pass to trackPhotoUse when used.',
      resolve: (p) => p.downloadLocation ?? null,
    }),
  }),
});

builder.objectType('LearnSectionProgress', {
  description: 'Which slides of a Learn-page section a user has viewed.',
  fields: (t) => ({
    sectionId: t.exposeID('sectionId', { nullable: false }),
    viewedSlides: t.field({
      type: ['Int'],
      nullable: false,
      description: 'Viewed slide indices (ascending). Completion is derived client-side.',
      resolve: (p) => p.viewedSlides,
    }),
  }),
});

builder.objectType('User', {
  description: 'The authenticated user. Identity comes from Cognito; preferences from DynamoDB.',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    email: t.exposeString('email', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    preferences: t.field({
      type: ['CountryPreference'],
      nullable: false,
      description:
        "Every catalog country scored 0–100 by Algorithm B — inferred from the user's " +
        'explicit likes (neutral 50 at the cold start).',
      resolve: async (user) => {
        const dossier = await db.getDossier(user.id);
        return preferencesFromTaste(dossier?.b.taste ?? []);
      },
    }),
    learnProgress: t.field({
      type: ['LearnSectionProgress'],
      nullable: false,
      description: 'Per-section Learn-page progress (sparse — only touched sections).',
      resolve: async (user) => {
        const map = await db.getLearnProgress(user.id);
        return Object.entries(map).map(([sectionId, viewedSlides]) => ({
          sectionId,
          viewedSlides,
        }));
      },
    }),
  }),
});

const InteractionActionEnum = builder.enumType('InteractionAction', {
  description: 'What the user did with an image.',
  values: ['like', 'dislike', 'skip'] as const,
});

const DriverEnum = builder.enumType('Driver', {
  description: 'Which algorithm drives the feed: A (engagement) or B (user-first).',
  values: ['A', 'B'] as const,
});

const InteractionInputRef = builder.inputType('InteractionInput', {
  description: "One interaction with an image, echoed back with the image's tags/colour.",
  fields: (t) => ({
    imageId: t.id({ required: true }),
    country: t.id({ required: true }),
    tags: t.stringList({ required: true }),
    color: t.string({ required: false }),
    action: t.field({ type: InteractionActionEnum, required: true }),
    dwellMs: t.int({ required: false, description: 'Time on screen, in milliseconds.' }),
    detailsTapped: t.boolean({ required: false }),
    reviews: t.int({ required: false }),
  }),
});

builder.objectType('InferredTrait', {
  description: 'An illustrative trait Algorithm A infers — see Dossier.disclaimer.',
  fields: (t) => ({
    trait: t.exposeString('trait', { nullable: false }),
    basis: t.exposeString('basis', { nullable: false }),
    confidence: t.exposeFloat('confidence', { nullable: false }),
  }),
});

builder.objectType('TasteFeature', {
  description: 'One axis of the learned taste vector and its weight.',
  fields: (t) => ({
    key: t.exposeString('key', { nullable: false }),
    value: t.exposeFloat('value', { nullable: false }),
  }),
});

builder.objectType('Dossier', {
  description: "Algorithm A's surveillance profile of the user (session-controlled, deletable).",
  fields: (t) => ({
    totalRatings: t.int({ nullable: false, resolve: (d) => d.metrics.totalRatings }),
    totalInteractions: t.int({ nullable: false, resolve: (d) => d.metrics.totalInteractions }),
    likes: t.int({ nullable: false, resolve: (d) => d.metrics.likes }),
    dislikes: t.int({ nullable: false, resolve: (d) => d.metrics.dislikes }),
    skips: t.int({ nullable: false, resolve: (d) => d.metrics.skips }),
    avgDwellMs: t.int({ nullable: false, resolve: (d) => d.metrics.avgDwellMs }),
    skipRate: t.float({ nullable: false, resolve: (d) => d.metrics.skipRate }),
    curiosityRate: t.float({ nullable: false, resolve: (d) => d.metrics.curiosityRate }),
    confidence: t.exposeFloat('confidence', { nullable: false }),
    exploration: t.exposeFloat('exploration', { nullable: false }),
    disclaimer: t.string({ nullable: false, resolve: () => INFERENCE_DISCLAIMER }),
    inferredTraits: t.field({
      type: ['InferredTrait'],
      nullable: false,
      resolve: (d) => d.traits,
    }),
    topFeatures: t.field({
      type: ['TasteFeature'],
      nullable: false,
      resolve: (d) => d.topFeatures,
    }),
    engagementPreferences: t.field({
      type: ['CountryPreference'],
      nullable: false,
      description: "Algorithm A's country ranking, inferred from abstract features.",
      resolve: (d) => d.engagement,
    }),
  }),
});

const LearnSectionProgressInput = builder.inputType('LearnSectionProgressInput', {
  description: "One section's viewed slide indices, sent from the client to merge.",
  fields: (t) => ({
    sectionId: t.id({ required: true }),
    viewedSlides: t.intList({ required: true }),
  }),
});

builder.queryType({
  fields: (t) => ({
    countries: t.field({
      type: ['Country'],
      nullable: false,
      description: 'The full country catalog.',
      resolve: () => [...COUNTRIES],
    }),
    me: t.field({
      type: 'User',
      nullable: true,
      description: 'The authenticated user, or null if not signed in.',
      resolve: (_root, _args, ctx) => ctx.user,
    }),
    travelImages: t.field({
      type: ['TravelImage'],
      nullable: false,
      description:
        'A batch of travel photos chosen by the given driver (A narrows toward the ' +
        "user's taste; B stays diverse). Defaults to B.",
      args: {
        count: t.arg.int({ defaultValue: 8 }),
        driver: t.arg({ type: DriverEnum, defaultValue: 'B' }),
      },
      resolve: async (_root, args, ctx) => {
        const user = requireUser(ctx);
        const count = args.count ?? 8;
        const driver = args.driver ?? 'B';
        const dossier = await db.getDossier(user.id);

        // A neutral candidate pool larger than the batch (cached when available),
        // then let the driver pick.
        const pool = await getImagePool(Math.min(count * 3, 30));
        const candidates = pool.map((img, i) => ({
          id: String(i),
          country: img.country.code,
          features: extractFeatures({ tags: img.tags, color: img.color }),
        }));

        const picks =
          driver === 'A'
            ? selectNext({
                driver: 'A',
                pool: candidates,
                count,
                taste: dossier?.a.taste ?? [],
                exploration: explorationFraction(dossier?.a.confidence ?? 0),
              })
            : selectNext({
                driver: 'B',
                pool: candidates,
                count,
                countryScores: scoreCountries(dossier?.b.taste ?? [], getCountrySignatures()),
              });

        return picks.flatMap((p) => {
          const img = pool[Number(p.id)];
          return img ? [img] : [];
        });
      },
    }),
    dossier: t.field({
      type: 'Dossier',
      nullable: false,
      description: "Algorithm A's full profile of the authenticated user (the surveillance view).",
      resolve: async (_root, _args, ctx): Promise<DossierView> => {
        const user = requireUser(ctx);
        const d = (await db.getDossier(user.id)) ?? emptyDossier();
        const metrics = derivedMetrics(d);
        return {
          metrics,
          confidence: d.a.confidence,
          exploration: explorationFraction(d.a.confidence),
          traits: inferTraits(d.a.taste, {
            avgDwellMs: metrics.avgDwellMs,
            skipRate: metrics.skipRate,
          }),
          topFeatures: topFeatures(d.a.taste, 8),
          engagement: preferencesFromTaste(d.a.taste),
        };
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    submitFeedback: t.field({
      type: 'User',
      nullable: false,
      description:
        'Run a batch of image interactions through both algorithms and persist the dossier.',
      args: { interactions: t.arg({ type: [InteractionInputRef], required: true }) },
      resolve: async (_root, args, ctx) => {
        const user = requireUser(ctx);
        const inputs: InteractionInput[] = args.interactions
          .filter((i) => isValidCountryCode(i.country))
          .map((i) => ({
            imageId: i.imageId,
            country: i.country,
            tags: i.tags,
            color: i.color ?? undefined,
            action: i.action,
            dwellMs: i.dwellMs ?? undefined,
            detailsTapped: i.detailsTapped ?? undefined,
            reviews: i.reviews ?? undefined,
          }));
        const current = (await db.getDossier(user.id)) ?? emptyDossier();
        const next = applyInteractions(current, inputs);
        await db.saveDossier(user.id, next);
        return user;
      },
    }),
    deleteAccount: t.field({
      type: 'Boolean',
      nullable: false,
      description: "Delete the user's stored data.",
      resolve: async (_root, _args, ctx) => {
        const user = requireUser(ctx);
        await db.deletePreferences(user.id);
        await deleteCognitoUser(user.email);
        return true;
      },
    }),

    trackPhotoUse: t.field({
      type: 'Boolean',
      nullable: false,
      description:
        "Ping an Unsplash photo's download endpoint when it is used (required by the API " +
        "guidelines). Pass the photo's downloadLocation.",
      args: { downloadLocation: t.arg.string({ required: true }) },
      resolve: (_root, args) => {
        triggerDownload(args.downloadLocation);
        return true;
      },
    }),

    resetPreferences: t.field({
      type: 'Boolean',
      nullable: false,
      description:
        "Clear the user's preferences (Algorithm B), resetting every country to neutral.",
      resolve: async (_root, _args, ctx) => {
        const user = requireUser(ctx);
        await db.resetPreferences(user.id);
        return true;
      },
    }),

    resetDossier: t.field({
      type: 'Boolean',
      nullable: false,
      description: "Delete Algorithm A's dossier and reset the cold start (both tastes cleared).",
      resolve: async (_root, _args, ctx) => {
        const user = requireUser(ctx);
        await db.resetDossier(user.id);
        return true;
      },
    }),

    recordSlideView: t.field({
      type: ['LearnSectionProgress'],
      nullable: false,
      description: 'Record that a Learn-page slide was viewed; returns the full updated progress.',
      args: {
        sectionId: t.arg.id({ required: true }),
        slideIndex: t.arg.int({ required: true }),
      },
      resolve: async (_root, args, ctx) => {
        const user = requireUser(ctx);
        const map = await db.recordLearnSlideView(user.id, args.sectionId, args.slideIndex);
        return Object.entries(map).map(([sectionId, viewedSlides]) => ({
          sectionId,
          viewedSlides,
        }));
      },
    }),

    mergeLearnProgress: t.field({
      type: ['LearnSectionProgress'],
      nullable: false,
      description:
        'Union a batch of client-recorded progress into the stored progress (used on sign-in to reconcile offline progress); returns the full updated progress.',
      args: { progress: t.arg({ type: [LearnSectionProgressInput], required: true }) },
      resolve: async (_root, args, ctx) => {
        const user = requireUser(ctx);
        const incoming: db.LearnProgressMap = {};
        for (const { sectionId, viewedSlides } of args.progress) {
          incoming[sectionId] = viewedSlides;
        }
        const map = await db.mergeLearnProgress(user.id, incoming);
        return Object.entries(map).map(([sectionId, viewedSlides]) => ({
          sectionId,
          viewedSlides,
        }));
      },
    }),

    resetLearnProgress: t.field({
      type: 'Boolean',
      nullable: false,
      description: "Clear all of the user's stored Learn-page progress.",
      resolve: async (_root, _args, ctx) => {
        const user = requireUser(ctx);
        await db.resetLearnProgress(user.id);
        return true;
      },
    }),

    findEmailByPhone: t.string({
      nullable: true,
      description:
        'Look up the email address associated with a verified phone number. Returns null if no account is found. Used for the forgot-email recovery flow — the caller must still complete a Cognito password-reset code to prove email ownership.',
      args: { phone: t.arg.string({ required: true }) },
      resolve: async (_root, args) => {
        return findUserByPhone(args.phone);
      },
    }),
  }),
});

export const schema = builder.toSchema();
