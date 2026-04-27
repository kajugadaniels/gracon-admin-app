import { apiClient } from '@/api/client';

export const decryptNidApi = (userId: string, reason: string) =>
    apiClient.post<{ nid: string; userId: string }>(
        `/users/${userId}/decrypt-nid`,
        { reason },
    );
