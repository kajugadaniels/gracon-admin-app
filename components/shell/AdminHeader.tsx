// AdminHeader — top bar showing breadcrumb, admin identity, and logout.
// Shows the mobile hamburger menu on small screens.
// Logout clears the store, cookie, and redirects to /login.
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { useSidebarStore } from '@/lib/store/sidebar.store';
import { adminLogoutApi } from '@/api/auth/admin-logout.api';
import { Button } from '@/components/ui/Button';

interface AdminHeaderProps {
    // Breadcrumb — ['Users', 'Kalisa Jean-Pierre'] renders as
    // Dashboard / Users / Kalisa Jean-Pierre
    breadcrumb?: string[];
}

const HamburgerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

export function AdminHeader({ breadcrumb = [] }: AdminHeaderProps) {
    const router = useRouter();
    const admin = useAdminAuthStore((s) => s.admin);
    const clearTokens = useAdminAuthStore((s) => s.clearTokens);
    const refreshToken = useAdminAuthStore((s) => s.refreshToken);
    const openMobile = useSidebarStore((s) => s.openMobile);

    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            if (refreshToken) {
                // Best-effort — if this fails, clear locally anyway
                await adminLogoutApi(refreshToken).catch(() => { });
            }
        } finally {
            clearTokens();
            router.replace('/login');
            toast.success('Signed out.');
            setLoggingOut(false);
        }
    };

    // Build initials from admin name
    const initials = admin
        ? `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()
        : '?';

    // Role label
    const roleLabel = admin?.role === 'SUPER_ADMIN'
        ? 'Super Admin'
        : 'Admin';

    return (
        <header className="admin-header" role="banner">
            {/* Mobile hamburger */}
            <button
                className="btn btn-ghost btn-icon"
                onClick={openMobile}
                aria-label="Open navigation"
                style={{
                    display: 'none',
                    // shown via CSS media query below
                }}
                id="mobile-menu-btn"
            >
                <HamburgerIcon />
            </button>

            {/* Breadcrumb */}
            <nav
                className="header-breadcrumb"
                aria-label="Breadcrumb"
            >
                <span>Dashboard</span>
                {breadcrumb.map((crumb, i) => (
                    <React.Fragment key={i}>
                        <span aria-hidden="true" style={{ opacity: 0.3 }}>
                            /
                        </span>
                        <span
                            className={i === breadcrumb.length - 1 ? 'current' : ''}
                        >
                            {crumb}
                        </span>
                    </React.Fragment>
                ))}
            </nav>

            {/* Admin identity + logout */}
            <div className="header-actions">
                {/* Role badge */}
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: admin?.role === 'SUPER_ADMIN'
                            ? 'var(--primary-muted)'
                            : 'var(--surface-raised)',
                        color: admin?.role === 'SUPER_ADMIN'
                            ? 'var(--primary)'
                            : 'var(--text-muted)',
                        border: `1px solid ${admin?.role === 'SUPER_ADMIN'
                                ? 'var(--primary-border)'
                                : 'var(--border)'
                            }`,
                    }}
                >
                    {roleLabel}
                </span>

                {/* Admin info */}
                <div className="header-admin-info">
                    <div className="admin-avatar" aria-hidden="true">
                        {initials}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <span
                            style={{
                                fontSize: 13,
                                fontWeight: 500,
                                color: 'var(--text-primary)',
                                lineHeight: 1.2,
                            }}
                        >
                            {admin?.firstName} {admin?.lastName}
                        </span>
                        <span
                            style={{
                                fontSize: 11,
                                color: 'var(--text-muted)',
                                lineHeight: 1.2,
                            }}
                        >
                            {admin?.email}
                        </span>
                    </div>
                </div>

                {/* Logout */}
                <Button
                    variant="ghost"
                    size="sm"
                    icon={<LogoutIcon />}
                    loading={loggingOut}
                    onClick={handleLogout}
                    aria-label="Sign out"
                    title="Sign out"
                >
                    Sign out
                </Button>
            </div>
        </header>
    );
}