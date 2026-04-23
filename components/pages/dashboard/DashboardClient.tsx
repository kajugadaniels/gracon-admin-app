// DashboardClient — the full dashboard assembled from its parts.
// Fetches stats on mount. Passes loading/error/data to every component.
// Separated from page.tsx so the server component stays clean.
// The cache invalidation button is SUPER_ADMIN only — shown conditionally.
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui';
import {
    StatsGrid,
    ActivityChart,
    SecurityAlert,
    RecentActivity,
    VerificationSummary,
    ForeignIdentityInsights,
} from '@/components/pages/dashboard';
import {
    getStatsApi,
    invalidateStatsCacheApi,
    type PlatformStats,
} from '@/api/stats/get-stats.api';
import { listSecurityEventsApi, type SecurityEventEntry }
    from '@/api/security-events/list-security-events.api';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';

// ── Icon ──────────────────────────────────────────────────────────────────

const RefreshIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

export function DashboardClient() {
    const admin = useAdminAuthStore((s) => s.admin);
    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [recentEvents, setRecentEvents] = useState<SecurityEventEntry[]>([]);
    const [statsLoading, setStatsLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [statsError, setStatsError] = useState<string | null>(null);
    const [invalidating, setInvalidating] = useState(false);

    // Fetch stats and recent security events in parallel
    const fetchData = useCallback(async () => {
        setStatsLoading(true);
        setEventsLoading(true);
        setStatsError(null);

        const [statsResult, eventsResult] = await Promise.allSettled([
            getStatsApi(),
            listSecurityEventsApi({ limit: 8, page: 1 }),
        ]);

        if (statsResult.status === 'fulfilled') {
            setStats(statsResult.value.data);
        } else {
            setStatsError('Failed to load stats. Please refresh.');
        }
        setStatsLoading(false);

        if (eventsResult.status === 'fulfilled') {
            setRecentEvents(eventsResult.value.data.data);
        }
        setEventsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Cache invalidation — SUPER_ADMIN only
    const handleInvalidateCache = async () => {
        setInvalidating(true);
        try {
            await invalidateStatsCacheApi();
            toast.success('Cache cleared. Refreshing stats…');
            await fetchData();
        } catch {
            toast.error('Failed to invalidate cache.');
        } finally {
            setInvalidating(false);
        }
    };

    // Format the cache timestamp for display
    const cacheAge = stats?.cachedAt
        ? (() => {
            const mins = Math.floor(
                (Date.now() - new Date(stats.cachedAt).getTime()) / 60_000,
            );
            return mins < 1
                ? 'just now'
                : `${mins} min${mins !== 1 ? 's' : ''} ago`;
        })()
        : null;

    return (
        <>
            <PageHeader
                title={`Good ${getTimeOfDay()}, ${admin?.firstName ?? 'Admin'}`}
                subtitle="Here is what is happening on the platform right now."
                action={
                    isSuperAdmin ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={<RefreshIcon />}
                            loading={invalidating}
                            onClick={handleInvalidateCache}
                            title="Force-refresh stats cache"
                        >
                            Refresh stats
                        </Button>
                    ) : undefined
                }
            />

            {statsError && (
                <div style={errorBannerStyle}>
                    {statsError}
                </div>
            )}

            {/* Security alert — only shown above threshold */}
            {stats && (
                <SecurityAlert
                    failedLogins={stats.failedLoginsLast24h}
                    rateLimitHits={stats.rateLimitHitsLast24h}
                />
            )}

            {/* Stat cards */}
            <StatsGrid stats={stats ?? undefined} loading={statsLoading} />

            {/* Charts + verification summary row */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 12,
                    marginBottom: 16,
                }}
            >
                {/* Registrations chart */}
                <div
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '14px 16px',
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: 12,
                        }}
                    >
                        New registrations — last 7 days
                    </div>
                    <ActivityChart
                        data={stats?.registrationsLast7Days ?? []}
                        color="var(--primary)"
                        label="New registrations"
                        loading={statsLoading}
                    />
                </div>

                {/* Verifications chart */}
                <div
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '14px 16px',
                    }}
                >
                    <div
                        style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: 12,
                        }}
                    >
                        Verification attempts — last 7 days
                    </div>
                    <ActivityChart
                        data={stats?.verificationsLast7Days ?? []}
                        color="#10b981"
                        label="Verification attempts"
                        loading={statsLoading}
                    />
                </div>

                {/* Verification summary */}
                <VerificationSummary
                    passed={stats?.verificationsPassed ?? 0}
                    failed={stats?.verificationsFailed ?? 0}
                    passRate={stats?.verificationPassRate ?? 0}
                    loading={statsLoading}
                />
            </div>

            <ForeignIdentityInsights
                insights={stats?.foreignIdentityStats}
                loading={statsLoading}
            />

            {/* Recent security events */}
            <RecentActivity
                events={recentEvents}
                loading={eventsLoading}
            />

            {/* Cache metadata footer */}
            {cacheAge && !statsLoading && (
                <p
                    style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        marginTop: 12,
                        textAlign: 'right',
                    }}
                >
                    Stats cached · last updated {cacheAge}
                    {isSuperAdmin && (
                        <span style={{ marginLeft: 4 }}>
                            · expires in {Math.max(
                                0,
                                Math.ceil(
                                    (new Date(stats!.cacheExpiresAt).getTime() - Date.now())
                                    / 60_000,
                                ),
                            )} min
                        </span>
                    )}
                </p>
            )}
        </>
    );
}

// ── Helper ────────────────────────────────────────────────────────────────

function getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

const errorBannerStyle: React.CSSProperties = {
    marginBottom: 16,
    padding: '12px 14px',
    borderRadius: 'var(--radius)',
    border: '1px solid var(--warning-border)',
    background: 'var(--warning-glass)',
    color: 'var(--warning-text)',
    fontSize: 13,
    fontWeight: 500,
};
