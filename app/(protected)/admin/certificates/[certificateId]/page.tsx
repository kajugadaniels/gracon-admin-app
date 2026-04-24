// Admin certificate detail page.
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, EmptyState, Spinner } from '@/components/ui';
import { getFriendlyErrorMessage } from '@/lib/http';
import {
    getCertificate,
    reissueCertificate,
    revokeCertificate,
} from '@/api/certificates/certificates.api';
import type { CertificateDetail } from '@/api/certificates/certificates.types';
import { CertificateDetailCard } from '@/components/certificates/CertificateDetailCard';
import { ReissueCertificateModal } from '@/components/certificates/ReissueCertificateModal';
import { RevokeCertificateModal } from '@/components/certificates/RevokeCertificateModal';

export default function CertificateDetailPage() {
    const router = useRouter();
    const params = useParams<{ certificateId: string }>();
    const admin = useAdminAuthStore((state) => state.admin);
    const certificateId = typeof params.certificateId === 'string' ? params.certificateId : '';
    const canManage = admin?.role === 'SUPER_ADMIN';
    const [certificate, setCertificate] = useState<CertificateDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revokeOpen, setRevokeOpen] = useState(false);
    const [reissueOpen, setReissueOpen] = useState(false);
    const [mutationLoading, setMutationLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCertificate(certificateId);
            setCertificate(response.data);
        } catch (nextError) {
            setError(
                getFriendlyErrorMessage(nextError, 'Failed to load certificate.'),
            );
        } finally {
            setLoading(false);
        }
    }, [certificateId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleRevoke = async (payload: { reason: string; crlReasonCode: 'keyCompromise' | 'affiliationChanged' | 'superseded' | 'cessationOfOperation' | 'unspecified' }) => {
        setMutationLoading(true);
        try {
            const response = await revokeCertificate(certificateId, payload);
            setCertificate(response.data);
            setRevokeOpen(false);
            toast.success('Certificate revoked successfully.');
        } catch (nextError) {
            toast.error(getFriendlyErrorMessage(nextError, 'Failed to revoke certificate.'));
        } finally {
            setMutationLoading(false);
        }
    };

    const handleReissue = async (reason: string) => {
        setMutationLoading(true);
        try {
            const response = await reissueCertificate(certificateId, { reason });
            setCertificate(response.data);
            setReissueOpen(false);
            toast.success('Certificate reissued successfully.');
        } catch (nextError) {
            toast.error(getFriendlyErrorMessage(nextError, 'Failed to reissue certificate.'));
        } finally {
            setMutationLoading(false);
        }
    };

    if (loading) {
        return <Spinner fullPage label="Loading certificate…" />;
    }

    if (error || !certificate) {
        return (
            <EmptyState
                icon="⚠"
                title="Certificate unavailable"
                description={error ?? 'The requested certificate does not exist.'}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Certificate Detail"
                subtitle="Parsed X.509 metadata and lifecycle controls."
                action={
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/certificates')}>
                        Back to certificates
                    </Button>
                }
            />

            <CertificateDetailCard
                certificate={certificate}
                canManage={Boolean(canManage)}
                onReissue={() => setReissueOpen(true)}
                onRevoke={() => setRevokeOpen(true)}
            />

            <RevokeCertificateModal
                open={revokeOpen}
                loading={mutationLoading}
                onClose={() => setRevokeOpen(false)}
                onConfirm={handleRevoke}
            />
            <ReissueCertificateModal
                open={reissueOpen}
                loading={mutationLoading}
                onClose={() => setReissueOpen(false)}
                onConfirm={handleReissue}
            />
        </>
    );
}
