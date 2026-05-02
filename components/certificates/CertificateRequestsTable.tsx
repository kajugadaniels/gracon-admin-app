'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import type { CertificateRequestListItem } from '@/api/certificates/certificates.types';

interface CertificateRequestsTableProps {
    data: CertificateRequestListItem[];
    loading: boolean;
    error: string | null;
}

function formatDate(value: string | null) {
    if (!value) return '—';

    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getBadgeVariant(status: CertificateRequestListItem['status']) {
    if (status === 'PENDING') return 'pending';
    if (status === 'APPROVED') return 'active';
    if (status === 'REJECTED') return 'danger';
    return 'neutral';
}

export function CertificateRequestsTable({
    data,
    loading,
    error,
}: CertificateRequestsTableProps) {
    const router = useRouter();

    const columns: Column<CertificateRequestListItem>[] = [
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
            key: 'status',
            header: 'Status',
            width: '120px',
            render: (row) => (
                <div style={badgeStackStyle}>
                    <Badge variant={getBadgeVariant(row.status)}>
                        {row.status.toLowerCase()}
                    </Badge>
                    {row.certificateAccessPolicy.isBanned && (
                        <Badge variant="danger">banned</Badge>
                    )}
                </div>
            ),
        },
        {
            key: 'keyAlgorithm',
            header: 'Key Algorithm',
            width: '120px',
            render: (row) => row.keyAlgorithm,
        },
        {
            key: 'requestedValidityYears',
            header: 'Validity',
            width: '90px',
            render: (row) => `${row.requestedValidityYears}y`,
        },
        {
            key: 'requestedAt',
            header: 'Requested',
            width: '110px',
            render: (row) => formatDate(row.requestedAt),
        },
        {
            key: 'reviewedAt',
            header: 'Reviewed',
            width: '110px',
            render: (row) => formatDate(row.reviewedAt),
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
                        router.push(`/admin/certificates/requests/${row.requestId}`);
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
            emptyTitle="No certificate requests found"
            emptyDescription="Pending approval requests will appear here before a real certificate is issued."
            getRowKey={(row) => row.requestId}
            onRowClick={(row) => router.push(`/admin/certificates/requests/${row.requestId}`)}
        />
    );
}

const badgeStackStyle: React.CSSProperties = {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
};
