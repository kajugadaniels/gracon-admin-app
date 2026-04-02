import type { Metadata } from 'next';
import { VerificationDetailClient } from '@/components/pages/verifications';

export const metadata: Metadata = { title: 'Verification detail' };

export default function VerificationDetailPage({
    params,
}: {
    params: { id: string };
}) {
    return <VerificationDetailClient verificationId={params.id} />;
}