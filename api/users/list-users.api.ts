import { apiClient } from '@/api/client';

export interface ListUsersParams {
    search?: string;
    isActive?: boolean;
    isVerified?: boolean;
    isIdVerified?: boolean;
    identityType?: IdentityType;
    createdFrom?: string;
    createdTo?: string;
    page?: number;
    limit?: number;
}

export type IdentityType = 'NID' | 'FIN';

export interface UserListItem {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    identityType: IdentityType | null;
    isActive: boolean;
    isVerified: boolean;
    isIdVerified: boolean;
    createdAt: string;
}

export interface PaginatedUsersResponse {
    data: UserListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    performanceWarning?: string;
}

export const listUsersApi = (params?: ListUsersParams) =>
    apiClient.get<PaginatedUsersResponse>('/users', { params });
