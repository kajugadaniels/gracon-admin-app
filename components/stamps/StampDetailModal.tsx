'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Badge } from '@/components/ui';
import type { StampDetail } from '@/api/stamps/stamps.types';
import { SignatureChainDisplay } from './SignatureChainDisplay';

interface StampDetailModalProps {
    open: boolean;
    stamp: StampDetail | null;
    onClose: () => void;
}

function truncateHash(hash: string) {
    return `${hash.slice(0, 18)}…${hash.slice(-10)}`;
}

export function StampDetailModal({ open, stamp, onClose }: StampDetailModalProps) {
    const [expanded, setExpanded] = useState(false);
    const verificationLabel = useMemo(
        () => (stamp?.verification.cryptographicValidity ? 'Valid' : 'Invalid'),
        [stamp?.verification.cryptographicValidity],
    );

    if (!open || !stamp) return null;

    return (
        <div style={backdropStyle} onClick={onClose} role="dialog" aria-modal="true">
            <div style={panelStyle} onClick={(event) => event.stopPropagation()}>
                <div style={headerStyle}>
                    <div>
                        <h3 style={titleStyle}>Stamp Event Detail</h3>
                        <p style={subtitleStyle}>{stamp.institutionName}</p>
                    </div>
                    <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
                </div>

                <div className="glass-card" style={sectionStyle}>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Document hash</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <code style={codeStyle}>{truncateHash(stamp.documentHash)}</code>
                            <Button type="button" size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(stamp.documentHash)}>
                                Copy
                            </Button>
                        </div>
                    </div>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Certificate serial</span>
                        <Link href={`/admin/institutions/${stamp.institutionId}`} style={linkStyle}>
                            {stamp.certificate.serialNumber}
                        </Link>
                    </div>
                    <div style={rowStyle}>
                        <span style={labelStyle}>Verification result</span>
                        <Badge variant={verificationLabel === 'Valid' ? 'active' : 'danger'}>
                            {verificationLabel}
                        </Badge>
                    </div>
                </div>

                <SignatureChainDisplay stamp={stamp} />

                <div className="glass-card" style={sectionStyle}>
                    <div style={headerInlineStyle}>
                        <div>
                            <h4 style={titleStyle}>Raw Signature Bytes</h4>
                            <p style={subtitleStyle}>Base64-encoded dual-signature payload.</p>
                        </div>
                        <Button type="button" variant="ghost" onClick={() => setExpanded((current) => !current)}>
                            {expanded ? 'Collapse' : 'Expand'}
                        </Button>
                    </div>
                    {expanded && (
                        <pre style={preStyle}>
                            {stamp.rawSignatureBytes}
                        </pre>
                    )}
                </div>
            </div>
        </div>
    );
}

const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 130,
    background: 'rgba(0, 0, 0, 0.62)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
};

const panelStyle: React.CSSProperties = {
    width: 'min(100%, 960px)',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'var(--surface-overlay)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
};

const headerInlineStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
};

const sectionStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
};

const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const subtitleStyle: React.CSSProperties = {
    marginTop: 4,
    fontSize: 13,
    color: 'var(--text-secondary)',
};

const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
};

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
};

const codeStyle: React.CSSProperties = {
    padding: '6px 10px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--glass-panel)',
    color: 'var(--text-primary)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
};

const linkStyle: React.CSSProperties = {
    color: 'var(--primary-text)',
    textDecoration: 'none',
    fontWeight: 600,
};

const preStyle: React.CSSProperties = {
    margin: 0,
    padding: 16,
    borderRadius: 'var(--radius-md)',
    background: 'var(--glass-panel)',
    color: 'var(--text-primary)',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    maxHeight: 240,
    overflowY: 'auto',
};
