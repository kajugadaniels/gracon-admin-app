import { apiClient } from '@/api/client';

export const decryptPidApi = (userId: string, reason: string) =>
    apiClient.post<{ pid: string; userId: string }>(
        `/users/${userId}/decrypt-pid`,
        { reason },
    );
