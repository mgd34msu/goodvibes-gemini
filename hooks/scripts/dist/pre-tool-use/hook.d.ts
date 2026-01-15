/**
 * Pre-Tool-Use Hook (GoodVibes)
 *
 * Main router/dispatcher for pre-tool-use validations.
 *
 * Validates prerequisites before tool execution:
 * - Bash tool: Git command detection and quality gates
 * - MCP tools: Resource availability checks
 *
 * Quality Gates (for git commit):
 * - TypeScript check (tsc --noEmit)
 * - ESLint check with auto-fix
 * - Prettier check with auto-fix
 * - Test runner (if enabled)
 *
 * Git Guards:
 * - Branch protection (prevent force push to main)
 * - Merge readiness checks
 */
/**
 * Main entry point for pre-tool-use hook.
 * Validates tool prerequisites and runs quality gates.
 *
 * @returns Promise that resolves when the hook completes
 */
export declare function runPreToolUseHook(): Promise<void>;
