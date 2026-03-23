import { apiClient } from '@/api/client';

export const adminLogoutApi = (refreshToken: string) =>
    apiClient.post<{ success: boolean; message: string }>(
        '/auth/logout',
        { refreshToken },
    );