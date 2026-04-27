'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui';

interface SensitiveValueRevealModalProps {
    open: boolean;
    loading?: boolean;
    error?: string | null;
    value: string | null;
    resetKey?: string | number | null;
    title: string;
    submitLabel: string;
    warningText: string;
    doneText: string;
    placeholderText?: string;
    countdownSeconds?: number;
    minReason?: number;
    maxReason?: number;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void> | void;
}

export function SensitiveValueRevealModal({
    open,
    loading,
    error,
    value,
    resetKey,
    title,
    submitLabel,
    warningText,
    doneText,
    placeholderText = '[hidden — modal will close]',
    countdownSeconds = 20,
    minReason = 20,
    maxReason = 500,
    onClose,
    onSubmit,
}: SensitiveValueRevealModalProps) {
    if (!open) return null;

    return createPortal(
        <SensitiveValueRevealModalContent
            key={resetKey ?? 'sensitive-reveal'}
            loading={loading}
            error={error}
            value={value}
            title={title}
            submitLabel={submitLabel}
            warningText={warningText}
            doneText={doneText}
            placeholderText={placeholderText}
            countdownSeconds={countdownSeconds}
            minReason={minReason}
            maxReason={maxReason}
            onClose={onClose}
            onSubmit={onSubmit}
        />,
        document.body,
    );
}

function SensitiveValueRevealModalContent({
    loading,
    error,
    value,
    title,
    submitLabel,
    warningText,
    doneText,
    placeholderText,
    countdownSeconds,
    minReason,
    maxReason,
    onClose,
    onSubmit,
}: Omit<SensitiveValueRevealModalProps, 'open' | 'resetKey'>) {
    const requiredMinReason = minReason ?? 20;
    const allowedMaxReason = maxReason ?? 500;
    const [reason, setReason] = useState('');
    const [countdown, setCountdown] = useState<number>(countdownSeconds ?? 20);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!value) return;
        const intervalId = window.setInterval(() => {
            setCountdown((current) => {
                if (current <= 1) {
                    setIsExpired(true);
                    window.setTimeout(onClose, 300);
                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => window.clearInterval(intervalId);
    }, [onClose, value]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            style={backdropStyle}
            onClick={(event) => event.target === event.currentTarget && onClose()}
        >
            <div className="glass-overlay" style={panelStyle}>
                <h2 style={titleStyle}>{title}</h2>

                {value ? (
                    <>
                        <div style={warningStyle}>{doneText}</div>
                        <div style={valueBoxStyle}>{isExpired ? placeholderText : value}</div>
                        <div style={resultFooterStyle}>
                            <span style={metaTextStyle}>Closing in {countdown}s</span>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    disabled={isExpired}
                                    onClick={() => !isExpired && navigator.clipboard.writeText(value)}
                                >
                                    Copy
                                </Button>
                                <Button type="button" size="sm" variant="primary" onClick={onClose}>
                                    Done
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div style={warningStyle}>{warningText}</div>
                        <label style={labelStyle}>Reason</label>
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value.slice(0, allowedMaxReason))}
                            rows={5}
                            style={textareaStyle}
                        />
                        <div style={reasonMetaStyle}>
                            <span style={metaTextStyle}>Minimum {requiredMinReason} characters.</span>
                            <span style={metaTextStyle}>{reason.length}/{allowedMaxReason}</span>
                        </div>
                        {error && <div style={errorTextStyle}>{error}</div>}
                        <div style={actionsStyle}>
                            <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="danger"
                                loading={loading}
                                disabled={reason.trim().length < requiredMinReason}
                                onClick={() => onSubmit(reason.trim())}
                            >
                                {submitLabel}
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
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
    maxWidth: 540,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '24px 26px',
    borderRadius: 'var(--radius-xl)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.60)',
};

const titleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
};

const warningStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--warning-border)',
    background: 'var(--warning-glass)',
    color: 'var(--warning-text)',
    padding: '10px 12px',
    fontSize: 12,
    lineHeight: 1.6,
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

const reasonMetaStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
};

const metaTextStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-muted)',
};

const errorTextStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--error-text)',
};

const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
};

const valueBoxStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-overlay-border)',
    background: 'var(--glass-interactive)',
    color: 'var(--text-primary)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 18,
    padding: '16px 18px',
    letterSpacing: '0.08em',
    wordBreak: 'break-all',
};

const resultFooterStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
};
