// Axios client for the admin service.
// Thin wrapper over the shared multi-service axios factory so api/admin
// keeps the same auth + refresh behavior as the newer service clients.
import type { AxiosInstance } from 'axios';
import { createAuthedApiClient } from '@/api/common/axios-factory';

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL!;

export function createAdminApiClient(baseURL: string): AxiosInstance {
    return createAuthedApiClient(baseURL);
}

export const apiClient = createAuthedApiClient(BASE_URL);
