// UserActionModals — all five confirm modals for user actions.
// Rendered once at the page level, controlled by useUserActions.
// Separated so the sticky bar stays clean — it only triggers modals,
// never renders them directly.
'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import type { UserDetail } from '@/api/users/get-user.api';
import type { ModalType } from './useUserActions';

const ConfirmModal = dynamic(
    () => import('@/components/ui/ConfirmModal').then((m) => m.ConfirmModal),
    { ssr: false },
);

interface UserActionModalsProps {
    user: UserDetail;
    modal: ModalType;
    reason: string;
    loading: boolean;
    onReasonChange: (v: string) => void;
    onClose: () => void;
    onDeactivate: () => void;
    onReactivate: () => void;
    onRevoke: () => void;
    onVerifyId: () => void;
    onUnverifyId: () => void;
}

export function UserActionModals({
    user,
    modal,
    reason,
    loading,
    onReasonChange,
    onClose,
    onDeactivate,
    onReactivate,
    onRevoke,
    onVerifyId,
    onUnverifyId,
}: UserActionModalsProps) {
    const name = `${user.firstName} ${user.lastName}`;
    const activeSessions = user.sessions.length;

    return (
        <>
            {/* Deactivate */}
            <ConfirmModal
                open={modal === 'deactivate'}
                onClose={onClose}
                onConfirm={onDeactivate}
                loading={loading}
                variant="danger"
                title="Deactivate account"
                description={`Deactivating ${name}'s account will immediately revoke all ${activeSessions} active session${activeSessions !== 1 ? 's' : ''} and block all future logins.`}
                confirmLabel="Deactivate"
                reasonLabel="Reason for deactivation"
                reason={reason}
                onReasonChange={onReasonChange}
            />

            {/* Reactivate */}
            <ConfirmModal
                open={modal === 'reactivate'}
                onClose={onClose}
                onConfirm={onReactivate}
                loading={loading}
                title="Reactivate account"
                description={`This will restore login access for ${name}. Existing sessions are not restored — the user must log in again.`}
                confirmLabel="Reactivate"
            />

            {/* Revoke sessions */}
            <ConfirmModal
                open={modal === 'revoke'}
                onClose={onClose}
                onConfirm={onRevoke}
                loading={loading}
                variant="danger"
                title="Revoke all sessions"
                description={`This will immediately terminate all ${activeSessions} active session${activeSessions !== 1 ? 's' : ''} for ${name}. The account remains active.`}
                confirmLabel="Revoke sessions"
            />

            {/* Grant ID verification */}
            <ConfirmModal
                open={modal === 'verifyId'}
                onClose={onClose}
                onConfirm={onVerifyId}
                loading={loading}
                title="Grant ID verification"
                description={`Manually marking ${name} as ID-verified bypasses the AI verification process. This action is logged.`}
                confirmLabel="Grant verification"
                reasonLabel="Reason for manual grant"
                reason={reason}
                onReasonChange={onReasonChange}
            />

            {/* Revoke ID verification */}
            <ConfirmModal
                open={modal === 'unverifyId'}
                onClose={onClose}
                onConfirm={onUnverifyId}
                loading={loading}
                variant="danger"
                title="Revoke ID verification"
                description={`Revoking ${name}'s verification will require them to re-verify their identity.`}
                confirmLabel="Revoke verification"
                reasonLabel="Reason for revocation"
                reason={reason}
                onReasonChange={onReasonChange}
                reasonRequired
            />
        </>
    );
}
