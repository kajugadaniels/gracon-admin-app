// SecurityEventTimeline — last 10 security events for a user.
// Timeline layout — events stack with a vertical line connecting them.
// Each event type has a semantic color and icon dot.
// Clicking an event type navigates to the security events page filtered.
'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, EVENT_TYPE_VARIANT } from '@/components/ui';
import type { SecurityEventItem } from '@/api/users/get-user.api';

interface SecurityEventTimelineProps {
    userId: string;
    events: SecurityEventItem[];
}

const EVENT_LABELS: Record<string, string> = {
    LOGIN_FAILED: 'Login failed',
    LOGIN_SUCCESS: 'Login successful',
    VERIFICATION_FAILED: 'Verification failed',
    VERIFICATION_PASSED: 'Verification passed',
    PASSWORD_RESET_REQUESTED: 'Password reset requested',
    PASSWORD_CHANGED: 'Password changed',
    SESSIONS_REVOKED_BY_USER: 'Sessions revoked by user',
    REVOKED_TOKEN_REUSE: 'Revoked token reuse detected',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
};

const EVENT_DOT_COLOR: Record<string, string> = {
    LOGIN_FAILED: 'var(--error)',
    LOGIN_SUCCESS: 'var(--success)',
    VERIFICATION_FAILED: 'var(--error)',
    VERIFICATION_PASSED: 'var(--success)',
    PASSWORD_RESET_REQUESTED: 'var(--warning)',
    PASSWORD_CHANGED: 'var(--info)',
    SESSIONS_REVOKED_BY_USER: 'var(--info)',
    REVOKED_TOKEN_REUSE: 'var(--error)',
    RATE_LIMIT_EXCEEDED: 'var(--error)',
};

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

export function SecurityEventTimeline({ userId, events }: SecurityEventTimelineProps) {
    return (
        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: 14,
                }}
            >
                Security events
                <span style={{ marginLeft: 6, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                    (last {Math.min(events.length, 10)})
                </span>
            </div>

            {events.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '12px 0' }}>
                    No security events recorded.
                </div>
            ) : (
                <div style={{ position: 'relative' }}>
                    {/* Vertical timeline line */}
                    <div
                        style={{
                            position: 'absolute',
                            left: 7,
                            top: 8,
                            bottom: 8,
                            width: 1,
                            background: 'var(--glass-interactive-border)',
                        }}
                        aria-hidden="true"
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {events.slice(0, 10).map((event, i) => {
                            const dotColor = EVENT_DOT_COLOR[event.eventType] ?? 'var(--text-muted)';
                            return (
                                <div
                                    key={event.id}
                                    style={{
                                        display: 'flex',
                                        gap: 14,
                                        paddingBottom: i < events.length - 1 ? 12 : 0,
                                        position: 'relative',
                                    }}
                                >
                                    {/* Dot */}
                                    <div
                                        style={{
                                            width: 15,
                                            height: 15,
                                            borderRadius: '50%',
                                            background: dotColor,
                                            opacity: 0.85,
                                            flexShrink: 0,
                                            marginTop: 2,
                                            boxShadow: `0 0 6px ${dotColor}`,
                                            zIndex: 1,
                                        }}
                                        aria-hidden="true"
                                    />

                                    {/* Content */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                flexWrap: 'wrap',
                                                marginBottom: 2,
                                            }}
                                        >
                                            <Badge
                                                variant={EVENT_TYPE_VARIANT[event.eventType] ?? 'neutral'}
                                            >
                                                {EVENT_LABELS[event.eventType] ?? event.eventType}
                                            </Badge>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                                                {timeAgo(event.createdAt)}
                                            </span>
                                        </div>
                                        {event.ipAddress && (
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                                {event.ipAddress}
                                            </div>
                                        )}
                                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                                                {Object.entries(event.metadata)
                                                    .filter(([k]) => k !== 'tokenHash')
                                                    .map(([k, v]) => `${k}: ${v}`)
                                                    .join(' · ')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Link to full security events filtered to this user */}
            <Link
                href={`/security-events?userId=${userId}`}
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
                View all events for this user →
            </Link>
        </div>
    );
}
