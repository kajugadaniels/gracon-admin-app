/**
 * Redirect helpers for admin login return paths.
 *
 * Admin login may receive a `next` query string from middleware. Keep that
 * value inside the admin app and block session-ending routes from becoming
 * post-login destinations.
 */
const DEFAULT_ADMIN_DESTINATION = '/dashboard';
const BLOCKED_ADMIN_DESTINATIONS = new Set(['/logout', '/login', '/set-password']);

function isSafeInternalAdminPath(path: string): boolean {
    if (!path.startsWith('/')) return false;
    if (path.startsWith('//')) return false;

    try {
        const parsed = new URL(path, 'http://admin.gracon360.local');
        return parsed.origin === 'http://admin.gracon360.local';
    } catch {
        return false;
    }
}

function isBlockedAdminDestination(path: string): boolean {
    try {
        const parsed = new URL(path, 'http://admin.gracon360.local');
        return BLOCKED_ADMIN_DESTINATIONS.has(parsed.pathname);
    } catch {
        return true;
    }
}

/**
 * Resolves an admin login `next` value to a safe internal admin route.
 *
 * @param next - Raw `next` query value from the login URL.
 * @returns Safe internal path for `router.replace`.
 */
export function resolveSafeAdminRedirect(next: string | null): string {
    if (!next) return DEFAULT_ADMIN_DESTINATION;
    if (!isSafeInternalAdminPath(next)) return DEFAULT_ADMIN_DESTINATION;
    if (isBlockedAdminDestination(next)) return DEFAULT_ADMIN_DESTINATION;

    return next;
}
