// UserActionsPanel — dedicated right-column actions glass card.
// Contains all three write operations: deactivate/reactivate,
// revoke sessions, and set ID verification status.
// NID decrypt is SUPER_ADMIN only — shown conditionally.
// Every action uses ConfirmModal with a reason input.
// After each action the parent re-fetches the user — no stale state.
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { Button, Badge } from '@/components/ui';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { updateUserStatusApi } from '@/api/users/update-status.api';
import { revokeSessionsApi } from '@/api/users/revoke-sessions.api';
import { updateIdVerificationApi } from '@/api/users/update-id-verification.api';
import { decryptNidApi } from '@/api/users/decrypt-nid.api';
import type { UserDetail } from '@/api/users/get-user.api';

function getApiErrorMessage(error: unknown, fallback: string) {
    if (typeof error !== 'object' || !error) return fallback;
    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) return fallback;
    const data = Reflect.get(response, 'data');
    if (typeof data !== 'object' || !data) return fallback;
    const message = Reflect.get(data, 'message');
    return typeof message === 'string' ? message : fallback;
}

// SSR-safe portal modal
const ConfirmModal = dynamic(
    () => import('@/components/ui/ConfirmModal').then((m) => m.ConfirmModal),
    { ssr: false },
);

interface UserActionsPanelProps {
    user: UserDetail;
    onRefresh: () => void;
}

// ── Icons ──────────────────────────────────────────────────────────────────

const DeactivateIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
);

const ActivateIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const RevokeIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const VerifyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

const UnverifyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="9" y1="9" x2="15" y2="15" />
        <line x1="15" y1="9" x2="9" y2="15" />
    </svg>
);

const KeyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
);

const CopyIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

// ── Action row component ───────────────────────────────────────────────────

function ActionRow({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 0',
                borderBottom: '1px solid var(--glass-interactive-border)',
            }}
        >
            <div
                style={{
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                    display: 'flex',
                }}
                aria-hidden="true"
            >
                {icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 1 }}>
                    {title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {description}
                </div>
            </div>
            <div style={{ flexShrink: 0 }}>
                {children}
            </div>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────

export function UserActionsPanel({ user, onRefresh }: UserActionsPanelProps) {
    const admin = useAdminAuthStore((s) => s.admin);
    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

    // Modal states
    const [modal, setModal] = useState<
        | 'deactivate'
        | 'reactivate'
        | 'revoke'
        | 'verifyId'
        | 'unverifyId'
        | 'decryptNid'
        | null
    >(null);

    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [decryptedNid, setDecryptedNid] = useState<string | null>(null);

    const closeModal = () => {
        setModal(null);
        setReason('');
    };

    // ── Action handlers ────────────────────────────────────────────────────

    const handleDeactivate = async () => {
        setLoading(true);
        try {
            await updateUserStatusApi(user.userId, false, reason);
            toast.success('Account deactivated. All sessions revoked.');
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to deactivate account.'));
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async () => {
        setLoading(true);
        try {
            await updateUserStatusApi(user.userId, true, reason);
            toast.success('Account reactivated.');
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to reactivate account.'));
        } finally {
            setLoading(false);
        }
    };

    const handleRevokeSessions = async () => {
        setLoading(true);
        try {
            const res = await revokeSessionsApi(user.userId);
            toast.success(res.data.message);
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to revoke sessions.'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyId = async () => {
        setLoading(true);
        try {
            await updateIdVerificationApi(user.userId, true, reason);
            toast.success('User manually marked as ID-verified.');
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to update ID status.'));
        } finally {
            setLoading(false);
        }
    };

    const handleUnverifyId = async () => {
        setLoading(true);
        try {
            await updateIdVerificationApi(user.userId, false, reason);
            toast.success('ID verification revoked.');
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to revoke ID status.'));
        } finally {
            setLoading(false);
        }
    };

    const handleDecryptNid = async () => {
        setLoading(true);
        try {
            const res = await decryptNidApi(user.userId);
            setDecryptedNid(res.data.nid);
            // Keep modal open to show the value — close handled by user
            toast.success('NID decrypted. Access has been logged.');
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to decrypt NID.'));
            closeModal();
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success('Copied to clipboard.');
        } catch {
            toast.error('Failed to copy.');
        }
    };

    const activeSessions = user.sessions.length;

    return (
        <>
            <div
                className="glass-card"
                style={{ borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}
            >
                {/* Section title */}
                <div
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted)',
                        marginBottom: 4,
                    }}
                >
                    Actions
                </div>

                {/* Account status action */}
                <ActionRow
                    icon={user.isActive ? <DeactivateIcon /> : <ActivateIcon />}
                    title={user.isActive ? 'Deactivate account' : 'Reactivate account'}
                    description={
                        user.isActive
                            ? 'Blocks login and revokes all active sessions immediately.'
                            : 'Restores login access. User must log in again.'
                    }
                >
                    <Button
                        variant={user.isActive ? 'danger' : 'secondary'}
                        size="sm"
                        onClick={() => setModal(user.isActive ? 'deactivate' : 'reactivate')}
                    >
                        {user.isActive ? 'Deactivate' : 'Reactivate'}
                    </Button>
                </ActionRow>

                {/* Revoke sessions */}
                <ActionRow
                    icon={<RevokeIcon />}
                    title="Revoke all sessions"
                    description={
                        activeSessions > 0
                            ? `${activeSessions} active session${activeSessions !== 1 ? 's' : ''} will be terminated.`
                            : 'No active sessions to revoke.'
                    }
                >
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={activeSessions === 0}
                        onClick={() => setModal('revoke')}
                    >
                        Revoke
                    </Button>
                </ActionRow>

                {/* ID verification */}
                <ActionRow
                    icon={user.isIdVerified ? <UnverifyIcon /> : <VerifyIcon />}
                    title={user.isIdVerified ? 'Revoke ID verification' : 'Grant ID verification'}
                    description={
                        user.isIdVerified
                            ? 'Removes verified status. User must re-verify.'
                            : 'Manually mark this user as ID-verified.'
                    }
                >
                    <Button
                        variant={user.isIdVerified ? 'danger' : 'secondary'}
                        size="sm"
                        onClick={() => setModal(user.isIdVerified ? 'unverifyId' : 'verifyId')}
                    >
                        {user.isIdVerified ? 'Revoke' : 'Grant'}
                    </Button>
                </ActionRow>

                {/* NID decrypt — SUPER_ADMIN only */}
                {isSuperAdmin && (
                    <ActionRow
                        icon={<KeyIcon />}
                        title="Decrypt National ID"
                        description="Access is permanently logged to the audit trail."
                    >
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setDecryptedNid(null);
                                setModal('decryptNid');
                            }}
                        >
                            Decrypt NID
                        </Button>
                    </ActionRow>
                )}
            </div>

            {/* ── Confirm modals ──────────────────────────────────────────────── */}

            {/* Deactivate */}
            <ConfirmModal
                open={modal === 'deactivate'}
                onClose={closeModal}
                onConfirm={handleDeactivate}
                loading={loading}
                variant="danger"
                title="Deactivate account"
                description={`Deactivating ${user.firstName} ${user.lastName}'s account will immediately revoke all ${activeSessions} active session${activeSessions !== 1 ? 's' : ''} and block all future logins.`}
                confirmLabel="Deactivate"
                reasonLabel="Reason for deactivation"
                reason={reason}
                onReasonChange={setReason}
                reasonRequired={false}
            />

            {/* Reactivate */}
            <ConfirmModal
                open={modal === 'reactivate'}
                onClose={closeModal}
                onConfirm={handleReactivate}
                loading={loading}
                title="Reactivate account"
                description={`This will restore login access for ${user.firstName} ${user.lastName}. Existing sessions are not restored — the user must log in again.`}
                confirmLabel="Reactivate"
            />

            {/* Revoke sessions */}
            <ConfirmModal
                open={modal === 'revoke'}
                onClose={closeModal}
                onConfirm={handleRevokeSessions}
                loading={loading}
                variant="danger"
                title="Revoke all sessions"
                description={`This will immediately terminate all ${activeSessions} active session${activeSessions !== 1 ? 's' : ''} for ${user.firstName} ${user.lastName}. The account remains active — the user can log in again.`}
                confirmLabel="Revoke sessions"
            />

            {/* Grant ID verification */}
            <ConfirmModal
                open={modal === 'verifyId'}
                onClose={closeModal}
                onConfirm={handleVerifyId}
                loading={loading}
                title="Grant ID verification"
                description={`Manually marking ${user.firstName} ${user.lastName} as ID-verified bypasses the AI verification process. This action is logged.`}
                confirmLabel="Grant verification"
                reasonLabel="Reason for manual grant"
                reason={reason}
                onReasonChange={setReason}
                reasonRequired={false}
            />

            {/* Revoke ID verification */}
            <ConfirmModal
                open={modal === 'unverifyId'}
                onClose={closeModal}
                onConfirm={handleUnverifyId}
                loading={loading}
                variant="danger"
                title="Revoke ID verification"
                description={`Revoking ${user.firstName} ${user.lastName}'s verification will require them to re-verify their identity.`}
                confirmLabel="Revoke verification"
                reasonLabel="Reason for revocation"
                reason={reason}
                onReasonChange={setReason}
                reasonRequired={true}
            />

            {/* Decrypt NID */}
            <ConfirmModal
                open={modal === 'decryptNid'}
                onClose={() => {
                    closeModal();
                    setDecryptedNid(null);
                }}
                onConfirm={decryptedNid ? () => {
                    closeModal();
                    setDecryptedNid(null);
                } : handleDecryptNid}
                loading={loading}
                variant={decryptedNid ? 'default' : 'danger'}
                title={decryptedNid ? 'National ID Number' : 'Decrypt National ID'}
                description={
                    decryptedNid
                        ? 'This access has been permanently logged. Close this dialog when done.'
                        : `Decrypting the NID of ${user.firstName} ${user.lastName} is a logged action. Your identity and timestamp are recorded permanently in the audit trail.`
                }
                confirmLabel={decryptedNid ? 'Done' : 'Confirm decrypt'}
                cancelLabel={decryptedNid ? undefined : 'Cancel'}
            >
                {/* Show decrypted value inside modal when available */}
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
                                fontSize: 14,
                                fontFamily: 'monospace',
                                color: 'var(--text-primary)',
                                letterSpacing: '0.05em',
                                wordBreak: 'break-all',
                            }}
                        >
                            {decryptedNid}
                        </code>
                        <button
                            onClick={() => copyToClipboard(decryptedNid)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--text-muted)',
                                display: 'flex',
                                padding: 4,
                            }}
                            aria-label="Copy NID"
                            title="Copy to clipboard"
                        >
                            <CopyIcon />
                        </button>
                    </div>
                )}
            </ConfirmModal>
        </>
    );
}
