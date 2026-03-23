import { apiClient } from '@/api/client';

export const updateUserStatusApi = (
    userId: string,
    isActive: boolean,
    reason?: string,
) =>
    apiClient.patch<{ success: boolean; message: string }>(
        `/users/${userId}/status`,
        { isActive, reason },
    );