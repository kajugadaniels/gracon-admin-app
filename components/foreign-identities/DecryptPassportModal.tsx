'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui';
import type { DecryptedPassportResponse } from '@/api/foreign-identity/foreign-identity.types';

interface DecryptPassportModalProps {
    open: boolean;
    loading?: boolean;
    error?: string | null;
    result: DecryptedPassportResponse | null;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void> | void;
}

const MIN_REASON = 20;
const MAX_REASON = 500;
const COUNTDOWN_SECONDS = 30;

function WarningBanner() {
    return (
        <div style={warningStyle}>
            Passport decryption is logged and rate-limited. Use only for documented legitimate reasons.
        </div>
    );
}

function ResultView({
    countdown,
    passportNumber,
    onClose,
}: {
    countdown: number;
    passportNumber: string | null;
    onClose: () => void;
}) {
    return (
        <>
            <div style={warningStyle}>This value will not be displayed again. Copy it now if needed.</div>
            <div style={passportBoxStyle}>
                {passportNumber ?? '[hidden — modal will close]'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Closing in {countdown}s
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={!passportNumber}
                        onClick={() => passportNumber && navigator.clipboard.writeText(passportNumber)}
                    >
                        Copy
                    </Button>
                    <Button type="button" size="sm" variant="primary" onClick={onClose}>
                        Done
                    </Button>
                </div>
            </div>
        </>
    );
}

export function DecryptPassportModal({
    open,
    loading,
    error,
    result,
    onClose,
    onSubmit,
}: DecryptPassportModalProps) {
    if (!open) return null;

    return createPortal(
        <DecryptPassportModalContent
            key={result?.decryptedAt ?? 'decrypt-form'}
            loading={loading}
            error={error}
            result={result}
            onClose={onClose}
            onSubmit={onSubmit}
        />,
        document.body,
    );
}

function DecryptPassportModalContent({
    loading,
    error,
    result,
    onClose,
    onSubmit,
}: Omit<DecryptPassportModalProps, 'open'>) {
    const [reason, setReason] = useState('');
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!result) return;
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
    }, [onClose, result]);

    return (
        <div role="dialog" aria-modal="true" style={backdropStyle} onClick={(event) => event.target === event.currentTarget && onClose()}>
            <div className="glass-overlay" style={panelStyle}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Request decrypted passport view
                </h2>

                {result ? (
                    <ResultView
                        countdown={countdown}
                        passportNumber={isExpired ? null : result.passportNumber}
                        onClose={onClose}
                    />
                ) : (
                    <>
                        <WarningBanner />
                        <label style={labelStyle}>Reason</label>
                        <textarea
                            value={reason}
                            onChange={(event) => setReason(event.target.value.slice(0, MAX_REASON))}
                            rows={5}
                            style={textareaStyle}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                Minimum 20 characters.
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {reason.length}/{MAX_REASON}
                            </span>
                        </div>
                        {error && (
                            <div style={{ fontSize: 12, color: 'var(--error-text)' }}>
                                {error}
                            </div>
                        )}
                        <div style={actionsStyle}>
                            <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={loading}>
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="danger"
                                loading={loading}
                                disabled={reason.trim().length < MIN_REASON}
                                onClick={() => onSubmit(reason.trim())}
                            >
                                Decrypt Passport
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

const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
};

const passportBoxStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-overlay-border)',
    background: 'var(--glass-interactive)',
    color: 'var(--text-primary)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 18,
    padding: '16px 18px',
    letterSpacing: '0.08em',
};
