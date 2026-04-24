'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, Input, Pagination, Select } from '@/components/ui';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { listInstitutions } from '@/api/institutions/institutions.api';
import type { InstitutionStatus, InstitutionType, PaginatedInstitutionsResponse } from '@/api/institutions/institutions.types';
import { InstitutionsTable } from '@/components/institutions/InstitutionsTable';
import { CountryDropdown } from '@/components/foreign-identities/CountryDropdown';
import { getFriendlyErrorMessage } from '@/lib/http';

type Filters = {
    search: string;
    type: InstitutionType | '';
    country: string;
    status: InstitutionStatus | '';
};

const LIMIT = 20;

function buildQuery(filters: Filters, page: number) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.type) params.set('type', filters.type);
    if (filters.country) params.set('country', filters.country);
    if (filters.status) params.set('status', filters.status);
    if (page > 1) params.set('page', String(page));
    return params.toString();
}

export default function InstitutionsPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const admin = useAdminAuthStore((state) => state.admin);
    const canManage = admin?.role === 'SUPER_ADMIN';
    const [filters, setFilters] = useState<Filters>({
        search: searchParams.get('search') ?? '',
        type: (searchParams.get('type') as InstitutionType | '') ?? '',
        country: searchParams.get('country') ?? '',
        status: (searchParams.get('status') as InstitutionStatus | '') ?? '',
    });
    const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));
    const [data, setData] = useState<PaginatedInstitutionsResponse | null>(null);
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
            const response = await listInstitutions({
                page,
                limit: LIMIT,
                search: debouncedSearch || undefined,
                type: filters.type || undefined,
                country: filters.country || undefined,
                status: filters.status || undefined,
            });
            setData(response.data);
        } catch (error) {
            const message = getFriendlyErrorMessage(error, 'Failed to load institutions.');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filters.country, filters.status, filters.type, page]);

    useEffect(() => {
        void load();
    }, [load]);

    const updateFilters = (patch: Partial<Filters>) => {
        const nextFilters = { ...filters, ...patch };
        setFilters(nextFilters);
        setPage(1);
        syncUrl(nextFilters, 1);
    };

    return (
        <>
            <PageHeader
                title="Institutions"
                subtitle={`${data?.total ?? 0} registered institutions and their trust material.`}
                action={canManage ? (
                    <Button type="button" variant="primary" onClick={() => router.push('/admin/institutions/new')}>
                        Register Institution
                    </Button>
                ) : undefined}
            />

            <div className="filter-bar">
                <div style={{ minWidth: 240, flex: '1 1 240px' }}>
                    <Input
                        search
                        placeholder="Search by name or registration number"
                        value={filters.search}
                        onChange={(event) => updateFilters({ search: event.target.value })}
                    />
                </div>
                <Select
                    value={filters.type}
                    onChange={(event) => updateFilters({ type: event.target.value as InstitutionType | '' })}
                    options={[
                        { value: '', label: 'All types' },
                        { value: 'COMPANY', label: 'Private' },
                        { value: 'NGO', label: 'NGO' },
                        { value: 'GOVERNMENT', label: 'Government' },
                        { value: 'OTHER', label: 'Other' },
                    ]}
                />
                <div style={{ minWidth: 220 }}>
                    <CountryDropdown label="" value={filters.country} onChange={(value) => updateFilters({ country: value })} placeholder="All countries" />
                </div>
                <Select
                    value={filters.status}
                    onChange={(event) => updateFilters({ status: event.target.value as InstitutionStatus | '' })}
                    options={[
                        { value: '', label: 'All statuses' },
                        { value: 'ACTIVE', label: 'Active' },
                        { value: 'INACTIVE', label: 'Inactive' },
                    ]}
                />
            </div>

            <InstitutionsTable data={data?.items ?? []} loading={loading} error={error} />

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
        </>
    );
}
