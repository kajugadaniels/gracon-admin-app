// SecurityAlert — warning banner shown when failed logins exceed 50 in 24h.
// Only renders when the threshold is crossed — completely absent otherwise.
// Links directly to the security events page with the filter pre-applied.
// Admins should be able to go from alert to investigation in one click.
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

interface SecurityAlertProps {
    failedLogins: number;
    rateLimitHits: number;
    threshold?: number;
}

const AlertIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

export function SecurityAlert({
    failedLogins,
    rateLimitHits,
    threshold = 50,
}: SecurityAlertProps) {
    // Always render — threshold determines severity styling only
    const isHighRisk = failedLogins >= threshold || rateLimitHits >= threshold;
    const hasActivity = failedLogins > 0 || rateLimitHits > 0;

    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                marginBottom: 16,
                borderRadius: 'var(--radius)',
                background: isHighRisk
                    ? '#FEF2F2'
                    : hasActivity
                        ? '#FFFBEB'
                        : '#F0FDF4',
                border: `1px solid ${isHighRisk
                        ? '#FECACA'
                        : hasActivity
                            ? '#FDE68A'
                            : '#BBF7D0'
                    }`,
            }}
        >
            {/* Icon */}
            <div
                style={{
                    color: isHighRisk ? 'var(--error)' : 'var(--warning)',
                    flexShrink: 0,
                    display: 'flex',
                }}
                aria-hidden="true"
            >
                <AlertIcon />
            </div>

            {/* Message */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isHighRisk
                            ? '#991B1B'
                            : hasActivity
                                ? '#92400E'
                                : '#166534',
                        marginBottom: 2,
                    }}
                >
                    {isHighRisk
                        ? 'High-risk activity detected'
                        : hasActivity
                            ? 'Security activity in the last 24h'
                            : 'No security alerts'}
                </div>
                <div
                    style={{
                        fontSize: 12,
                        color: isHighRisk ? '#B91C1C' : hasActivity ? '#B45309' : '#15803D',
                        lineHeight: 1.5,
                    }}
                >
                    {hasActivity ? (
                        <>
                            {failedLogins > 0 && (
                                <span>
                                    <strong>{failedLogins.toLocaleString()}</strong> failed login
                                    {failedLogins !== 1 ? 's' : ''}
                                </span>
                            )}
                            {failedLogins > 0 && rateLimitHits > 0 && (
                                <span style={{ margin: '0 6px', opacity: 0.5 }}>·</span>
                            )}
                            {rateLimitHits > 0 && (
                                <span>
                                    <strong>{rateLimitHits.toLocaleString()}</strong> rate limit
                                    hit{rateLimitHits !== 1 ? 's' : ''}
                                </span>
                            )}
                        </>
                    ) : (
                        'All clear — no failed logins or rate limit hits in the last 24 hours.'
                    )}
                </div>
            </div>

            {hasActivity && (
                <Link
                    href="/security-events?eventType=LOGIN_FAILED"
                    style={{ textDecoration: 'none', flexShrink: 0 }}
                >
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={<ArrowRightIcon />}
                        style={{
                            background: 'white',
                            borderColor: isHighRisk ? '#FECACA' : '#FDE68A',
                            color: isHighRisk ? '#991B1B' : '#92400E',
                        }}
                    >
                        Investigate
                    </Button>
                </Link>
            )}
        </div>
    );
}