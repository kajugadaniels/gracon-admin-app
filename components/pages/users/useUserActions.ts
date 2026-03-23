// useUserActions — all action handlers and modal state for the user detail page.
// Extracted from the panel into a hook so the sticky action bar can use them
// without being coupled to a specific layout position.
'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { updateUserStatusApi } from '@/api/users/update-status.api';
import { revokeSessionsApi } from '@/api/users/revoke-sessions.api';
import { updateIdVerificationApi } from '@/api/users/update-id-verification.api';
import { decryptNidApi } from '@/api/users/decrypt-nid.api';
import type { UserDetail } from '@/api/users/get-user.api';

export type ModalType =
    | 'deactivate'
    | 'reactivate'
    | 'revoke'
    | 'verifyId'
    | 'unverifyId'
    | 'decryptNid'
    | null;

export function useUserActions(
    user: UserDetail,
    onRefresh: () => void,
) {
    const [modal, setModal] = useState<ModalType>(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [decryptedNid, setDecryptedNid] = useState<string | null>(null);

    const closeModal = useCallback(() => {
        setModal(null);
        setReason('');
    }, []);

    const handleDeactivate = useCallback(async () => {
        setLoading(true);
        try {
            await updateUserStatusApi(user.userId, false, reason);
            toast.success('Account deactivated. All sessions revoked.');
            closeModal();
            onRefresh();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to deactivate.');
        } finally { setLoading(false); }
    }, [user.userId, reason, closeModal, onRefresh]);

    const handleReactivate = useCallback(async () => {
        setLoading(true);
        try {
            await updateUserStatusApi(user.userId, true, reason);
            toast.success('Account reactivated.');
            closeModal();
            onRefresh();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to reactivate.');
        } finally { setLoading(false); }
    }, [user.userId, reason, closeModal, onRefresh]);

    const handleRevokeSessions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await revokeSessionsApi(user.userId);
            toast.success(res.data.message);
            closeModal();
            onRefresh();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to revoke sessions.');
        } finally { setLoading(false); }
    }, [user.userId, closeModal, onRefresh]);

    const handleVerifyId = useCallback(async () => {
        setLoading(true);
        try {
            await updateIdVerificationApi(user.userId, true, reason);
            toast.success('User manually marked as ID-verified.');
            closeModal();
            onRefresh();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to update ID status.');
        } finally { setLoading(false); }
    }, [user.userId, reason, closeModal, onRefresh]);

    const handleUnverifyId = useCallback(async () => {
        setLoading(true);
        try {
            await updateIdVerificationApi(user.userId, false, reason);
            toast.success('ID verification revoked.');
            closeModal();
            onRefresh();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to revoke ID status.');
        } finally { setLoading(false); }
    }, [user.userId, reason, closeModal, onRefresh]);

    const handleDecryptNid = useCallback(async () => {
        setLoading(true);
        try {
            const res = await decryptNidApi(user.userId);
            setDecryptedNid(res.data.nid);
            toast.success('NID decrypted. Access has been logged.');
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Failed to decrypt NID.');
            closeModal();
        } finally { setLoading(false); }
    }, [user.userId, closeModal]);

    return {
        modal, setModal,
        reason, setReason,
        loading,
        decryptedNid, setDecryptedNid,
        closeModal,
        handleDeactivate,
        handleReactivate,
        handleRevokeSessions,
        handleVerifyId,
        handleUnverifyId,
        handleDecryptNid,
    };
}