// UserTable — high-density row table for the users list.
// Every row is clickable — navigates to user detail.
// Columns: name+email (stacked), phone, status badges, created date.
// Uses DataTable for consistent loading/empty/error states.
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, Badge, type Column } from '@/components/ui';
import type { UserListItem } from '@/api/users/list-users.api';

interface UserTableProps {
    data: UserListItem[];
    loading: boolean;
    error: string | null;
}

// Format a date string to a short readable format
// e.g. "Nov 19, 2024"
function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function getIdentityLabel(identityType: UserListItem['identityType']) {
    if (identityType === 'FIN') return 'Foreign';
    if (identityType === 'NID') return 'Citizen';
    return 'Unlinked';
}

export function UserTable({ data, loading, error }: UserTableProps) {
    const router = useRouter();

    const columns: Column<UserListItem>[] = [
        {
            key: 'name',
            header: 'User',
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
            key: 'identityType',
            header: 'Identity',
            width: '100px',
            render: (row) => (
                <Badge
                    variant={row.identityType === 'FIN' ? 'info' : 'primary'}
                    dot
                >
                    {getIdentityLabel(row.identityType)}
                </Badge>
            ),
        },
        {
            key: 'phone',
            header: 'Phone',
            width: '140px',
            render: (row) => (
                <span
                    style={{
                        fontSize: 12,
                        color: row.phoneNumber
                            ? 'var(--text-secondary)'
                            : 'var(--text-muted)',
                    }}
                >
                    {row.phoneNumber ?? '—'}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Account',
            width: '96px',
            render: (row) => (
                <Badge variant={row.isActive ? 'active' : 'inactive'} dot>
                    {row.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'email_verified',
            header: 'Email',
            width: '96px',
            render: (row) => (
                <Badge variant={row.isVerified ? 'verified' : 'pending'} dot>
                    {row.isVerified ? 'Verified' : 'Pending'}
                </Badge>
            ),
        },
        {
            key: 'id_verified',
            header: 'ID',
            width: '96px',
            render: (row) => (
                <Badge variant={row.isIdVerified ? 'verified' : 'pending'} dot>
                    {row.isIdVerified ? 'Verified' : 'Pending'}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            header: 'Registered',
            width: '120px',
            render: (row) => (
                <span
                    style={{
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {formatDate(row.createdAt)}
                </span>
            ),
        },
    ];

    return (
        // Horizontal scroll wrapper for small screens
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: 740 }}>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    error={error}
                    getRowKey={(row) => row.userId}
                    onRowClick={(row) => router.push(`/users/${row.userId}`)}
                    emptyTitle="No users found"
                    emptyDescription="Try adjusting your search or filters."
                />
            </div>
        </div>
    );
}
