/**
 * @fileoverview Publishes the photo pool to S3 — Step B.
 *
 * Reads the generated `photos.json`, downloads each photo from Unsplash's image CDN
 * (a plain file fetch — NOT the rate-limited API), then uploads BOTH the image
 * binaries (`photos/<id>.jpg`) AND the metadata (`photos.json`) to the shared photos
 * bucket via `aws s3`. Fast and bandwidth-bound (~15–30 min), not the ~9 h Step A takes.
 *
 * The Lambda loads `photos.json` from this bucket at runtime (`pool.ts`), so the
 * metadata is never bundled into the code — regenerate + re-sync, no code deploy.
 *
 * Downloads are **resumable**: files already in the local cache are skipped, so an
 * interrupted run just re-runs. Uploading uses the AWS CLI (already required for
 * deploys) so the Lambda bundle gains no new SDK dependency.
 *
 *   PHOTO_S3_BUCKET=bba-photos npm run sync:photos        # download + upload (images + json)
 *   npm run sync:photos                                   # download only; prints the upload cmds
 *
 * Runtime ToS: we do NOT trigger Unsplash download pings here — that happens at
 * runtime (`trackPhotoUse`) when a user actually likes a photo.
 *
 * NB: this script intentionally does NOT load `.env` — the `aws` CLI resolves its own
 * credentials (profile / SSO / real env vars), and `backend/.env` holds dummy
 * DynamoDB-Local creds that would break a real S3 upload. Pass `PHOTO_S3_BUCKET` inline.
 */
import { execFileSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { join } from 'node:path';
import type { CachedPhoto } from '../src/photos.types';

const POOL_PATH = join(import.meta.dirname, '..', 'photos.json');
const CACHE_DIR = join(import.meta.dirname, '..', 'photos-cache');
const BUCKET = process.env.PHOTO_S3_BUCKET;

/** Load the generated metadata; {} if Step A has not run. */
function loadPool(): Record<string, CachedPhoto[]> {
  try {
    return JSON.parse(readFileSync(POOL_PATH, 'utf8')) as Record<string, CachedPhoto[]>;
  } catch {
    return {};
  }
}
/** Concurrent downloads — the CDN is happy with a modest fan-out. */
const CONCURRENCY = Number(process.env.PHOTO_SYNC_CONCURRENCY ?? 12);

/** Download one photo to the cache, skipping if already present (resumable). */
async function download(photo: CachedPhoto): Promise<'downloaded' | 'skipped' | 'failed'> {
  const dest = join(CACHE_DIR, `${photo.id}.jpg`);
  if (existsSync(dest)) return 'skipped';
  try {
    const res = await fetch(photo.unsplashImageUrl);
    if (!res.ok || !res.body) throw new Error(`HTTP ${String(res.status)}`);
    await pipeline(
      Readable.fromWeb(res.body as Parameters<typeof Readable.fromWeb>[0]),
      createWriteStream(dest),
    );
    return 'downloaded';
  } catch (err) {
    console.error(`${photo.id}: download failed — ${(err as Error).message}`);
    return 'failed';
  }
}

/** Run tasks with a bounded worker pool. */
async function pool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let idx = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (idx < items.length) {
      const item = items[idx++];
      if (item !== undefined) await worker(item);
    }
  });
  await Promise.all(runners);
}

async function main(): Promise<void> {
  const photos = Object.values(loadPool()).flat();
  if (photos.length === 0) {
    console.error('photos.json is empty/missing — run `npm run build:photos` (Step A) first.');
    process.exit(1);
  }

  mkdirSync(CACHE_DIR, { recursive: true });
  const counts = { downloaded: 0, skipped: 0, failed: 0 };
  await pool(photos, CONCURRENCY, async (photo) => {
    counts[await download(photo)]++;
  });
  const onDisk = readdirSync(CACHE_DIR).filter((f) => f.endsWith('.jpg')).length;
  console.log(
    `Downloaded ${String(counts.downloaded)}, skipped ${String(counts.skipped)}, ` +
      `failed ${String(counts.failed)} — ${String(onDisk)} files in ${CACHE_DIR}`,
  );

  const bucket = BUCKET ?? '<bucket>';
  // Images: immutable, id-addressed → cache hard. Metadata: mutable → no long cache.
  const imagesArgs = [
    's3',
    'sync',
    CACHE_DIR,
    `s3://${bucket}/photos/`,
    '--content-type',
    'image/jpeg',
    '--cache-control',
    'public,max-age=31536000,immutable',
  ];
  const jsonArgs = [
    's3',
    'cp',
    POOL_PATH,
    `s3://${bucket}/photos.json`,
    '--content-type',
    'application/json',
    '--cache-control',
    'no-cache',
  ];
  if (!BUCKET) {
    console.log(
      `\nTo upload, set PHOTO_S3_BUCKET and re-run, or run:\n` +
        `  aws ${imagesArgs.join(' ')}\n  aws ${jsonArgs.join(' ')}`,
    );
    return;
  }
  console.log(`\nUploading images to s3://${BUCKET}/photos/ …`);
  execFileSync('aws', imagesArgs, { stdio: 'inherit' });
  console.log(`Uploading metadata to s3://${BUCKET}/photos.json …`);
  execFileSync('aws', jsonArgs, { stdio: 'inherit' });
  console.log('Done.');
}

void main();
