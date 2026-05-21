/**
 * @fileoverview The GraphQL schema, built code-first with Pothos.
 *
 * Resolvers stay thin — the real work lives in db.ts, images.ts, and algorithm.ts.
 * Account management (sign-up, login, password, MFA) is handled by Cognito on the
 * client, so the API only covers app data.
 */
import SchemaBuilder from '@pothos/core';
import { GraphQLError } from 'graphql';
import type { AuthUser } from './auth';
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

const builder = new SchemaBuilder<{
  Context: GraphQLContext;
  Objects: {
    Country: Country;
    CountryPreference: CountryPreferenceModel;
    TravelImage: TravelImage;
    User: AuthUser;
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
    code: t.exposeID('code', { description: 'ISO 3166-1 alpha-2 code.' }),
    name: t.exposeString('name'),
  }),
});

builder.objectType('CountryPreference', {
  description: "A single country's preference score for a user (0–100).",
  fields: (t) => ({
    country: t.field({ type: 'Country', resolve: (p) => p.country }),
    value: t.exposeInt('value'),
  }),
});

builder.objectType('TravelImage', {
  description: 'A travel photo for the user to rate.',
  fields: (t) => ({
    country: t.field({ type: 'Country', resolve: (p) => p.country }),
    imageUrl: t.exposeString('imageUrl'),
    attribution: t.exposeString('attribution'),
  }),
});

builder.objectType('User', {
  description: 'The authenticated user. Identity comes from Cognito; preferences from DynamoDB.',
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name'),
    preferences: t.field({
      type: ['CountryPreference'],
      description: 'Every catalog country with its current score (neutral default filled in).',
      resolve: async (user) => {
        const stored = await db.getPreferences(user.id);
        return COUNTRIES.map((country) => ({
          country,
          value: stored[country.code] ?? NEUTRAL_PREFERENCE,
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
      description: 'A batch of travel photos, weighted by the user’s preferences.',
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
      description: 'Delete the user’s stored data.',
      resolve: async (_root, _args, ctx) => {
        const user = requireUser(ctx);
        await db.deletePreferences(user.id);
        // TODO (Phase 3): also delete the Cognito user via AdminDeleteUser.
        return true;
      },
    }),
  }),
});

export const schema = builder.toSchema();
