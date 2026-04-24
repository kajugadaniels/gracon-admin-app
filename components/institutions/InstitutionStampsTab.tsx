'use client';

import React from 'react';
import { Badge, Button, DataTable, EmptyState, Pagination, type Column } from '@/components/ui';
import type { InstitutionStampActivityItem } from '@/api/institutions/institutions.types';
import type { StampDetail } from '@/api/stamps/stamps.types';
import { StampDetailModal } from '@/components/stamps/StampDetailModal';

interface InstitutionStampsTabProps {
    institutionId: string;
    stamps: InstitutionStampActivityItem[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    onView: (stampId: string) => void;
    selectedStamp: StampDetail | null;
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

export function InstitutionStampsTab({
    stamps,
    loading,
    page,
    totalPages,
    onPageChange,
    onView,
    selectedStamp,
}: InstitutionStampsTabProps) {
    const columns: Column<InstitutionStampActivityItem>[] = [
        {
            key: 'documentHash',
            header: 'Document Hash',
            width: '1.1fr',
            render: (row) => <span style={monoStyle}>{row.documentHash}</span>,
        },
        { key: 'stampedBy', header: 'Stamped By', width: '160px', render: (row) => row.stampedBy },
        { key: 'coSigner', header: 'Co-signer', width: '160px', render: (row) => row.coSigner },
        { key: 'stampedAt', header: 'Stamped At', width: '150px', render: (row) => formatDate(row.stampedAt) },
        {
            key: 'verificationStatus',
            header: 'Verification',
            width: '110px',
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
                <Button type="button" variant="ghost" size="sm" onClick={() => onView(row.stampId)}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
                <h3 style={titleStyle}>Stamping Activity</h3>
                <p style={subtitleStyle}>Review every institutional stamp event and its verification chain.</p>
            </div>

            {stamps.length === 0 && !loading ? (
                <div className="glass-card" style={{ padding: 24 }}>
                    <EmptyState
                        title="No stamp activity"
                        description="Stamp events will appear here after institution members begin stamping documents."
                    />
                </div>
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        data={stamps}
                        loading={loading}
                        getRowKey={(row) => row.stampId}
                        emptyTitle="No stamp activity"
                    />
                    {totalPages > 1 && (
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            total={stamps.length * totalPages}
                            limit={10}
                            onChange={onPageChange}
                        />
                    )}
                </>
            )}

            <StampDetailModal open={Boolean(selectedStamp)} stamp={selectedStamp} onClose={() => onView('')} />
        </div>
    );
}

const monoStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    color: 'var(--text-primary)',
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
