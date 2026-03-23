import { apiClient } from '@/api/client';

export interface ListVerificationsParams {
    passed?: boolean;
    userId?: string;
    ipAddress?: string;
    createdFrom?: string;
    createdTo?: string;
    scoreMin?: number;
    scoreMax?: number;
    page?: number;
    limit?: number;
}

export interface VerificationListItem {
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
}

export const listVerificationsApi = (params?: ListVerificationsParams) =>
    apiClient.get<{
        data: VerificationListItem[];
        pagination: {
            page: number; limit: number; total: number;
            totalPages: number; hasNext: boolean; hasPrev: boolean;
        };
    }>('/verifications', { params });