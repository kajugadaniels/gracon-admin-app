'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { adminLoginApi } from '@/api/auth/admin-login.api';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';

// Install these if not already present:
// npm install react-hook-form @hookform/resolvers zod

const schema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

type FormFields = z.infer<typeof schema>;

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
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ?? 'Invalid email or password.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: 380 }}>

            {/* Logo mark */}
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <div
                    style={{
                        width: 44,
                        height: 44,
                        background: 'var(--primary)',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#fff',
                        margin: '0 auto 16px',
                    }}
                >
                    A
                </div>
                <div
                    style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        marginBottom: 4,
                    }}
                >
                    Admin Panel
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    ID Verification Platform
                </div>
            </div>

            {/* Form panel */}
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
                        <input
                            type="email"
                            autoComplete="email"
                            placeholder="you@idverify.rw"
                            className="input"
                            {...register('email')}
                        />
                        {errors.email && (
                            <p style={{ fontSize: 12, color: 'var(--error)', marginTop: 4 }}>
                                {errors.email.message}
                            </p>
                        )}
                    </div>

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
                        <input
                            type="password"
                            autoComplete="current-password"
                            placeholder="Your password"
                            className="input"
                            {...register('password')}
                        />
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
                        style={{ width: '100%', marginTop: 4 }}
                    >
                        {loading ? 'Signing in…' : 'Sign in'}
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
                This panel is for authorised administrators only.
                All actions are logged and audited.
            </p>
        </div>
    );
}