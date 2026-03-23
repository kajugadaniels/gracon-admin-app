// AuthProvider — hydrates both the auth store and sidebar store on mount.
// Must wrap every protected page.
// Without this, page refresh loses the access token and shows
// a blank screen or redirects to login incorrectly.
// isHydrated gate prevents the protected layout from rendering
// until the store is ready — avoids flash of unauthenticated content.
'use client';

import { useEffect } from 'react';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { hydrateSidebar } from '@/lib/store/sidebar.store';
import { Spinner } from '@/components/ui/Spinner';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const hydrate = useAdminAuthStore((s) => s.hydrate);
    const isHydrated = useAdminAuthStore((s) => s.isHydrated);

    useEffect(() => {
        // Both stores must hydrate before the layout renders
        hydrate();
        hydrateSidebar();
    }, [hydrate]);

    // Hold render until store is ready — prevents flicker
    if (!isHydrated) {
        return (
            <div
                style={{
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg)',
                }}
            >
                <Spinner size={24} label="Loading session…" />
            </div>
        );
    }

    return <>{children}</>;
}