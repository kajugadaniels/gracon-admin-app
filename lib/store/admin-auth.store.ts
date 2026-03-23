// Admin auth store — Zustand with sessionStorage persistence.
// Same pattern as the user app but completely separate.
// sessionStorage: survives refresh, cleared on tab close.
// Cookie is set for middleware route protection.
import { create } from 'zustand';

interface AdminUser {
    adminId: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
}

interface AdminAuthState {
    accessToken: string | null;
    refreshToken: string | null;
    admin: AdminUser | null;
    isHydrated: boolean;

    setTokens: (
        accessToken: string,
        refreshToken: string,
        admin: AdminUser,
    ) => void;
    clearTokens: () => void;
    hydrate: () => void;
}

const STORAGE_KEYS = {
    ACCESS: 'adm_at',
    REFRESH: 'adm_rt',
    ADMIN: 'adm_user',
} as const;

const SESSION_COOKIE = 'admin_session';

function setCookie(name: string, value: string) {
    document.cookie =
        `${name}=${value}; path=/; SameSite=Strict`;
}

function deleteCookie(name: string) {
    document.cookie =
        `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
    accessToken: null,
    refreshToken: null,
    admin: null,
    isHydrated: false,

    setTokens: (accessToken, refreshToken, admin) => {
        // Persist to sessionStorage
        sessionStorage.setItem(STORAGE_KEYS.ACCESS, accessToken);
        sessionStorage.setItem(STORAGE_KEYS.REFRESH, refreshToken);
        sessionStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));

        // Set session cookie for middleware
        setCookie(SESSION_COOKIE, '1');

        set({ accessToken, refreshToken, admin });
    },

    clearTokens: () => {
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS);
        sessionStorage.removeItem(STORAGE_KEYS.REFRESH);
        sessionStorage.removeItem(STORAGE_KEYS.ADMIN);

        deleteCookie(SESSION_COOKIE);

        set({ accessToken: null, refreshToken: null, admin: null });
    },

    // Called on mount by AuthProvider to restore state after page refresh
    hydrate: () => {
        try {
            const accessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS);
            const refreshToken = sessionStorage.getItem(STORAGE_KEYS.REFRESH);
            const adminRaw = sessionStorage.getItem(STORAGE_KEYS.ADMIN);
            const admin = adminRaw ? JSON.parse(adminRaw) : null;

            if (accessToken && refreshToken && admin) {
                set({ accessToken, refreshToken, admin, isHydrated: true });
            } else {
                set({ isHydrated: true });
            }
        } catch {
            set({ isHydrated: true });
        }
    },
}));
