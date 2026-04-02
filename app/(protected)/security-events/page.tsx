import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SecurityEventsClient } from '@/components/pages/security-events';

export const metadata: Metadata = { title: 'Security events' };

export default function SecurityEventsPage() {
    return (
        <Suspense>
            <SecurityEventsClient />
        </Suspense>
    );
}