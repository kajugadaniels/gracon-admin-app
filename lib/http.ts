// Shared helpers for translating axios-style failures into admin-friendly copy.

/**
 * Extracts an HTTP status code from an unknown error object.
 *
 * @param error Unknown thrown value.
 * @returns Numeric HTTP status or 0 when unavailable.
 */
export function getErrorStatus(error: unknown): number {
    if (typeof error !== 'object' || !error) {
        return 0;
    }

    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) {
        return 0;
    }

    const status = Reflect.get(response, 'status');
    return typeof status === 'number' ? status : 0;
}

/**
 * Extracts the backend message field from an unknown error object.
 *
 * @param error Unknown thrown value.
 * @param fallback Fallback copy.
 * @returns Human-readable error message.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error !== 'object' || !error) {
        return fallback;
    }

    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) {
        return fallback;
    }

    const data = Reflect.get(response, 'data');
    if (typeof data !== 'object' || !data) {
        return fallback;
    }

    const message = Reflect.get(data, 'message');
    return typeof message === 'string' ? message : fallback;
}

/**
 * Maps common admin dashboard HTTP failures to user-facing copy.
 *
 * @param error Unknown thrown value.
 * @param fallback Default message.
 * @returns Stable UI message for the page or toast.
 */
export function getFriendlyErrorMessage(
    error: unknown,
    fallback: string,
): string {
    const status = getErrorStatus(error);

    if (status === 401) {
        return 'Your admin session expired. Redirecting to login.';
    }

    if (status === 403) {
        return 'You do not have permission to perform this action.';
    }

    if (status === 404) {
        return getErrorMessage(error, 'The requested record was not found.');
    }

    if (status === 429) {
        return 'Rate limit reached. Please wait a moment and try again.';
    }

    if (status >= 500) {
        return 'The service is temporarily unavailable. Please retry.';
    }

    return getErrorMessage(error, fallback);
}
