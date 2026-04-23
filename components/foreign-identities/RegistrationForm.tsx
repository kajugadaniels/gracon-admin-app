'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button, Input, Select } from '@/components/ui';
import {
    lookupForeignIdentity,
    registerForeignIdentity,
    uploadImage,
} from '@/api/foreign-identity/foreign-identity.api';
import type {
    ForeignGender,
    MaritalStatus,
    RegisterForeignIdentityInput,
} from '@/api/foreign-identity/foreign-identity.types';
import { CountryDropdown } from './CountryDropdown';
import { ProfileImageUpload } from './ProfileImageUpload';

const formSchema = z.object({
    firstName: z.string().trim().min(2, 'First name must be at least 2 characters.').max(100),
    lastName: z.string().trim().min(2, 'Last name must be at least 2 characters.').max(100),
    passportNumber: z.string().min(5, 'Passport number must be at least 5 characters.').max(30),
    gender: z.enum(['MALE', 'FEMALE']),
    dateOfBirth: z.string().refine((value) => Boolean(value), 'Date of birth is required.'),
    countryOfOrigin: z.string().length(2, 'Country of origin is required.'),
    nationality: z.string().trim().min(2, 'Nationality must be at least 2 characters.').max(100),
    maritalStatus: z.enum(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),
});

type FormValues = z.infer<typeof formSchema>;

const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
];

const maritalOptions = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED', label: 'Married' },
    { value: 'DIVORCED', label: 'Divorced' },
    { value: 'WIDOWED', label: 'Widowed' },
];

function buildPayload(values: FormValues): RegisterForeignIdentityInput {
    return {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        passportNumber: values.passportNumber,
        gender: values.gender as ForeignGender,
        dateOfBirth: values.dateOfBirth,
        countryOfOrigin: values.countryOfOrigin,
        nationality: values.nationality.trim(),
        maritalStatus: values.maritalStatus as MaritalStatus,
    };
}

function FormLabel({ children }: { children: React.ReactNode }) {
    return (
        <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
            {children}
        </label>
    );
}

function InlineLink({ fin, onNavigate }: { fin: string; onNavigate: (fin: string) => void }) {
    return (
        <button
            type="button"
            onClick={() => onNavigate(fin)}
            style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: 'none',
                color: 'var(--primary-text)',
                fontSize: 12,
                cursor: 'pointer',
                textDecoration: 'underline',
            }}
        >
            Look up existing record
        </button>
    );
}

export function RegistrationForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [existingFin, setExistingFin] = useState<string | null>(null);
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const {
        control,
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            gender: 'MALE',
            maritalStatus: 'SINGLE',
            countryOfOrigin: '',
        },
    });

    const handleImageChange = (file: File | null) => {
        setExistingFin(null);
        if (!file) return setImageFile(null);
        const allowed = ['image/jpeg', 'image/png'];
        if (!allowed.includes(file.type) || file.size > 5 * 1024 * 1024) {
            toast.error('Image must be a JPG or PNG smaller than 5MB.');
            return;
        }
        setImageFile(file);
    };

    const navigateToFin = (fin: string) => router.push(`/admin/foreign-identities/${fin}`);

    const onSubmit = async (values: FormValues) => {
        setLoading(true);
        setExistingFin(null);

        try {
            const registered = await registerForeignIdentity(buildPayload(values));
            if (imageFile) await uploadImage(registered.data.fin, imageFile);
            toast.success(`Foreign identity registered. FIN: ${registered.data.fin}`);
            navigateToFin(registered.data.fin);
        } catch (error: unknown) {
            const message = extractErrorMessage(error);
            if (extractStatus(error) === 409) {
                toast.error('A foreign identity with this passport number is already registered.');
                const lookup = await resolveExistingFin(values.passportNumber);
                setExistingFin(lookup);
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="glass-card" style={formCardStyle} onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={formGridStyle}>
                <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
                <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
                <Input
                    label="Passport Number"
                    error={errors.passportNumber?.message}
                    {...register('passportNumber')}
                    style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', textTransform: 'uppercase' }}
                />
                {existingFin && <InlineLink fin={existingFin} onNavigate={navigateToFin} />}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <FormLabel>Gender</FormLabel>
                    <Controller
                        control={control}
                        name="gender"
                        render={({ field }) => (
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                {genderOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => field.onChange(option.value)}
                                        style={radioStyle(field.value === option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    />
                </div>
                <Input
                    label="Date of Birth"
                    type="date"
                    error={errors.dateOfBirth?.message}
                    max={today}
                    min="1900-01-01"
                    {...register('dateOfBirth')}
                />
                <Controller
                    control={control}
                    name="countryOfOrigin"
                    render={({ field }) => (
                        <CountryDropdown
                            label="Country of Origin"
                            value={field.value}
                            onChange={field.onChange}
                            error={errors.countryOfOrigin?.message}
                        />
                    )}
                />
                <Input label="Nationality" error={errors.nationality?.message} {...register('nationality')} />
                <Controller
                    control={control}
                    name="maritalStatus"
                    render={({ field }) => (
                        <Select
                            label="Marital Status"
                            value={field.value}
                            onChange={field.onChange}
                            options={maritalOptions}
                            error={errors.maritalStatus?.message}
                        />
                    )}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <FormLabel>Optional profile image</FormLabel>
                <ProfileImageUpload file={imageFile} onFileChange={handleImageChange} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="primary" loading={loading}>
                    Register Foreign Identity
                </Button>
            </div>
        </form>
    );
}

function extractStatus(error: unknown): number | null {
    if (typeof error !== 'object' || !error) return null;
    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) return null;
    const status = Reflect.get(response, 'status');
    return typeof status === 'number' ? status : null;
}

function extractErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || !error) return 'Failed to register foreign identity.';
    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) return 'Failed to register foreign identity.';
    const data = Reflect.get(response, 'data');
    if (typeof data !== 'object' || !data) return 'Failed to register foreign identity.';
    const message = Reflect.get(data, 'message');
    return typeof message === 'string' ? message : 'Failed to register foreign identity.';
}

async function resolveExistingFin(passportNumber: string) {
    try {
        const lookup = await lookupForeignIdentity(passportNumber);
        return lookup.data.fin;
    } catch {
        return null;
    }
}

const formCardStyle: React.CSSProperties = {
    padding: '24px 26px',
    borderRadius: 'var(--radius-xl)',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
};

const formGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
};

const radioStyle = (active: boolean): React.CSSProperties => ({
    minHeight: 38,
    padding: '0 14px',
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${active ? 'var(--primary-border)' : 'var(--glass-panel-border)'}`,
    background: active ? 'var(--primary-glass)' : 'rgba(255, 255, 255, 0.90)',
    color: active ? 'var(--primary-text)' : 'var(--text-primary)',
    cursor: 'pointer',
});
