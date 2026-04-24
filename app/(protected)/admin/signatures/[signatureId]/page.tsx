// Admin signature detail page.
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, EmptyState, Pagination, Spinner } from '@/components/ui';
import { getFriendlyErrorMessage } from '@/lib/http';
import {
    getSignature,
    listSignatureDocuments,
    revokeSignature,
} from '@/api/signatures/signatures.api';
import type {
    PaginatedSignatureDocumentsResponse,
    SignatureDetail,
} from '@/api/signatures/signatures.types';
import { SignatureDetailCard } from '@/components/signatures/SignatureDetailCard';
import { SignedDocumentsTable } from '@/components/signatures/SignedDocumentsTable';
import { RevokeSignatureModal } from '@/components/signatures/RevokeSignatureModal';

export default function SignatureDetailPage() {
    const router = useRouter();
    const params = useParams<{ signatureId: string }>();
    const admin = useAdminAuthStore((state) => state.admin);
    const signatureId = typeof params.signatureId === 'string' ? params.signatureId : '';
    const canRevoke = admin?.role === 'SUPER_ADMIN';
    const [signature, setSignature] = useState<SignatureDetail | null>(null);
    const [documents, setDocuments] =
        useState<PaginatedSignatureDocumentsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [documentsPage, setDocumentsPage] = useState(1);
    const [revokeOpen, setRevokeOpen] = useState(false);
    const [revokeLoading, setRevokeLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [signatureResponse, documentsResponse] = await Promise.all([
                getSignature(signatureId),
                listSignatureDocuments(signatureId, { page: documentsPage, limit: 10 }),
            ]);
            setSignature(signatureResponse.data);
            setDocuments(documentsResponse.data);
        } catch (nextError) {
            setError(
                getFriendlyErrorMessage(nextError, 'Failed to load signature.'),
            );
        } finally {
            setLoading(false);
        }
    }, [documentsPage, signatureId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleRevoke = async (reason: string) => {
        setRevokeLoading(true);
        try {
            const response = await revokeSignature(signatureId, { reason });
            setSignature(response.data);
            setRevokeOpen(false);
            toast.success('Signature revoked successfully.');
        } catch (nextError) {
            toast.error(
                getFriendlyErrorMessage(nextError, 'Failed to revoke signature.'),
            );
        } finally {
            setRevokeLoading(false);
        }
    };

    if (loading) {
        return <Spinner fullPage label="Loading signature…" />;
    }

    if (error || !signature) {
        return (
            <EmptyState
                icon="⚠"
                title="Signature unavailable"
                description={error ?? 'The requested signature does not exist.'}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Signature Detail"
                subtitle="Cross-user signature activity and verification history."
                action={
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/signatures')}>
                        Back to signatures
                    </Button>
                }
            />

            <div style={layoutStyle}>
                <SignatureDetailCard
                    signature={signature}
                    canRevoke={Boolean(canRevoke)}
                    onRevoke={() => setRevokeOpen(true)}
                />

                <section className="glass-card" style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>Signed Documents</h3>
                    <SignedDocumentsTable
                        data={documents?.items ?? []}
                        loading={loading}
                        error={null}
                    />
                    {documents && documents.totalPages > 1 && (
                        <Pagination
                            page={documents.page}
                            totalPages={documents.totalPages}
                            total={documents.total}
                            limit={documents.limit}
                            onChange={setDocumentsPage}
                        />
                    )}
                </section>

                <section className="glass-card" style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>Audit Log</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {signature.auditLog.length === 0 && (
                            <div style={mutedStyle}>No audit entries recorded for this signature.</div>
                        )}
                        {signature.auditLog.map((entry) => (
                            <div key={entry.id} style={auditRowStyle}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {entry.action}
                                    </div>
                                    <div style={mutedStyle}>
                                        {entry.actorName} · {entry.actorRole}
                                    </div>
                                </div>
                                <div style={mutedStyle}>
                                    {new Date(entry.createdAt).toLocaleString('en-US')}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <RevokeSignatureModal
                open={revokeOpen}
                loading={revokeLoading}
                onClose={() => setRevokeOpen(false)}
                onConfirm={handleRevoke}
            />
        </>
    );
}

const layoutStyle: React.CSSProperties = {
    display: 'grid',
    gap: 16,
};

const sectionStyle: React.CSSProperties = {
    padding: 20,
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const auditRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    background: 'var(--glass-interactive)',
    border: '1px solid var(--glass-interactive-border)',
    borderRadius: 'var(--radius-md)',
    padding: 12,
    flexWrap: 'wrap',
};

const mutedStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
};
