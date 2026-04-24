// Shared pagination contracts used across multi-service admin API clients.

/**
 * Common paginated response shape for admin list endpoints.
 *
 * @template T Item type.
 */
export interface PaginatedResponse<T> {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    items: T[];
}
