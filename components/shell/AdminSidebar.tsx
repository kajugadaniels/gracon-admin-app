// AdminSidebar — collapsible left navigation.
// Collapsed: 64px wide, icons only with tooltip on hover.
// Expanded: 240px wide, icons + labels.
// State persists in localStorage via sidebarStore.
// SUPER_ADMIN sees the Admins nav item — ADMIN role does not.
// Active route is highlighted with a left accent bar + primary tint.
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore, hydrateSidebar } from '@/lib/store/sidebar.store';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';

// ── Nav item definition ────────────────────────────────────────────────────

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    // Only show for SUPER_ADMIN
    superAdminOnly?: boolean;
}

// ── SVG icons — inline, no external dependency ───────────────────────────

const Icon = {
    Dashboard: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    ),
    Users: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    Shield: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    ClipboardList: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="13" y2="16" />
        </svg>
    ),
    AlertTriangle: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    ),
    AdminKey: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
    ),
    ChevronLeft: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
        </svg>
    ),
    ChevronRight: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
        </svg>
    ),
};

// ── Nav items ─────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <Icon.Dashboard />,
    },
    {
        href: '/users',
        label: 'Users',
        icon: <Icon.Users />,
    },
    {
        href: '/verifications',
        label: 'Verifications',
        icon: <Icon.Shield />,
    },
    {
        href: '/audit',
        label: 'Audit log',
        icon: <Icon.ClipboardList />,
    },
    {
        href: '/security-events',
        label: 'Security events',
        icon: <Icon.AlertTriangle />,
    },
    {
        href: '/admins',
        label: 'Admins',
        icon: <Icon.AdminKey />,
        superAdminOnly: true,
    },
];

// ── Tooltip for collapsed state ───────────────────────────────────────────

function NavTooltip({
    label,
    visible,
}: {
    label: string;
    visible: boolean;
}) {
    if (!visible) return null;
    return (
        <div
            role="tooltip"
            style={{
                position: 'absolute',
                left: 'calc(100% + 8px)',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'var(--surface-overlay)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius)',
                padding: '4px 10px',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 200,
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            }}
        >
            {label}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────

export function AdminSidebar() {
    const pathname = usePathname();
    const collapsed = useSidebarStore((s) => s.collapsed);
    const mobileOpen = useSidebarStore((s) => s.mobileOpen);
    const toggle = useSidebarStore((s) => s.toggle);
    const closeMobile = useSidebarStore((s) => s.closeMobile);
    const admin = useAdminAuthStore((s) => s.admin);

    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

    // Hydrate sidebar state from localStorage on mount
    useEffect(() => {
        hydrateSidebar();
    }, []);

    // Which items to show based on role
    const visibleItems = NAV_ITEMS.filter(
        (item) => !item.superAdminOnly || isSuperAdmin,
    );

    const isActive = (href: string) => {
        // Exact match for dashboard, prefix match for others
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 40,
                    }}
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}

            <aside
                className={[
                    'admin-sidebar',
                    collapsed ? 'collapsed' : '',
                    mobileOpen ? 'mobile-open' : '',
                ].filter(Boolean).join(' ')}
                aria-label="Admin navigation"
            >
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon" aria-hidden="true">
                        IV
                    </div>
                    <span className="sidebar-logo-text">
                        ID Verify Admin
                    </span>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav" aria-label="Main navigation">
                    <div
                        className="nav-section-label"
                        aria-hidden={collapsed}
                    >
                        Navigation
                    </div>

                    {visibleItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <NavItemLink
                                key={item.href}
                                item={item}
                                active={active}
                                collapsed={collapsed}
                                onClick={closeMobile}
                            />
                        );
                    })}
                </nav>

                {/* Footer toggle */}
                <div className="sidebar-footer">
                    <button
                        className="sidebar-toggle"
                        onClick={toggle}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        {collapsed ? <Icon.ChevronRight /> : (
                            <>
                                <Icon.ChevronLeft />
                                <span style={{
                                    fontSize: 12,
                                    opacity: 1,
                                    transition: 'opacity 150ms ease',
                                }}>
                                    Collapse
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}

// ── Nav item link ─────────────────────────────────────────────────────────

function NavItemLink({
    item,
    active,
    collapsed,
    onClick,
}: {
    item: NavItem;
    active: boolean;
    collapsed: boolean;
    onClick: () => void;
}) {
    const [hovered, setHovered] = React.useState(false);

    return (
        <div style={{ position: 'relative' }}>
            <Link
                href={item.href}
                className={['nav-item', active ? 'active' : ''].filter(Boolean).join(' ')}
                onClick={onClick}
                aria-current={active ? 'page' : undefined}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <span className="nav-item-icon" aria-hidden="true">
                    {item.icon}
                </span>
                <span className="nav-item-label">
                    {item.label}
                </span>
            </Link>

            {/* Tooltip — only visible when collapsed and hovered */}
            <NavTooltip
                label={item.label}
                visible={collapsed && hovered}
            />
        </div>
    );
}