'use client';

// LoginForm — admin sign-in form.
// Email + password with inline icons. Submits to adminLoginApi and stores tokens.
// On success redirects to ?next= param or /dashboard.
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { adminLoginApi } from '@/api/auth/admin-login.api';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type FormFields = z.infer<typeof schema>;

// ── Inline icons ──────────────────────────────────────────────────────────

const EnvelopeIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const LockIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const ArrowRightIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
);

// ── Component ─────────────────────────────────────────────────────────────

export function LoginForm() {
    const router = useRouter();
    const setTokens = useAdminAuthStore((s) => s.setTokens);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormFields>({ resolver: zodResolver(schema) });

    const onSubmit = async (values: FormFields) => {
        setLoading(true);
        try {
            const res = await adminLoginApi(values);
            const { accessToken, refreshToken, admin } = res.data.data;

            setTokens(accessToken, refreshToken, admin);

            const next = new URLSearchParams(window.location.search).get('next');
            router.replace(next ?? '/dashboard');
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ?? 'Invalid email or password.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: 400, padding: '0 16px' }}>

            {/* Logo mark */}
            <div style={{ marginBottom: 28, textAlign: 'center' }}>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        background: 'var(--primary)',
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#fff',
                        margin: '0 auto 16px',
                        boxShadow: '0 8px 24px rgba(91, 35, 255, 0.28)',
                    }}
                >
                    A
                </div>
                <div
                    style={{
                        fontSize: 22,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                        letterSpacing: '-0.01em',
                    }}
                >
                    Admin Panel
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    ID Verification Platform
                </div>
            </div>

            {/* Form panel */}
            <div className="auth-panel">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                >
                    {/* Email */}
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--text-secondary)',
                                marginBottom: 6,
                            }}
                        >
                            Email address
                        </label>
                        <div className="input-icon-wrap">
                            <span className="input-icon-left">
                                <EnvelopeIcon />
                            </span>
                            <input
                                type="email"
                                autoComplete="email"
                                placeholder="you@idverify.rw"
                                className={['input', errors.email ? 'input-error' : ''].filter(Boolean).join(' ')}
                                {...register('email')}
                            />
                        </div>
                        {errors.email && (
                            <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            style={{
                                display: 'block',
                                fontSize: 12,
                                fontWeight: 500,
                                color: 'var(--text-secondary)',
                                marginBottom: 6,
                            }}
                        >
                            Password
                        </label>
                        <div className="input-icon-wrap">
                            <span className="input-icon-left">
                                <LockIcon />
                            </span>
                            <input
                                type="password"
                                autoComplete="current-password"
                                placeholder="Your password"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: 4, gap: 8 }}
                    >
                        {loading ? 'Signing in…' : (
                            <>
                                Sign in
                                <ArrowRightIcon />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Security notice */}
            <p
                style={{
                    textAlign: 'center',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginTop: 16,
                    lineHeight: 1.5,
                }}
            >
                Authorised administrators only.
                All actions are logged and audited.
            </p>
        </div>
    );
}
