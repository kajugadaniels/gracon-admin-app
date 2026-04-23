// AdminsClient — admin management page.
// Only accessible to SUPER_ADMIN — AdminAuthGuard + @RequireRole on the API.
// Frontend guards the create button and resend action additionally
// so regular admins see the list but cannot modify it.
// Optimistic UI: newly created admin is prepended to the list immediately
// rather than waiting for a re-fetch.
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button } from '@/components/ui';
import { AdminTable, type AdminRow } from './AdminTable';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { resendInviteApi } from '@/api/admins/resend-invite.api';

// SSR-safe modal
const CreateAdminModal = dynamic(
    () => import('./CreateAdminModal').then((m) => m.CreateAdminModal),
    { ssr: false },
);

// ── Fetch admins API call ─────────────────────────────────────────────────
// The admin service list endpoint lives at GET /auth/admins
// Add this API file now:
import { apiClient } from '@/api/client';

function getApiErrorMessage(error: unknown, fallback: string) {
    if (typeof error !== 'object' || !error) return fallback;
    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) return fallback;
    const data = Reflect.get(response, 'data');
    if (typeof data !== 'object' || !data) return fallback;
    const message = Reflect.get(data, 'message');
    return typeof message === 'string' ? message : fallback;
}

async function listAdminsApi(): Promise<AdminRow[]> {
    const res = await apiClient.get<{ data: AdminRow[] }>('/auth/admins');
    return res.data.data;
}

// ── Icons ──────────────────────────────────────────────────────────────────

const PlusIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

export function AdminsClient() {
    const admin = useAdminAuthStore((s) => s.admin);
    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

    const [admins, setAdmins] = useState<AdminRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [resendingId, setResendingId] = useState<string | null>(null);

    const fetchAdmins = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listAdminsApi();
            setAdmins(data);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, 'Failed to load admins.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);

    // Optimistic prepend — new admin appears immediately
    const handleAdminCreated = (newAdmin: {
        adminId: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        role: string;
        createdAt: string;
    }) => {
        const row: AdminRow = {
            adminId: newAdmin.adminId,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            email: newAdmin.email,
            phoneNumber: newAdmin.phoneNumber,
            role: newAdmin.role as 'ADMIN' | 'SUPER_ADMIN',
            isVerified: false,   // just created — invite not yet accepted
            isActive: true,
            createdAt: newAdmin.createdAt,
        };
        setAdmins((prev) => [row, ...prev]);
    };

    const handleResendInvite = async (adminId: string, email: string) => {
        setResendingId(adminId);
        try {
            await resendInviteApi(adminId);
            toast.success(`Invite resent to ${email}.`);
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, 'Failed to resend invite.'));
        } finally {
            setResendingId(null);
        }
    };

    return (
        <>
            <PageHeader
                title="Admins"
                subtitle="All administrator accounts on the platform."
                action={
                    // Only SUPER_ADMIN sees the create button
                    isSuperAdmin ? (
                        <Button
                            variant="primary"
                            size="sm"
                            icon={<PlusIcon />}
                            onClick={() => setModalOpen(true)}
                        >
                            Add admin
                        </Button>
                    ) : undefined
                }
            />

            {/* Stat summary */}
            {!loading && !error && (
                <div
                    style={{
                        display: 'flex',
                        gap: 16,
                        marginBottom: 12,
                        flexWrap: 'wrap',
                    }}
                >
                    <StatPill
                        label="Total"
                        value={admins.length}
                        color="var(--text-secondary)"
                    />
                    <StatPill
                        label="Active"
                        value={admins.filter((a) => a.isActive && a.isVerified).length}
                        color="var(--success-text)"
                    />
                    <StatPill
                        label="Invite pending"
                        value={admins.filter((a) => !a.isVerified && a.isActive).length}
                        color="var(--warning-text)"
                    />
                    <StatPill
                        label="Super admins"
                        value={admins.filter((a) => a.role === 'SUPER_ADMIN').length}
                        color="var(--primary-text)"
                    />
                </div>
            )}

            <AdminTable
                data={admins}
                loading={loading}
                error={error}
                isSuperAdmin={isSuperAdmin}
                resendingId={resendingId}
                onResendInvite={handleResendInvite}
            />

            {isSuperAdmin && (
                <CreateAdminModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    onSuccess={handleAdminCreated}
                />
            )}
        </>
    );
}

// ── Stat pill ─────────────────────────────────────────────────────────────

function StatPill({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 12px',
                background: 'var(--glass-interactive)',
                border: '1px solid var(--glass-interactive-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 12,
            }}
        >
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span
                style={{
                    fontWeight: 600,
                    color,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {value}
            </span>
        </div>
    );
}
