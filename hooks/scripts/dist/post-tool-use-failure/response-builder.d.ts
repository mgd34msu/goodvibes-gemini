/**
 * Response Builder for Post Tool Use Failure
 *
 * Builds structured response messages for the fix loop with phase info,
 * suggestions, research hints, and warnings.
 */
import type { RecoveryPattern } from './recovery-types.js';
import type { ErrorCategory, ErrorState } from '../types/errors.js';
/**
 * Build research hints message based on phase.
 *
 * @param hints - Object with official and community hints
 * @param phase - Current fix loop phase (1, 2, or 3)
 * @returns Formatted research hints string, or empty string for phase 1
 */
export declare function buildResearchHintsMessage(hints: {
    official: string[];
    community: string[];
}, phase: 1 | 2 | 3): string;
/**
 * Build complete fix loop response message.
 *
 * @param options - Response building options
 * @returns Complete formatted response string
 */
export declare function buildFixLoopResponse(options: {
    errorState: ErrorState;
    retryCount: number;
    pattern: RecoveryPattern | null;
    category: ErrorCategory;
    suggestedFix: string;
    researchHints: string;
    exhausted: boolean;
}): Promise<string>;
