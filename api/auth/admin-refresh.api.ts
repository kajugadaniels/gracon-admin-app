import { apiClient } from '@/api/client';

export const adminRefreshApi = (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        { refreshToken },
    );