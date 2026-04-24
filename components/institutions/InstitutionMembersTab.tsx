'use client';

import React from 'react';
import { Badge, Button, DataTable, type Column, EmptyState } from '@/components/ui';
import type { InstitutionMemberItem } from '@/api/institutions/institutions.types';

interface InstitutionMembersTabProps {
    members: InstitutionMemberItem[];
    canManage: boolean;
    onAddMember: () => void;
    onChangeRole: (member: InstitutionMemberItem) => void;
    onRemove: (member: InstitutionMemberItem) => void;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function InstitutionMembersTab({
    members,
    canManage,
    onAddMember,
    onChangeRole,
    onRemove,
}: InstitutionMembersTabProps) {
    const columns: Column<InstitutionMemberItem>[] = [
        {
            key: 'user',
            header: 'Member',
            width: '1.2fr',
            render: (row) => (
                <div className="data-cell-stack">
                    <span className="primary">{row.userName}</span>
                    <span className="sub">{row.userEmail}</span>
                </div>
            ),
        },
        { key: 'role', header: 'Role', width: '110px', render: (row) => row.role },
        {
            key: 'joinedAt',
            header: 'Joined',
            width: '110px',
            render: (row) => formatDate(row.joinedAt),
        },
        {
            key: 'status',
            header: 'Status',
            width: '110px',
            render: (row) => (
                <Badge variant={row.status === 'ACTIVE' ? 'active' : row.status === 'PENDING' ? 'pending' : 'neutral'}>
                    {row.status}
                </Badge>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            width: '170px',
            render: (row) => (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {canManage && (
                        <>
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                disabled={row.isOwner}
                                title={row.isOwner ? 'The institution owner cannot be changed.' : undefined}
                                onClick={() => onChangeRole(row)}
                            >
                                Change Role
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="danger"
                                disabled={row.isOwner}
                                title={row.isOwner ? 'The institution owner cannot be removed.' : undefined}
                                onClick={() => onRemove(row)}
                            >
                                Remove
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={headerStyle}>
                <div>
                    <h3 style={titleStyle}>Members</h3>
                    <p style={subtitleStyle}>Manage the institution trust roster and signing roles.</p>
                </div>
                {canManage && (
                    <Button type="button" variant="primary" onClick={onAddMember}>
                        Add Member
                    </Button>
                )}
            </div>

            {members.length === 0 ? (
                <div className="glass-card" style={{ padding: 24 }}>
                    <EmptyState
                        title="No institution members"
                        description="Add verified users to start managing institutional signing authority."
                        action={canManage ? { label: 'Add Member', onClick: onAddMember } : undefined}
                    />
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={members}
                    getRowKey={(row) => row.memberId}
                    emptyTitle="No institution members"
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
