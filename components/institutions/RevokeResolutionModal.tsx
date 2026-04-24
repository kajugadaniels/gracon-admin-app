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

interface RevokeResolutionModalProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const MIN_REASON = 20;

export function RevokeResolutionModal({
    open,
    loading,
    onClose,
    onConfirm,
}: RevokeResolutionModalProps) {
    const [reason, setReason] = useState('');
    const canSubmit = useMemo(() => reason.trim().length >= MIN_REASON, [reason]);

    React.useEffect(() => {
        if (open) setReason('');
    }, [open]);

    if (!open) return null;

    return (
        <div style={backdropStyleShared} onClick={onClose} role="dialog" aria-modal="true">
            <div style={panelStyleShared} onClick={(event) => event.stopPropagation()}>
                <h3 style={{ ...titleStyleShared, color: 'var(--error-text)' }}>Revoke Resolution</h3>
                <p style={descriptionStyleShared}>
                    Revoking this resolution removes the institution authority chain for any members still linked to it.
                </p>
                <label htmlFor="revoke-resolution-reason" style={labelStyleShared}>Reason</label>
                <textarea
                    id="revoke-resolution-reason"
                    rows={5}
                    maxLength={500}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    style={textareaStyleShared}
                />
                <div style={counterStyleShared}>{reason.trim().length}/{MIN_REASON} minimum</div>
                <div style={actionsStyleShared}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="button" variant="danger" loading={loading} disabled={!canSubmit} onClick={() => onConfirm(reason.trim())}>
                        Revoke Resolution
                    </Button>
                </div>
            </div>
        </div>
    );
}
