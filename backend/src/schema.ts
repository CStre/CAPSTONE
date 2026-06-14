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
import { NEUTRAL_PREFERENCE, updatePreferences, type Feedback } from './algorithm';
import type { TravelImage } from './images';
import { fetchTravelImages } from './images';
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

const builder = new SchemaBuilder<{
  Context: GraphQLContext;
  Objects: {
    Country: Country;
    CountryPreference: CountryPreferenceModel;
    TravelImage: TravelImage;
    User: AuthUser;
    LearnSectionProgress: LearnSectionProgressModel;
  };
}>({});

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
      description: 'Every catalog country with its current score (neutral default filled in).',
      resolve: async (user) => {
        const stored = await db.getPreferences(user.id);
        return COUNTRIES.map((country) => ({
          country,
          value: stored[country.code] ?? NEUTRAL_PREFERENCE,
        }));
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

const FeedbackInput = builder.inputType('FeedbackInput', {
  fields: (t) => ({
    liked: t.boolean({ required: true, description: 'true = liked, false = disliked.' }),
    country: t.id({ required: true, description: 'Country code the feedback applies to.' }),
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
      description: "A batch of travel photos, weighted by the user's preferences.",
      args: { count: t.arg.int({ defaultValue: 8 }) },
      resolve: async (_root, args, ctx) => {
        const user = requireUser(ctx);
        const prefs = await db.getPreferences(user.id);
        return fetchTravelImages(prefs, args.count ?? 8);
      },
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    submitFeedback: t.field({
      type: 'User',
      nullable: false,
      description: 'Run a batch of like/dislike feedback through the algorithm and persist it.',
      args: { feedback: t.arg({ type: [FeedbackInput], required: true }) },
      resolve: async (_root, args, ctx) => {
        const user = requireUser(ctx);
        const feedback: Feedback[] = args.feedback
          .filter((f) => isValidCountryCode(f.country))
          .map((f) => ({ country: f.country, liked: f.liked }));
        const current = await db.getPreferences(user.id);
        const changed = updatePreferences(current, feedback);
        await db.persistPreferences(user.id, changed);
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
