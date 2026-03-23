// StatsGrid — four stat cards in a responsive grid.
// Layout: 4 columns on desktop, 2 on tablet, 1 on mobile.
// Each card maps to a specific metric from the stats API response.
'use client';

import React from 'react';
import { StatCard } from './StatCard';
import type { PlatformStats } from '@/api/stats/get-stats.api';

interface StatsGridProps {
    stats?: PlatformStats;
    loading: boolean;
}

// ── Icons ──────────────────────────────────────────────────────────────────

const UsersIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const VerifiedIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const PendingIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const PassRateIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

export function StatsGrid({ stats, loading }: StatsGridProps) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
                marginBottom: 20,
            }}
        >
            <StatCard
                label="Total users"
                value={stats?.totalUsers ?? 0}
                icon={<UsersIcon />}
                accentColor="#5B23FF"
                delta={
                    stats
                        ? `${stats.usersPendingIdVerification.toLocaleString()} pending verification`
                        : undefined
                }
                deltaType="neutral"
                loading={loading}
            />

            <StatCard
                label="Verified today"
                value={stats?.usersVerifiedToday ?? 0}
                icon={<VerifiedIcon />}
                accentColor="#10b981"
                delta={
                    stats
                        ? `${stats.usersPendingIdVerification.toLocaleString()} still pending`
                        : undefined
                }
                deltaType={
                    stats && stats.usersPendingIdVerification > 100
                        ? 'negative'
                        : 'neutral'
                }
                loading={loading}
            />

            <StatCard
                label="Pending ID verification"
                value={stats?.usersPendingIdVerification ?? 0}
                icon={<PendingIcon />}
                accentColor="#f59e0b"
                delta={
                    stats
                        ? `${stats.totalVerifications.toLocaleString()} total attempts`
                        : undefined
                }
                deltaType="neutral"
                loading={loading}
            />

            <StatCard
                label="Verification pass rate"
                value={stats ? Math.round(stats.verificationPassRate) : 0}
                suffix="%"
                icon={<PassRateIcon />}
                accentColor={
                    stats && stats.verificationPassRate >= 75
                        ? '#10b981'
                        : '#f59e0b'
                }
                delta={
                    stats
                        ? `${stats.verificationsPassed.toLocaleString()} passed · ${stats.verificationsFailed.toLocaleString()} failed`
                        : undefined
                }
                deltaType={
                    stats && stats.verificationPassRate >= 75
                        ? 'positive'
                        : 'negative'
                }
                loading={loading}
            />
        </div>
    );
}