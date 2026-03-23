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

const CopyIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

interface UserActionModalsProps {
    user: UserDetail;
    modal: ModalType;
    reason: string;
    loading: boolean;
    decryptedNid: string | null;
    onReasonChange: (v: string) => void;
    onClose: () => void;
    onCloseDecrypt: () => void;
    onDeactivate: () => void;
    onReactivate: () => void;
    onRevoke: () => void;
    onVerifyId: () => void;
    onUnverifyId: () => void;
    onDecryptNid: () => void;
}

export function UserActionModals({
    user,
    modal,
    reason,
    loading,
    decryptedNid,
    onReasonChange,
    onClose,
    onCloseDecrypt,
    onDeactivate,
    onReactivate,
    onRevoke,
    onVerifyId,
    onUnverifyId,
    onDecryptNid,
}: UserActionModalsProps) {
    const name = `${user.firstName} ${user.lastName}`;
    const activeSessions = user.sessions.length;

    const copyToClipboard = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            const { toast } = await import('sonner');
            toast.success('Copied to clipboard.');
        } catch {
            const { toast } = await import('sonner');
            toast.error('Failed to copy.');
        }
    };

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

            {/* Decrypt NID — inline reveal */}
            <ConfirmModal
                open={modal === 'decryptNid'}
                onClose={onCloseDecrypt}
                onConfirm={
                    decryptedNid
                        ? onCloseDecrypt
                        : onDecryptNid
                }
                loading={loading}
                variant={decryptedNid ? 'default' : 'danger'}
                title={decryptedNid ? 'National ID Number' : 'Decrypt National ID'}
                description={
                    decryptedNid
                        ? 'This access has been permanently logged. Close when done.'
                        : `Decrypting the NID of ${name} is a permanently logged action. Your identity and timestamp are recorded in the audit trail.`
                }
                confirmLabel={decryptedNid ? 'Done' : 'Confirm decrypt'}
                cancelLabel={decryptedNid ? undefined : 'Cancel'}
            >
                {/* Inline NID reveal — shown after successful decrypt */}
                {decryptedNid && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'var(--glass-interactive)',
                            border: '1px solid var(--glass-interactive-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 14px',
                            marginBottom: 12,
                        }}
                    >
                        <code
                            style={{
                                flex: 1,
                                fontSize: 15,
                                fontFamily: 'monospace',
                                color: 'var(--text-primary)',
                                letterSpacing: '0.06em',
                                wordBreak: 'break-all',
                            }}
                        >
                            {decryptedNid}
                        </code>
                        <button
                            onClick={() => copyToClipboard(decryptedNid)}
                            title="Copy to clipboard"
                            aria-label="Copy NID"
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                padding: 4,
                                flexShrink: 0,
                            }}
                        >
                            <CopyIcon />
                        </button>
                    </div>
                )}
            </ConfirmModal>
        </>
    );
}