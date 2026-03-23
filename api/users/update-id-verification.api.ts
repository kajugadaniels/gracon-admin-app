import { apiClient } from '@/api/client';

export const updateIdVerificationApi = (
    userId: string,
    isIdVerified: boolean,
    reason?: string,
) =>
    apiClient.patch<{ success: boolean; message: string }>(
        `/users/${userId}/id-verification`,
        { isIdVerified, reason },
    );