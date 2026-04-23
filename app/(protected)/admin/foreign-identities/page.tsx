'use client';

import React, { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Pagination } from '@/components/ui';
import { PageHeader } from '@/components/shell/PageHeader';
import { useDebounce } from '@/lib/hooks/useDebounce';
import {
    listForeignIdentities,
} from '@/api/foreign-identity/foreign-identity.api';
import type { PaginatedForeignIdentitiesResponse } from '@/api/foreign-identity/foreign-identity.types';
import {
    ForeignIdentityFilters,
    type ForeignIdentityFilterState,
} from '@/components/foreign-identities/ForeignIdentityFilters';
import { ForeignIdentityTable } from '@/components/foreign-identities/ForeignIdentityTable';

const DEFAULT_LIMIT = 20;

function readFilters(searchParams: URLSearchParams): ForeignIdentityFilterState {
    return {
        search: searchParams.get('search') ?? '',
        countryOfOrigin: searchParams.get('countryOfOrigin') ?? '',
        gender: (searchParams.get('gender') as ForeignIdentityFilterState['gender']) ?? '',
        maritalStatus: (searchParams.get('maritalStatus') as ForeignIdentityFilterState['maritalStatus']) ?? '',
        includeInactive: searchParams.get('includeInactive') === 'true',
    };
}

export default function ForeignIdentitiesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [filters, setFilters] = useState(() => readFilters(searchParams));
    const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));
    const [data, setData] = useState<PaginatedForeignIdentitiesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const debouncedSearch = useDebounce(filters.search, 350);

    const syncUrl = useCallback((nextFilters: ForeignIdentityFilterState, nextPage: number) => {
        const params = new URLSearchParams();
        if (nextFilters.search) params.set('search', nextFilters.search);
        if (nextFilters.countryOfOrigin) params.set('countryOfOrigin', nextFilters.countryOfOrigin);
        if (nextFilters.gender) params.set('gender', nextFilters.gender);
        if (nextFilters.maritalStatus) params.set('maritalStatus', nextFilters.maritalStatus);
        if (nextFilters.includeInactive) params.set('includeInactive', 'true');
        if (nextPage > 1) params.set('page', String(nextPage));
        const query = params.toString();
        startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
    }, [pathname, router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await listForeignIdentities({
                page,
                limit: DEFAULT_LIMIT,
                countryOfOrigin: filters.countryOfOrigin || undefined,
                gender: filters.gender || undefined,
                maritalStatus: filters.maritalStatus || undefined,
                includeInactive: filters.includeInactive,
                search: debouncedSearch || undefined,
            });
            setData(response.data);
        } catch {
            const message = 'Failed to load foreign identities. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filters.countryOfOrigin, filters.gender, filters.includeInactive, filters.maritalStatus, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFilterChange = (nextFilters: ForeignIdentityFilterState) => {
        setFilters(nextFilters);
        setPage(1);
        syncUrl(nextFilters, 1);
    };

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
        syncUrl(filters, nextPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <PageHeader
                title="Foreign Identities"
                subtitle={`${data?.total ?? 0} records in the registry`}
                action={
                    <Button type="button" variant="primary" onClick={() => router.push('/admin/foreign-identities/new')}>
                        Register New
                    </Button>
                }
            />
            <ForeignIdentityFilters filters={filters} total={data?.total} loading={loading || isPending} onChange={handleFilterChange} />
            <ForeignIdentityTable data={data?.items ?? []} loading={loading} error={error} />
            {data && data.totalPages > 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                        Page {data.page} of {data.totalPages}
                    </div>
                    <Pagination
                        page={data.page}
                        totalPages={data.totalPages}
                        total={data.total}
                        limit={data.limit}
                        onChange={handlePageChange}
                    />
                </div>
            )}
        </>
    );
}
