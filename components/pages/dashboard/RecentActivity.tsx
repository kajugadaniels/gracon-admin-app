// RecentActivity — compact list of the last 8 security events.
// Gives the admin a live pulse of platform activity without
// leaving the dashboard. Click any row goes to security events.
// This is not a full table — it is a quick-scan feed.
'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, EVENT_TYPE_VARIANT } from '@/components/ui';
import type { SecurityEventEntry } from '@/api/security-events/list-security-events.api';

interface RecentActivityProps {
    events: SecurityEventEntry[];
    loading: boolean;
}

// Human-readable labels for event types
const EVENT_LABELS: Record<string, string> = {
    LOGIN_FAILED: 'Login failed',
    LOGIN_SUCCESS: 'Login successful',
    VERIFICATION_FAILED: 'Verification failed',
    VERIFICATION_PASSED: 'Verification passed',
    PASSWORD_RESET_REQUESTED: 'Password reset requested',
    PASSWORD_CHANGED: 'Password changed',
    SESSIONS_REVOKED_BY_USER: 'Sessions revoked',
    REVOKED_TOKEN_REUSE: 'Revoked token reuse',
    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
};

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

export function RecentActivity({ events, loading }: RecentActivityProps) {
    return (
        <div
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
            }}
        >
            {/* Section header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                }}
            >
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                    }}
                >
                    Recent security events
                </span>
                <Link
                    href="/security-events"
                    style={{
                        fontSize: 12,
                        color: 'var(--primary)',
                        textDecoration: 'none',
                        fontWeight: 500,
                    }}
                >
                    View all →
                </Link>
            </div>

            {/* Event list */}
            {loading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '10px 16px',
                            borderBottom: '1px solid var(--border)',
                        }}
                    >
                        <div
                            style={{
                                width: 80,
                                height: 20,
                                background: 'rgba(0,0,0,0.06)',
                                borderRadius: 4,
                            }}
                        />
                        <div
                            style={{
                                flex: 1,
                                height: 13,
                                background: 'rgba(0,0,0,0.06)',
                                borderRadius: 4,
                            }}
                        />
                        <div
                            style={{
                                width: 40,
                                height: 13,
                                background: 'rgba(0,0,0,0.06)',
                                borderRadius: 4,
                            }}
                        />
                    </div>
                ))
            ) : events.length === 0 ? (
                <div
                    style={{
                        padding: '24px 16px',
                        textAlign: 'center',
                        fontSize: 13,
                        color: 'var(--text-muted)',
                    }}
                >
                    No security events recorded yet.
                </div>
            ) : (
                events.slice(0, 8).map((event, i) => (
                    <Link
                        key={event.id}
                        href={`/security-events?eventType=${event.eventType}`}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '9px 16px',
                            borderBottom: i < Math.min(events.length, 8) - 1
                                ? '1px solid var(--border)'
                                : 'none',
                            textDecoration: 'none',
                            transition: 'background 100ms ease',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                                'var(--surface-raised)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = '';
                        }}
                    >
                        {/* Event type badge */}
                        <Badge
                            variant={EVENT_TYPE_VARIANT[event.eventType] ?? 'neutral'}
                            style={{ flexShrink: 0, minWidth: 140 } as React.CSSProperties}
                        >
                            {EVENT_LABELS[event.eventType] ?? event.eventType}
                        </Badge>

                        {/* User or IP */}
                        <span
                            style={{
                                flex: 1,
                                fontSize: 12,
                                color: 'var(--text-muted)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                minWidth: 0,
                            }}
                        >
                            {event.userEmail ?? event.ipAddress ?? '—'}
                        </span>

                        {/* Time ago */}
                        <span
                            style={{
                                fontSize: 11,
                                color: 'var(--text-muted)',
                                flexShrink: 0,
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {timeAgo(event.createdAt)}
                        </span>
                    </Link>
                ))
            )}
        </div>
    );
}