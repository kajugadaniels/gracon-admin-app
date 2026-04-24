// SignedDocumentsTable renders the document history for one signature.
'use client';

import React from 'react';
import { Badge, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import type { SignatureDocumentItem } from '@/api/signatures/signatures.types';

interface SignedDocumentsTableProps {
    data: SignatureDocumentItem[];
    loading: boolean;
    error: string | null;
}

function formatDate(value: string) {
    return new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function truncateHash(value: string) {
    return `${value.slice(0, 10)}…${value.slice(-8)}`;
}

/**
 * Signed document history for a signature detail page.
 */
export function SignedDocumentsTable({
    data,
    loading,
    error,
}: SignedDocumentsTableProps) {
    const columns: Column<SignatureDocumentItem>[] = [
        {
            key: 'documentHash',
            header: 'Document',
            width: '1.2fr',
            render: (row) => (
                <div className="data-cell-stack">
                    <span className="primary">{row.documentName}</span>
                    <span className="sub" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                        {truncateHash(row.documentHash)}
                    </span>
                </div>
            ),
        },
        {
            key: 'signedAt',
            header: 'Signed At',
            width: '120px',
            render: (row) => formatDate(row.signedAt),
        },
        {
            key: 'verificationStatus',
            header: 'Verification',
            width: '120px',
            render: (row) => (
                <Badge
                    variant={
                        row.verificationStatus === 'VALID'
                            ? 'active'
                            : row.verificationStatus === 'INVALID'
                                ? 'danger'
                                : 'neutral'
                    }
                >
                    {row.verificationStatus.toLowerCase()}
                </Badge>
            ),
        },
        {
            key: 'documentSource',
            header: 'Source',
            width: '120px',
            render: (row) => row.documentSource,
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={data}
            loading={loading}
            error={error}
            emptyTitle="No signed documents yet"
            emptyDescription="This signature has not been used to sign any tracked documents."
            getRowKey={(row) => row.documentId}
        />
    );
}
