'use client';

// SetPasswordForm — accepts an admin invite token and sets the initial password.
// States: validating → valid (form) | invalid (error panel) | success.
// Token validated on mount via validateInviteApi before the form is shown.
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

// ── Inline icon ───────────────────────────────────────────────────────────

const LockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

// ── Component ─────────────────────────────────────────────────────────────

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
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? 'Failed to set password.';
            toast.error(message);
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
            <div style={{ width: '100%', maxWidth: 400, padding: '0 16px', textAlign: 'center' }}>
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
            <div style={{ width: '100%', maxWidth: 400, padding: '0 16px', textAlign: 'center' }}>
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
        <div style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 4,
                    letterSpacing: '-0.01em',
                }}>
                    Set your password
                </div>
                {adminName && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Welcome, {adminName}. Choose a strong password for your admin account.
                    </div>
                )}
            </div>

            <div className="auth-panel">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            marginBottom: 6,
                        }}>
                            New password
                        </label>
                        <div className="input-icon-wrap">
                            <span className="input-icon-left">
                                <LockIcon />
                            </span>
                            <input
                                type="password"
                                autoComplete="new-password"
                                placeholder="Min 8 chars, uppercase, digit, special"
                                className={['input', errors.password ? 'input-error' : ''].filter(Boolean).join(' ')}
                                {...register('password')}
                            />
                        </div>
                        {errors.password && (
                            <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>
                                {errors.password.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                            marginBottom: 6,
                        }}>
                            Confirm password
                        </label>
                        <div className="input-icon-wrap">
                            <span className="input-icon-left">
                                <LockIcon />
                            </span>
                            <input
                                type="password"
                                autoComplete="new-password"
                                placeholder="Repeat your password"
                                className={['input', errors.confirm ? 'input-error' : ''].filter(Boolean).join(' ')}
                                {...register('confirm')}
                            />
                        </div>
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

            <p style={{
                textAlign: 'center',
                fontSize: 11,
                color: 'var(--text-muted)',
                marginTop: 16,
                lineHeight: 1.5,
            }}>
                This link is single-use and expires after 48 hours.
            </p>
        </div>
    );
}
