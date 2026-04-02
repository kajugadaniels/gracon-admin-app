// VerificationsClient — full verifications list page.
// Filters are URL-synced — bookmarkable and shareable.
// Score range filters are converted from strings to numbers before the API call.
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
    VerificationFilters,
    VerificationTable,
    DEFAULT_VERIFICATION_FILTERS,
    type VerificationFilterState,
} from '@/components/pages/verifications';
import {
    listVerificationsApi,
    type VerificationListItem,
} from '@/api/verifications/list-verifications.api';
import { useDebounce } from '@/lib/hooks/useDebounce';

const DEFAULT_LIMIT = 25;

export function VerificationsClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [filters, setFilters] = useState<VerificationFilterState>({
        passed: searchParams.get('passed') ?? '',
        ipAddress: searchParams.get('ipAddress') ?? '',
        createdFrom: searchParams.get('createdFrom') ?? '',
        createdTo: searchParams.get('createdTo') ?? '',
        scoreMin: searchParams.get('scoreMin') ?? '',
        scoreMax: searchParams.get('scoreMax') ?? '',
    });
    const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));

    const [data, setData] = useState<{
        data: VerificationListItem[];
        pagination: { page: number; limit: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Debounce IP address filter
    const debouncedIp = useDebounce(filters.ipAddress, 350);

    const syncUrl = useCallback(
        (f: VerificationFilterState, p: number) => {
            const params = new URLSearchParams();
            if (f.passed) params.set('passed', f.passed);
            if (f.ipAddress) params.set('ipAddress', f.ipAddress);
            if (f.createdFrom) params.set('createdFrom', f.createdFrom);
            if (f.createdTo) params.set('createdTo', f.createdTo);
            if (f.scoreMin) params.set('scoreMin', f.scoreMin);
            if (f.scoreMax) params.set('scoreMax', f.scoreMax);
            if (p > 1) params.set('page', String(p));
            const q = params.toString();
            startTransition(() => {
                router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
            });
        },
        [router, pathname],
    );

    const fetchData = useCallback(async (
        f: VerificationFilterState,
        p: number,
        ip: string,
    ) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = { page: p, limit: DEFAULT_LIMIT };
            if (f.passed !== '') params.passed = f.passed === 'true';
            if (ip) params.ipAddress = ip;
            if (f.createdFrom) params.createdFrom = new Date(f.createdFrom).toISOString();
            if (f.createdTo) params.createdTo = new Date(f.createdTo + 'T23:59:59').toISOString();
            if (f.scoreMin !== '') params.scoreMin = Number(f.scoreMin);
            if (f.scoreMax !== '') params.scoreMax = Number(f.scoreMax);

            const res = await listVerificationsApi(params);
            setData(res.data);
        } catch {
            setError('Failed to load verifications. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(filters, page, debouncedIp);
    }, [
        filters.passed,
        filters.createdFrom,
        filters.createdTo,
        filters.scoreMin,
        filters.scoreMax,
        debouncedIp,
        page,
    ]);

    const handleFilterChange = (f: VerificationFilterState) => {
        setFilters(f);
        setPage(1);
        syncUrl(f, 1);
    };

    const handlePageChange = (p: number) => {
        setPage(p);
        syncUrl(filters, p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <PageHeader
                title="Verifications"
                subtitle="All ID verification attempts across the platform."
            />

            <VerificationFilters
                filters={filters}
                onChange={handleFilterChange}
                total={data?.pagination.total}
                loading={loading}
            />

            <VerificationTable
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