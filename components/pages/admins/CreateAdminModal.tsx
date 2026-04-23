// CreateAdminModal — SUPER_ADMIN only form to create a new admin account.
// Collects firstName, lastName, email, and optional phone number.
// On submit the API creates the record and sends an invite email.
// The new admin sets their own password via the invite link.
// Password is never set or seen by the SUPER_ADMIN — by design.
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { createAdminApi, type CreateAdminPayload }
    from '@/api/admins/create-admin.api';

function getApiErrorMessage(error: unknown, fallback: string) {
    if (typeof error !== 'object' || !error) return fallback;
    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) return fallback;
    const data = Reflect.get(response, 'data');
    if (typeof data !== 'object' || !data) return fallback;
    const message = Reflect.get(data, 'message');
    return typeof message === 'string' ? message : fallback;
}

const schema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(64),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(64),
    email: z.string().email('Please enter a valid email address').transform((v) => v.toLowerCase().trim()),
    phoneNumber: z.string()
        .regex(/^\+?[\d\s\-()\\.]{7,20}$/, 'Please enter a valid phone number')
        .optional()
        .or(z.literal('')),
});

type FormFields = z.infer<typeof schema>;

interface CreateAdminModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (admin: {
        adminId: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
        role: string;
        createdAt: string;
    }) => void;
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;
    return (
        <span
            role="alert"
            style={{ fontSize: 11, color: 'var(--error-text)', marginTop: 4, display: 'block' }}
        >
            {message}
        </span>
    );
}

function Label({ htmlFor, children, required }: {
    htmlFor: string;
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label
            htmlFor={htmlFor}
            style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                marginBottom: 5,
            }}
        >
            {children}
            {required && (
                <span style={{ color: 'var(--error-text)', marginLeft: 2 }}>*</span>
            )}
        </label>
    );
}

export function CreateAdminModal({
    open,
    onClose,
    onSuccess,
}: CreateAdminModalProps) {
    const [loading, setLoading] = useState(false);
    const firstInputRef = useRef<HTMLInputElement>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        mode: 'onBlur',
    });

    // Focus first input when modal opens
    useEffect(() => {
        if (open) {
            setTimeout(() => firstInputRef.current?.focus(), 60);
        } else {
            reset();
        }
    }, [open, reset]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open && !loading) onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [open, loading, onClose]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    const onSubmit = async (values: FormFields) => {
        setLoading(true);
        try {
            const payload: CreateAdminPayload = {
                firstName: values.firstName.trim(),
                lastName: values.lastName.trim(),
                email: values.email,
                phoneNumber: values.phoneNumber?.trim() || undefined,
            };

            const res = await createAdminApi(payload);
            toast.success(
                `Admin account created. Invite sent to ${payload.email}.`,
            );
            onSuccess(res.data.data);
            onClose();
        } catch (err: unknown) {
            toast.error(
                getApiErrorMessage(err, 'Failed to create admin account. Please try again.'),
            );
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    const modal = (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-admin-title"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                background: 'rgba(0, 0, 0, 0.72)',
                backdropFilter: 'blur(4px)',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && !loading) onClose();
            }}
        >
            <div
                className="glass-overlay"
                style={{
                    borderRadius: 'var(--radius-xl)',
                    padding: '24px 28px',
                    width: '100%',
                    maxWidth: 480,
                    boxShadow: '0 32px 80px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.14)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                    <h2
                        id="create-admin-title"
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: 4,
                        }}
                    >
                        Create admin account
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        An invite email will be sent to the address below.
                        The admin sets their own password via the link — you
                        never see or choose their password.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
                >
                    {/* Name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                            <Label htmlFor="firstName" required>First name</Label>
                            <input
                                id="firstName"
                                className="input"
                                placeholder="Ishimwe"
                                autoComplete="given-name"
                                {...register('firstName')}
                                ref={(e) => {
                                    register('firstName').ref(e);
                                    firstInputRef.current = e;
                                }}
                            />
                            <FieldError message={errors.firstName?.message} />
                        </div>
                        <div>
                            <Label htmlFor="lastName" required>Last name</Label>
                            <input
                                id="lastName"
                                className="input"
                                placeholder="Patrick"
                                autoComplete="family-name"
                                {...register('lastName')}
                            />
                            <FieldError message={errors.lastName?.message} />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email" required>Email address</Label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="ishimwe.patrick@idverify.rw"
                            autoComplete="email"
                            {...register('email')}
                        />
                        <FieldError message={errors.email?.message} />
                    </div>

                    {/* Phone */}
                    <div>
                        <Label htmlFor="phoneNumber">Phone number</Label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            className="input"
                            placeholder="+250788123456"
                            autoComplete="tel"
                            {...register('phoneNumber')}
                        />
                        <FieldError message={errors.phoneNumber?.message} />
                    </div>

                    {/* Info box */}
                    <div
                        style={{
                            padding: '10px 12px',
                            background: 'var(--primary-glass)',
                            border: '1px solid var(--primary-border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 11,
                            color: 'var(--primary-text)',
                            lineHeight: 1.6,
                        }}
                    >
                        The new admin will receive an invite email with a 48-hour
                        link to set their password and activate their account.
                        They can log in once they complete that step.
                    </div>

                    {/* Actions */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 8,
                            paddingTop: 4,
                        }}
                    >
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            loading={loading}
                        >
                            Create and send invite
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
