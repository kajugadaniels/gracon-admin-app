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
import { NAV_ITEMS, Icon } from '@/constants/navigation';
import type { NavItem } from '@/constants/navigation';

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
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
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
                        background: 'rgba(0,0,0,0.4)',
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
