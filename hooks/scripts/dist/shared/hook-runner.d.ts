/**
 * Shared Hook Runner
 *
 * Provides common boilerplate for hook entry points:
 * - Input reading from stdin
 * - Error handling patterns
 * - Main module detection
 * - Response output
 *
 * Usage:
 * ```ts
 * import { runHook, isMainModule } from './shared/hook-runner.js';
 *
 * async function myHookHandler(input: HookInput): Promise<HookResponse> {
 *   // Hook logic here
 *   return { continue: true };
 * }
 *
 * if (isMainModule(import.meta.url)) {
 *   runHook('MyHook', myHookHandler);
 * }
 * ```
 */
import { createResponse } from './hook-io.js';
import { debug, logError } from './logging.js';
import type { HookInput, HookResponse, CreateResponseOptions } from './hook-io.js';
/**
 * Hook handler function type.
 * Receives parsed input and returns a response.
 */
export type HookHandler<TResponse extends HookResponse = HookResponse> = (_input: HookInput) => Promise<TResponse>;
/**
 * Options for the hook runner.
 */
export interface RunHookOptions {
    /**
     * Custom error response creator.
     * Default creates a response with systemMessage containing the error.
     */
    onError?: (_error: unknown) => HookResponse;
    /**
     * Whether to catch uncaught promise rejections.
     * Default: true
     */
    catchUncaught?: boolean;
}
/**
 * Check if the current module is the main entry point.
 *
 * @param importMetaUrl - The import.meta.url of the calling module
 * @returns True if this is the main module being executed
 *
 * @example
 * ```ts
 * if (isMainModule(import.meta.url)) {
 *   runHook('MyHook', handler);
 * }
 * ```
 */
export declare function isMainModule(importMetaUrl: string): boolean;
/**
 * Run a hook with standard error handling and input/output.
 *
 * This function:
 * 1. Reads input from stdin using readHookInput()
 * 2. Calls the handler with the parsed input
 * 3. Sends the response using respond()
 * 4. Handles any errors with logging and error response
 *
 * @param hookName - Name of the hook for logging
 * @param handler - The hook handler function
 * @param options - Optional configuration
 *
 * @example
 * ```ts
 * async function handleNotification(input: HookInput): Promise<HookResponse> {
 *   debug('Processing notification', { session_id: input.session_id });
 *   return createResponse();
 * }
 *
 * runHook('Notification', handleNotification);
 * ```
 */
export declare function runHook<TResponse extends HookResponse = HookResponse>(hookName: string, handler: HookHandler<TResponse>, options?: RunHookOptions): Promise<void>;
/**
 * Run a hook synchronously (no uncaught handler).
 * Use this when you need to await the hook completion.
 *
 * @param hookName - Name of the hook for logging
 * @param handler - The hook handler function
 * @param options - Optional configuration (catchUncaught is ignored)
 */
export declare function runHookSync<TResponse extends HookResponse = HookResponse>(hookName: string, handler: HookHandler<TResponse>, options?: Omit<RunHookOptions, 'catchUncaught'>): Promise<void>;
/** Re-export of commonly used types and functions for hook development convenience */
export type { HookInput, HookResponse, CreateResponseOptions };
export { createResponse, debug, logError };
