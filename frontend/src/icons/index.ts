/**
 * @fileoverview Icon folder barrel — the single import surface for icons.
 *
 * Import the wrapper and the registry from here:
 *   `import { LordIcon, ICONS } from '.../icons';`
 *
 * `ICONS` aggregates the per-page registries (header, home, auth, account,
 * learn, sources, travel, notFound) plus `shared`, so every key remains
 * accessible as a flat `ICONS.<name>`. The underlying JSON files live in
 * `public/icons/<Page>/` (and `public/icons/shared/`), mirroring this split.
 */
export { LordIcon, useLordIconColors } from './LordIcon';

import { SHARED_ICONS } from './shared';
import { HEADER_ICONS } from './header';
import { HOME_ICONS } from './home';
import { AUTH_ICONS } from './auth';
import { ACCOUNT_ICONS } from './account';
import { LEARN_ICONS } from './learn';
import { SOURCES_ICONS } from './sources';
import { TRAVEL_ICONS } from './travel';
import { NOT_FOUND_ICONS } from './notFound';

export {
  SHARED_ICONS,
  HEADER_ICONS,
  HOME_ICONS,
  AUTH_ICONS,
  ACCOUNT_ICONS,
  LEARN_ICONS,
  SOURCES_ICONS,
  TRAVEL_ICONS,
  NOT_FOUND_ICONS,
};

/** Flat, theme-agnostic map of every icon name → its public JSON path. */
export const ICONS = {
  ...SHARED_ICONS,
  ...HEADER_ICONS,
  ...HOME_ICONS,
  ...AUTH_ICONS,
  ...ACCOUNT_ICONS,
  ...LEARN_ICONS,
  ...SOURCES_ICONS,
  ...TRAVEL_ICONS,
  ...NOT_FOUND_ICONS,
} as const;
