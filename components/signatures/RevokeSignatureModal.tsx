// RevokeSignatureModal handles the SUPER_ADMIN signature revocation flow.
'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui';

interface RevokeSignatureModalProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const MIN_REASON_LENGTH = 20;

/**
 * Signature revocation modal with the required reason field.
 */
export function RevokeSignatureModal({
    open,
    loading,
    onClose,
    onConfirm,
}: RevokeSignatureModalProps) {
    const [reason, setReason] = useState('');

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
                <h3 style={titleStyle}>Revoke Signature</h3>
                <p style={descriptionStyle}>
                    Revoking this signature will mark all future verification attempts as invalid.
                    Documents already signed remain cryptographically valid but their trust chain
                    will indicate the signature was later revoked.
                </p>
                <label htmlFor="revoke-signature-reason" style={labelStyle}>
                    Reason
                </label>
                <textarea
                    id="revoke-signature-reason"
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={5}
                    maxLength={500}
                    style={textareaStyle}
                />
                <div style={counterStyle}>
                    {reason.trim().length}/{MIN_REASON_LENGTH} minimum
                </div>
                <div style={actionsStyle}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="danger"
                        loading={loading}
                        disabled={!canSubmit}
                        onClick={() => onConfirm(reason.trim())}
                    >
                        Revoke Signature
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
