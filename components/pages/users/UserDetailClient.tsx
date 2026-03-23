// UserDetailClient — user detail page with sticky action bar + tabs.
// Sticky bar stays visible at all times — actions never require scrolling.
// Tabs divide the content into four focused views.
// Re-fetches the full user after every successful action.
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, Spinner } from '@/components/ui';
import { StickyActionBar } from './StickyActionBar';
import { UserTabs } from './UserTabs';
import { UserActionModals } from './UserActionModals';
import { useUserActions } from './useUserActions';
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

    // All action state lives here — passed down to bar + modals
    const actions = useUserActions(user!, fetchUser);

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

    return (
        <>
            <PageHeader
                title={`${user.firstName} ${user.lastName}`}
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

            {/* Sticky action bar — always visible */}
            <StickyActionBar
                user={user}
                onOpen={actions.setModal}
            />

            {/* Tabbed content */}
            <UserTabs user={user} />

            {/* All modals rendered at page level */}
            <UserActionModals
                user={user}
                modal={actions.modal}
                reason={actions.reason}
                loading={actions.loading}
                decryptedNid={actions.decryptedNid}
                onReasonChange={actions.setReason}
                onClose={actions.closeModal}
                onCloseDecrypt={() => {
                    actions.closeModal();
                    actions.setDecryptedNid(null);
                }}
                onDeactivate={actions.handleDeactivate}
                onReactivate={actions.handleReactivate}
                onRevoke={actions.handleRevokeSessions}
                onVerifyId={actions.handleVerifyId}
                onUnverifyId={actions.handleUnverifyId}
                onDecryptNid={actions.handleDecryptNid}
            />
        </>
    );
}