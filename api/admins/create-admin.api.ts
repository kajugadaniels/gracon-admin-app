import { apiClient } from '@/api/client';

export interface CreateAdminPayload {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
}

export const createAdminApi = (payload: CreateAdminPayload) =>
    apiClient.post<{
        success: boolean;
        message: string;
        data: {
            adminId: string;
            firstName: string;
            lastName: string;
            email: string;
            phoneNumber: string | null;
            role: string;
            createdAt: string;
        };
    }>('/auth/admins', payload);