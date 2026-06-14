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
    "\n  query TravelImages($count: Int!) {\n    travelImages(count: $count) {\n      imageUrl\n      attribution\n      country {\n        code\n        name\n      }\n    }\n  }\n": typeof types.TravelImagesDocument,
    "\n  mutation SubmitFeedback($feedback: [FeedbackInput!]!) {\n    submitFeedback(feedback: $feedback) {\n      id\n      preferences {\n        value\n        country {\n          code\n        }\n      }\n    }\n  }\n": typeof types.SubmitFeedbackDocument,
};
const documents: Documents = {
    "\n  mutation FindEmailByPhone($phone: String!) {\n    findEmailByPhone(phone: $phone)\n  }\n": types.FindEmailByPhoneDocument,
    "\n  query Countries {\n    countries {\n      code\n      name\n    }\n  }\n": types.CountriesDocument,
    "\n  mutation DeleteAccount {\n    deleteAccount\n  }\n": types.DeleteAccountDocument,
    "\n  query Preferences {\n    me {\n      id\n      name\n      preferences {\n        value\n        country {\n          code\n          name\n        }\n      }\n    }\n  }\n": types.PreferencesDocument,
    "\n  query LearnProgress {\n    me {\n      id\n      learnProgress {\n        sectionId\n        viewedSlides\n      }\n    }\n  }\n": types.LearnProgressDocument,
    "\n  mutation RecordSlideView($sectionId: ID!, $slideIndex: Int!) {\n    recordSlideView(sectionId: $sectionId, slideIndex: $slideIndex) {\n      sectionId\n      viewedSlides\n    }\n  }\n": types.RecordSlideViewDocument,
    "\n  query TravelImages($count: Int!) {\n    travelImages(count: $count) {\n      imageUrl\n      attribution\n      country {\n        code\n        name\n      }\n    }\n  }\n": types.TravelImagesDocument,
    "\n  mutation SubmitFeedback($feedback: [FeedbackInput!]!) {\n    submitFeedback(feedback: $feedback) {\n      id\n      preferences {\n        value\n        country {\n          code\n        }\n      }\n    }\n  }\n": types.SubmitFeedbackDocument,
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
export function graphql(source: "\n  query TravelImages($count: Int!) {\n    travelImages(count: $count) {\n      imageUrl\n      attribution\n      country {\n        code\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query TravelImages($count: Int!) {\n    travelImages(count: $count) {\n      imageUrl\n      attribution\n      country {\n        code\n        name\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SubmitFeedback($feedback: [FeedbackInput!]!) {\n    submitFeedback(feedback: $feedback) {\n      id\n      preferences {\n        value\n        country {\n          code\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation SubmitFeedback($feedback: [FeedbackInput!]!) {\n    submitFeedback(feedback: $feedback) {\n      id\n      preferences {\n        value\n        country {\n          code\n        }\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;