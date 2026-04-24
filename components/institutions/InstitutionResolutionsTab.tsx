'use client';

import React from 'react';
import { Badge, Button, DataTable, type Column, EmptyState } from '@/components/ui';
import type { AuthorityResolutionItem } from '@/api/institutions/institutions.types';

interface InstitutionResolutionsTabProps {
    resolutions: AuthorityResolutionItem[];
    canManage: boolean;
    onCreate: () => void;
    onRevoke: (resolutionId: string) => void;
}

function formatDate(value: string | null) {
    if (!value) return 'Open-ended';
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function InstitutionResolutionsTab({
    resolutions,
    canManage,
    onCreate,
    onRevoke,
}: InstitutionResolutionsTabProps) {
    const columns: Column<AuthorityResolutionItem>[] = [
        {
            key: 'title',
            header: 'Resolution',
            width: '1.15fr',
            render: (row) => (
                <div className="data-cell-stack">
                    <span className="primary">{row.title}</span>
                    <span className="sub">{row.authorityScope}</span>
                </div>
            ),
        },
        { key: 'grantedTo', header: 'Granted To', width: '160px', render: (row) => row.grantedToName },
        { key: 'validFrom', header: 'Valid From', width: '110px', render: (row) => formatDate(row.validFrom) },
        { key: 'validTo', header: 'Valid To', width: '110px', render: (row) => formatDate(row.validTo) },
        {
            key: 'status',
            header: 'Status',
            width: '100px',
            render: (row) => (
                <Badge variant={row.status === 'ACTIVE' ? 'active' : 'neutral'}>
                    {row.status}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            width: '180px',
            render: (row) => (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {row.documentUrl && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => window.open(row.documentUrl!, '_blank', 'noopener,noreferrer')}>
                            View Document
                        </Button>
                    )}
                    {canManage && row.status === 'ACTIVE' && (
                        <Button type="button" size="sm" variant="danger" onClick={() => onRevoke(row.resolutionId)}>
                            Revoke
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Authority Resolutions</h3>
                    <p style={subtitleStyle}>Document which members are authorized to stamp on behalf of the institution.</p>
                </div>
                {canManage && (
                    <Button type="button" variant="primary" onClick={onCreate}>
                        Create Resolution
                    </Button>
                )}
            </div>

            {resolutions.length === 0 ? (
                <div className="glass-card" style={{ padding: 24 }}>
                    <EmptyState
                        title="No authority resolutions"
                        description="Create a resolution before granting signing authority to institution members."
                        action={canManage ? { label: 'Create Resolution', onClick: onCreate } : undefined}
                    />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={resolutions}
                    getRowKey={(row) => row.resolutionId}
                    emptyTitle="No authority resolutions"
                />
            )}
        </div>
    );
}

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
};

const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const subtitleStyle: React.CSSProperties = {
    marginTop: 4,
    fontSize: 13,
    color: 'var(--text-secondary)',
};
