/**
 * Settings Injection
 *
 * Manages the injection of GoodVibes hooks into the project's .gemini/settings.json.
 * Creates or updates the settings file to include SubagentStart and SubagentStop hooks
 * pointing to the plugin's hook scripts.
 *
 * @module session-start/settings-injection
 */
/** Structure for a single hook entry */
interface HookEntry {
    type: string;
    command: string;
    timeout?: number;
}
/** Structure for a matcher with its hooks */
interface HookMatcher {
    matcher: string;
    hooks: HookEntry[];
}
/** Structure for Gemini settings hooks section */
interface GeminiHooks {
    SubagentStart?: HookMatcher[];
    SubagentStop?: HookMatcher[];
    [key: string]: HookMatcher[] | undefined;
}
/** Structure for .gemini/settings.json */
interface GeminiSettings {
    hooks?: GeminiHooks;
    [key: string]: unknown;
}
/** Result of the settings injection operation */
export interface SettingsInjectionResult {
    /** Whether the operation succeeded */
    success: boolean;
    /** Whether the settings file was created (vs updated) */
    created: boolean;
    /** Whether hooks were added (false if already present) */
    hooksAdded: boolean;
    /** Error message if operation failed */
    error?: string;
}
/**
 * Gets the plugin root directory from the hook script's location.
 * The hook scripts are at: {pluginRoot}/hooks/scripts/dist/
 * So we go up 3 levels from dist to get the plugin root.
 *
 * @returns The absolute path to the plugin root directory
 */
export declare function getPluginRoot(): string;
/**
 * Creates the SubagentStart hook command using the plugin root path.
 *
 * @param pluginRoot - The path to the plugin root directory
 * @returns The command string for the SubagentStart hook
 */
export declare function createSubagentStartCommand(pluginRoot: string): string;
/**
 * Creates the SubagentStop hook command using the plugin root path.
 *
 * @param pluginRoot - The path to the plugin root directory
 * @returns The command string for the SubagentStop hook
 */
export declare function createSubagentStopCommand(pluginRoot: string): string;
/**
 * Creates the default GoodVibes SubagentStart hook configuration.
 *
 * @param pluginRoot - The path to the plugin root directory
 * @returns The hook matcher configuration for SubagentStart
 */
export declare function createGoodVibesHook(pluginRoot: string): HookMatcher;
/**
 * Creates the default GoodVibes SubagentStop hook configuration.
 *
 * @param pluginRoot - The path to the plugin root directory
 * @returns The hook matcher configuration for SubagentStop
 */
export declare function createSubagentStopHook(pluginRoot: string): HookMatcher;
/**
 * Checks if the GoodVibes SubagentStart hook is already present in the hooks array.
 *
 * @param hooks - Array of existing hook matchers
 * @param pluginRoot - The plugin root path to check against
 * @returns True if our hook is already present
 */
export declare function isGoodVibesHookPresent(hooks: HookMatcher[], pluginRoot: string): boolean;
/**
 * Checks if the GoodVibes SubagentStop hook is already present in the hooks array.
 *
 * @param hooks - Array of existing hook matchers
 * @param pluginRoot - The plugin root path to check against
 * @returns True if our hook is already present
 */
export declare function isSubagentStopHookPresent(hooks: HookMatcher[], pluginRoot: string): boolean;
/**
 * Safely parses JSON with error handling.
 *
 * @param content - The JSON string to parse
 * @returns The parsed object or null if parsing failed
 */
export declare function safeParseJson(content: string): GeminiSettings | null;
/**
 * Merges GoodVibes hooks into existing settings without overwriting user hooks.
 * Injects both SubagentStart and SubagentStop hooks.
 *
 * @param settings - The existing settings object
 * @param pluginRoot - The plugin root path
 * @returns Object with merged settings and whether hooks were added
 */
export declare function mergeHooks(settings: GeminiSettings, pluginRoot: string): {
    settings: GeminiSettings;
    hooksAdded: boolean;
};
/**
 * Creates the default settings object with GoodVibes hooks.
 *
 * @param pluginRoot - The plugin root path
 * @returns A new settings object with SubagentStart and SubagentStop hooks configured
 */
export declare function createDefaultSettings(pluginRoot: string): GeminiSettings;
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
export declare function injectSettings(cwd: string, pluginRootOverride?: string): Promise<SettingsInjectionResult>;
export {};
