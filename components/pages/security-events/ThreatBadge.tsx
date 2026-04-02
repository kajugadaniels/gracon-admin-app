// ThreatBadge — color-coded badge for security event types.
// Extends the base Badge with event-specific labels and a
// threat level indicator. High-threat events glow.
// Used standalone on the security events page and as a building
// block for the dashboard RecentActivity feed.
'use client';

import React from 'react';
import { Badge, EVENT_TYPE_VARIANT } from '@/components/ui';

interface ThreatBadgeProps {
    eventType: string;
    // Shows a glow effect on the badge for high-risk events
    glow?: boolean;
}

const EVENT_LABELS: Record<string, string> = {
    LOGIN_FAILED: 'Login failed',
    LOGIN_SUCCESS: 'Login successful',
    VERIFICATION_FAILED: 'Verification failed',
    VERIFICATION_PASSED: 'Verification passed',
    PASSWORD_RESET_REQUESTED: 'Password reset',
    PASSWORD_CHANGED: 'Password changed',
    SESSIONS_REVOKED_BY_USER: 'Sessions revoked',
    REVOKED_TOKEN_REUSE: 'Token reuse',
    RATE_LIMIT_EXCEEDED: 'Rate limit hit',
};

// Events that indicate active threat — get a glow treatment
const HIGH_THREAT = new Set([
    'REVOKED_TOKEN_REUSE',
    'RATE_LIMIT_EXCEEDED',
    'LOGIN_FAILED',
    'VERIFICATION_FAILED',
]);

export function ThreatBadge({ eventType, glow = true }: ThreatBadgeProps) {
    const isHighThreat = glow && HIGH_THREAT.has(eventType);
    const variant = EVENT_TYPE_VARIANT[eventType] ?? 'neutral';

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
            }}
        >
            {isHighThreat && (
                // Pulsing threat dot for high-risk events
                <span
                    style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'var(--error)',
                        flexShrink: 0,
                        boxShadow: '0 0 5px var(--error)',
                        animation: 'threatPulse 2s ease-in-out infinite',
                    }}
                    aria-hidden="true"
                />
            )}
            <Badge variant={variant}>
                {EVENT_LABELS[eventType] ?? eventType}
            </Badge>
        </span>
    );
}