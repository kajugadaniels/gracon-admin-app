// Axios client for the admin service.
// Reads the access token from the admin auth store.
// Silently refreshes on 401 — same pattern as user app.
// On refresh failure — clears store and redirects to login.
import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';

const BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL!;

export const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ── Request interceptor — attach access token ─────────────────────────────

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Read token from store first, fall back to sessionStorage
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

// ── Response interceptor — silent refresh on 401 ─────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retried?: boolean;
        };

        if (error.response?.status !== 401 || originalRequest._retried) {
            return Promise.reject(error);
        }

        originalRequest._retried = true;

        // Queue requests while refresh is in flight
        if (isRefreshing) {
            return new Promise((resolve) => {
                refreshQueue.push((token: string) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    resolve(apiClient(originalRequest));
                });
            });
        }

        isRefreshing = true;

        try {
            const refreshToken =
                useAdminAuthStore.getState().refreshToken ??
                sessionStorage.getItem('adm_rt');

            if (!refreshToken) throw new Error('No refresh token');

            const res = await axios.post(`${BASE_URL}/auth/refresh`, {
                refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = res.data;
            const currentAdmin = useAdminAuthStore.getState().admin!;

            useAdminAuthStore.getState().setTokens(
                accessToken,
                newRefreshToken,
                currentAdmin,
            );

            // Drain the queue
            refreshQueue.forEach((cb) => cb(accessToken));
            refreshQueue = [];

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
        } catch {
            // Refresh failed — session is over
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