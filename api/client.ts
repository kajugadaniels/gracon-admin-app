// Axios client for the admin service.
// Reads the access token from the admin auth store.
// Silently refreshes on 401 — same pattern as user app.
// On refresh failure — clears store and redirects to login.
import axios, {
    AxiosInstance,
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL!;

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

function attachRefreshInterceptor(client: AxiosInstance, baseURL: string) {
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
                return new Promise((resolve) => {
                    refreshQueue.push((token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(client(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const refreshToken =
                    useAdminAuthStore.getState().refreshToken ??
                    sessionStorage.getItem('adm_rt');

                if (!refreshToken) throw new Error('No refresh token');

                const res = await axios.post(`${baseURL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken, refreshToken: newRefreshToken } = res.data;
                const currentAdmin = useAdminAuthStore.getState().admin!;

                useAdminAuthStore.getState().setTokens(
                    accessToken,
                    newRefreshToken,
                    currentAdmin,
                );

                refreshQueue.forEach((cb) => cb(accessToken));
                refreshQueue = [];

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return client(originalRequest);
            } catch {
                useAdminAuthStore.getState().clearTokens();
                refreshQueue = [];

                if (typeof window !== 'undefined') {
                    window.location.href = '/login?session=expired';
                }

                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        },
    );
}

export function createAdminApiClient(baseURL: string): AxiosInstance {
    const client = createBaseClient(baseURL);
    attachRequestInterceptor(client);
    attachRefreshInterceptor(client, BASE_URL);
    return client;
}

export const apiClient = createBaseClient(BASE_URL);

attachRequestInterceptor(apiClient);
attachRefreshInterceptor(apiClient, BASE_URL);

// ── Request interceptor — attach access token ─────────────────────────────

// ── Response interceptor — silent refresh on 401 ─────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];
