// Sidebar collapsed/expanded state.
// localStorage — persists across sessions, tabs, and page refreshes.
// Admins configure their workspace once and it stays that way.
import { create } from 'zustand';

interface SidebarState {
    collapsed: boolean;
    mobileOpen: boolean;
    toggle: () => void;
    setCollapsed: (collapsed: boolean) => void;
    openMobile: () => void;
    closeMobile: () => void;
}

const STORAGE_KEY = 'adm_sidebar_collapsed';

function readInitialState(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
    collapsed: false, // will be overwritten on hydration
    mobileOpen: false,

    toggle: () => {
        const next = !get().collapsed;
        localStorage.setItem(STORAGE_KEY, String(next));
        set({ collapsed: next });
    },

    setCollapsed: (collapsed) => {
        localStorage.setItem(STORAGE_KEY, String(collapsed));
        set({ collapsed });
    },

    openMobile: () => set({ mobileOpen: true }),
    closeMobile: () => set({ mobileOpen: false }),
}));

// Call this on mount to restore localStorage state
export function hydrateSidebar() {
    useSidebarStore.getState().setCollapsed(readInitialState());
}
