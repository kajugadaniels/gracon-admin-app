// Admin signatures list page.
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, Input, Pagination, Select } from '@/components/ui';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { getFriendlyErrorMessage } from '@/lib/http';
import { listSignatures } from '@/api/signatures/signatures.api';
import type {
    PaginatedSignaturesResponse,
    SignatureAlgorithm,
    SignatureStatus,
} from '@/api/signatures/signatures.types';
import { SignaturesTable } from '@/components/signatures/SignaturesTable';

type Filters = {
    search: string;
    algorithm: SignatureAlgorithm | '';
    status: SignatureStatus | '';
    createdFrom: string;
    createdTo: string;
};

const LIMIT = 20;

function buildQuery(filters: Filters, page: number) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.algorithm) params.set('algorithm', filters.algorithm);
    if (filters.status) params.set('status', filters.status);
    if (filters.createdFrom) params.set('createdFrom', filters.createdFrom);
    if (filters.createdTo) params.set('createdTo', filters.createdTo);
    if (page > 1) params.set('page', String(page));
    return params.toString();
}

export default function SignaturesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [filters, setFilters] = useState<Filters>({
        search: searchParams.get('search') ?? '',
        algorithm: (searchParams.get('algorithm') as SignatureAlgorithm | '') ?? '',
        status: (searchParams.get('status') as SignatureStatus | '') ?? '',
        createdFrom: searchParams.get('createdFrom') ?? '',
        createdTo: searchParams.get('createdTo') ?? '',
    });
    const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));
    const [data, setData] = useState<PaginatedSignaturesResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const debouncedSearch = useDebounce(filters.search, 350);

    const syncUrl = useCallback((nextFilters: Filters, nextPage: number) => {
        const query = buildQuery(nextFilters, nextPage);
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, [pathname, router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await listSignatures({
                page,
                limit: LIMIT,
                search: debouncedSearch || undefined,
                algorithm: filters.algorithm || undefined,
                status: filters.status || undefined,
                createdFrom: filters.createdFrom || undefined,
                createdTo: filters.createdTo || undefined,
            });
            setData(response.data);
        } catch (nextError) {
            const message = getFriendlyErrorMessage(
                nextError,
                'Failed to load signatures.',
            );
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filters.algorithm, filters.createdFrom, filters.createdTo, filters.status, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateFilters = (patch: Partial<Filters>) => {
        const nextFilters = { ...filters, ...patch };
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
                title="Signatures"
                subtitle={`${data?.total ?? 0} personal digital signatures across the platform.`}
                action={
                    <Button type="button" variant="ghost" onClick={fetchData}>
                        Refresh
                    </Button>
                }
            />

            <div className="filter-bar">
                <div style={{ minWidth: 260, flex: '1 1 260px' }}>
                    <Input
                        search
                        placeholder="Search by user name or email"
                        value={filters.search}
                        onChange={(event) => updateFilters({ search: event.target.value })}
                    />
                </div>
                <Select
                    value={filters.algorithm}
                    onChange={(event) => updateFilters({ algorithm: event.target.value as SignatureAlgorithm | '' })}
                    options={[
                        { value: '', label: 'All algorithms' },
                        { value: 'RSA_2048', label: 'RSA-2048' },
                        { value: 'ED25519', label: 'Ed25519' },
                    ]}
                />
                <Select
                    value={filters.status}
                    onChange={(event) => updateFilters({ status: event.target.value as SignatureStatus | '' })}
                    options={[
                        { value: '', label: 'All statuses' },
                        { value: 'ACTIVE', label: 'Active' },
                        { value: 'REVOKED', label: 'Revoked' },
                    ]}
                />
                <Input
                    type="date"
                    value={filters.createdFrom}
                    onChange={(event) => updateFilters({ createdFrom: event.target.value })}
                />
                <Input
                    type="date"
                    value={filters.createdTo}
                    onChange={(event) => updateFilters({ createdTo: event.target.value })}
                />
            </div>

            <SignaturesTable data={data?.items ?? []} loading={loading} error={error} />

            {data && data.totalPages > 1 && (
                <Pagination
                    page={data.page}
                    totalPages={data.totalPages}
                    total={data.total}
                    limit={data.limit}
                    onChange={handlePageChange}
                />
            )}
        </>
    );
}
