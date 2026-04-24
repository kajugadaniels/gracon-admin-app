'use client';

import React from 'react';
import { Badge } from '@/components/ui';
import type { StampDetail } from '@/api/stamps/stamps.types';

interface SignatureChainDisplayProps {
    stamp: StampDetail;
}

export function SignatureChainDisplay({ stamp }: SignatureChainDisplayProps) {
    return (
        <div style={layoutStyle}>
            <ChainCard
                title="Primary Signer"
                name={stamp.primarySigner.name}
                role={stamp.primarySigner.role}
                timestamp={stamp.primarySigner.signedAt}
            />
            <ChainCard
                title="Co-signer"
                name={stamp.coSigner.name}
                role={stamp.coSigner.role}
                timestamp={stamp.coSigner.signedAt}
            />
            <div className="glass-card" style={cardStyle}>
                <h4 style={titleStyle}>Authority Chain</h4>
                <p style={bodyStyle}>{stamp.authorityChain.resolutionTitle}</p>
                <Badge variant={stamp.authorityChain.validAtStampTime ? 'active' : 'danger'}>
                    {stamp.authorityChain.validAtStampTime ? 'Valid at stamp time' : 'Invalid at stamp time'}
                </Badge>
            </div>
            <div className="glass-card" style={cardStyle}>
                <h4 style={titleStyle}>Verification</h4>
                <p style={bodyStyle}>Signature chain: {stamp.verification.signatureChainStatus}</p>
                <p style={bodyStyle}>Certificate validity: {stamp.verification.certificateValidityAtStampTime}</p>
                <Badge variant={stamp.verification.cryptographicValidity ? 'active' : 'danger'}>
                    {stamp.verification.cryptographicValidity ? 'Cryptographically valid' : 'Cryptographically invalid'}
                </Badge>
            </div>
        </div>
    );
}

function ChainCard(props: { title: string; name: string; role: string; timestamp: string }) {
    return (
        <div className="glass-card" style={cardStyle}>
            <h4 style={titleStyle}>{props.title}</h4>
            <p style={bodyStyle}>{props.name}</p>
            <p style={metaStyle}>{props.role}</p>
            <p style={metaStyle}>{new Date(props.timestamp).toLocaleString('en-US')}</p>
        </div>
    );
}

const layoutStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
};

const cardStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
};

const titleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const bodyStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-primary)',
};

const metaStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
};
