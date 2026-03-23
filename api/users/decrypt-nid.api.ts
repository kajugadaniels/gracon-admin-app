import { apiClient } from '@/api/client';

export const decryptNidApi = (userId: string) =>
    apiClient.get<{ nid: string; userId: string }>(
        `/users/${userId}/decrypt-nid`,
    );