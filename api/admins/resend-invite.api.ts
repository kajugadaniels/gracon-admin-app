import { apiClient } from '@/api/client';

export const resendInviteApi = (adminId: string) =>
    apiClient.post<{ success: boolean; message: string }>(
        `/auth/admins/${adminId}/resend-invite`,
    );