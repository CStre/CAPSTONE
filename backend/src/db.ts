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
