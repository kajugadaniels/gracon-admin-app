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
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { decryptNidApi } from '@/api/users/decrypt-nid.api';
import { decryptPidApi } from '@/api/users/decrypt-pid.api';
import { SensitiveValueRevealModal } from '@/components/security/SensitiveValueRevealModal';

function getApiErrorMessage(error: unknown, fallback: string) {
    if (typeof error !== 'object' || !error) return fallback;
    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) return fallback;
    const data = Reflect.get(response, 'data');
    if (typeof data !== 'object' || !data) return fallback;
    const message = Reflect.get(data, 'message');
    return typeof message === 'string' ? message : fallback;
}

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
    const admin = useAdminAuthStore((state) => state.admin);
    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revealTarget, setRevealTarget] = useState<'nid' | 'pid' | null>(null);
    const [revealLoading, setRevealLoading] = useState(false);
    const [revealError, setRevealError] = useState<string | null>(null);
    const [revealedValue, setRevealedValue] = useState<string | null>(null);
    const [revealResetKey, setRevealResetKey] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getUserApi(userId);
            setUser(res.data);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to load user. They may not exist.'));
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // All action state lives here — passed down to bar + modals
    const actions = useUserActions(user, fetchUser);

    const closeRevealModal = useCallback(() => {
        setRevealTarget(null);
        setRevealLoading(false);
        setRevealError(null);
        setRevealedValue(null);
        setRevealResetKey(null);
    }, []);

    const handleSensitiveReveal = useCallback(async (reason: string) => {
        if (!user) return;
        setRevealLoading(true);
        setRevealError(null);
        try {
            if (revealTarget === 'pid') {
                const response = await decryptPidApi(user.userId, reason);
                setRevealedValue(response.data.pid);
                setRevealResetKey(`${response.data.userId}-pid-${Date.now()}`);
            } else {
                const response = await decryptNidApi(user.userId, reason);
                setRevealedValue(response.data.nid);
                setRevealResetKey(`${response.data.userId}-nid-${Date.now()}`);
            }
        } catch (nextError: unknown) {
            setRevealError(getApiErrorMessage(nextError, 'Failed to reveal value.'));
        } finally {
            setRevealLoading(false);
        }
    }, [revealTarget, user]);

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
            <UserTabs
                user={user}
                isSuperAdmin={Boolean(isSuperAdmin)}
                onRevealNid={() => {
                    setRevealTarget('nid');
                    setRevealError(null);
                    setRevealedValue(null);
                    setRevealResetKey(null);
                }}
                onRevealPid={() => {
                    setRevealTarget('pid');
                    setRevealError(null);
                    setRevealedValue(null);
                    setRevealResetKey(null);
                }}
            />

            {/* All modals rendered at page level */}
            <UserActionModals
                user={user}
                modal={actions.modal}
                reason={actions.reason}
                loading={actions.loading}
                onReasonChange={actions.setReason}
                onClose={actions.closeModal}
                onDeactivate={actions.handleDeactivate}
                onReactivate={actions.handleReactivate}
                onRevoke={actions.handleRevokeSessions}
                onVerifyId={actions.handleVerifyId}
                onUnverifyId={actions.handleUnverifyId}
            />
            <SensitiveValueRevealModal
                open={Boolean(revealTarget)}
                loading={revealLoading}
                error={revealError}
                value={revealedValue}
                resetKey={revealResetKey}
                title={revealTarget === 'pid' ? 'Request decrypted PID view' : 'Request decrypted NID view'}
                submitLabel={revealTarget === 'pid' ? 'Decrypt PID' : 'Decrypt NID'}
                warningText={
                    revealTarget === 'pid'
                        ? 'PID decryption is logged and rate-limited. Use only for documented legitimate reasons.'
                        : 'NID decryption is logged and rate-limited. Use only for documented legitimate reasons.'
                }
                doneText="This value will not be displayed again. Copy it now if needed."
                countdownSeconds={20}
                onClose={closeRevealModal}
                onSubmit={handleSensitiveReveal}
            />
        </>
    );
}
