/**
 * State persistence operations - loading and saving state to disk.
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureGoodVibesDir, fileExists } from '../shared/index.js';
import { debug } from '../shared/logging.js';
import { createDefaultState } from '../types/state.js';
/** Relative path to the state file within .goodvibes directory. */
const STATE_FILE = 'state/hooks-state.json';
/**
 * Loads hook state from disk, returning defaults if not found.
 *
 * Reads the persisted hooks state from the .goodvibes/state directory.
 * If the file doesn't exist or is corrupted, returns a fresh default state.
 *
 * @param cwd - The current working directory (project root)
 * @param options - Optional configuration for error handling
 * @returns Promise resolving to the loaded HooksState or default state
 *
 * @example
 * const state = await loadState('/path/to/project');
 * debug(state.session.id);
 *
 * @example
 * // Throw errors instead of using defaults
 * try {
 *   const state = await loadState('/path/to/project', { throwOnError: true });
 * } catch (error) {
 *   logError('Failed to load state:', error);
 * }
 */
export async function loadState(cwd, options = {}) {
    const { throwOnError = false } = options;
    const goodvibesDir = path.join(cwd, '.goodvibes');
    const statePath = path.join(goodvibesDir, STATE_FILE);
    if (!(await fileExists(statePath))) {
        return createDefaultState();
    }
    try {
        const content = await fs.readFile(statePath, 'utf-8');
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object' && parsed !== null && 'session' in parsed) {
            return parsed;
        }
        return createDefaultState();
    }
    catch (error) {
        debug('Failed to load state, using defaults', error);
        if (throwOnError) {
            throw error;
        }
        return createDefaultState();
    }
}
/**
 * Persists hook state to disk with atomic write.
 *
 * Saves the hooks state to disk using an atomic write pattern (write to temp file,
 * then rename) to prevent corruption from interrupted writes.
 *
 * @param cwd - The current working directory (project root)
 * @param state - The HooksState object to persist
 * @param options - Optional configuration for error handling
 * @returns Promise that resolves when the state is saved
 *
 * @example
 * const state = await loadState(cwd);
 * state.session.id = 'new-session-id';
 * await saveState(cwd, state);
 *
 * @example
 * // Throw errors instead of swallowing them
 * try {
 *   await saveState(cwd, state, { throwOnError: true });
 * } catch (error) {
 *   logError('Failed to save state:', error);
 * }
 */
export async function saveState(cwd, state, options = {}) {
    const { throwOnError = false } = options;
    await ensureGoodVibesDir(cwd);
    const statePath = path.join(cwd, '.goodvibes', STATE_FILE);
    // Ensure state directory exists
    const stateDir = path.dirname(statePath);
    if (!(await fileExists(stateDir))) {
        await fs.mkdir(stateDir, { recursive: true });
    }
    try {
        // Atomic write: write to temp file, then rename
        const tempPath = statePath + '.tmp';
        await fs.writeFile(tempPath, JSON.stringify(state, null, 2));
        await fs.rename(tempPath, statePath);
    }
    catch (error) {
        debug('Failed to save state', error);
        if (throwOnError) {
            throw error;
        }
    }
}
