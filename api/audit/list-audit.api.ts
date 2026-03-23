import { apiClient } from '@/api/client';

export interface ListAuditParams {
    adminId?: string;
    targetUserId?: string;
    action?: string;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    limit?: number;
}

export interface AuditLogEntry {
    id: string;
    adminId: string;
    adminName: string;
    adminEmail: string;
    action: string;
    targetUserId: string | null;
    targetEmail: string | null;
    metadata: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string;
}

export const listAuditApi = (params?: ListAuditParams) =>
    apiClient.get<{
        data: AuditLogEntry[];
        pagination: {
            page: number; limit: number; total: number;
            totalPages: number; hasNext: boolean; hasPrev: boolean;
        };
    }>('/audit', { params });