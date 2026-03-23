import { apiClient } from '@/api/client';

export interface SetPasswordPayload {
    adminId: string;
    token: string;
    password: string;
}

export const setPasswordApi = (payload: SetPasswordPayload) =>
    apiClient.post<{ success: boolean; message: string }>(
        '/auth/invite/set-password',
        payload,
    );