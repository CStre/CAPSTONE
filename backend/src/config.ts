/**
 * @fileoverview Central environment configuration.
 *
 * Local dev reads these from a `.env` file (loaded in dev.ts). In AWS they are
 * injected as Lambda environment variables, sourced from SSM Parameter Store.
 */

export interface Config {
  /** True when running outside AWS (local dev). */
  isLocal: boolean;
  /** DynamoDB table holding per-user preference maps. */
  dynamoTable: string;
  /** Optional DynamoDB endpoint override — set for DynamoDB Local. */
  dynamoEndpoint?: string;
  awsRegion: string;
  /** 'dev' bypasses Cognito and trusts a request-supplied identity. */
  authMode: 'dev' | 'cognito';
  cognitoUserPoolId?: string;
  cognitoClientId?: string;
  /** Unsplash access key; when absent, images.ts falls back to placeholders. */
  unsplashAccessKey?: string;
  /** Shared S3 bucket holding the Travel photo pool (metadata JSON + image binaries). */
  photosBucket: string;
  /** Key of the metadata JSON within `photosBucket`. */
  photosKey: string;
  /** Owner address that receives research-download notifications (empty disables them). */
  ownerEmail: string;
  /** Local dev HTTP port. */
  port: number;
}

function bool(name: string): boolean {
  return Boolean(process.env[name]);
}

export function loadConfig(): Config {
  const authMode = process.env.AUTH_MODE === 'cognito' ? 'cognito' : 'dev';

  return {
    isLocal: bool('DYNAMODB_ENDPOINT') || process.env.NODE_ENV !== 'production',
    dynamoTable: process.env.DYNAMODB_TABLE ?? 'bba-prefs-local',
    dynamoEndpoint: process.env.DYNAMODB_ENDPOINT,
    awsRegion: process.env.AWS_REGION ?? 'us-east-1',
    authMode,
    cognitoUserPoolId: process.env.COGNITO_USER_POOL_ID,
    cognitoClientId: process.env.COGNITO_CLIENT_ID,
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    photosBucket: process.env.PHOTOS_BUCKET ?? 'bba-photos',
    photosKey: process.env.PHOTOS_KEY ?? 'photos.json',
    ownerEmail: process.env.OWNER_EMAIL ?? '',
    port: Number(process.env.PORT ?? 4000),
  };
}

/** Singleton config, resolved once at module load. */
export const config: Config = loadConfig();
