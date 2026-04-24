// InstitutionRegistrationForm handles the institution registration workflow.
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Input, Select } from '@/components/ui';
import { CountryDropdown } from '@/components/foreign-identities/CountryDropdown';
import { createInstitution, uploadInstitutionLogo } from '@/api/institutions/institutions.api';
import type {
    InstitutionType,
    RegisterInstitutionInput,
} from '@/api/institutions/institutions.types';
import { getFriendlyErrorMessage } from '@/lib/http';
import { LogoUpload } from './LogoUpload';

const INSTITUTION_TYPES: InstitutionType[] = [
    'COMPANY',
    'NGO',
    'GOVERNMENT',
    'OTHER',
];

/**
 * Institution registration form for SUPER_ADMIN operators.
 */
export function InstitutionRegistrationForm() {
    const router = useRouter();
    const [form, setForm] = useState<RegisterInstitutionInput>({
        name: '',
        type: 'COMPANY',
        country: 'RW',
        registrationNumber: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        taxIdentificationNumber: '',
        dateOfIncorporation: '',
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const canSubmit = useMemo(() => {
        return Boolean(
            form.name.trim() &&
            form.type &&
            form.country &&
            form.registrationNumber.trim(),
        );
    }, [form]);

    const updateField = <T extends keyof RegisterInstitutionInput>(
        field: T,
        value: RegisterInstitutionInput[T],
    ) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSubmit) {
            toast.error('Name, type, country, and registration number are required.');
            return;
        }

        setLoading(true);
        try {
            const response = await createInstitution(form);
            if (logoFile) {
                await uploadInstitutionLogo(response.data.institutionId, logoFile);
            }
            toast.success('Institution registered successfully.');
            router.push(`/admin/institutions/${response.data.institutionId}`);
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, 'Failed to register institution.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="glass-card" style={formStyle} onSubmit={handleSubmit}>
            <div style={gridStyle}>
                <Input label="Institution Name" value={form.name} onChange={(event) => updateField('name', event.target.value)} />
                <Select
                    label="Type"
                    value={form.type}
                    onChange={(event) => updateField('type', event.target.value as InstitutionType)}
                    options={INSTITUTION_TYPES.map((type) => ({ value: type, label: type }))}
                />
                <CountryDropdown label="Country" value={form.country} onChange={(value) => updateField('country', value)} />
                <Input label="Registration Number" value={form.registrationNumber} onChange={(event) => updateField('registrationNumber', event.target.value)} />
                <Input label="Address" value={form.address ?? ''} onChange={(event) => updateField('address', event.target.value)} />
                <Input label="Phone" value={form.phone ?? ''} onChange={(event) => updateField('phone', event.target.value)} />
                <Input label="Email" value={form.email ?? ''} onChange={(event) => updateField('email', event.target.value)} />
                <Input label="Website" value={form.website ?? ''} onChange={(event) => updateField('website', event.target.value)} />
                <Input label="Tax Identification Number" value={form.taxIdentificationNumber ?? ''} onChange={(event) => updateField('taxIdentificationNumber', event.target.value)} />
                <Input label="Date of Incorporation" type="date" value={form.dateOfIncorporation ?? ''} onChange={(event) => updateField('dateOfIncorporation', event.target.value)} />
            </div>

            <LogoUpload label="Institution Logo" onFileChange={setLogoFile} />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="primary" loading={loading} disabled={!canSubmit}>
                    Register Institution
                </Button>
            </div>
        </form>
    );
}

const formStyle: React.CSSProperties = {
    padding: 20,
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 16,
};
