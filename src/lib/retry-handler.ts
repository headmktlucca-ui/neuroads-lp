/**
 * Retry handler with exponential backoff
 * Useful for API calls that might fail due to temporary issues
 */

type RetryOptions = {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: Error, delayMs: number) => void;
};

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  onRetry: () => {},
};

/**
 * Executes a function with exponential backoff retry logic
 * @param fn - Async function to retry
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Error if all attempts fail
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      lastError = err;

      // Don't retry if this is the last attempt
      if (attempt === config.maxAttempts) {
        throw err;
      }

      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelayMs
      );

      config.onRetry(attempt, err, delayMs);
      console.warn(
        `Attempt ${attempt}/${config.maxAttempts} failed: ${err.message}. ` +
        `Retrying in ${delayMs}ms...`
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  // This should never happen, but TypeScript needs it
  throw lastError || new Error('Unknown retry error');
}

/**
 * Retry configuration presets for common scenarios
 */
export const RETRY_PRESETS = {
  // For network calls to external APIs (Meta, Google, LinkedIn)
  api: {
    maxAttempts: 3,
    initialDelayMs: 500,
    maxDelayMs: 5000,
    backoffMultiplier: 2,
  },

  // For database operations (Firestore)
  database: {
    maxAttempts: 2,
    initialDelayMs: 100,
    maxDelayMs: 500,
    backoffMultiplier: 2,
  },

  // For aggressive retries on critical operations
  critical: {
    maxAttempts: 5,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    backoffMultiplier: 1.5,
  },

  // No retry (fail fast)
  noRetry: {
    maxAttempts: 1,
  },
} as const;

/**
 * Retry specific HTTP/fetch errors that are likely transient
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('econnrefused') || message.includes('econnreset')) return true;
  if (message.includes('timeout') || message.includes('timed out')) return true;
  if (message.includes('socket hang up')) return true;

  // HTTP 5xx (server errors - transient)
  if (message.includes('500') || message.includes('502') || message.includes('503')) return true;
  if (message.includes('504')) return true; // Gateway timeout

  // Rate limiting (429)
  if (message.includes('429')) return true;

  // Temporary Meta/Google errors
  if (message.includes('temporarily unavailable')) return true;
  if (message.includes('service unavailable')) return true;

  return false;
}

/**
 * Wrapper for API fetch calls with automatic retry on transient errors
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  options?: RetryOptions
): Promise<Response> {
  return withRetry(
    () => fetch(input, init),
    {
      ...RETRY_PRESETS.api,
      ...options,
      // Only retry if error is transient
      onRetry: (attempt, error, delayMs) => {
        if (!isRetryableError(error)) {
          throw error; // Don't retry permanent errors
        }
        options?.onRetry?.(attempt, error, delayMs);
      },
    }
  );
}
