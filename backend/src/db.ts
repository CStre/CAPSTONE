/**
 * @fileoverview DynamoDB data access for per-user preference maps.
 *
 * Table `bba-prefs`: partition key `userId` (the Cognito `sub`), attribute
 * `preferences` (a Map of countryCode -> 0..100, stored sparsely), `createdAt`.
 * Updates are targeted per country — never a whole-map overwrite.
 */
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { config } from './config';
import type { PreferenceMap } from './algorithm';

const client = new DynamoDBClient({
  region: config.awsRegion,
  ...(config.dynamoEndpoint ? { endpoint: config.dynamoEndpoint } : {}),
});

const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

/** Fetch a user's stored preference map (empty object if the user has no record). */
export async function getPreferences(userId: string): Promise<PreferenceMap> {
  const res = await doc.send(new GetCommand({ TableName: config.dynamoTable, Key: { userId } }));
  return (res.Item?.preferences as PreferenceMap | undefined) ?? {};
}

/** Persist changed country values with a targeted update — no whole-map overwrite. */
export async function persistPreferences(userId: string, changed: PreferenceMap): Promise<void> {
  const entries = Object.entries(changed);
  if (entries.length === 0) return;

  // Step 1 — ensure the item and its `preferences` map exist, without touching any
  // values already stored.
  await doc.send(
    new UpdateCommand({
      TableName: config.dynamoTable,
      Key: { userId },
      UpdateExpression:
        'SET preferences = if_not_exists(preferences, :empty), createdAt = if_not_exists(createdAt, :now)',
      ExpressionAttributeValues: { ':empty': {}, ':now': new Date().toISOString() },
    }),
  );

  // Step 2 — set just the countries that changed.
  const names: Record<string, string> = {};
  const values: Record<string, number> = {};
  const assignments = entries.map(([code, value], i) => {
    names[`#c${i}`] = code;
    values[`:v${i}`] = value;
    return `preferences.#c${i} = :v${i}`;
  });
  await doc.send(
    new UpdateCommand({
      TableName: config.dynamoTable,
      Key: { userId },
      UpdateExpression: `SET ${assignments.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    }),
  );
}

/**
 * Learn-page progress: a Map of `sectionId -> sorted list of viewed slide
 * indices`, stored on the same user item as `learnProgress`. Stored sparsely —
 * only sections the user has touched appear. The frontend derives completion
 * from its own slide counts; the backend only records which slides were viewed.
 */
export type LearnProgressMap = Record<string, number[]>;

/** Fetch a user's learn-progress map (empty object if none). */
export async function getLearnProgress(userId: string): Promise<LearnProgressMap> {
  const res = await doc.send(new GetCommand({ TableName: config.dynamoTable, Key: { userId } }));
  return (res.Item?.learnProgress as LearnProgressMap | undefined) ?? {};
}

/**
 * Record that a slide was viewed (idempotent). Read-modify-write: small maps and
 * single-user writes make this simpler and clearer than a conditional ADD; the
 * returned map reflects the new state.
 */
export async function recordLearnSlideView(
  userId: string,
  sectionId: string,
  slideIndex: number,
): Promise<LearnProgressMap> {
  const current = await getLearnProgress(userId);
  const seen = current[sectionId] ?? [];
  if (seen.includes(slideIndex)) return current;

  const updated = [...seen, slideIndex].sort((a, b) => a - b);
  const next: LearnProgressMap = { ...current, [sectionId]: updated };

  // Step 1 — ensure the item and its `learnProgress` map exist (mirrors persistPreferences).
  await doc.send(
    new UpdateCommand({
      TableName: config.dynamoTable,
      Key: { userId },
      UpdateExpression:
        'SET learnProgress = if_not_exists(learnProgress, :empty), createdAt = if_not_exists(createdAt, :now)',
      ExpressionAttributeValues: { ':empty': {}, ':now': new Date().toISOString() },
    }),
  );
  // Step 2 — set just this section's list.
  await doc.send(
    new UpdateCommand({
      TableName: config.dynamoTable,
      Key: { userId },
      UpdateExpression: 'SET learnProgress.#s = :arr',
      ExpressionAttributeNames: { '#s': sectionId },
      ExpressionAttributeValues: { ':arr': updated },
    }),
  );
  return next;
}

/**
 * Merge a batch of client-side progress into the stored map (union per section)
 * and return the full updated map. Used on sign-in to reconcile progress recorded
 * while signed out with whatever the account already holds — a single write
 * instead of one call per slide.
 */
export async function mergeLearnProgress(
  userId: string,
  incoming: LearnProgressMap,
): Promise<LearnProgressMap> {
  const current = await getLearnProgress(userId);

  // Union each incoming section's slides with what's stored; track which changed.
  const merged: LearnProgressMap = { ...current };
  const changed: LearnProgressMap = {};
  for (const [sectionId, slides] of Object.entries(incoming)) {
    const union = new Set([...(current[sectionId] ?? []), ...slides]);
    const sorted = [...union].sort((a, b) => a - b);
    if (sorted.length !== (current[sectionId]?.length ?? 0)) {
      merged[sectionId] = sorted;
      changed[sectionId] = sorted;
    }
  }

  const entries = Object.entries(changed);
  if (entries.length === 0) return merged;

  // Step 1 — ensure the item and its `learnProgress` map exist.
  await doc.send(
    new UpdateCommand({
      TableName: config.dynamoTable,
      Key: { userId },
      UpdateExpression:
        'SET learnProgress = if_not_exists(learnProgress, :empty), createdAt = if_not_exists(createdAt, :now)',
      ExpressionAttributeValues: { ':empty': {}, ':now': new Date().toISOString() },
    }),
  );
  // Step 2 — set just the sections that gained slides.
  const names: Record<string, string> = {};
  const values: Record<string, number[]> = {};
  const assignments = entries.map(([sectionId, slides], i) => {
    names[`#s${i}`] = sectionId;
    values[`:v${i}`] = slides;
    return `learnProgress.#s${i} = :v${i}`;
  });
  await doc.send(
    new UpdateCommand({
      TableName: config.dynamoTable,
      Key: { userId },
      UpdateExpression: `SET ${assignments.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
    }),
  );
  return merged;
}

/** Clear a user's learn-progress map (leaves preferences and the item intact). */
export async function resetLearnProgress(userId: string): Promise<void> {
  await doc.send(
    new UpdateCommand({
      TableName: config.dynamoTable,
      Key: { userId },
      UpdateExpression: 'REMOVE learnProgress',
    }),
  );
}

/** Delete a user's record entirely (used by the deleteAccount mutation). */
export async function deletePreferences(userId: string): Promise<void> {
  await doc.send(new DeleteCommand({ TableName: config.dynamoTable, Key: { userId } }));
}

/** Create the local DynamoDB table if it does not exist — a dev-only convenience. */
export async function ensureLocalTable(): Promise<void> {
  try {
    await client.send(new DescribeTableCommand({ TableName: config.dynamoTable }));
    return; // already exists
  } catch (err) {
    if ((err as Error).name !== 'ResourceNotFoundException') throw err;
  }
  await client.send(
    new CreateTableCommand({
      TableName: config.dynamoTable,
      BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [{ AttributeName: 'userId', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    }),
  );
  await waitUntilTableExists({ client, maxWaitTime: 20 }, { TableName: config.dynamoTable });
}
