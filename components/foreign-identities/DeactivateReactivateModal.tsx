'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui';

interface DeactivateReactivateModalProps {
    open: boolean;
    mode: 'deactivate' | 'reactivate';
    loading?: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void> | void;
}

const MIN_REASON = 20;
const MAX_REASON = 500;

function ModalCopy({ mode }: { mode: 'deactivate' | 'reactivate' }) {
    if (mode === 'deactivate') {
        return {
            title: 'Deactivate foreign identity',
            body: 'This will keep the record in the registry but mark it inactive. Registration flows that depend on this FIN will treat it as unavailable until it is reactivated.',
            button: 'Confirm Deactivation',
        };
    }

    return {
        title: 'Reactivate foreign identity',
        body: 'This restores the record to active use and makes the FIN valid again for downstream registration and lookup flows.',
        button: 'Confirm Reactivation',
    };
}

function ReasonCounter({ length }: { length: number }) {
    return (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
            {length}/{MAX_REASON}
        </div>
    );
}

export function DeactivateReactivateModal({
    open,
    mode,
    loading,
    onClose,
    onConfirm,
}: DeactivateReactivateModalProps) {
    const [reason, setReason] = useState('');
    const content = useMemo(() => ModalCopy({ mode }), [mode]);
    const canSubmit = reason.trim().length >= MIN_REASON;

    useEffect(() => {
        if (!open) setReason('');
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !loading) onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [loading, onClose, open]);

    if (!open) return null;

    return createPortal(
        <div role="dialog" aria-modal="true" style={backdropStyle} onClick={(event) => event.target === event.currentTarget && onClose()}>
            <div className="glass-overlay" style={panelStyle}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: mode === 'deactivate' ? 'var(--error-text)' : 'var(--text-primary)' }}>
                        {content.title}
                    </h2>
                    <p style={descriptionStyle}>{content.body}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
                    <label style={labelStyle}>Reason</label>
                    <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value.slice(0, MAX_REASON))}
                        rows={5}
                        style={textareaStyle}
                    />
                    <ReasonCounter length={reason.length} />
                    {!canSubmit && (
                        <span style={{ fontSize: 11, color: 'var(--warning-text)' }}>
                            Reason must be at least 20 characters.
                        </span>
                    )}
                </div>

                <div style={actionsStyle}>
                    <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant={mode === 'deactivate' ? 'danger' : 'primary'}
                        loading={loading}
                        disabled={!canSubmit}
                        onClick={() => onConfirm(reason.trim())}
                    >
                        {content.button}
                    </Button>
                </div>
            </div>
        </div>,
        document.body,
    );
}

const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    background: 'rgba(0, 0, 0, 0.72)',
    backdropFilter: 'blur(4px)',
};

const panelStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 520,
    padding: '24px 26px',
    borderRadius: 'var(--radius-xl)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.60)',
};

const descriptionStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-muted)',
    lineHeight: 1.7,
};

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
};

const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 120,
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-panel-border)',
    background: 'rgba(255, 255, 255, 0.90)',
    color: 'var(--text-primary)',
    padding: '10px 12px',
    fontSize: 13,
    fontFamily: 'var(--font-sans)',
    resize: 'vertical',
};

const actionsStyle: React.CSSProperties = {
    marginTop: 18,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
};
