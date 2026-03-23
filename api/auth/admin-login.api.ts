import { apiClient } from '@/api/client';

export interface AdminLoginPayload {
    email: string;
    password: string;
}

export interface AdminLoginResponse {
    success: boolean;
    message: string;
    data: {
        accessToken: string;
        refreshToken: string;
        admin: {
            adminId: string;
            firstName: string;
            lastName: string;
            email: string;
            role: 'ADMIN' | 'SUPER_ADMIN';
        };
    };
}

export const adminLoginApi = (payload: AdminLoginPayload) =>
    apiClient.post<AdminLoginResponse>('/auth/login', payload);