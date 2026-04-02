// AdminTable — list of all admin accounts.
// Shows name, email, role badge, verified status, created by, and date.
// Unverified admins (invite not yet accepted) get a visual indicator.
// Resend invite action is inline on the row — SUPER_ADMIN only.
// No row click navigation — admin detail is not a planned page.
'use client';

import React from 'react';
import { DataTable, Badge, Button, type Column } from '@/components/ui';

export interface AdminRow {
    adminId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    role: 'ADMIN' | 'SUPER_ADMIN';
    isVerified: boolean;
    isActive: boolean;
    createdAt: string;
}

interface AdminTableProps {
    data: AdminRow[];
    loading: boolean;
    error: string | null;
    isSuperAdmin: boolean;
    resendingId: string | null;
    onResendInvite: (adminId: string, email: string) => void;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

const ResendIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
    </svg>
);

export function AdminTable({
    data,
    loading,
    error,
    isSuperAdmin,
    resendingId,
    onResendInvite,
}: AdminTableProps) {

    const columns: Column<AdminRow>[] = [
        {
            key: 'name',
            header: 'Admin',
            width: '1fr',
            render: (row) => (
                <div className="data-cell-stack">
                    <span className="primary">
                        {row.firstName} {row.lastName}
                    </span>
                    <span className="sub">{row.email}</span>
                </div>
            ),
        },
        {
            key: 'role',
            header: 'Role',
            width: '120px',
            render: (row) => (
                <Badge variant={row.role === 'SUPER_ADMIN' ? 'primary' : 'neutral'}>
                    {row.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </Badge>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            width: '130px',
            render: (row) => {
                if (!row.isActive) {
                    return <Badge variant="inactive" dot>Deactivated</Badge>;
                }
                if (!row.isVerified) {
                    return (
                        <Badge variant="pending" dot>Invite pending</Badge>
                    );
                }
                return <Badge variant="active" dot>Active</Badge>;
            },
        },
        {
            key: 'phone',
            header: 'Phone',
            width: '130px',
            render: (row) => (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {row.phoneNumber ?? '—'}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Added',
            width: '110px',
            render: (row) => (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {formatDate(row.createdAt)}
                </span>
            ),
        },
        // Resend invite column — SUPER_ADMIN only, only for unverified admins
        ...(isSuperAdmin ? [{
            key: 'actions',
            header: '',
            width: '110px',
            render: (row: AdminRow) => {
                if (row.isVerified || !row.isActive) return null;
                return (
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<ResendIcon />}
                        loading={resendingId === row.adminId}
                        onClick={(e) => {
                            e.stopPropagation();
                            onResendInvite(row.adminId, row.email);
                        }}
                        style={{ fontSize: 11 }}
                    >
                        Resend
                    </Button>
                );
            },
        }] as Column<AdminRow>[] : []),
    ];

    return (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: 600 }}>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    error={error}
                    getRowKey={(row) => row.adminId}
                    emptyTitle="No admins found"
                    emptyDescription="Add the first admin using the button above."
                />
            </div>
        </div>
    );
}