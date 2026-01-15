/**
 * Settings Injection
 *
 * Manages the injection of GoodVibes hooks into the project's .gemini/settings.json.
 * Creates or updates the settings file to include SubagentStart and SubagentStop hooks
 * pointing to the plugin's hook scripts.
 *
 * @module session-start/settings-injection
 */
import * as fs from 'fs/promises';
import * as path from 'path';
import { fileExists, PLUGIN_ROOT } from '../shared/index.js';
import { debug, logError } from '../shared/logging.js';
/**
 * Gets the plugin root directory from the hook script's location.
 * The hook scripts are at: {pluginRoot}/hooks/scripts/dist/
 * So we go up 3 levels from dist to get the plugin root.
 *
 * @returns The absolute path to the plugin root directory
 */
export function getPluginRoot() {
    return PLUGIN_ROOT;
}
/**
 * Creates the SubagentStart hook command using the plugin root path.
 *
 * @param pluginRoot - The path to the plugin root directory
 * @returns The command string for the SubagentStart hook
 */
export function createSubagentStartCommand(pluginRoot) {
    const scriptPath = path.join(pluginRoot, 'hooks', 'scripts', 'dist', 'subagent-start.js');
    return `node "${scriptPath}"`;
}
/**
 * Creates the SubagentStop hook command using the plugin root path.
 *
 * @param pluginRoot - The path to the plugin root directory
 * @returns The command string for the SubagentStop hook
 */
export function createSubagentStopCommand(pluginRoot) {
    const scriptPath = path.join(pluginRoot, 'hooks', 'scripts', 'dist', 'subagent-stop.js');
    return `node "${scriptPath}"`;
}
/**
 * Creates the default GoodVibes SubagentStart hook configuration.
 *
 * @param pluginRoot - The path to the plugin root directory
 * @returns The hook matcher configuration for SubagentStart
 */
export function createGoodVibesHook(pluginRoot) {
    return {
        matcher: '*',
        hooks: [
            {
                type: 'command',
                command: createSubagentStartCommand(pluginRoot),
                timeout: 10,
            },
        ],
    };
}
/**
 * Creates the default GoodVibes SubagentStop hook configuration.
 *
 * @param pluginRoot - The path to the plugin root directory
 * @returns The hook matcher configuration for SubagentStop
 */
export function createSubagentStopHook(pluginRoot) {
    return {
        matcher: '*',
        hooks: [
            {
                type: 'command',
                command: createSubagentStopCommand(pluginRoot),
                timeout: 10,
            },
        ],
    };
}
/**
 * Checks if the GoodVibes SubagentStart hook is already present in the hooks array.
 *
 * @param hooks - Array of existing hook matchers
 * @param pluginRoot - The plugin root path to check against
 * @returns True if our hook is already present
 */
export function isGoodVibesHookPresent(hooks, pluginRoot) {
    const expectedCommand = createSubagentStartCommand(pluginRoot);
    return hooks.some((matcher) => matcher.hooks?.some((hook) => hook.command === expectedCommand));
}
/**
 * Checks if the GoodVibes SubagentStop hook is already present in the hooks array.
 *
 * @param hooks - Array of existing hook matchers
 * @param pluginRoot - The plugin root path to check against
 * @returns True if our hook is already present
 */
export function isSubagentStopHookPresent(hooks, pluginRoot) {
    const expectedCommand = createSubagentStopCommand(pluginRoot);
    return hooks.some((matcher) => matcher.hooks?.some((hook) => hook.command === expectedCommand));
}
/**
 * Safely parses JSON with error handling.
 *
 * @param content - The JSON string to parse
 * @returns The parsed object or null if parsing failed
 */
export function safeParseJson(content) {
    try {
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return parsed;
        }
        return null;
    }
    catch {
        return null;
    }
}
/**
 * Merges GoodVibes hooks into existing settings without overwriting user hooks.
 * Injects both SubagentStart and SubagentStop hooks.
 *
 * @param settings - The existing settings object
 * @param pluginRoot - The plugin root path
 * @returns Object with merged settings and whether hooks were added
 */
export function mergeHooks(settings, pluginRoot) {
    const subagentStartHook = createGoodVibesHook(pluginRoot);
    const subagentStopHook = createSubagentStopHook(pluginRoot);
    // Initialize hooks object if it doesn't exist
    settings.hooks ??= {};
    // Initialize arrays if they don't exist
    settings.hooks.SubagentStart ??= [];
    settings.hooks.SubagentStop ??= [];
    let hooksAdded = false;
    // Check and add SubagentStart hook
    if (!isGoodVibesHookPresent(settings.hooks.SubagentStart, pluginRoot)) {
        settings.hooks.SubagentStart = [
            subagentStartHook,
            ...settings.hooks.SubagentStart,
        ];
        debug('Added GoodVibes SubagentStart hook');
        hooksAdded = true;
    }
    else {
        debug('GoodVibes SubagentStart hook already present');
    }
    // Check and add SubagentStop hook
    if (!isSubagentStopHookPresent(settings.hooks.SubagentStop, pluginRoot)) {
        settings.hooks.SubagentStop = [
            subagentStopHook,
            ...settings.hooks.SubagentStop,
        ];
        debug('Added GoodVibes SubagentStop hook');
        hooksAdded = true;
    }
    else {
        debug('GoodVibes SubagentStop hook already present');
    }
    return { settings, hooksAdded };
}
/**
 * Creates the default settings object with GoodVibes hooks.
 *
 * @param pluginRoot - The plugin root path
 * @returns A new settings object with SubagentStart and SubagentStop hooks configured
 */
export function createDefaultSettings(pluginRoot) {
    return {
        hooks: {
            SubagentStart: [createGoodVibesHook(pluginRoot)],
            SubagentStop: [createSubagentStopHook(pluginRoot)],
        },
    };
}
/**
 * Injects GoodVibes hooks into the project's .gemini/settings.json.
 *
 * This function:
 * 1. Checks if .gemini/settings.json exists
 * 2. If not, creates .gemini directory and settings.json with our hooks
 * 3. If it exists, reads it and merges our hooks without overwriting user hooks
 * 4. Only adds SubagentStart/SubagentStop hooks if not already present
 *
 * @param cwd - The current working directory (project root)
 * @param pluginRootOverride - Optional override for plugin root (used in tests)
 * @returns Promise resolving to the injection result
 *
 * @example
 * const result = await injectSettings('/path/to/project');
 * if (result.success) {
 *   if (result.created) {
 *     console.log('Created new settings.json');
 *   } else if (result.hooksAdded) {
 *     console.log('Added hooks to existing settings.json');
 *   }
 * }
 */
export async function injectSettings(cwd, pluginRootOverride) {
    const pluginRoot = pluginRootOverride ?? getPluginRoot();
    const geminiDir = path.join(cwd, '.gemini');
    const settingsPath = path.join(geminiDir, 'settings.json');
    try {
        // Check if settings file exists
        const settingsExist = await fileExists(settingsPath);
        if (!settingsExist) {
            // Create .gemini directory if needed
            const geminiDirExists = await fileExists(geminiDir);
            if (!geminiDirExists) {
                await fs.mkdir(geminiDir, { recursive: true });
                debug(`Created .gemini directory at ${geminiDir}`);
            }
            // Create new settings file with our hooks
            const settings = createDefaultSettings(pluginRoot);
            await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
            debug(`Created settings.json at ${settingsPath}`);
            return { success: true, created: true, hooksAdded: true };
        }
        // Read existing settings
        const content = await fs.readFile(settingsPath, 'utf-8');
        const settings = safeParseJson(content);
        if (settings === null) {
            // Invalid JSON - log error but don't overwrite
            const errorMsg = 'Invalid JSON in settings.json, skipping hook injection';
            logError('Settings injection', new Error(errorMsg));
            return { success: false, created: false, hooksAdded: false, error: errorMsg };
        }
        // Merge our hooks
        const { settings: mergedSettings, hooksAdded } = mergeHooks(settings, pluginRoot);
        if (!hooksAdded) {
            // Hooks already present, no need to write
            return { success: true, created: false, hooksAdded: false };
        }
        // Write updated settings
        await fs.writeFile(settingsPath, JSON.stringify(mergedSettings, null, 2));
        debug(`Updated settings.json at ${settingsPath}`);
        return { success: true, created: false, hooksAdded: true };
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        logError('Settings injection', error);
        return { success: false, created: false, hooksAdded: false, error: errorMsg };
    }
}
