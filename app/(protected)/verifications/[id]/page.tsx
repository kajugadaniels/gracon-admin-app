import type { Metadata } from 'next';
import { VerificationDetailClient } from '@/components/pages/verifications';

export const metadata: Metadata = { title: 'Verification detail' };

export default async function VerificationDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <VerificationDetailClient verificationId={id} />;
}
