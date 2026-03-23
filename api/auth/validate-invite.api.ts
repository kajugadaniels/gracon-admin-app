import { apiClient } from '@/api/client';

export interface ValidateInviteResponse {
    valid: boolean;
    message: string;
    adminName?: string;
}

export const validateInviteApi = (adminId: string, token: string) =>
    apiClient.get<ValidateInviteResponse>('/auth/invite/validate', {
        params: { adminId, token },
    });