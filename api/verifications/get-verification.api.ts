import { apiClient } from '@/api/client';

export interface VerificationDetail {
    id: string;
    userId: string;
    userEmail: string;
    userName: string;
    attemptNumber: number;
    documentMatch: boolean;
    faceScore: number;
    livenessScore: number;
    compositeScore: number;
    passed: boolean;
    failReason: string | null;
    ipAddress: string | null;
    createdAt: string;
    scoreBreakdown: {
        face: { score: number; weight: number; weighted: number };
        liveness: { score: number; weight: number; weighted: number };
        document: { matched: boolean; weight: number; weighted: number };
        composite: number;
        threshold: number;
        passed: boolean;
    };
    userContext: {
        isActive: boolean;
        isIdVerified: boolean;
        totalAttempts: number;
    };
}

export const getVerificationApi = (id: string) =>
    apiClient.get<VerificationDetail>(`/verifications/${id}`);