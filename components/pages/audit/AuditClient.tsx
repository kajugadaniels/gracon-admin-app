// AuditClient — full audit log page.
// Read-only — no actions. Filters are URL-synced.
// Sensitive actions (NID/PID decrypts) are visually highlighted.
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
    AuditFilters,
    AuditTable,
    DEFAULT_AUDIT_FILTERS,
    type AuditFilterState,
} from '@/components/pages/audit';
import { listAuditApi, type AuditLogEntry } from '@/api/audit/list-audit.api';

const DEFAULT_LIMIT = 50;

export function AuditClient() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [filters, setFilters] = useState<AuditFilterState>({
        action: searchParams.get('action') ?? '',
        createdFrom: searchParams.get('createdFrom') ?? '',
        createdTo: searchParams.get('createdTo') ?? '',
    });
    const [page, setPage] = useState(Number(searchParams.get('page') ?? 1));

    const [data, setData] = useState<{
        data: AuditLogEntry[];
        pagination: {
            page: number; limit: number; total: number;
            totalPages: number; hasNext: boolean; hasPrev: boolean;
        };
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const syncUrl = useCallback(
        (f: AuditFilterState, p: number) => {
            const params = new URLSearchParams();
            if (f.action) params.set('action', f.action);
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
        f: AuditFilterState,
        p: number,
    ) => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, any> = { page: p, limit: DEFAULT_LIMIT };
            if (f.action) params.action = f.action;
            if (f.createdFrom) params.createdFrom = new Date(f.createdFrom).toISOString();
            if (f.createdTo) params.createdTo = new Date(f.createdTo + 'T23:59:59').toISOString();

            const res = await listAuditApi(params);
            setData(res.data);
        } catch {
            setError('Failed to load audit log. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(filters, page);
    }, [filters.action, filters.createdFrom, filters.createdTo, page]);

    const handleFilterChange = (f: AuditFilterState) => {
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
                title="Audit log"
                subtitle="Every admin action — immutable and permanent."
            />

            {/* Sensitive action legend */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 10,
                    fontSize: 11,
                    color: 'var(--text-muted)',
                }}
            >
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--error)',
                        boxShadow: '0 0 4px var(--error)',
                        flexShrink: 0,
                    }}
                    aria-hidden="true"
                />
                Sensitive data access (NID / PID decrypt)
            </div>

            <AuditFilters
                filters={filters}
                onChange={handleFilterChange}
                total={data?.pagination.total}
                loading={loading}
            />

            <AuditTable
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