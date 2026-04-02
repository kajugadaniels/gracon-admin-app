import { Suspense } from 'react';
import type { Metadata } from 'next';
import { AuditClient } from '@/components/pages/audit';

export const metadata: Metadata = { title: 'Audit log' };

export default function AuditPage() {
    return (
        <Suspense>
            <AuditClient />
        </Suspense>
    );
}