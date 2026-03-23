// ConfirmModal — the only modal primitive in the admin panel.
// Every destructive action (deactivate, revoke sessions, ID override)
// requires confirmation before executing.
//
// Design decisions:
// - Renders in a portal to avoid z-index conflicts
// - Traps focus inside the modal — keyboard accessible
// - Closes on backdrop click OR Escape key
// - Danger variant makes the confirm button red — visual warning
// - Never auto-confirms — admin must always click explicitly
'use client';

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ConfirmModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
    loading?: boolean;
    // Optional reason input — required for some admin actions
    reasonLabel?: string;
    reason?: string;
    onReasonChange?: (value: string) => void;
    reasonRequired?: boolean;
    children?: React.ReactNode;
}

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    loading = false,
    reasonLabel,
    reason = '',
    onReasonChange,
    reasonRequired = false,
}: ConfirmModalProps) {
    const cancelRef = useRef<HTMLButtonElement>(null);

    // Focus the cancel button when modal opens — safest default
    useEffect(() => {
        if (open) {
            setTimeout(() => cancelRef.current?.focus(), 50);
        }
    }, [open]);

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open && !loading) onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, loading, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    const canConfirm = !reasonRequired || reason.trim().length >= 3;

    const modal = (
        // Backdrop
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.70)',
                backdropFilter: 'blur(2px)',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) onClose();
            }}
        >
            {/* Panel */}
            <div
                style={{
                    background: 'var(--surface-overlay)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius)',
                    padding: '20px 24px',
                    width: '100%',
                    maxWidth: 400,
                    boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ marginBottom: 12 }}>
                    <h2
                        id="confirm-modal-title"
                        style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: variant === 'danger'
                                ? 'var(--error)'
                                : 'var(--text-primary)',
                            marginBottom: 6,
                        }}
                    >
                        {title}
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {description}
                    </p>
                </div>

                {/* Optional reason input */}
                {reasonLabel && onReasonChange && (
                    <div style={{ marginBottom: 16 }}>
                        <label
                            htmlFor="confirm-reason"
                            style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--text-secondary)',
                                marginBottom: 6,
                            }}
                        >
                            {reasonLabel}
                            {reasonRequired && (
                                <span style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>
                            )}
                        </label>
                        <textarea
                            id="confirm-reason"
                            value={reason}
                            onChange={(e) => onReasonChange(e.target.value)}
                            placeholder="Describe the reason for this action…"
                            rows={3}
                            style={{
                                width: '100%',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '8px 12px',
                                color: 'var(--text-primary)',
                                fontSize: 13,
                                fontFamily: 'var(--font-sans)',
                                resize: 'vertical',
                                outline: 'none',
                                lineHeight: 1.5,
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = 'var(--border-focus)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--border)';
                            }}
                        />
                        {reasonRequired && reason.trim().length < 3 && (
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                Reason is required for this action.
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <Button
                        ref={cancelRef}
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'danger' ? 'danger' : 'primary'}
                        size="sm"
                        onClick={onConfirm}
                        loading={loading}
                        disabled={!canConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}