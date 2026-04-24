'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shell/PageHeader';
import { EmptyState } from '@/components/ui';
import { InstitutionRegistrationForm } from '@/components/institutions/InstitutionRegistrationForm';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';

export default function NewInstitutionPage() {
    const router = useRouter();
    const admin = useAdminAuthStore((state) => state.admin);

    if (admin?.role !== 'SUPER_ADMIN') {
        return (
            <EmptyState
                icon="⛔"
                title="Insufficient privileges"
                description="Only SUPER_ADMIN can register new institutions."
                action={{ label: 'Back to institutions', onClick: () => router.push('/admin/institutions') }}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Register Institution"
                subtitle="Create a new institution profile and prepare its cryptographic trust material."
            />
            <InstitutionRegistrationForm />
        </>
    );
}
