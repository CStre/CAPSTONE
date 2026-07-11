/**
 * @fileoverview At-a-glance progress for a running `build:photos` job (Step A).
 *
 * Reads the checkpointed `photos.json` (written after every country) and reports how
 * far through the 228-country catalog the run is, how many photos/tags landed, whether
 * the background job is still alive, and the last few log lines.
 *
 *   npm run photos:progress
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { COUNTRIES } from '../src/countries';
import type { CachedPhoto } from '../src/photos.types';

const cwd = process.cwd();
const POOL = join(cwd, 'photos.json');
const LOG = join(cwd, 'photos-build.log');
const PID = join(cwd, '.photos-build.pid');

function readPool(): Record<string, CachedPhoto[]> {
  if (!existsSync(POOL)) return {};
  try {
    return JSON.parse(readFileSync(POOL, 'utf8')) as Record<string, CachedPhoto[]>;
  } catch {
    return {};
  }
}

function isRunning(): boolean {
  if (!existsSync(PID)) return false;
  const pid = Number(readFileSync(PID, 'utf8').trim());
  try {
    process.kill(pid, 0); // signal 0 = existence check, doesn't kill
    return true;
  } catch {
    return false;
  }
}

const pool = readPool();
const done = Object.keys(pool).length;
const total = COUNTRIES.length;
const photos = Object.values(pool).flat();
const tagged = photos.filter((p) => p.tags.length > 0).length;
const geotagged = photos.filter((p) => p.locationName).length;
const pct = total > 0 ? Math.round((done / total) * 100) : 0;
const remaining = total - done;
const etaHrs = ((remaining * 20) / 60).toFixed(1); // ~20 min/country

console.log(`\n  Photo pool build — ${isRunning() ? '🟢 running' : '⚪️ not running'}`);
console.log(`  ${'─'.repeat(46)}`);
console.log(`  Countries : ${String(done)} / ${String(total)}  (${String(pct)}%)`);
console.log(
  `  Photos    : ${String(photos.length)}  (${String(tagged)} tagged, ${String(geotagged)} geotagged)`,
);
if (remaining > 0 && isRunning())
  console.log(`  ETA       : ~${etaHrs} h for the remaining ${String(remaining)}`);
if (!existsSync(POOL))
  console.log(`  (photos.json not written yet — first country still enriching)`);

if (existsSync(LOG)) {
  const lines = readFileSync(LOG, 'utf8')
    .split('\n')
    .filter((l) => /kept|Rate limit|Wrote|failed/.test(l))
    .slice(-5);
  if (lines.length > 0) {
    console.log(`\n  Recent:`);
    for (const l of lines) console.log(`    ${l}`);
  }
}
console.log('');
