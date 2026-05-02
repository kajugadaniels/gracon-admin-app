'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, Button } from '@/components/ui';
import type { CertificateRequestDetail } from '@/api/certificates/certificates.types';

interface CertificateRequestDetailCardProps {
    request: CertificateRequestDetail;
    canManage: boolean;
    onApprove: () => void;
    onReject: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={fieldStyle}>
            <span style={labelStyle}>{label}</span>
            <span style={valueStyle}>{value}</span>
        </div>
    );
}

function formatDate(value: string | null) {
    if (!value) return '—';

    return new Date(value).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function getStatusVariant(status: CertificateRequestDetail['status']) {
    if (status === 'PENDING') return 'pending';
    if (status === 'APPROVED') return 'active';
    if (status === 'REJECTED') return 'danger';
    return 'neutral';
}

export function CertificateRequestDetailCard({
    request,
    canManage,
    onApprove,
    onReject,
}: CertificateRequestDetailCardProps) {
    const isBanned = request.certificateAccessPolicy.isBanned;

    return (
        <section className="glass-card" style={sectionStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>{request.userName}</h2>
                    <p style={subtitleStyle}>{request.userEmail}</p>
                    <Link href={`/users/${request.userId}`} style={linkStyle}>
                        Open linked user profile
                    </Link>
                </div>
                <Badge variant={getStatusVariant(request.status)}>
                    {request.status.toLowerCase()}
                </Badge>
            </div>

            {isBanned && (
                <div style={policyWarningStyle}>
                    <strong>User certificate access is banned</strong>
                    <span>
                        {request.certificateAccessPolicy.banReason ??
                            'No ban reason was recorded.'}
                    </span>
                    {request.certificateAccessPolicy.bannedAt && (
                        <span>
                            Banned on {formatDate(request.certificateAccessPolicy.bannedAt)}
                        </span>
                    )}
                </div>
            )}

            <div style={gridStyle}>
                <Field label="Identity Type" value={request.identityType} />
                <Field label="Requested Validity" value={`${request.requestedValidityYears} years`} />
                <Field label="Key Algorithm" value={request.keyAlgorithm} />
                <Field label="Requested At" value={formatDate(request.requestedAt)} />
                <Field label="Reviewed At" value={formatDate(request.reviewedAt)} />
                <Field
                    label="Issued Certificate"
                    value={
                        request.issuedCertificateId ? (
                            <Link
                                href={`/admin/certificates/${request.issuedCertificateId}`}
                                style={linkStyle}
                            >
                                Open certificate
                            </Link>
                        ) : '—'
                    }
                />
                <Field label="Key Pair ID" value={<span style={monoStyle}>{request.keyPairId}</span>} />
                <Field label="Key Fingerprint" value={<span style={monoStyle}>{request.keyFingerprint}</span>} />
                <Field label="Review Reason" value={request.reviewReason ?? '—'} />
                <Field label="Cancellation Reason" value={request.cancellationReason ?? '—'} />
            </div>

            {canManage && request.status === 'PENDING' && (
                <div style={actionsStyle}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onApprove}
                        disabled={isBanned}
                    >
                        Approve Request
                    </Button>
                    <Button type="button" variant="danger" onClick={onReject}>
                        Reject Request
                    </Button>
                </div>
            )}
        </section>
    );
}

const sectionStyle: React.CSSProperties = {
    padding: 20,
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
};

const titleStyle: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const subtitleStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-secondary)',
    marginTop: 4,
};

const linkStyle: React.CSSProperties = {
    display: 'inline-flex',
    marginTop: 10,
    color: 'var(--primary-text)',
    fontSize: 12,
    textDecoration: 'none',
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
};

const fieldStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
};

const labelStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
};

const valueStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-primary)',
};

const monoStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
};

const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    flexWrap: 'wrap',
};

const policyWarningStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: 14,
    borderRadius: 'var(--radius-md)',
    background: 'var(--error-bg)',
    border: '1px solid var(--error-border)',
    color: 'var(--error-text)',
    fontSize: 13,
    lineHeight: 1.5,
};
