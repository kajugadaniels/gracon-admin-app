// SessionList — active refresh tokens for a user.
// Shows IP, user agent (truncated), expiry, and created date.
// Empty state is explicit — "No active sessions" is meaningful signal.
'use client';

import React from 'react';
import type { SessionItem } from '@/api/users/get-user.api';

interface SessionListProps {
    sessions: SessionItem[];
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// Truncate user agent to the browser + OS part only
function parseUserAgent(ua: string | null): string {
    if (!ua) return 'Unknown device';
    // Extract browser name
    if (ua.includes('Chrome')) return `Chrome · ${ua.includes('Mobile') ? 'Mobile' : 'Desktop'}`;
    if (ua.includes('Firefox')) return `Firefox · ${ua.includes('Mobile') ? 'Mobile' : 'Desktop'}`;
    if (ua.includes('Safari')) return `Safari · ${ua.includes('Mobile') ? 'Mobile' : 'Desktop'}`;
    if (ua.includes('Edge')) return `Edge · ${ua.includes('Mobile') ? 'Mobile' : 'Desktop'}`;
    return ua.substring(0, 40) + (ua.length > 40 ? '…' : '');
}

function isExpiringSoon(expiresAt: string): boolean {
    const hoursUntilExpiry =
        (new Date(expiresAt).getTime() - Date.now()) / 3_600_000;
    return hoursUntilExpiry < 2;
}

export function SessionList({ sessions }: SessionListProps) {
    return (
        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                }}
            >
                <SectionTitle>Active sessions</SectionTitle>
                {sessions.length > 0 && (
                    <span
                        style={{
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            background: 'var(--glass-interactive)',
                            border: '1px solid var(--glass-interactive-border)',
                            borderRadius: 12,
                            padding: '2px 8px',
                        }}
                    >
                        {sessions.length}
                    </span>
                )}
            </div>

            {sessions.length === 0 ? (
                <div style={{ padding: '12px 0', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
                    No active sessions.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sessions.map((session, i) => {
                        const expiringSoon = isExpiringSoon(session.expiresAt);
                        return (
                            <div
                                key={session.id}
                                style={{
                                    background: 'var(--glass-interactive)',
                                    border: `1px solid ${expiringSoon ? 'var(--warning-border)' : 'var(--glass-interactive-border)'}`,
                                    borderRadius: 'var(--radius-md)',
                                    padding: '10px 12px',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr auto',
                                    gap: 8,
                                    alignItems: 'start',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: 'var(--text-primary)',
                                            marginBottom: 2,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {parseUserAgent(session.userAgent)}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        {session.ipAddress ?? 'Unknown IP'} ·{' '}
                                        <span
                                            style={{
                                                background: session.tokenType === 'limited'
                                                    ? 'var(--warning-glass)'
                                                    : 'var(--primary-glass)',
                                                color: session.tokenType === 'limited'
                                                    ? 'var(--warning-text)'
                                                    : 'var(--primary-text)',
                                                padding: '1px 5px',
                                                borderRadius: 4,
                                                fontSize: 10,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {session.tokenType}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        Created {formatDateTime(session.createdAt)}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 10,
                                            color: expiringSoon ? 'var(--warning-text)' : 'var(--text-muted)',
                                            marginTop: 2,
                                        }}
                                    >
                                        Expires {formatDateTime(session.expiresAt)}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
            }}
        >
            {children}
        </div>
    );
}