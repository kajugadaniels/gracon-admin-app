// AuditTable — high-density rows for the admin audit log.
// Shows: action badge, actor (admin who did it), target user,
// metadata reason if present, IP, and timestamp.
// Rows are static — no detail page, all context is in the row.
// NID_DECRYPTED and PID_DECRYPTED rows are highlighted — sensitive actions.
'use client';

import React from 'react';
import Link from 'next/link';
import { DataTable, Badge, ADMIN_ACTION_VARIANT, type Column } from '@/components/ui';
import type { AuditLogEntry } from '@/api/audit/list-audit.api';

interface AuditTableProps {
    data: AuditLogEntry[];
    loading: boolean;
    error: string | null;
}

const ACTION_LABELS: Record<string, string> = {
    USER_DEACTIVATED: 'User deactivated',
    USER_REACTIVATED: 'User reactivated',
    SESSIONS_REVOKED: 'Sessions revoked',
    ID_STATUS_CHANGED: 'ID status changed',
    NID_DECRYPTED: 'NID decrypted',
    PID_DECRYPTED: 'PID decrypted',
    USER_DETAIL_VIEWED: 'Detail viewed',
    ADMIN_CREATED: 'Admin created',
    ADMIN_DEACTIVATED: 'Admin deactivated',
    ADMIN_REACTIVATED: 'Admin reactivated',
    ADMIN_INVITE_RESENT: 'Invite resent',
};

// Actions that warrant a visual highlight — sensitive data access
const SENSITIVE_ACTIONS = new Set(['NID_DECRYPTED', 'PID_DECRYPTED']);

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function AuditTable({ data, loading, error }: AuditTableProps) {
    const columns: Column<AuditLogEntry>[] = [
        {
            key: 'action',
            header: 'Action',
            width: '180px',
            render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {SENSITIVE_ACTIONS.has(row.action) && (
                        // Red dot for sensitive actions — instant visual signal
                        <div
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: 'var(--error)',
                                flexShrink: 0,
                                boxShadow: '0 0 4px var(--error)',
                            }}
                            title="Sensitive data access"
                            aria-label="Sensitive data access"
                        />
                    )}
                    <Badge variant={ADMIN_ACTION_VARIANT[row.action] ?? 'neutral'}>
                        {ACTION_LABELS[row.action] ?? row.action}
                    </Badge>
                </div>
            ),
        },
        {
            key: 'admin',
            header: 'Performed by',
            width: '160px',
            render: (row) => (
                <div className="data-cell-stack">
                    <span className="primary">{row.adminName}</span>
                    <span className="sub">{row.adminEmail}</span>
                </div>
            ),
        },
        {
            key: 'target',
            header: 'Target user',
            width: '160px',
            render: (row) =>
                row.targetUserId ? (
                    <Link
                        href={`/users/${row.targetUserId}`}
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
                        title={`View user ${row.targetEmail ?? row.targetUserId}`}
                    >
                        {row.targetEmail ?? row.targetUserId.slice(0, 8) + '…'}
                    </Link>
                ) : (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                ),
        },
        {
            key: 'reason',
            header: 'Reason',
            width: '1fr',
            render: (row) => {
                const reason = row.metadata?.reason;
                if (!reason || typeof reason !== 'string') {
                    return <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>;
                }
                return (
                    <span
                        style={{
                            fontSize: 12,
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            fontStyle: 'italic',
                        }}
                        title={reason}
                    >
                        {reason}
                    </span>
                );
            },
        },
        {
            key: 'ip',
            header: 'IP',
            width: '120px',
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
            key: 'date',
            header: 'Date',
            width: '140px',
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
            <div style={{ minWidth: 780 }}>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    error={error}
                    getRowKey={(row) => row.id}
                    // No onRowClick — audit log is read-only, all context in the row
                    emptyTitle="No audit records found"
                    emptyDescription="Try adjusting your filters."
                />
            </div>
        </div>
    );
}