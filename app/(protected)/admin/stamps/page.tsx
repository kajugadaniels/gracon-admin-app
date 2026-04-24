'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shell/PageHeader';
import { Input, Pagination, Select } from '@/components/ui';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { getFriendlyErrorMessage } from '@/lib/http';
import { listStamps, getStampDetail } from '@/api/stamps/stamps.api';
import type { PaginatedStampsResponse, StampDetail, StampVerificationStatus } from '@/api/stamps/stamps.types';
import { StampsTable } from '@/components/stamps/StampsTable';
import { StampDetailModal } from '@/components/stamps/StampDetailModal';

type Filters = {
    search: string;
    verificationStatus: StampVerificationStatus | '';
    stampedFrom: string;
    stampedTo: string;
};

const LIMIT = 20;

function buildQuery(filters: Filters, page: number) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.verificationStatus) params.set('verificationStatus', filters.verificationStatus);
    if (filters.stampedFrom) params.set('stampedFrom', filters.stampedFrom);
    if (filters.stampedTo) params.set('stampedTo', filters.stampedTo);
    if (page > 1) params.set('page', String(page));
    return params.toString();
}

export default function StampsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [filters, setFilters] = useState<Filters>({
        search: searchParams.get('search') ?? '',
        verificationStatus: (searchParams.get('verificationStatus') as StampVerificationStatus | '') ?? '',
        stampedFrom: searchParams.get('stampedFrom') ?? '',
        stampedTo: searchParams.get('stampedTo') ?? '',
    });
    const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));
    const [data, setData] = useState<PaginatedStampsResponse | null>(null);
    const [selectedStamp, setSelectedStamp] = useState<StampDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const debouncedSearch = useDebounce(filters.search, 350);

    const syncUrl = useCallback((nextFilters: Filters, nextPage: number) => {
        const query = buildQuery(nextFilters, nextPage);
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, [pathname, router]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await listStamps({
                page,
                limit: LIMIT,
                search: debouncedSearch || undefined,
                verificationStatus: filters.verificationStatus || undefined,
                stampedFrom: filters.stampedFrom || undefined,
                stampedTo: filters.stampedTo || undefined,
            });
            setData(response.data);
        } catch (error) {
            const message = getFriendlyErrorMessage(error, 'Failed to load stamp events.');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filters.stampedFrom, filters.stampedTo, filters.verificationStatus, page]);

    useEffect(() => {
        void load();
    }, [load]);

    const updateFilters = (patch: Partial<Filters>) => {
        const nextFilters = { ...filters, ...patch };
        setFilters(nextFilters);
        setPage(1);
        syncUrl(nextFilters, 1);
    };

    const handleView = async (stampId: string) => {
        try {
            const response = await getStampDetail(stampId);
            setSelectedStamp(response.data);
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, 'Failed to load stamp detail.'));
        }
    };

    return (
        <>
            <PageHeader
                title="Stamps"
                subtitle={`${data?.total ?? 0} institutional stamp events across the platform.`}
            />

            <div className="filter-bar">
                <div style={{ minWidth: 260, flex: '1 1 260px' }}>
                    <Input
                        search
                        placeholder="Search by document hash"
                        value={filters.search}
                        onChange={(event) => updateFilters({ search: event.target.value })}
                    />
                </div>
                <Select
                    value={filters.verificationStatus}
                    onChange={(event) => updateFilters({ verificationStatus: event.target.value as StampVerificationStatus | '' })}
                    options={[
                        { value: '', label: 'All statuses' },
                        { value: 'VALID', label: 'Valid' },
                        { value: 'INVALID', label: 'Invalid' },
                    ]}
                />
                <Input type="date" value={filters.stampedFrom} onChange={(event) => updateFilters({ stampedFrom: event.target.value })} />
                <Input type="date" value={filters.stampedTo} onChange={(event) => updateFilters({ stampedTo: event.target.value })} />
            </div>

            <StampsTable data={data?.items ?? []} loading={loading} error={error} onView={handleView} />

            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    total={data.total}
                    limit={data.limit}
                    onChange={(nextPage) => {
                        setPage(nextPage);
                        syncUrl(filters, nextPage);
                    }}
                />
            )}

            <StampDetailModal open={Boolean(selectedStamp)} stamp={selectedStamp} onClose={() => setSelectedStamp(null)} />
        </>
    );
}
