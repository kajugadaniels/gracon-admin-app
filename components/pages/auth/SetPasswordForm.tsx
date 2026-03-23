'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { validateInviteApi } from '@/api/auth/validate-invite.api';
import { setPasswordApi } from '@/api/auth/set-password.api';

const schema = z
    .object({
        password: z
            .string()
            .min(8, 'Minimum 8 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])/,
                'Must include uppercase, lowercase, digit, and special character',
            ),
        confirm: z.string(),
    })
    .refine((d) => d.password === d.confirm, {
        message: 'Passwords do not match',
        path: ['confirm'],
    });

type FormFields = z.infer<typeof schema>;
type PageState = 'validating' | 'valid' | 'invalid' | 'success';

export function SetPasswordForm() {
    const params = useSearchParams();
    const adminId = params.get('adminId') ?? '';
    const token = params.get('token') ?? '';

    const [state, setState] = useState<PageState>('validating');
    const [adminName, setAdminName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({ resolver: zodResolver(schema), mode: 'onChange' });

    useEffect(() => {
        if (!adminId || !token) {
            setState('invalid');
            setErrorMsg('Invalid invite link.');
            return;
        }

        validateInviteApi(adminId, token)
            .then((res) => {
                if (res.data.valid) {
                    setState('valid');
                    setAdminName(res.data.adminName ?? '');
                } else {
                    setState('invalid');
                    setErrorMsg(res.data.message);
                }
            })
            .catch(() => {
                setState('invalid');
                setErrorMsg('Unable to validate invite link. Please request a new one.');
            });
    }, [adminId, token]);

    const onSubmit = async (values: FormFields) => {
        setLoading(true);
        try {
            await setPasswordApi({ adminId, token, password: values.password });
            setState('success');
            toast.success('Password set. You can now log in.');
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Failed to set password.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Validating ────────────────────────────────────────────────

    if (state === 'validating') {
        return (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Validating invite link…
            </div>
        );
    }

    // ── Invalid ───────────────────────────────────────────────────

    if (state === 'invalid') {
        return (
            <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
                <div
                    style={{
                        background: 'var(--error-muted)',
                        border: '1px solid var(--error-border)',
                        borderRadius: 'var(--radius)',
                        padding: '24px',
                        marginBottom: 16,
                    }}
                >
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--error)', marginBottom: 8 }}>
                        Invalid invite link
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {errorMsg}
                    </div>
                </div>
                <a href="/login" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
                    Back to login
                </a>
            </div>
        );
    }

    // ── Success ───────────────────────────────────────────────────

    if (state === 'success') {
        return (
            <div style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
                <div
                    style={{
                        background: 'var(--success-muted)',
                        border: '1px solid var(--success-border)',
                        borderRadius: 'var(--radius)',
                        padding: '24px',
                        marginBottom: 16,
                    }}
                >
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--success)', marginBottom: 8 }}>
                        Account activated
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        Your password has been set. All admin actions are logged and audited.
                    </div>
                </div>
                <a href="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                    Sign in now
                </a>
            </div>
        );
    }

    // ── Valid — show form ─────────────────────────────────────────

    return (
        <div style={{ width: '100%', maxWidth: 380 }}>
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                    Set your password
                </div>
                {adminName && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Welcome, {adminName}. Choose a strong password for your admin account.
                    </div>
                )}
            </div>

            <div
                style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    padding: '24px',
                }}
            >
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                            New password
                        </label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Min 8 chars, uppercase, digit, special"
                            className="input"
                            {...register('password')}
                        />
                        {errors.password && (
                            <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                            Confirm password
                        </label>
                        <input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            className="input"
                            {...register('confirm')}
                        />
                        {errors.confirm && (
                            <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>
                                {errors.confirm.message}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 4 }}
                    >
                        {loading ? 'Setting password…' : 'Set password and activate account'}
                    </button>
                </form>
            </div>

            <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.5 }}>
                This link is single-use and expires after 48 hours.
            </p>
        </div>
    );
}