// VerificationTable — high-density rows for verification attempts.
// Score is shown as a colored number — green above threshold, red below.
// Composite score bar gives instant visual context per row.
// Clicking a row navigates to the full detail page.
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Badge, type Column } from '@/components/ui';
import type { VerificationListItem } from '@/api/verifications/list-verifications.api';

const PASS_THRESHOLD = 80.0;

interface VerificationTableProps {
    data: VerificationListItem[];
    loading: boolean;
    error: string | null;
}

function ScoreCell({ score, passed }: { score: number; passed: boolean }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Mini score bar */}
            <div
                style={{
                    width: 48,
                    height: 4,
                    borderRadius: 2,
                    background: 'var(--glass-interactive)',
                    overflow: 'hidden',
                    flexShrink: 0,
                }}
                aria-hidden="true"
            >
                <div
                    style={{
                        height: '100%',
                        width: `${Math.min(score, 100)}%`,
                        background: passed ? 'var(--success)' : 'var(--error)',
                        borderRadius: 2,
                    }}
                />
            </div>
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: passed ? 'var(--success-text)' : 'var(--error-text)',
                    fontVariantNumeric: 'tabular-nums',
                    minWidth: 32,
                }}
            >
                {score.toFixed(1)}
            </span>
        </div>
    );
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function VerificationTable({
    data,
    loading,
    error,
}: VerificationTableProps) {
    const router = useRouter();

    const columns: Column<VerificationListItem>[] = [
        {
            key: 'user',
            header: 'User',
            width: '1fr',
            render: (row) => (
                <div className="data-cell-stack">
                    <span className="primary">{row.userName}</span>
                    <span className="sub">{row.userEmail}</span>
                </div>
            ),
        },
        {
            key: 'attempt',
            header: 'Attempt',
            width: '70px',
            render: (row) => (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    #{row.attemptNumber}
                </span>
            ),
        },
        {
            key: 'result',
            header: 'Result',
            width: '90px',
            render: (row) => (
                <Badge variant={row.passed ? 'active' : 'inactive'} dot>
                    {row.passed ? 'Passed' : 'Failed'}
                </Badge>
            ),
        },
        {
            key: 'score',
            header: 'Score',
            width: '120px',
            render: (row) => (
                <ScoreCell score={row.compositeScore} passed={row.passed} />
            ),
        },
        {
            key: 'document',
            header: 'Doc match',
            width: '90px',
            render: (row) => (
                <Badge variant={row.documentMatch ? 'verified' : 'inactive'}>
                    {row.documentMatch ? 'Yes' : 'No'}
                </Badge>
            ),
        },
        {
            key: 'ip',
            header: 'IP',
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
            key: 'date',
            header: 'Date',
            width: '120px',
            render: (row) => (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
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
                    onRowClick={(row) => router.push(`/verifications/${row.id}`)}
                    emptyTitle="No verification attempts found"
                    emptyDescription="Try adjusting your filters."
                />
            </div>
        </div>
    );
}