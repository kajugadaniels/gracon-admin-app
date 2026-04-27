// Admin certificates list page.
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, Input, Pagination, Select } from '@/components/ui';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { getFriendlyErrorMessage } from '@/lib/http';
import {
    listCertificateRequests,
    listCertificates,
} from '@/api/certificates/certificates.api';
import type {
    CertificateStatus,
    CertificateRequestStatus,
    IdentityType,
    PaginatedCertificateRequestsResponse,
    PaginatedCertificatesResponse,
} from '@/api/certificates/certificates.types';
import { CertificateRequestsTable } from '@/components/certificates/CertificateRequestsTable';
import { CertificatesTable } from '@/components/certificates/CertificatesTable';

type Filters = {
    search: string;
    identityType: IdentityType | '';
    status: CertificateStatus | '';
    requestStatus: CertificateRequestStatus | '';
    country: string;
    expiringSoon: boolean;
};

const LIMIT = 20;

function buildQuery(filters: Filters, page: number) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.identityType) params.set('identityType', filters.identityType);
    if (filters.status) params.set('status', filters.status);
    if (filters.requestStatus) params.set('requestStatus', filters.requestStatus);
    if (filters.country) params.set('country', filters.country);
    if (filters.expiringSoon) params.set('expiringSoon', 'true');
    if (page > 1) params.set('page', String(page));
    return params.toString();
}

export default function CertificatesPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [filters, setFilters] = useState<Filters>({
        search: searchParams.get('search') ?? '',
        identityType: (searchParams.get('identityType') as IdentityType | '') ?? '',
        status: (searchParams.get('status') as CertificateStatus | '') ?? '',
        requestStatus: (searchParams.get('requestStatus') as CertificateRequestStatus | '') ?? 'PENDING',
        country: searchParams.get('country') ?? '',
        expiringSoon: searchParams.get('expiringSoon') === 'true',
    });
    const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));
    const [data, setData] = useState<PaginatedCertificatesResponse | null>(null);
    const [requestData, setRequestData] = useState<PaginatedCertificateRequestsResponse | null>(null);
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
            const [certificatesResponse, requestsResponse] = await Promise.all([
                listCertificates({
                    page,
                    limit: LIMIT,
                    search: debouncedSearch || undefined,
                    identityType: filters.identityType || undefined,
                    status: filters.status || undefined,
                    country: filters.country || undefined,
                    expiringSoon: filters.expiringSoon || undefined,
                }),
                listCertificateRequests({
                    page: 1,
                    limit: 10,
                    search: debouncedSearch || undefined,
                    status: filters.requestStatus || undefined,
                }),
            ]);
            setData(certificatesResponse.data);
            setRequestData(requestsResponse.data);
        } catch (nextError) {
            const message = getFriendlyErrorMessage(
                nextError,
                'Failed to load certificates.',
            );
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, filters.country, filters.expiringSoon, filters.identityType, filters.requestStatus, filters.status, page]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateFilters = (patch: Partial<Filters>) => {
        const nextFilters = { ...filters, ...patch };
        setFilters(nextFilters);
        setPage(1);
        syncUrl(nextFilters, 1);
    };

    return (
        <>
            <PageHeader
                title="Certificates"
                subtitle={`${data?.total ?? 0} personal X.509 certificates issued across the platform.`}
                action={<Button type="button" variant="ghost" onClick={fetchData}>Refresh</Button>}
            />

            <div className="filter-bar">
                <div style={{ minWidth: 240, flex: '1 1 240px' }}>
                    <Input
                        search
                        placeholder="Search by user name"
                        value={filters.search}
                        onChange={(event) => updateFilters({ search: event.target.value })}
                    />
                </div>
                <Select
                    value={filters.identityType}
                    onChange={(event) => updateFilters({ identityType: event.target.value as IdentityType | '' })}
                    options={[
                        { value: '', label: 'All identity types' },
                        { value: 'NID', label: 'NID' },
                        { value: 'FIN', label: 'FIN' },
                    ]}
                />
                <Select
                    value={filters.status}
                    onChange={(event) => updateFilters({ status: event.target.value as CertificateStatus | '' })}
                    options={[
                        { value: '', label: 'All statuses' },
                        { value: 'ACTIVE', label: 'Active' },
                        { value: 'EXPIRED', label: 'Expired' },
                        { value: 'REVOKED', label: 'Revoked' },
                    ]}
                />
                <Select
                    value={filters.requestStatus}
                    onChange={(event) => updateFilters({ requestStatus: event.target.value as CertificateRequestStatus | '' })}
                    options={[
                        { value: '', label: 'All request states' },
                        { value: 'PENDING', label: 'Pending requests' },
                        { value: 'APPROVED', label: 'Approved requests' },
                        { value: 'REJECTED', label: 'Rejected requests' },
                        { value: 'CANCELLED', label: 'Cancelled requests' },
                    ]}
                />
                <Input
                    placeholder="Country code"
                    value={filters.country}
                    onChange={(event) => updateFilters({ country: event.target.value.toUpperCase() })}
                    maxLength={2}
                />
                <Button
                    type="button"
                    variant={filters.expiringSoon ? 'primary' : 'secondary'}
                    onClick={() => updateFilters({ expiringSoon: !filters.expiringSoon })}
                >
                    Expiring Soon
                </Button>
            </div>

            <section style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <h2 style={sectionTitleStyle}>Certificate Requests</h2>
                    <p style={sectionSubtitleStyle}>
                        {requestData?.total ?? 0} request records match the current review filters.
                    </p>
                </div>
                <CertificateRequestsTable
                    data={requestData?.items ?? []}
                    loading={loading}
                    error={error}
                />
            </section>

            <section style={sectionStyle}>
                <div style={sectionHeaderStyle}>
                    <h2 style={sectionTitleStyle}>Issued Certificates</h2>
                    <p style={sectionSubtitleStyle}>
                        {data?.total ?? 0} personal X.509 certificates match the current lifecycle filters.
                    </p>
                </div>
                <CertificatesTable
                    data={data?.items ?? []}
                    loading={loading}
                    error={error}
                />
            </section>

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

const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
};

const sectionHeaderStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const sectionSubtitleStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-secondary)',
};
