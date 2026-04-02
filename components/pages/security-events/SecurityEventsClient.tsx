// SecurityEventsClient — full security events page.
// Pre-selects eventType from URL params — dashboard SecurityAlert
// links directly here with ?eventType=LOGIN_FAILED pre-filled.
// This makes the alert→investigate flow one click.
'use client';

import React, {
    useState,
    useEffect,
    useCallback,
    useTransition,
} from 'react';
import {
    useRouter,
    useSearchParams,
    usePathname,
} from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { Pagination } from '@/components/ui';
import {
    SecurityEventFilters,
    SecurityEventTable,
    DEFAULT_SECURITY_EVENT_FILTERS,
    type SecurityEventFilterState,
} from '@/components/pages/security-events';
import {
    listSecurityEventsApi,
    type SecurityEventEntry,
} from '@/api/security-events/list-security-events.api';
import { useDebounce } from '@/lib/hooks/useDebounce';

const DEFAULT_LIMIT = 50;

export function SecurityEventsClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Pre-fill from URL — dashboard alert links here with eventType set
    const [filters, setFilters] = useState<SecurityEventFilterState>({
        eventType: searchParams.get('eventType') ?? '',
        ipAddress: searchParams.get('ipAddress') ?? '',
        createdFrom: searchParams.get('createdFrom') ?? '',
        createdTo: searchParams.get('createdTo') ?? '',
    });
    const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));

    const [data, setData] = useState<{
        data: SecurityEventEntry[];
        pagination: {
            page: number; limit: number; total: number;
            totalPages: number; hasNext: boolean; hasPrev: boolean;
        };
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const debouncedIp = useDebounce(filters.ipAddress, 350);

    const syncUrl = useCallback(
        (f: SecurityEventFilterState, p: number) => {
            const params = new URLSearchParams();
            if (f.eventType) params.set('eventType', f.eventType);
            if (f.ipAddress) params.set('ipAddress', f.ipAddress);
            if (f.createdFrom) params.set('createdFrom', f.createdFrom);
            if (f.createdTo) params.set('createdTo', f.createdTo);
            if (p > 1) params.set('page', String(p));
            const q = params.toString();
            startTransition(() => {
                router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
            });
        },
        [router, pathname],
    );

    const fetchData = useCallback(async (
        f: SecurityEventFilterState,
        p: number,
        ip: string,
    ) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = { page: p, limit: DEFAULT_LIMIT };
            if (f.eventType) params.eventType = f.eventType;
            if (ip) params.ipAddress = ip;
            if (f.createdFrom) params.createdFrom = new Date(f.createdFrom).toISOString();
            if (f.createdTo) params.createdTo = new Date(f.createdTo + 'T23:59:59').toISOString();

            const res = await listSecurityEventsApi(params);
            setData(res.data);
        } catch {
            setError('Failed to load security events. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(filters, page, debouncedIp);
    }, [
        filters.eventType,
        filters.createdFrom,
        filters.createdTo,
        debouncedIp,
        page,
    ]);

    const handleFilterChange = (f: SecurityEventFilterState) => {
        setFilters(f);
        setPage(1);
        syncUrl(f, 1);
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        syncUrl(filters, p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Active filter summary — shows admin what they are looking at
    const activeFilter = filters.eventType
        ? filters.eventType.replace(/_/g, ' ').toLowerCase()
        : null;

    return (
        <>
            <PageHeader
                title="Security events"
                subtitle={
                    activeFilter
                        ? `Filtered: ${activeFilter}`
                        : 'All security events written by the auth service.'
                }
            />

            <SecurityEventFilters
                filters={filters}
                onChange={handleFilterChange}
                total={data?.pagination.total}
                loading={loading}
            />

            <SecurityEventTable
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
        </>
    );
}