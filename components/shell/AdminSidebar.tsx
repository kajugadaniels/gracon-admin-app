// AdminSidebar — floating glass panel navigation.
// Collapsed: 64px wide, icons only with tooltip on hover.
// Expanded: 240px wide, icons + labels.
// State persists in localStorage via sidebarStore.
// SUPER_ADMIN sees the Admins nav item — ADMIN role does not.
// Active item uses glass tint + primary border — no left accent bar.
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarStore, hydrateSidebar } from '@/lib/store/sidebar.store';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { NAV_SECTIONS, Icon } from '@/constants/navigation';
import type { NavItem, NavSection } from '@/constants/navigation';

// ── Tooltip — shown when sidebar is collapsed and item is hovered ──────────

/**
 * Floating label tooltip displayed to the right of a collapsed nav icon.
 * Only renders when visible to avoid unnecessary DOM nodes.
 */
function NavTooltip({ label, visible }: { label: string; visible: boolean }) {
    if (!visible) return null;
    return (
        <div
            role="tooltip"
            style={{
                position:    'absolute',
                left:        'calc(100% + 10px)',
                top:         '50%',
                transform:   'translateY(-50%)',
                background:  'var(--glass-overlay)',
                border:      '1px solid var(--glass-overlay-border)',
                borderRadius:'var(--radius-md)',
                padding:     '5px 12px',
                fontSize:    12,
                fontWeight:  500,
                color:       'var(--text-primary)',
                whiteSpace:  'nowrap',
                pointerEvents:'none',
                zIndex:      200,
                boxShadow:   '0 8px 24px rgba(0,0,0,0.10)',
                backdropFilter: 'blur(var(--glass-overlay-blur))',
            }}
        >
            {label}
        </div>
    );
}

// ── Nav item link ─────────────────────────────────────────────────────────

/**
 * Single navigation item — renders as a Next.js Link with active state,
 * icon, label, and a tooltip when the sidebar is collapsed.
 */
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
            <NavTooltip label={item.label} visible={collapsed && hovered} />
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────

/**
 * Admin sidebar — floating glass panel with collapsible navigation.
 * Hydrates collapse preference from localStorage on mount.
 */
export function AdminSidebar() {
    const pathname    = usePathname();
    const collapsed   = useSidebarStore((s) => s.collapsed);
    const mobileOpen  = useSidebarStore((s) => s.mobileOpen);
    const toggle      = useSidebarStore((s) => s.toggle);
    const closeMobile = useSidebarStore((s) => s.closeMobile);
    const admin       = useAdminAuthStore((s) => s.admin);

    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

    useEffect(() => {
        hydrateSidebar();
    }, []);

    const visibleSections = NAV_SECTIONS.map((section: NavSection) => ({
        ...section,
        items: section.items.filter(
            (item) => !item.superAdminOnly || isSuperAdmin,
        ),
    })).filter((section) => section.items.length > 0);

    const isSectioned = visibleSections.some((section) => section.label);

    const navSectionStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    };

    const navSectionLabelStyle: React.CSSProperties = {
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        padding: collapsed ? '10px 8px 4px' : '10px 10px 4px',
    };

    const navDividerStyle: React.CSSProperties = {
        height: 1,
        background: 'var(--glass-panel-border)',
        margin: collapsed ? '10px 6px 6px' : '12px 8px 6px',
        borderRadius: 999,
    };

    const showSectionLabel = (section: NavSection) =>
        Boolean(section.label) && !collapsed;

    const sectionNeedsDivider = (section: NavSection, index: number) =>
        Boolean(section.label) && index > 0 && isSectioned;

    const renderSection = (section: NavSection, index: number) => {
        return (
            <div key={section.label ?? `section-${index}`} style={navSectionStyle}>
                {sectionNeedsDivider(section, index) && (
                    <div aria-hidden="true" style={navDividerStyle} />
                )}
                {showSectionLabel(section) && (
                    <div style={navSectionLabelStyle}>{section.label}</div>
                )}
                {section.items.map((item) => (
                    <NavItemLink
                        key={item.href}
                        item={item}
                        active={isActive(item.href)}
                        collapsed={collapsed}
                        onClick={closeMobile}
                    />
                ))}
            </div>
        );
    };

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    return (
        <>
            {/* Mobile overlay — dims content when sidebar slides in */}
            {mobileOpen && (
                <div
                    style={{
                        position:   'fixed',
                        inset:      0,
                        background: 'rgba(0, 0, 0, 0.40)',
                        zIndex:     40,
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}

            <aside
                className={[
                    'admin-sidebar',
                    collapsed   ? 'collapsed'    : '',
                    mobileOpen  ? 'mobile-open'  : '',
                ].filter(Boolean).join(' ')}
                aria-label="Admin navigation"
            >
                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon" aria-hidden="true">IV</div>
                    <div className="sidebar-logo-text">
                        <div className="logo-name">ID Verify</div>
                        <div className="logo-role">Admin</div>
                    </div>
                </div>

                <nav className="sidebar-nav" aria-label="Main navigation">
                    {visibleSections.map(renderSection)}
                </nav>

                {/* Footer collapse toggle */}
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
                                <span style={{ fontSize: 12 }}>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}