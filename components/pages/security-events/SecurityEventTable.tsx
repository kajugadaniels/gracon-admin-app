// SecurityEventTable — high-density rows for the security event log.
// ThreatBadge with pulsing dot for high-risk events.
// userId null is handled gracefully — pre-auth events have no user.
// Metadata is rendered as key:value pairs inline, tokenHash excluded.
// Clicking a user email navigates to their profile.
'use client';

import React from 'react';
import Link from 'next/link';
import { DataTable, type Column } from '@/components/ui';
import { ThreatBadge } from './ThreatBadge';
import type { SecurityEventEntry }
    from '@/api/security-events/list-security-events.api';

interface SecurityEventTableProps {
    data: SecurityEventEntry[];
    loading: boolean;
    error: string | null;
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

// Render metadata as compact key:value pairs
// Excludes tokenHash — never show partial token data
function MetadataCell({ metadata }: { metadata: Record<string, unknown> | null }) {
    if (!metadata) return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>;

    const entries = Object.entries(metadata)
        .filter(([k]) => k !== 'tokenHash')
        .slice(0, 3); // max 3 pairs to keep rows compact

    if (entries.length === 0) {
        return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>;
    }

    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 4,
            }}
        >
            {entries.map(([k, v]) => (
                <span
                    key={k}
                    style={{
                        fontSize: 10,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: 'var(--glass-interactive)',
                        border: '1px solid var(--glass-interactive-border)',
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace',
                        whiteSpace: 'nowrap',
                    }}
                    title={`${k}: ${String(v)}`}
                >
                    {k}: <span style={{ color: 'var(--text-primary)' }}>
                        {String(v).slice(0, 20)}{String(v).length > 20 ? '…' : ''}
                    </span>
                </span>
            ))}
        </div>
    );
}

export function SecurityEventTable({
    data,
    loading,
    error,
}: SecurityEventTableProps) {
    const columns: Column<SecurityEventEntry>[] = [
        {
            key: 'eventType',
            header: 'Event',
            width: '190px',
            render: (row) => <ThreatBadge eventType={row.eventType} />,
        },
        {
            key: 'user',
            header: 'User',
            width: '180px',
            render: (row) =>
                row.userId && row.userEmail ? (
                    <Link
                        href={`/users/${row.userId}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            fontSize: 12,
                            color: 'var(--primary-text)',
                            textDecoration: 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                        }}
                    >
                        {row.userEmail}
                    </Link>
                ) : (
                    <span
                        style={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                        }}
                    >
                        Pre-auth / unknown
                    </span>
                ),
        },
        {
            key: 'ip',
            header: 'IP address',
            width: '130px',
            render: (row) => (
                <span
                    style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                    }}
                >
                    {row.ipAddress ?? '—'}
                </span>
            ),
        },
        {
            key: 'metadata',
            header: 'Context',
            width: '1fr',
            render: (row) => <MetadataCell metadata={row.metadata} />,
        },
        {
            key: 'date',
            header: 'Date',
            width: '160px',
            render: (row) => (
                <span
                    style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {formatDateTime(row.createdAt)}
                </span>
            ),
        },
    ];

    return (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: 700 }}>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    error={error}
                    getRowKey={(row) => row.id}
                    emptyTitle="No security events found"
                    emptyDescription="Try adjusting your filters."
                />
            </div>
        </div>
    );
}