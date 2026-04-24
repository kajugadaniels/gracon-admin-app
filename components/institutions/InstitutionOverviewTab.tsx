// InstitutionOverviewTab shows the profile, key, certificate, and stamp summary.
'use client';

import React from 'react';
import { Badge, Button } from '@/components/ui';
import type { InstitutionDetail } from '@/api/institutions/institutions.types';
import { LogoUpload } from './LogoUpload';
import { StampImageUpload } from './StampImageUpload';

interface InstitutionOverviewTabProps {
    institution: InstitutionDetail;
    canManage: boolean;
    onLogoChange: (file: File | null) => void;
    onStampImageChange: (file: File | null) => void;
    onLogoRemove: () => void;
    onStampImageRemove: () => void;
    onStatusToggle: () => void;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {label}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value}</span>
        </div>
    );
}

/**
 * Overview tab content for one institution.
 */
export function InstitutionOverviewTab({
    institution,
    canManage,
    onLogoChange,
    onStampImageChange,
    onLogoRemove,
    onStampImageRemove,
    onStatusToggle,
}: InstitutionOverviewTabProps) {
    return (
        <div style={layoutStyle}>
            <section className="glass-card" style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                        <h3 style={{ fontSize: 20, fontWeight: 700 }}>{institution.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{institution.registrationNumber}</p>
                    </div>
                    <Badge variant={institution.status === 'ACTIVE' ? 'active' : 'neutral'}>
                        {institution.status}
                    </Badge>
                </div>
                <div style={gridStyle}>
                    <Field label="Type" value={institution.type} />
                    <Field label="Country" value={institution.country} />
                    <Field label="Address" value={institution.address ?? '—'} />
                    <Field label="Phone" value={institution.phone ?? '—'} />
                    <Field label="Email" value={institution.email ?? '—'} />
                    <Field label="Website" value={institution.website ?? '—'} />
                </div>
                {canManage && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="button" variant={institution.status === 'ACTIVE' ? 'danger' : 'primary'} onClick={onStatusToggle}>
                            {institution.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                        </Button>
                    </div>
                )}
            </section>

            <section className="glass-card" style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Key Material</h3>
                <div style={gridStyle}>
                    <Field label="Algorithm" value={institution.keyAlgorithm ?? '—'} />
                    <Field label="Created At" value={institution.keyCreatedAt ?? '—'} />
                    <Field label="Public Key Fingerprint" value={institution.publicKeyFingerprint ?? '—'} />
                </div>
            </section>

            <section className="glass-card" style={sectionStyle}>
                <h3 style={sectionTitleStyle}>Certificate</h3>
                <div style={gridStyle}>
                    <Field label="Serial" value={institution.certificateSerialNumber ?? '—'} />
                    <Field label="Subject" value={institution.certificateSubject ?? '—'} />
                    <Field label="Valid From" value={institution.certificateNotBefore ?? '—'} />
                    <Field label="Valid To" value={institution.certificateNotAfter ?? '—'} />
                </div>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div className="glass-card" style={sectionStyle}>
                    <LogoUpload
                        label="Institution Logo"
                        currentUrl={institution.logoUrl}
                        onFileChange={onLogoChange}
                        onRemove={canManage && institution.logoUrl ? onLogoRemove : undefined}
                    />
                </div>
                <div className="glass-card" style={sectionStyle}>
                    <StampImageUpload
                        currentUrl={institution.stampImageUrl}
                        onFileChange={onStampImageChange}
                        onRemove={canManage && institution.stampImageUrl ? onStampImageRemove : undefined}
                    />
                </div>
            </section>
        </div>
    );
}

const layoutStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
};

const sectionStyle: React.CSSProperties = {
    padding: 20,
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
};
