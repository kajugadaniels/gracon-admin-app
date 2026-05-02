// CertificateDetailCard shows parsed X.509 metadata on the admin detail page.
'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, Button } from '@/components/ui';
import type { CertificateDetail } from '@/api/certificates/certificates.types';
import { CertificateDownloadButtons } from './CertificateDownloadButtons';

interface CertificateDetailCardProps {
    certificate: CertificateDetail;
    canManage: boolean;
    onRevoke: () => void;
    onReissue: () => void;
    onBanAccess: () => void;
    onLiftBan: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
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

/**
 * Parsed certificate metadata card.
 */
export function CertificateDetailCard({
    certificate,
    canManage,
    onReissue,
    onRevoke,
    onBanAccess,
    onLiftBan,
}: CertificateDetailCardProps) {
    const isBanned = certificate.certificateAccessPolicy.isBanned;

    return (
        <section className="glass-card" style={sectionStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>{certificate.userName}</h2>
                    <p style={subtitleStyle}>{certificate.userEmail}</p>
                    <Link href={`/users/${certificate.userId}`} style={linkStyle}>
                        Open linked user profile
                    </Link>
                </div>
                <Badge
                    variant={
                        certificate.status === 'ACTIVE'
                            ? 'active'
                            : certificate.status === 'EXPIRED'
                                ? 'pending'
                                : 'danger'
                    }
                >
                    {certificate.status.toLowerCase()}
                </Badge>
            </div>

            {isBanned && (
                <div style={policyWarningStyle}>
                    <strong>Certificate access banned</strong>
                    <span>
                        {certificate.certificateAccessPolicy.banReason ??
                            'No ban reason was recorded.'}
                    </span>
                    {certificate.certificateAccessPolicy.bannedAt && (
                        <span>
                            Banned on {formatDate(certificate.certificateAccessPolicy.bannedAt)}
                        </span>
                    )}
                </div>
            )}

            <div style={gridStyle}>
                <Field label="Serial Number" value={<span style={monoStyle}>{certificate.serialNumber}</span>} />
                <Field label="Fingerprint" value={<span style={monoStyle}>{certificate.fingerprintSha256}</span>} />
                <Field label="Algorithm" value={certificate.keyAlgorithm} />
                <Field label="Key Size" value={certificate.keySize ?? '—'} />
                <Field label="Issued At" value={formatDate(certificate.issuedAt)} />
                <Field label="Expires At" value={formatDate(certificate.notAfter)} />
                <Field label="Issuer DN" value={`${certificate.issuer.commonName}, ${certificate.issuer.country}`} />
                <Field label="Subject DN" value={`${certificate.subject.commonName}, ${certificate.subject.country}`} />
            </div>

            <CertificateDownloadButtons certificateId={certificate.certificateId} />

            {canManage && (
                <div style={actionsStyle}>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onReissue}
                        disabled={isBanned}
                    >
                        Reissue Certificate
                    </Button>
                    {!isBanned ? (
                        <Button type="button" variant="danger" onClick={onBanAccess}>
                            Ban Access
                        </Button>
                    ) : (
                        <Button type="button" variant="primary" onClick={onLiftBan}>
                            Lift Ban
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="danger"
                        onClick={onRevoke}
                        disabled={certificate.status === 'REVOKED'}
                    >
                        Revoke Certificate
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
