// RevokeCertificateModal handles certificate revocation with CRL reason codes.
'use client';

import React, { useMemo, useState } from 'react';
import { Button, Select } from '@/components/ui';
import type { CrlReasonCode } from '@/api/certificates/certificates.types';

interface RevokeCertificateModalProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: (payload: { reason: string; crlReasonCode: CrlReasonCode }) => void;
}

const MIN_REASON_LENGTH = 20;

/**
 * Certificate revocation modal with mandatory reason and CRL code.
 */
export function RevokeCertificateModal({
    open,
    loading,
    onClose,
    onConfirm,
}: RevokeCertificateModalProps) {
    const [reason, setReason] = useState('');
    const [crlReasonCode, setCrlReasonCode] = useState<CrlReasonCode>('unspecified');

    const canSubmit = useMemo(
        () => reason.trim().length >= MIN_REASON_LENGTH,
        [reason],
    );

    if (!open) {
        return null;
    }

    return (
        <div style={backdropStyle} onClick={onClose} role="dialog" aria-modal="true">
            <div style={panelStyle} onClick={(event) => event.stopPropagation()}>
                <h3 style={titleStyle}>Revoke Certificate</h3>
                <p style={descriptionStyle}>
                    Revoking a certificate marks it invalid for future trust decisions and updates
                    the certificate lifecycle state shown across the admin dashboard.
                </p>
                <Select
                    label="CRL Reason Code"
                    value={crlReasonCode}
                    onChange={(event) => setCrlReasonCode(event.target.value as CrlReasonCode)}
                    options={[
                        { value: 'keyCompromise', label: 'keyCompromise' },
                        { value: 'affiliationChanged', label: 'affiliationChanged' },
                        { value: 'superseded', label: 'superseded' },
                        { value: 'cessationOfOperation', label: 'cessationOfOperation' },
                        { value: 'unspecified', label: 'unspecified' },
                    ]}
                />
                <label htmlFor="revoke-certificate-reason" style={labelStyle}>Reason</label>
                <textarea
                    id="revoke-certificate-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={5}
                    maxLength={500}
                    style={textareaStyle}
                />
                <div style={counterStyle}>{reason.trim().length}/{MIN_REASON_LENGTH} minimum</div>
                <div style={actionsStyle}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        loading={loading}
                        disabled={!canSubmit}
                        onClick={() => onConfirm({ reason: reason.trim(), crlReasonCode })}
                    >
                        Revoke Certificate
                    </Button>
                </div>
            </div>
        </div>
    );
}

const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 120,
    background: 'rgba(0, 0, 0, 0.62)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
};

const panelStyle: React.CSSProperties = {
    width: 'min(100%, 560px)',
    background: 'var(--surface-overlay)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
};

const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--error-text)',
};

const descriptionStyle: React.CSSProperties = {
    fontSize: 13,
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
};

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
};

const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 132,
    resize: 'vertical',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 12,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
};

const counterStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-muted)',
    textAlign: 'right',
};

const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
};
