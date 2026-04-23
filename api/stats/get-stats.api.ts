import { apiClient } from '@/api/client';

export interface DailyCount {
    date: string;
    count: number;
}

export interface CountryCount {
    country: string;
    count: number;
}

export interface ForeignIdentityRecentRegistration {
    fin: string;
    firstName: string;
    lastName: string;
    countryOfOrigin: string;
    isActive: boolean;
    issuanceVersion: number;
    createdAt: string;
}

export interface ForeignIdentityStats {
    totalRegistered: number;
    active: number;
    inactive: number;
    registeredToday: number;
    activeRate: number;
    maleCount: number;
    femaleCount: number;
    registrationsLast7Days: DailyCount[];
    topCountriesOfOrigin: CountryCount[];
    recentRegistrations: ForeignIdentityRecentRegistration[];
}

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
    registrationsLast7Days: DailyCount[];
    verificationsLast7Days: DailyCount[];
    topCountriesOfBirth: CountryCount[];
    foreignIdentityStats: ForeignIdentityStats;
    cachedAt: string;
    cacheExpiresAt: string;
}

export const getStatsApi = () =>
    apiClient.get<PlatformStats>('/stats/overview');

export const invalidateStatsCacheApi = () =>
    apiClient.post<{ success: boolean; message: string }>(
        '/stats/invalidate-cache',
    );
