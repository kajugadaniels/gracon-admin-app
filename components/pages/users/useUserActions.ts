// useUserActions — all action handlers and modal state for the user detail page.
// Extracted from the panel into a hook so the sticky action bar can use them
// without being coupled to a specific layout position.
'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { updateUserStatusApi } from '@/api/users/update-status.api';
import { revokeSessionsApi } from '@/api/users/revoke-sessions.api';
import { updateIdVerificationApi } from '@/api/users/update-id-verification.api';
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

export type ModalType =
    | 'deactivate'
    | 'reactivate'
    | 'revoke'
    | 'verifyId'
    | 'unverifyId'
    | null;

export function useUserActions(
    user: UserDetail | null,
    onRefresh: () => void,
) {
    const [modal, setModal] = useState<ModalType>(null);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const userId = user?.userId ?? null;

    const closeModal = useCallback(() => {
        setModal(null);
        setReason('');
    }, []);

    const handleDeactivate = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            await updateUserStatusApi(userId, false, reason);
            toast.success('Account deactivated. All sessions revoked.');
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to deactivate.'));
        } finally { setLoading(false); }
    }, [userId, reason, closeModal, onRefresh]);

    const handleReactivate = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            await updateUserStatusApi(userId, true, reason);
            toast.success('Account reactivated.');
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to reactivate.'));
        } finally { setLoading(false); }
    }, [userId, reason, closeModal, onRefresh]);

    const handleRevokeSessions = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const res = await revokeSessionsApi(userId);
            toast.success(res.data.message);
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to revoke sessions.'));
        } finally { setLoading(false); }
    }, [userId, closeModal, onRefresh]);

    const handleVerifyId = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            await updateIdVerificationApi(userId, true, reason);
            toast.success('User manually marked as ID-verified.');
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to update ID status.'));
        } finally { setLoading(false); }
    }, [userId, reason, closeModal, onRefresh]);

    const handleUnverifyId = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            await updateIdVerificationApi(userId, false, reason);
            toast.success('ID verification revoked.');
            closeModal();
            onRefresh();
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to revoke ID status.'));
        } finally { setLoading(false); }
    }, [userId, reason, closeModal, onRefresh]);

    return {
        modal, setModal,
        reason, setReason,
        loading,
        closeModal,
        handleDeactivate,
        handleReactivate,
        handleRevokeSessions,
        handleVerifyId,
        handleUnverifyId,
    };
}
