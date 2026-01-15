/**
 * Constants
 *
 * Environment constants and package manager lockfile definitions.
 */

import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Package manager lockfiles for detection.
 * Used to identify which package manager a project uses (pnpm, yarn, npm, or bun).
 */
export const LOCKFILES = [
  'pnpm-lock.yaml',
  'yarn.lock',
  'package-lock.json',
  'bun.lockb',
] as const;

/**
 * Root directory of the GoodVibes extension.
 * Resolves relative to this compiled file (dist/shared/constants.js) -> ../../..
 */
export const PLUGIN_ROOT =
  process.env.GEMINI_PLUGIN_ROOT || path.resolve(__dirname, '../../../');

/**
 * Root directory of the user's project.
 * Defaults to current working directory.
 */
export const PROJECT_ROOT = process.env.GEMINI_PROJECT_DIR || process.cwd();

/**
 * Cache directory for temporary plugin data.
 * Located at PLUGIN_ROOT/.cache for storing analytics and other ephemeral data.
 */
export const CACHE_DIR = path.join(PLUGIN_ROOT, '.cache');

/**
 * Path to the analytics JSON file.
 * Stores session analytics data including tool usage and skill recommendations.
 */
export const ANALYTICS_FILE = path.join(CACHE_DIR, 'analytics.json');
