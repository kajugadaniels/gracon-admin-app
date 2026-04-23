// UsersClient — full users list page with search, filters, and pagination.
// Filters are pushed into URL search params so the page is bookmarkable
// and shareable — an admin can send a colleague a filtered view.
// Debounced search — API not called until user stops typing for 350ms.
'use client';

import React, {
    useState,
    useEffect,
    useCallback,
    useTransition,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { Pagination } from '@/components/ui';
import { UserFilters, UserTable, type UserFilterState }
    from '@/components/pages/users';
import {
    listUsersApi,
    type UserListItem,
    type PaginatedUsersResponse,
} from '@/api/users/list-users.api';
import { useDebounce } from '@/lib/hooks/useDebounce';

const DEFAULT_LIMIT = 25;

export function UsersClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Read initial state from URL params
    const [filters, setFilters] = useState<UserFilterState>({
        search: searchParams.get('search') ?? '',
        isActive: searchParams.get('isActive') ?? '',
        isVerified: searchParams.get('isVerified') ?? '',
        isIdVerified: searchParams.get('isIdVerified') ?? '',
    });
    const [page, setPage] = useState(
        Number(searchParams.get('page') ?? 1),
    );

    const [data, setData] = useState<PaginatedUsersResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Debounce search input — 350ms
    const debouncedSearch = useDebounce(filters.search, 350);

    // Sync filters + page into URL search params
    const syncUrl = useCallback(
        (newFilters: UserFilterState, newPage: number) => {
            const params = new URLSearchParams();
            if (newFilters.search) params.set('search', newFilters.search);
            if (newFilters.isActive) params.set('isActive', newFilters.isActive);
            if (newFilters.isVerified) params.set('isVerified', newFilters.isVerified);
            if (newFilters.isIdVerified) params.set('isIdVerified', newFilters.isIdVerified);
            if (newPage > 1) params.set('page', String(newPage));

            const query = params.toString();
            startTransition(() => {
                router.replace(
                    query ? `${pathname}?${query}` : pathname,
                    { scroll: false },
                );
            });
        },
        [router, pathname],
    );

    // Fetch users from API
    const fetchUsers = useCallback(async (
        currentFilters: UserFilterState,
        currentPage: number,
        search: string,
    ) => {
        setLoading(true);
        setError(null);

        try {
            const params: Record<string, string | number | boolean> = {
                page: currentPage,
                limit: DEFAULT_LIMIT,
            };

            if (search) params.search = search;
            if (currentFilters.isActive !== '') params.isActive = currentFilters.isActive === 'true';
            if (currentFilters.isVerified !== '') params.isVerified = currentFilters.isVerified === 'true';
            if (currentFilters.isIdVerified !== '') params.isIdVerified = currentFilters.isIdVerified === 'true';

            const res = await listUsersApi(params);
            setData(res.data);
        } catch {
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch when debounced search, filters, or page changes
    useEffect(() => {
        fetchUsers(filters, page, debouncedSearch);
    }, [debouncedSearch, filters.isActive, filters.isVerified, filters.isIdVerified, page]);

    // When filters change (not search) reset to page 1
    const handleFilterChange = (newFilters: UserFilterState) => {
        const resetPage = 1;
        setFilters(newFilters);
        setPage(resetPage);
        syncUrl(newFilters, resetPage);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        syncUrl(filters, newPage);
        // Scroll table back to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <PageHeader
                title="Users"
                subtitle="All registered users on the platform."
            />

            <UserFilters
                filters={filters}
                onChange={handleFilterChange}
                total={data?.pagination.total}
                loading={loading}
            />

            <UserTable
                data={data?.data ?? []}
                loading={loading}
                error={error}
            />

            {data && data.pagination.totalPages > 1 && (
                <Pagination
                    page={data.pagination.page}
                    totalPages={data.pagination.totalPages}
                    total={data.pagination.total}
                    limit={DEFAULT_LIMIT}
                    onChange={handlePageChange}
                />
            )}

            {/* Performance warning from API */}
            {data?.performanceWarning && (
                <p
                    style={{
                        fontSize: 11,
                        color: 'var(--warning)',
                        marginTop: 8,
                        textAlign: 'right',
                    }}
                >
                    ⚠ {data.performanceWarning}
                </p>
            )}
        </>
    );
}
