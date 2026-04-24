'use client';

import React, { useMemo, useState } from 'react';
import { Button, Select } from '@/components/ui';
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

interface ChangeRoleModalProps {
    open: boolean;
    member: InstitutionMemberItem | null;
    loading: boolean;
    onClose: () => void;
    onConfirm: (payload: { role: string; reason: string }) => void;
}

const ROLE_OPTIONS = ['Owner', 'Admin', 'Member', 'Signer'];
const MIN_REASON = 20;

export function ChangeRoleModal({
    open,
    member,
    loading,
    onClose,
    onConfirm,
}: ChangeRoleModalProps) {
    const [role, setRole] = useState(member?.role ?? 'Member');
    const [reason, setReason] = useState('');
    const canSubmit = useMemo(() => reason.trim().length >= MIN_REASON, [reason]);

    React.useEffect(() => {
        setRole(member?.role ?? 'Member');
        setReason('');
    }, [member]);

    if (!open || !member) return null;

    return (
        <div style={backdropStyleShared} onClick={onClose} role="dialog" aria-modal="true">
            <div style={panelStyleShared} onClick={(event) => event.stopPropagation()}>
                <h3 style={titleStyleShared}>Change Member Role</h3>
                <p style={descriptionStyleShared}>Update the institutional role for {member.userName}.</p>
                <Select
                    label="Role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    options={ROLE_OPTIONS.map((item) => ({ value: item, label: item }))}
                />
                <label htmlFor="change-role-reason" style={labelStyleShared}>Reason</label>
                <textarea
                    id="change-role-reason"
                    rows={5}
                    maxLength={500}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    style={textareaStyleShared}
                />
                <div style={counterStyleShared}>{reason.trim().length}/{MIN_REASON} minimum</div>
                <div style={actionsStyleShared}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="button" variant="primary" loading={loading} disabled={!canSubmit} onClick={() => onConfirm({ role, reason: reason.trim() })}>
                        Save Role
                    </Button>
                </div>
            </div>
        </div>
    );
}
