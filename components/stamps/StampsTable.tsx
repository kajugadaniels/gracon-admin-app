'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Button, DataTable, type Column } from '@/components/ui';
import type { StampListItem } from '@/api/stamps/stamps.types';

interface StampsTableProps {
    data: StampListItem[];
    loading: boolean;
    error: string | null;
    onView: (stampId: string) => void;
}

function formatDate(value: string) {
    return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function truncateHash(hash: string) {
    return `${hash.slice(0, 14)}…${hash.slice(-8)}`;
}

export function StampsTable({ data, loading, error, onView }: StampsTableProps) {
    const router = useRouter();
    const columns: Column<StampListItem>[] = [
        {
            key: 'institution',
            header: 'Institution',
            width: '1fr',
            render: (row) => (
                <button type="button" style={linkButtonStyle} onClick={() => router.push(`/admin/institutions/${row.institutionId}`)}>
                    {row.institutionName}
                </button>
            ),
        },
        {
            key: 'documentHash',
            header: 'Document Hash',
            width: '1.1fr',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <code style={codeStyle}>{truncateHash(row.documentHash)}</code>
                    <Button type="button" size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(row.documentHash)}>
                        Copy
                    </Button>
                </div>
            ),
        },
        { key: 'stampedBy', header: 'Stamped By', width: '150px', render: (row) => row.stampedBy },
        { key: 'coSigner', header: 'Co-signer', width: '150px', render: (row) => row.coSigner },
        { key: 'stampedAt', header: 'Stamped At', width: '150px', render: (row) => formatDate(row.stampedAt) },
        {
            key: 'verificationStatus',
            header: 'Verification',
            width: '100px',
            render: (row) => (
                <Badge variant={row.verificationStatus === 'VALID' ? 'active' : 'danger'}>
                    {row.verificationStatus}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            width: '90px',
            render: (row) => (
                <Button type="button" size="sm" variant="ghost" onClick={() => onView(row.stampId)}>
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
            getRowKey={(row) => row.stampId}
            emptyTitle="No stamp events found"
            emptyDescription="Stamp operations will appear here once institutions begin sealing documents."
        />
    );
}

const linkButtonStyle: React.CSSProperties = {
    padding: 0,
    border: 0,
    background: 'transparent',
    color: 'var(--primary-text)',
    cursor: 'pointer',
    fontWeight: 600,
    textAlign: 'left',
};

const codeStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--glass-panel)',
    color: 'var(--text-primary)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
};
