// SignaturesTable renders the global admin view of personal signatures.
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import type { SignatureListItem } from '@/api/signatures/signatures.types';

interface SignaturesTableProps {
    data: SignatureListItem[];
    loading: boolean;
    error: string | null;
}

function formatDate(value: string | null) {
    if (!value) {
        return 'Never';
    }

    return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatAlgorithm(value: SignatureListItem['algorithm']) {
    return value === 'RSA_2048' ? 'RSA-2048' : 'Ed25519';
}

/**
 * Global signatures table for the admin dashboard.
 */
export function SignaturesTable({
    data,
    loading,
    error,
}: SignaturesTableProps) {
    const router = useRouter();

    const columns: Column<SignatureListItem>[] = [
        {
            key: 'user',
            header: 'User',
            width: '1.3fr',
            render: (row) => (
                <div className="data-cell-stack">
                    <span className="primary">{row.userName}</span>
                    <span className="sub">{row.userEmail}</span>
                </div>
            ),
        },
        {
            key: 'algorithm',
            header: 'Algorithm',
            width: '120px',
            render: (row) => formatAlgorithm(row.algorithm),
        },
        {
            key: 'createdAt',
            header: 'Created At',
            width: '120px',
            render: (row) => formatDate(row.createdAt),
        },
        {
            key: 'lastUsedAt',
            header: 'Last Used',
            width: '120px',
            render: (row) => formatDate(row.lastUsedAt),
        },
        {
            key: 'documentsSigned',
            header: 'Signed',
            width: '90px',
            render: (row) => row.documentsSigned,
        },
        {
            key: 'status',
            header: 'Status',
            width: '100px',
            render: (row) => (
                <Badge variant={row.status === 'ACTIVE' ? 'active' : 'danger'}>
                    {row.status === 'ACTIVE' ? 'Active' : 'Revoked'}
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
                    size="sm"
                    variant="ghost"
                    onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/admin/signatures/${row.signatureId}`);
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
            emptyTitle="No signatures found"
            emptyDescription="Try widening the filters or wait until users generate personal signature keys."
            getRowKey={(row) => row.signatureId}
            onRowClick={(row) => router.push(`/admin/signatures/${row.signatureId}`)}
        />
    );
}
