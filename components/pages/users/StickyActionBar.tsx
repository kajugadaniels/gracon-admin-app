// StickyActionBar — always-visible action bar at the top of the user
// detail page. Sticks to the top of the content area when scrolling.
// Shows the user's name + status at a glance.
// Contains all three action buttons — always reachable without scrolling.
// SUPER_ADMIN additionally sees the Decrypt NID button.
'use client';

import React from 'react';
import { Badge, Button } from '@/components/ui';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import type { UserDetail } from '@/api/users/get-user.api';
import type { ModalType } from './useUserActions';

interface StickyActionBarProps {
    user: UserDetail;
    onOpen: (modal: ModalType) => void;
}

// ── Icons ──────────────────────────────────────────────────────────────────

const DeactivateIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

const ActivateIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const RevokeIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const VerifyIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

const KeyIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
);

export function StickyActionBar({ user, onOpen }: StickyActionBarProps) {
    const admin = useAdminAuthStore((s) => s.admin);
    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';
    const activeSessions = user.sessions.length;

    return (
        <div
            style={{
                position: 'sticky',
                top: 8,
                zIndex: 10,
                marginBottom: 16,
            }}
        >
            <div
                className="glass-card"
                style={{
                    borderRadius: 'var(--radius-lg)',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                }}
            >
                {/* User identity summary */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    {/* Status dot */}
                    <div
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: user.isActive ? 'var(--success)' : 'var(--error)',
                            flexShrink: 0,
                            boxShadow: `0 0 6px ${user.isActive ? 'var(--success)' : 'var(--error)'}`,
                        }}
                        aria-hidden="true"
                    />
                    <div style={{ minWidth: 0 }}>
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                display: 'block',
                            }}
                        >
                            {user.firstName} {user.lastName}
                        </span>
                    </div>

                    {/* Compact status badges */}
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <Badge variant={user.isActive ? 'active' : 'inactive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={user.isIdVerified ? 'verified' : 'pending'}>
                            {user.isIdVerified ? 'ID verified' : 'ID pending'}
                        </Badge>
                    </div>
                </div>

                {/* Divider */}
                <div
                    style={{
                        width: 1,
                        height: 24,
                        background: 'var(--glass-interactive-border)',
                        flexShrink: 0,
                    }}
                    aria-hidden="true"
                />

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                    {/* Deactivate / Reactivate */}
                    <Button
                        variant={user.isActive ? 'danger' : 'secondary'}
                        size="sm"
                        icon={user.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                        onClick={() => onOpen(user.isActive ? 'deactivate' : 'reactivate')}
                    >
                        {user.isActive ? 'Deactivate' : 'Reactivate'}
                    </Button>

                    {/* Revoke sessions */}
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<RevokeIcon />}
                        disabled={activeSessions === 0}
                        onClick={() => onOpen('revoke')}
                        title={
                            activeSessions === 0
                                ? 'No active sessions to revoke'
                                : `Revoke ${activeSessions} active session${activeSessions !== 1 ? 's' : ''}`
                        }
                    >
                        Revoke sessions
                        {activeSessions > 0 && (
                            <span
                                style={{
                                    background: 'var(--glass-interactive)',
                                    border: '1px solid var(--glass-interactive-border)',
                                    borderRadius: 10,
                                    padding: '0 5px',
                                    fontSize: 10,
                                    fontWeight: 600,
                                    marginLeft: 4,
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {activeSessions}
                            </span>
                        )}
                    </Button>

                    {/* ID verification toggle */}
                    <Button
                        variant={user.isIdVerified ? 'danger' : 'secondary'}
                        size="sm"
                        icon={<VerifyIcon />}
                        onClick={() => onOpen(user.isIdVerified ? 'unverifyId' : 'verifyId')}
                    >
                        {user.isIdVerified ? 'Revoke ID' : 'Grant ID'}
                    </Button>

                    {/* NID decrypt — SUPER_ADMIN only */}
                    {isSuperAdmin && (
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<KeyIcon />}
                            onClick={() => onOpen('decryptNid')}
                        >
                            Decrypt NID
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}