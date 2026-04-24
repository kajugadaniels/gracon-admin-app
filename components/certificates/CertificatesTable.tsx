// CertificatesTable renders the global admin certificate list.
'use client';

import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useRouter } from 'next/navigation';
import { Badge, Button, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import type { CertificateListItem } from '@/api/certificates/certificates.types';

interface CertificatesTableProps {
    data: CertificateListItem[];
    loading: boolean;
    error: string | null;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getExpiryColor(value: number, status: string) {
    if (status !== 'ACTIVE') return 'var(--text-muted)';
    if (value < 7) return 'var(--error-text)';
    if (value <= 30) return 'var(--warning-text)';
    return 'var(--success-text)';
}

/**
 * Global certificates table for the admin dashboard.
 */
export function CertificatesTable({
    data,
    loading,
    error,
}: CertificatesTableProps) {
    const router = useRouter();

    const columns: Column<CertificateListItem>[] = [
        {
            key: 'userName',
            header: 'User',
            width: '1.2fr',
            render: (row) => row.userName,
        },
        {
            key: 'identityType',
            header: 'Identity',
            width: '100px',
            render: (row) => (
                <Badge variant={row.identityType === 'FIN' ? 'primary' : 'info'}>
                    {row.identityType}
                </Badge>
            ),
        },
        {
            key: 'country',
            header: 'Country',
            width: '100px',
            render: (row) => (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <ReactCountryFlag countryCode={row.country} svg />
                    {row.country}
                </span>
            ),
        },
        {
            key: 'issuedAt',
            header: 'Issued',
            width: '110px',
            render: (row) => formatDate(row.issuedAt),
        },
        {
            key: 'expiresAt',
            header: 'Expires',
            width: '110px',
            render: (row) => formatDate(row.expiresAt),
        },
        {
            key: 'daysToExpiry',
            header: 'Days Left',
            width: '90px',
            render: (row) => (
                <span style={{ color: getExpiryColor(row.daysToExpiry, row.status), fontWeight: 600 }}>
                    {row.daysToExpiry}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            width: '110px',
            render: (row) => (
                <Badge
                    variant={
                        row.status === 'ACTIVE'
                            ? 'active'
                            : row.status === 'EXPIRED'
                                ? 'pending'
                                : 'danger'
                    }
                >
                    {row.status.toLowerCase()}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            width: '90px',
            render: (row) => (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/admin/certificates/${row.certificateId}`);
                    }}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={data}
            loading={loading}
            error={error}
            emptyTitle="No certificates found"
            emptyDescription="Certificates will appear here after users issue personal X.509 credentials."
            getRowKey={(row) => row.certificateId}
            onRowClick={(row) => router.push(`/admin/certificates/${row.certificateId}`)}
        />
    );
}
