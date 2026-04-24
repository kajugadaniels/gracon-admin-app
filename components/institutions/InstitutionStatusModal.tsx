'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import {
    actionsStyleShared,
    backdropStyleShared,
    counterStyleShared,
    descriptionStyleShared,
    labelStyleShared,
    panelStyleShared,
    textareaStyleShared,
    titleStyleShared,
} from './modalStyles';

interface InstitutionStatusModalProps {
    open: boolean;
    mode: 'deactivate' | 'reactivate';
    loading: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const MIN_REASON = 20;

export function InstitutionStatusModal({
    open,
    mode,
    loading,
    onClose,
    onConfirm,
}: InstitutionStatusModalProps) {
    const [reason, setReason] = useState('');
    const canSubmit = useMemo(() => reason.trim().length >= MIN_REASON, [reason]);
    const isDeactivate = mode === 'deactivate';

    React.useEffect(() => {
        if (open) setReason('');
    }, [open]);

    if (!open) return null;

    return (
        <div style={backdropStyleShared} onClick={onClose} role="dialog" aria-modal="true">
            <div style={panelStyleShared} onClick={(event) => event.stopPropagation()}>
                <h3 style={{ ...titleStyleShared, color: isDeactivate ? 'var(--error-text)' : 'var(--text-primary)' }}>
                    {isDeactivate ? 'Deactivate Institution' : 'Reactivate Institution'}
                </h3>
                <p style={descriptionStyleShared}>
                    {isDeactivate
                        ? 'Deactivating an institution suspends operational trust actions until it is reactivated.'
                        : 'Reactivating restores institutional operations and visibility in the active registry.'}
                </p>
                <label htmlFor="institution-status-reason" style={labelStyleShared}>Reason</label>
                <textarea
                    id="institution-status-reason"
                    rows={5}
                    maxLength={500}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    style={textareaStyleShared}
                />
                <div style={counterStyleShared}>{reason.trim().length}/{MIN_REASON} minimum</div>
                <div style={actionsStyleShared}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="button" variant={isDeactivate ? 'danger' : 'primary'} loading={loading} disabled={!canSubmit} onClick={() => onConfirm(reason.trim())}>
                        {isDeactivate ? 'Confirm Deactivation' : 'Confirm Reactivation'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
