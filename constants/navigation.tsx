// Navigation constants — nav items and icons for the admin sidebar.
// Extracted here so AdminSidebar stays focused on layout/state, not data.
// SUPER_ADMIN-only items are flagged with superAdminOnly: true.
import React from 'react';

// ── Nav item definition ────────────────────────────────────────────────────

export interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    /** Only show this item for the SUPER_ADMIN role */
    superAdminOnly?: boolean;
}

export interface NavSection {
    label?: string;
    items: NavItem[];
}

// ── SVG icons — inline, no external dependency ───────────────────────────

export const Icon = {
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
    Passport: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M9 7h6" />
            <circle cx="12" cy="13" r="2.5" />
            <path d="M8.5 18a4 4 0 0 1 7 0" />
        </svg>
    ),
    Signature: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17c3.5 0 3.5-8 7-8s3.5 8 7 8c1.5 0 2.5-.5 4-2" />
            <path d="M3 21h18" />
        </svg>
    ),
    Certificate: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 7h8" />
            <path d="M8 11h8" />
            <path d="M9 15l3 2 3-2" />
        </svg>
    ),
    Building: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 10h.01" />
            <path d="M15 10h.01" />
            <path d="M9 14h.01" />
            <path d="M15 14h.01" />
            <path d="M10 21v-4h4v4" />
        </svg>
    ),
    Stamp: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6a4 4 0 1 1 8 0c0 2 1 3 2 4v2H6v-2c1-1 2-2 2-4Z" />
            <path d="M5 18h14" />
            <path d="M7 21h10" />
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

export const NAV_SECTIONS: NavSection[] = [
    {
        items: [
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
                href: '/admin/foreign-identities',
                label: 'Foreign Identities',
                icon: <Icon.Passport />,
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
        ],
    },
    {
        label: 'Cryptographic Infrastructure',
        items: [
            {
                href: '/admin/signatures',
                label: 'Signatures',
                icon: <Icon.Signature />,
            },
            {
                href: '/admin/certificates',
                label: 'Certificates',
                icon: <Icon.Certificate />,
            },
            {
                href: '/admin/institutions',
                label: 'Institutions',
                icon: <Icon.Building />,
            },
            {
                href: '/admin/stamps',
                label: 'Stamps',
                icon: <Icon.Stamp />,
            },
        ],
    },
];
