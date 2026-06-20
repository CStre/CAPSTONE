/* eslint-disable */
import * as types from './graphql';
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation FindEmailByPhone($phone: String!) {\n    findEmailByPhone(phone: $phone)\n  }\n": typeof types.FindEmailByPhoneDocument,
    "\n  query Countries {\n    countries {\n      code\n      name\n    }\n  }\n": typeof types.CountriesDocument,
    "\n  mutation DeleteAccount {\n    deleteAccount\n  }\n": typeof types.DeleteAccountDocument,
    "\n  query Preferences {\n    me {\n      id\n      name\n      preferences {\n        value\n        country {\n          code\n          name\n        }\n      }\n    }\n  }\n": typeof types.PreferencesDocument,
    "\n  query LearnProgress {\n    me {\n      id\n      learnProgress {\n        sectionId\n        viewedSlides\n      }\n    }\n  }\n": typeof types.LearnProgressDocument,
    "\n  mutation RecordSlideView($sectionId: ID!, $slideIndex: Int!) {\n    recordSlideView(sectionId: $sectionId, slideIndex: $slideIndex) {\n      sectionId\n      viewedSlides\n    }\n  }\n": typeof types.RecordSlideViewDocument,
    "\n  mutation MergeLearnProgress($progress: [LearnSectionProgressInput!]!) {\n    mergeLearnProgress(progress: $progress) {\n      sectionId\n      viewedSlides\n    }\n  }\n": typeof types.MergeLearnProgressDocument,
    "\n  mutation ResetLearnProgress {\n    resetLearnProgress\n  }\n": typeof types.ResetLearnProgressDocument,
    "\n  query TravelImages($count: Int!, $driver: Driver!) {\n    travelImages(count: $count, driver: $driver) {\n      imageUrl\n      attribution\n      photographerName\n      photographerUrl\n      unsplashUrl\n      tags\n      color\n      downloadLocation\n      country {\n        code\n        name\n      }\n    }\n  }\n": typeof types.TravelImagesDocument,
    "\n  mutation SubmitFeedback($interactions: [InteractionInput!]!) {\n    submitFeedback(interactions: $interactions) {\n      id\n    }\n  }\n": typeof types.SubmitFeedbackDocument,
    "\n  mutation TrackPhotoUse($downloadLocation: String!) {\n    trackPhotoUse(downloadLocation: $downloadLocation)\n  }\n": typeof types.TrackPhotoUseDocument,
    "\n  query Dossier {\n    dossier {\n      totalInteractions\n      likes\n      dislikes\n      skips\n      avgDwellMs\n      confidence\n      exploration\n      disclaimer\n      inferredTraits {\n        trait\n        confidence\n      }\n      topFeatures {\n        key\n        value\n      }\n    }\n  }\n": typeof types.DossierDocument,
};
const documents: Documents = {
    "\n  mutation FindEmailByPhone($phone: String!) {\n    findEmailByPhone(phone: $phone)\n  }\n": types.FindEmailByPhoneDocument,
    "\n  query Countries {\n    countries {\n      code\n      name\n    }\n  }\n": types.CountriesDocument,
    "\n  mutation DeleteAccount {\n    deleteAccount\n  }\n": types.DeleteAccountDocument,
    "\n  query Preferences {\n    me {\n      id\n      name\n      preferences {\n        value\n        country {\n          code\n          name\n        }\n      }\n    }\n  }\n": types.PreferencesDocument,
    "\n  query LearnProgress {\n    me {\n      id\n      learnProgress {\n        sectionId\n        viewedSlides\n      }\n    }\n  }\n": types.LearnProgressDocument,
    "\n  mutation RecordSlideView($sectionId: ID!, $slideIndex: Int!) {\n    recordSlideView(sectionId: $sectionId, slideIndex: $slideIndex) {\n      sectionId\n      viewedSlides\n    }\n  }\n": types.RecordSlideViewDocument,
    "\n  mutation MergeLearnProgress($progress: [LearnSectionProgressInput!]!) {\n    mergeLearnProgress(progress: $progress) {\n      sectionId\n      viewedSlides\n    }\n  }\n": types.MergeLearnProgressDocument,
    "\n  mutation ResetLearnProgress {\n    resetLearnProgress\n  }\n": types.ResetLearnProgressDocument,
    "\n  query TravelImages($count: Int!, $driver: Driver!) {\n    travelImages(count: $count, driver: $driver) {\n      imageUrl\n      attribution\n      photographerName\n      photographerUrl\n      unsplashUrl\n      tags\n      color\n      downloadLocation\n      country {\n        code\n        name\n      }\n    }\n  }\n": types.TravelImagesDocument,
    "\n  mutation SubmitFeedback($interactions: [InteractionInput!]!) {\n    submitFeedback(interactions: $interactions) {\n      id\n    }\n  }\n": types.SubmitFeedbackDocument,
    "\n  mutation TrackPhotoUse($downloadLocation: String!) {\n    trackPhotoUse(downloadLocation: $downloadLocation)\n  }\n": types.TrackPhotoUseDocument,
    "\n  query Dossier {\n    dossier {\n      totalInteractions\n      likes\n      dislikes\n      skips\n      avgDwellMs\n      confidence\n      exploration\n      disclaimer\n      inferredTraits {\n        trait\n        confidence\n      }\n      topFeatures {\n        key\n        value\n      }\n    }\n  }\n": types.DossierDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation FindEmailByPhone($phone: String!) {\n    findEmailByPhone(phone: $phone)\n  }\n"): (typeof documents)["\n  mutation FindEmailByPhone($phone: String!) {\n    findEmailByPhone(phone: $phone)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Countries {\n    countries {\n      code\n      name\n    }\n  }\n"): (typeof documents)["\n  query Countries {\n    countries {\n      code\n      name\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation DeleteAccount {\n    deleteAccount\n  }\n"): (typeof documents)["\n  mutation DeleteAccount {\n    deleteAccount\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Preferences {\n    me {\n      id\n      name\n      preferences {\n        value\n        country {\n          code\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Preferences {\n    me {\n      id\n      name\n      preferences {\n        value\n        country {\n          code\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LearnProgress {\n    me {\n      id\n      learnProgress {\n        sectionId\n        viewedSlides\n      }\n    }\n  }\n"): (typeof documents)["\n  query LearnProgress {\n    me {\n      id\n      learnProgress {\n        sectionId\n        viewedSlides\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation RecordSlideView($sectionId: ID!, $slideIndex: Int!) {\n    recordSlideView(sectionId: $sectionId, slideIndex: $slideIndex) {\n      sectionId\n      viewedSlides\n    }\n  }\n"): (typeof documents)["\n  mutation RecordSlideView($sectionId: ID!, $slideIndex: Int!) {\n    recordSlideView(sectionId: $sectionId, slideIndex: $slideIndex) {\n      sectionId\n      viewedSlides\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MergeLearnProgress($progress: [LearnSectionProgressInput!]!) {\n    mergeLearnProgress(progress: $progress) {\n      sectionId\n      viewedSlides\n    }\n  }\n"): (typeof documents)["\n  mutation MergeLearnProgress($progress: [LearnSectionProgressInput!]!) {\n    mergeLearnProgress(progress: $progress) {\n      sectionId\n      viewedSlides\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation ResetLearnProgress {\n    resetLearnProgress\n  }\n"): (typeof documents)["\n  mutation ResetLearnProgress {\n    resetLearnProgress\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TravelImages($count: Int!, $driver: Driver!) {\n    travelImages(count: $count, driver: $driver) {\n      imageUrl\n      attribution\n      photographerName\n      photographerUrl\n      unsplashUrl\n      tags\n      color\n      downloadLocation\n      country {\n        code\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query TravelImages($count: Int!, $driver: Driver!) {\n    travelImages(count: $count, driver: $driver) {\n      imageUrl\n      attribution\n      photographerName\n      photographerUrl\n      unsplashUrl\n      tags\n      color\n      downloadLocation\n      country {\n        code\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitFeedback($interactions: [InteractionInput!]!) {\n    submitFeedback(interactions: $interactions) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation SubmitFeedback($interactions: [InteractionInput!]!) {\n    submitFeedback(interactions: $interactions) {\n      id\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation TrackPhotoUse($downloadLocation: String!) {\n    trackPhotoUse(downloadLocation: $downloadLocation)\n  }\n"): (typeof documents)["\n  mutation TrackPhotoUse($downloadLocation: String!) {\n    trackPhotoUse(downloadLocation: $downloadLocation)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Dossier {\n    dossier {\n      totalInteractions\n      likes\n      dislikes\n      skips\n      avgDwellMs\n      confidence\n      exploration\n      disclaimer\n      inferredTraits {\n        trait\n        confidence\n      }\n      topFeatures {\n        key\n        value\n      }\n    }\n  }\n"): (typeof documents)["\n  query Dossier {\n    dossier {\n      totalInteractions\n      likes\n      dislikes\n      skips\n      avgDwellMs\n      confidence\n      exploration\n      disclaimer\n      inferredTraits {\n        trait\n        confidence\n      }\n      topFeatures {\n        key\n        value\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;