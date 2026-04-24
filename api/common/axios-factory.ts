// Shared axios factory for multi-service admin API clients.
// Reuses the same admin JWT attachment and silent refresh behavior
// across api/admin, api/signature, api/stamp, and api/institution.
import axios, {
    AxiosError,
    AxiosInstance,
    InternalAxiosRequestConfig,
} from 'axios';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';

const ADMIN_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL!;

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function createBaseClient(baseURL: string): AxiosInstance {
    return axios.create({
        baseURL,
        withCredentials: false,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function attachRequestInterceptor(client: AxiosInstance) {
    client.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token =
                useAdminAuthStore.getState().accessToken ??
                sessionStorage.getItem('adm_at');

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => Promise.reject(error),
    );
}

function queueRefreshRetry(
    client: AxiosInstance,
    originalRequest: InternalAxiosRequestConfig & { _retried?: boolean },
) {
    return new Promise((resolve) => {
        refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(client(originalRequest));
        });
    });
}

async function refreshAdminSession(): Promise<string> {
    const refreshToken =
        useAdminAuthStore.getState().refreshToken ??
        sessionStorage.getItem('adm_rt');

    if (!refreshToken) {
        throw new Error('No refresh token');
    }

    const response = await axios.post(`${ADMIN_BASE_URL}/auth/refresh`, {
        refreshToken,
    });
    const { accessToken, refreshToken: nextRefreshToken } = response.data as {
        accessToken: string;
        refreshToken: string;
    };
    const currentAdmin = useAdminAuthStore.getState().admin;

    if (!currentAdmin) {
        throw new Error('No hydrated admin session');
    }

    useAdminAuthStore.getState().setTokens(
        accessToken,
        nextRefreshToken,
        currentAdmin,
    );

    return accessToken;
}

function handleRefreshFailure(error: AxiosError) {
    useAdminAuthStore.getState().clearTokens();
    refreshQueue = [];

    if (typeof window !== 'undefined') {
        window.location.href = '/login?session=expired';
    }

    return Promise.reject(error);
}

function attachRefreshInterceptor(client: AxiosInstance) {
    client.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & {
                _retried?: boolean;
            };

            if (error.response?.status !== 401 || originalRequest._retried) {
                return Promise.reject(error);
            }

            originalRequest._retried = true;

            if (isRefreshing) {
                return queueRefreshRetry(client, originalRequest);
            }

            isRefreshing = true;

            try {
                const accessToken = await refreshAdminSession();
                refreshQueue.forEach((callback) => callback(accessToken));
                refreshQueue = [];
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return client(originalRequest);
            } catch {
                return handleRefreshFailure(error);
            } finally {
                isRefreshing = false;
            }
        },
    );
}

/**
 * Creates an authenticated axios client for any admin-consumed backend service.
 *
 * @param baseURL Service base URL.
 * @returns Axios instance with admin JWT and silent refresh support.
 */
export function createAuthedApiClient(baseURL: string): AxiosInstance {
    const client = createBaseClient(baseURL);
    attachRequestInterceptor(client);
    attachRefreshInterceptor(client);
    return client;
}
