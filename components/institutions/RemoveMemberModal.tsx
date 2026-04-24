'use client';

import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import type { InstitutionMemberItem } from '@/api/institutions/institutions.types';
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

interface RemoveMemberModalProps {
    open: boolean;
    member: InstitutionMemberItem | null;
    loading: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
}

const MIN_REASON = 20;

export function RemoveMemberModal({
    open,
    member,
    loading,
    onClose,
    onConfirm,
}: RemoveMemberModalProps) {
    const [reason, setReason] = useState('');
    const canSubmit = useMemo(() => reason.trim().length >= MIN_REASON, [reason]);

    React.useEffect(() => {
        setReason('');
    }, [member]);

    if (!open || !member) return null;

    return (
        <div style={backdropStyleShared} onClick={onClose} role="dialog" aria-modal="true">
            <div style={panelStyleShared} onClick={(event) => event.stopPropagation()}>
                <h3 style={{ ...titleStyleShared, color: 'var(--error-text)' }}>Remove Member</h3>
                <p style={descriptionStyleShared}>Remove {member.userName} from the institution roster.</p>
                <label htmlFor="remove-member-reason" style={labelStyleShared}>Reason</label>
                <textarea
                    id="remove-member-reason"
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
                        Remove Member
                    </Button>
                </div>
            </div>
        </div>
    );
}
