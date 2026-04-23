// AuditHistory — last 5 admin actions taken on this user.
// Shows who did what, when, from which IP, and any reason provided.
// Links to the full audit log filtered to this user.
'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, ADMIN_ACTION_VARIANT } from '@/components/ui';
import type { AuditItem } from '@/api/users/get-user.api';

interface AuditHistoryProps {
    userId: string;
    history: AuditItem[];
}

const ACTION_LABELS: Record<string, string> = {
    USER_DEACTIVATED: 'Account deactivated',
    USER_REACTIVATED: 'Account reactivated',
    SESSIONS_REVOKED: 'Sessions revoked',
    ID_STATUS_CHANGED: 'ID status changed',
    NID_DECRYPTED: 'NID decrypted',
    PID_DECRYPTED: 'PID decrypted',
    USER_DETAIL_VIEWED: 'Detail viewed',
    ADMIN_CREATED: 'Admin created',
};

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export function AuditHistory({ userId, history }: AuditHistoryProps) {
    return (
        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: 12,
                }}
            >
                Admin action history
            </div>

            {history.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                    No admin actions recorded for this user.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {history.map((item) => {
                        const adminName =
                            typeof item.adminName === 'string' && item.adminName.trim()
                                ? item.adminName
                                : 'Unknown admin';
                        const reasonText =
                            typeof item.metadata?.reason === 'string'
                                ? item.metadata.reason
                                : null;

                        return (
                            <div
                                key={item.id}
                                style={{
                                    background: 'var(--glass-interactive)',
                                    border: '1px solid var(--glass-interactive-border)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '10px 12px',
                                }}
                            >
                                {/* Top row */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 4,
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    <Badge variant={ADMIN_ACTION_VARIANT[item.action] ?? 'neutral'}>
                                        {ACTION_LABELS[item.action] ?? item.action}
                                    </Badge>
                                    <span
                                        style={{
                                            marginLeft: 'auto',
                                            fontSize: 11,
                                            color: 'var(--text-muted)',
                                            fontVariantNumeric: 'tabular-nums',
                                        }}
                                    >
                                        {formatDateTime(item.createdAt)}
                                    </span>
                                </div>

                                {/* Admin who performed + IP */}
                                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                                    By <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                        {adminName}
                                    </span>
                                    {item.ipAddress && (
                                        <span style={{ color: 'var(--text-muted)' }}>
                                            {' '}from {item.ipAddress}
                                        </span>
                                    )}
                                </div>

                                {/* Reason from metadata */}
                                {reasonText && (
                                    <div
                                        style={{
                                            marginTop: 4,
                                            fontSize: 11,
                                            color: 'var(--text-muted)',
                                            fontStyle: 'italic',
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        &quot;{reasonText}&quot;
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            <Link
                href={`/audit?targetUserId=${userId}`}
                style={{
                    display: 'block',
                    textAlign: 'center',
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: '1px solid var(--glass-interactive-border)',
                    fontSize: 12,
                    color: 'var(--primary-text)',
                    textDecoration: 'none',
                    fontWeight: 500,
                }}
            >
                View full audit log for this user →
            </Link>
        </div>
    );
}
