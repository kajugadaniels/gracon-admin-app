'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, EmptyState, Spinner } from '@/components/ui';
import { getFriendlyErrorMessage } from '@/lib/http';
import {
    approveCertificateRequest,
    getCertificateRequest,
    rejectCertificateRequest,
} from '@/api/certificates/certificates.api';
import type { CertificateRequestDetail } from '@/api/certificates/certificates.types';
import { CertificateRequestDetailCard } from '@/components/certificates/CertificateRequestDetailCard';
import { ApproveCertificateRequestModal } from '@/components/certificates/ApproveCertificateRequestModal';
import { RejectCertificateRequestModal } from '@/components/certificates/RejectCertificateRequestModal';

export default function CertificateRequestDetailPage() {
    const router = useRouter();
    const params = useParams<{ requestId: string }>();
    const admin = useAdminAuthStore((state) => state.admin);
    const requestId = typeof params.requestId === 'string' ? params.requestId : '';
    const canManage = admin?.role === 'SUPER_ADMIN';
    const [request, setRequest] = useState<CertificateRequestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approveOpen, setApproveOpen] = useState(false);
    const [rejectOpen, setRejectOpen] = useState(false);
    const [mutationLoading, setMutationLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getCertificateRequest(requestId);
            setRequest(response.data);
        } catch (nextError) {
            setError(
                getFriendlyErrorMessage(nextError, 'Failed to load certificate request.'),
            );
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        load();
    }, [load]);

    const reviewRequest = async (
        action: 'approve' | 'reject',
        reason: string,
    ) => {
        setMutationLoading(true);
        try {
            const response = action === 'approve'
                ? await approveCertificateRequest(requestId, { reason })
                : await rejectCertificateRequest(requestId, { reason });
            setRequest(response.data);
            setApproveOpen(false);
            setRejectOpen(false);
            toast.success(
                action === 'approve'
                    ? 'Certificate request approved successfully.'
                    : 'Certificate request rejected successfully.',
            );
        } catch (nextError) {
            toast.error(
                getFriendlyErrorMessage(
                    nextError,
                    `Failed to ${action} certificate request.`,
                ),
            );
        } finally {
            setMutationLoading(false);
        }
    };

    if (loading) {
        return <Spinner fullPage label="Loading certificate request…" />;
    }

    if (error || !request) {
        return (
            <EmptyState
                icon="⚠"
                title="Certificate request unavailable"
                description={error ?? 'The requested certificate request does not exist.'}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Certificate Request Detail"
                subtitle="Admin review state before real certificate issuance."
                action={
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/certificates')}>
                        Back to certificates
                    </Button>
                }
            />

            <CertificateRequestDetailCard
                request={request}
                canManage={Boolean(canManage)}
                onApprove={() => setApproveOpen(true)}
                onReject={() => setRejectOpen(true)}
            />

            <ApproveCertificateRequestModal
                open={approveOpen}
                loading={mutationLoading}
                onClose={() => setApproveOpen(false)}
                onConfirm={(reason) => reviewRequest('approve', reason)}
            />
            <RejectCertificateRequestModal
                open={rejectOpen}
                loading={mutationLoading}
                onClose={() => setRejectOpen(false)}
                onConfirm={(reason) => reviewRequest('reject', reason)}
            />
        </>
    );
}
