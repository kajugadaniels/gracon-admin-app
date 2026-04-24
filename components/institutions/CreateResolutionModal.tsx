'use client';

import React, { useMemo, useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import type { InstitutionMemberItem } from '@/api/institutions/institutions.types';
import {
    actionsStyleShared,
    backdropStyleShared,
    labelStyleShared,
    panelStyleShared,
    textareaStyleShared,
    titleStyleShared,
} from './modalStyles';

interface CreateResolutionModalProps {
    open: boolean;
    members: InstitutionMemberItem[];
    loading: boolean;
    onClose: () => void;
    onConfirm: (payload: {
        title: string;
        grantedToUserId: string;
        authorityScope: string;
        validFrom: string;
        validTo?: string;
    }) => void;
}

export function CreateResolutionModal({
    open,
    members,
    loading,
    onClose,
    onConfirm,
}: CreateResolutionModalProps) {
    const [title, setTitle] = useState('');
    const [grantedToUserId, setGrantedToUserId] = useState('');
    const [authorityScope, setAuthorityScope] = useState('');
    const [validFrom, setValidFrom] = useState('');
    const [validTo, setValidTo] = useState('');

    const canSubmit = useMemo(() => {
        return Boolean(title.trim() && grantedToUserId && authorityScope.trim() && validFrom);
    }, [authorityScope, grantedToUserId, title, validFrom]);

    React.useEffect(() => {
        if (!open) return;
        setTitle('');
        setGrantedToUserId('');
        setAuthorityScope('');
        setValidFrom('');
        setValidTo('');
    }, [open]);

    if (!open) return null;

    return (
        <div style={backdropStyleShared} onClick={onClose} role="dialog" aria-modal="true">
            <div style={panelStyleShared} onClick={(event) => event.stopPropagation()}>
                <h3 style={titleStyleShared}>Create Resolution</h3>
                <Input label="Resolution Title" value={title} onChange={(event) => setTitle(event.target.value)} />
                <Select
                    label="Granted To"
                    value={grantedToUserId}
                    onChange={(event) => setGrantedToUserId(event.target.value)}
                    options={members.map((member) => ({ value: member.userId, label: `${member.userName} (${member.role})` }))}
                    placeholder="Select member"
                />
                <label htmlFor="resolution-scope" style={labelStyleShared}>Authority Scope</label>
                <textarea
                    id="resolution-scope"
                    rows={4}
                    maxLength={500}
                    value={authorityScope}
                    onChange={(event) => setAuthorityScope(event.target.value)}
                    style={textareaStyleShared}
                />
                <div style={dateGridStyle}>
                    <Input label="Valid From" type="date" value={validFrom} onChange={(event) => setValidFrom(event.target.value)} />
                    <Input label="Valid To" type="date" value={validTo} onChange={(event) => setValidTo(event.target.value)} />
                </div>
                <div style={actionsStyleShared}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button
                        type="button"
                        variant="primary"
                        loading={loading}
                        disabled={!canSubmit}
                        onClick={() => onConfirm({
                            title: title.trim(),
                            grantedToUserId,
                            authorityScope: authorityScope.trim(),
                            validFrom,
                            validTo: validTo || undefined,
                        })}
                    >
                        Create Resolution
                    </Button>
                </div>
            </div>
        </div>
    );
}

const dateGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
};
