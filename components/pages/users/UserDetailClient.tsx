// UserDetailClient — the full user detail page assembled.
// Two-column layout: left has profile + identity, right has
// actions panel + all activity sections stacked.
// Re-fetches user on every successful action — never shows stale state.
// Back button uses router.back() — preserves filter state on the list.
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, Spinner } from '@/components/ui';
import {
    UserDetailCard,
    UserActionsPanel,
    VerificationHistory,
    SessionList,
    SecurityEventTimeline,
    AuditHistory,
} from '@/components/pages/users';
import { getUserApi, type UserDetail } from '@/api/users/get-user.api';

interface UserDetailClientProps {
    userId: string;
}

const BackIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
);

export function UserDetailClient({ userId }: UserDetailClientProps) {
    const router = useRouter();

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUserApi(userId);
            setUser(res.data);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                'Failed to load user. They may not exist.',
            );
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    if (loading) {
        return <Spinner fullPage label="Loading user profile…" />;
    }

    if (error || !user) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 14, color: 'var(--error-text)', marginBottom: 16 }}>
                    {error ?? 'User not found.'}
                </div>
                <Button variant="secondary" onClick={() => router.push('/users')}>
                    Back to users
                </Button>
            </div>
        );
    }

    const fullName = `${user.firstName} ${user.lastName}`;

    return (
        <>
            <PageHeader
                title={fullName}
                subtitle={user.email}
                action={
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<BackIcon />}
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                }
            />

            {/* Two-column layout */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
                    gap: 16,
                    alignItems: 'start',
                }}
            >
                {/* Left column — profile + identity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <UserDetailCard user={user} />
                </div>

                {/* Right column — actions + activity */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <UserActionsPanel user={user} onRefresh={fetchUser} />
                    <VerificationHistory verifications={user.verifications} />
                    <SessionList sessions={user.sessions} />
                    <SecurityEventTimeline events={user.securityEvents} />
                    <AuditHistory userId={user.userId} history={user.auditHistory} />
                </div>
            </div>

            {/* Responsive: stack columns on tablet and mobile */}
            <style>{`
        @media (max-width: 900px) {
          .user-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </>
    );
}