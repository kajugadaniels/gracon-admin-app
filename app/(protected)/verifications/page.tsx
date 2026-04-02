import { Suspense } from 'react';
import type { Metadata } from 'next';
import { VerificationsClient } from '@/components/pages/verifications';

export const metadata: Metadata = { title: 'Verifications' };

export default function VerificationsPage() {
    return (
        <Suspense>
            <VerificationsClient />
        </Suspense>
    );
}