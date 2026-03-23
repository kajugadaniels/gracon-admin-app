import { apiClient } from '@/api/client';

export interface PlatformStats {
    totalUsers: number;
    usersVerifiedToday: number;
    usersPendingIdVerification: number;
    totalVerifications: number;
    verificationsPassed: number;
    verificationsFailed: number;
    verificationPassRate: number;
    failedLoginsLast24h: number;
    rateLimitHitsLast24h: number;
    registrationsLast7Days: { date: string; count: number }[];
    verificationsLast7Days: { date: string; count: number }[];
    topCountriesOfBirth: { country: string; count: number }[];
    cachedAt: string;
    cacheExpiresAt: string;
}

export const getStatsApi = () =>
    apiClient.get<PlatformStats>('/stats/overview');

export const invalidateStatsCacheApi = () =>
    apiClient.post<{ success: boolean; message: string }>(
        '/stats/invalidate-cache',
    );