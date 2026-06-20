/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Which algorithm drives the feed: A (engagement) or B (user-first). */
export type Driver =
  | 'A'
  | 'B';

/** What the user did with an image. */
export type InteractionAction =
  | 'dislike'
  | 'like'
  | 'skip';

/** One interaction with an image, echoed back with the image's tags/colour. */
export type InteractionInput = {
  action: InteractionAction;
  color?: string | null | undefined;
  country: string | number;
  detailsTapped?: boolean | null | undefined;
  /** Time on screen, in milliseconds. */
  dwellMs?: number | null | undefined;
  imageId: string | number;
  reviews?: number | null | undefined;
  tags: Array<string>;
};

/** One section's viewed slide indices, sent from the client to merge. */
export type LearnSectionProgressInput = {
  sectionId: string | number;
  viewedSlides: Array<number>;
};

export type FindEmailByPhoneMutationVariables = Exact<{
  phone: string;
}>;


export type FindEmailByPhoneMutation = { findEmailByPhone: string | null };

export type CountriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CountriesQuery = { countries: Array<{ code: string, name: string }> };

export type DeleteAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAccountMutation = { deleteAccount: boolean };

export type PreferencesQueryVariables = Exact<{ [key: string]: never; }>;


export type PreferencesQuery = { me: { id: string, name: string, preferences: Array<{ value: number, country: { code: string, name: string } }> } | null };

export type LearnProgressQueryVariables = Exact<{ [key: string]: never; }>;


export type LearnProgressQuery = { me: { id: string, learnProgress: Array<{ sectionId: string, viewedSlides: Array<number> }> } | null };

export type RecordSlideViewMutationVariables = Exact<{
  sectionId: string | number;
  slideIndex: number;
}>;


export type RecordSlideViewMutation = { recordSlideView: Array<{ sectionId: string, viewedSlides: Array<number> }> };

export type MergeLearnProgressMutationVariables = Exact<{
  progress: Array<LearnSectionProgressInput> | LearnSectionProgressInput;
}>;


export type MergeLearnProgressMutation = { mergeLearnProgress: Array<{ sectionId: string, viewedSlides: Array<number> }> };

export type ResetLearnProgressMutationVariables = Exact<{ [key: string]: never; }>;


export type ResetLearnProgressMutation = { resetLearnProgress: boolean };

export type TravelImagesQueryVariables = Exact<{
  count: number;
  driver: Driver;
}>;


export type TravelImagesQuery = { travelImages: Array<{ imageUrl: string, attribution: string, photographerName: string, photographerUrl: string, unsplashUrl: string, tags: Array<string>, color: string | null, downloadLocation: string | null, country: { code: string, name: string } }> };

export type SubmitFeedbackMutationVariables = Exact<{
  interactions: Array<InteractionInput> | InteractionInput;
}>;


export type SubmitFeedbackMutation = { submitFeedback: { id: string } };

export type TrackPhotoUseMutationVariables = Exact<{
  downloadLocation: string;
}>;


export type TrackPhotoUseMutation = { trackPhotoUse: boolean };

export type DossierQueryVariables = Exact<{ [key: string]: never; }>;


export type DossierQuery = { dossier: { totalInteractions: number, likes: number, dislikes: number, skips: number, avgDwellMs: number, confidence: number, exploration: number, disclaimer: string, inferredTraits: Array<{ trait: string, confidence: number }>, topFeatures: Array<{ key: string, value: number }> } };


export const FindEmailByPhoneDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"FindEmailByPhone"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"phone"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findEmailByPhone"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"phone"},"value":{"kind":"Variable","name":{"kind":"Name","value":"phone"}}}]}]}}]} as unknown as DocumentNode<FindEmailByPhoneMutation, FindEmailByPhoneMutationVariables>;
export const CountriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Countries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"countries"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<CountriesQuery, CountriesQueryVariables>;
export const DeleteAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"}}]}}]} as unknown as DocumentNode<DeleteAccountMutation, DeleteAccountMutationVariables>;
export const PreferencesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Preferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"preferences"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<PreferencesQuery, PreferencesQueryVariables>;
export const LearnProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LearnProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"learnProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sectionId"}},{"kind":"Field","name":{"kind":"Name","value":"viewedSlides"}}]}}]}}]}}]} as unknown as DocumentNode<LearnProgressQuery, LearnProgressQueryVariables>;
export const RecordSlideViewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordSlideView"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slideIndex"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordSlideView"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sectionId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sectionId"}}},{"kind":"Argument","name":{"kind":"Name","value":"slideIndex"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slideIndex"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sectionId"}},{"kind":"Field","name":{"kind":"Name","value":"viewedSlides"}}]}}]}}]} as unknown as DocumentNode<RecordSlideViewMutation, RecordSlideViewMutationVariables>;
export const MergeLearnProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MergeLearnProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"progress"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LearnSectionProgressInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mergeLearnProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"progress"},"value":{"kind":"Variable","name":{"kind":"Name","value":"progress"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sectionId"}},{"kind":"Field","name":{"kind":"Name","value":"viewedSlides"}}]}}]}}]} as unknown as DocumentNode<MergeLearnProgressMutation, MergeLearnProgressMutationVariables>;
export const ResetLearnProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetLearnProgress"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetLearnProgress"}}]}}]} as unknown as DocumentNode<ResetLearnProgressMutation, ResetLearnProgressMutationVariables>;
export const TravelImagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TravelImages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"count"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"driver"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Driver"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"travelImages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"count"},"value":{"kind":"Variable","name":{"kind":"Name","value":"count"}}},{"kind":"Argument","name":{"kind":"Name","value":"driver"},"value":{"kind":"Variable","name":{"kind":"Name","value":"driver"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"attribution"}},{"kind":"Field","name":{"kind":"Name","value":"photographerName"}},{"kind":"Field","name":{"kind":"Name","value":"photographerUrl"}},{"kind":"Field","name":{"kind":"Name","value":"unsplashUrl"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"color"}},{"kind":"Field","name":{"kind":"Name","value":"downloadLocation"}},{"kind":"Field","name":{"kind":"Name","value":"country"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<TravelImagesQuery, TravelImagesQueryVariables>;
export const SubmitFeedbackDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitFeedback"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"interactions"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"InteractionInput"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitFeedback"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"interactions"},"value":{"kind":"Variable","name":{"kind":"Name","value":"interactions"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>;
export const TrackPhotoUseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"TrackPhotoUse"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"downloadLocation"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trackPhotoUse"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"downloadLocation"},"value":{"kind":"Variable","name":{"kind":"Name","value":"downloadLocation"}}}]}]}}]} as unknown as DocumentNode<TrackPhotoUseMutation, TrackPhotoUseMutationVariables>;
export const DossierDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Dossier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dossier"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalInteractions"}},{"kind":"Field","name":{"kind":"Name","value":"likes"}},{"kind":"Field","name":{"kind":"Name","value":"dislikes"}},{"kind":"Field","name":{"kind":"Name","value":"skips"}},{"kind":"Field","name":{"kind":"Name","value":"avgDwellMs"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}},{"kind":"Field","name":{"kind":"Name","value":"exploration"}},{"kind":"Field","name":{"kind":"Name","value":"disclaimer"}},{"kind":"Field","name":{"kind":"Name","value":"inferredTraits"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"trait"}},{"kind":"Field","name":{"kind":"Name","value":"confidence"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topFeatures"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}}]}}]}}]} as unknown as DocumentNode<DossierQuery, DossierQueryVariables>;