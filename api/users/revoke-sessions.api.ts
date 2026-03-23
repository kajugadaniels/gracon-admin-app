import { apiClient } from '@/api/client';

export const revokeSessionsApi = (userId: string) =>
    apiClient.post<{
        success: boolean;
        message: string;
        revokedCount: number;
    }>(`/users/${userId}/revoke-sessions`);