// AdminHeader — top bar: breadcrumb, role badge, admin identity dropdown.
// Clicking the admin name/avatar opens a menu with Sign Out.
// Mobile: shows hamburger; collapses name/email to avatar only.
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { useSidebarStore } from '@/lib/store/sidebar.store';
import { adminLogoutApi } from '@/api/auth/admin-logout.api';

interface AdminHeaderProps {
    /** Breadcrumb segments appended after "Dashboard" — e.g. ['Users', 'Kalisa Jean-Pierre']. */
    breadcrumb?: string[];
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const HamburgerIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const ChevronDownIcon = ({ open }: { open: boolean }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ opacity: 0.4, transition: 'transform 150ms ease', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
        <path d="M6 9l6 6 6-6" />
    </svg>
);

// ── Sub-components ─────────────────────────────────────────────────────────────

type AdminUser = { firstName: string; lastName: string; email: string; role: 'ADMIN' | 'SUPER_ADMIN' } | null;

/** Role pill badge — SUPER_ADMIN gets primary tint, ADMIN gets neutral. */
function AdminRoleBadge({ role }: { role: 'ADMIN' | 'SUPER_ADMIN' | undefined }) {
    const isSuperAdmin = role === 'SUPER_ADMIN';
    return (
        <span style={{
            fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap',
            background: isSuperAdmin ? 'var(--primary-muted)' : 'var(--surface-raised)',
            color:      isSuperAdmin ? 'var(--primary)' : 'var(--text-muted)',
            border:     `1px solid ${isSuperAdmin ? 'var(--primary-border)' : 'var(--border)'}`,
        }}>
            {isSuperAdmin ? 'Super Admin' : 'Admin'}
        </span>
    );
}

/** Dropdown panel rendered when the admin identity button is open. */
function UserMenuDropdown({ admin, loggingOut, onLogout }: {
    admin: AdminUser;
    loggingOut: boolean;
    onLogout: () => void;
}) {
    return (
        <div className="user-menu" role="menu">
            <div className="user-menu-header">
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {admin?.firstName} {admin?.lastName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {admin?.email}
                </div>
            </div>
            <div style={{ padding: '4px 0' }}>
                <button className="user-menu-item danger" role="menuitem"
                    onClick={onLogout} disabled={loggingOut}>
                    <LogoutIcon />
                    {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
            </div>
        </div>
    );
}

interface AdminUserMenuProps {
    admin: AdminUser;
    onLogout: () => void;
    loggingOut: boolean;
}

/**
 * Admin identity button with a dropdown menu.
 * Shows initials avatar + name/email; clicking opens the menu.
 * Closes automatically on outside click.
 */
function AdminUserMenu({ admin, onLogout, loggingOut }: AdminUserMenuProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on any click outside the dropdown container
    useEffect(() => {
        if (!open) return;
        const onOutsideClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onOutsideClick);
        return () => document.removeEventListener('mousedown', onOutsideClick);
    }, [open]);

    const initials = admin
        ? `${admin.firstName[0]}${admin.lastName[0]}`.toUpperCase()
        : '?';

    const handleLogout = () => { setOpen(false); onLogout(); };

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button className="header-admin-info"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open} aria-haspopup="menu">
                <div className="admin-avatar" aria-hidden="true">{initials}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {admin?.firstName} {admin?.lastName}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.2 }}>
                        {admin?.email}
                    </span>
                </div>
                <ChevronDownIcon open={open} />
            </button>
            {open && (
                <UserMenuDropdown admin={admin} loggingOut={loggingOut} onLogout={handleLogout} />
            )}
        </div>
    );
}

// ── AdminHeader ────────────────────────────────────────────────────────────────

/**
 * Top navigation bar for the admin shell.
 * Contains the mobile menu trigger, breadcrumb trail, role badge, and admin identity dropdown.
 */
export function AdminHeader({ breadcrumb = [] }: AdminHeaderProps) {
    const router       = useRouter();
    const admin        = useAdminAuthStore((s) => s.admin);
    const clearTokens  = useAdminAuthStore((s) => s.clearTokens);
    const refreshToken = useAdminAuthStore((s) => s.refreshToken);
    const openMobile   = useSidebarStore((s) => s.openMobile);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            // Best-effort server-side token invalidation — clear locally regardless
            if (refreshToken) await adminLogoutApi(refreshToken).catch(() => {});
        } finally {
            clearTokens();
            router.replace('/login');
            toast.success('Signed out.');
            setLoggingOut(false);
        }
    };

    return (
        <header className="admin-header" role="banner">
            <button className="btn btn-ghost btn-icon" onClick={openMobile}
                aria-label="Open navigation" style={{ display: 'none' }} id="mobile-menu-btn">
                <HamburgerIcon />
            </button>

            <nav className="header-breadcrumb" aria-label="Breadcrumb">
                <span>Dashboard</span>
                {breadcrumb.map((crumb, i) => (
                    <React.Fragment key={i}>
                        <span aria-hidden="true" style={{ opacity: 0.3 }}>/</span>
                        <span className={i === breadcrumb.length - 1 ? 'current' : ''}>{crumb}</span>
                    </React.Fragment>
                ))}
            </nav>

            <div className="header-actions">
                <AdminRoleBadge role={admin?.role} />
                <AdminUserMenu admin={admin} onLogout={handleLogout} loggingOut={loggingOut} />
            </div>
        </header>
    );
}
