import { apiClient } from '@/api/client';

export interface ListSecurityEventsParams {
    userId?: string;
    eventType?: string;
    ipAddress?: string;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    limit?: number;
}

export interface SecurityEventEntry {
    id: string;
    userId: string | null;
    userEmail: string | null;
    eventType: string;
    ipAddress: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

export const listSecurityEventsApi = (params?: ListSecurityEventsParams) =>
    apiClient.get<{
        data: SecurityEventEntry[];
        pagination: {
            page: number; limit: number; total: number;
            totalPages: number; hasNext: boolean; hasPrev: boolean;
        };
    }>('/security-events', { params });