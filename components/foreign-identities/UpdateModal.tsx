'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button, Input, Select } from '@/components/ui';
import type {
    ForeignIdentityProfile,
    MaritalStatus,
    UpdateForeignIdentityInput,
} from '@/api/foreign-identity/foreign-identity.types';

interface UpdateModalProps {
    open: boolean;
    profile: ForeignIdentityProfile;
    loading?: boolean;
    onClose: () => void;
    onSave: (data: UpdateForeignIdentityInput) => Promise<void> | void;
}

const maritalOptions = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED', label: 'Married' },
    { value: 'DIVORCED', label: 'Divorced' },
    { value: 'WIDOWED', label: 'Widowed' },
];

export function UpdateModal({
    open,
    profile,
    loading,
    onClose,
    onSave,
}: UpdateModalProps) {
    if (!open) return null;

    return createPortal(
        <UpdateModalContent
            key={`${profile.fin}-${open ? 'open' : 'closed'}`}
            profile={profile}
            loading={loading}
            onClose={onClose}
            onSave={onSave}
        />,
        document.body,
    );
}

function UpdateModalContent({
    profile,
    loading,
    onClose,
    onSave,
}: Omit<UpdateModalProps, 'open'>) {
    const [firstName, setFirstName] = useState(profile.firstName);
    const [lastName, setLastName] = useState(profile.lastName);
    const [nationality, setNationality] = useState(profile.nationality);
    const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(profile.maritalStatus);
    const [reason, setReason] = useState('');

    return (
        <div role="dialog" aria-modal="true" style={backdropStyle} onClick={(event) => event.target === event.currentTarget && onClose()}>
            <div className="glass-overlay" style={panelStyle}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                    Update profile
                </h2>
                <div style={profile.issuanceVersion === 9 ? criticalWarningStyle : warningStyle}>
                    {profile.issuanceVersion === 9
                        ? 'Maximum updates reached. Further changes require deactivation and re-registration.'
                        : 'Updating will regenerate the FIN (position 14 + checksum). The new FIN will be displayed after saving.'}
                </div>
                <div style={formGridStyle}>
                    <Input label="First Name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
                    <Input label="Last Name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
                    <Input label="Nationality" value={nationality} onChange={(event) => setNationality(event.target.value)} />
                    <Select
                        label="Marital Status"
                        value={maritalStatus}
                        onChange={(event) => setMaritalStatus(event.target.value as MaritalStatus)}
                        options={maritalOptions}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={labelStyle}>Reason for audit log</label>
                    <textarea
                        value={reason}
                        onChange={(event) => setReason(event.target.value.slice(0, 500))}
                        rows={4}
                        style={textareaStyle}
                    />
                </div>
                <div style={actionsStyle}>
                    <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        loading={loading}
                        disabled={profile.issuanceVersion === 9}
                        onClick={() => onSave({
                            firstName: firstName.trim(),
                            lastName: lastName.trim(),
                            nationality: nationality.trim(),
                            maritalStatus,
                            reason: reason.trim() || undefined,
                        })}
                    >
                        Save Changes
                    </Button>
                </div>
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
    maxWidth: 560,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: '24px 26px',
    borderRadius: 'var(--radius-xl)',
    boxShadow: '0 32px 80px rgba(0,0,0,0.60)',
};

const warningStyle: React.CSSProperties = {
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--primary-border)',
    background: 'var(--primary-glass)',
    color: 'var(--primary-text)',
    padding: '10px 12px',
    fontSize: 12,
    lineHeight: 1.6,
};

const criticalWarningStyle: React.CSSProperties = {
    ...warningStyle,
    border: '1px solid var(--error-border)',
    background: 'var(--error-glass)',
    color: 'var(--error-text)',
};

const formGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 12,
};

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
};

const textareaStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 110,
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
