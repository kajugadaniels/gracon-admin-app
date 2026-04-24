// SignatureDetailCard shows the primary signature metadata and user summary.
'use client';

import React from 'react';
import Link from 'next/link';
import { Badge, Button } from '@/components/ui';
import type { SignatureDetail } from '@/api/signatures/signatures.types';

interface SignatureDetailCardProps {
    signature: SignatureDetail;
    canRevoke: boolean;
    onRevoke: () => void;
}

function formatDate(value: string | null) {
    if (!value) {
        return 'Never';
    }

    return new Date(value).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatAlgorithm(value: SignatureDetail['algorithm']) {
    return value === 'RSA_2048' ? 'RSA-2048' : 'Ed25519';
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}

/**
 * Primary detail card for one personal signature.
 */
export function SignatureDetailCard({
    signature,
    canRevoke,
    onRevoke,
}: SignatureDetailCardProps) {
    return (
        <section className="glass-card" style={sectionStyle}>
            <div style={headerStyle}>
                <div>
                    <h2 style={titleStyle}>{signature.userName}</h2>
                    <p style={subtitleStyle}>{signature.userEmail}</p>
                    <Link href={`/users/${signature.userId}`} style={linkStyle}>
                        Open linked user profile
                    </Link>
                </div>
                <Badge variant={signature.status === 'ACTIVE' ? 'active' : 'danger'}>
                    {signature.status === 'ACTIVE' ? 'Active' : 'Revoked'}
                </Badge>
            </div>

            <div style={gridStyle}>
                <Field label="Algorithm" value={formatAlgorithm(signature.algorithm)} />
                <Field label="Created At" value={formatDate(signature.createdAt)} />
                <Field label="Last Used" value={formatDate(signature.lastUsedAt)} />
                <Field label="Documents Signed" value={signature.documentsSigned} />
                <Field label="Signature ID" value={<span style={monoStyle}>{signature.signatureId}</span>} />
            </div>

            {canRevoke && signature.status === 'ACTIVE' && (
                <div style={actionsStyle}>
                    <Button type="button" variant="danger" onClick={onRevoke}>
                        Revoke Signature
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
    alignItems: 'flex-start',
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
};

const monoStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontVariantNumeric: 'tabular-nums',
};
