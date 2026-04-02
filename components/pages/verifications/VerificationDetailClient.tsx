// VerificationDetailClient — full detail view for a single attempt.
// Left: score breakdown + user context.
// Right: attempt metadata, fail reason, user link.
// Back button returns to verifications list with filters preserved.
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, Badge, Spinner } from '@/components/ui';
import { ScoreBreakdown } from './ScoreBreakdown';
import {
    getVerificationApi,
    type VerificationDetail,
} from '@/api/verifications/get-verification.api';

interface VerificationDetailClientProps {
    verificationId: string;
}

const BackIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
);

const UserIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

function DetailRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '130px 1fr',
                gap: 8,
                padding: '8px 0',
                borderBottom: '1px solid var(--glass-interactive-border)',
                alignItems: 'start',
            }}
        >
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    paddingTop: 1,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: 13,
                    color: 'var(--text-primary)',
                    fontFamily: mono ? 'monospace' : undefined,
                    lineHeight: 1.5,
                }}
            >
                {value ?? '—'}
            </span>
        </div>
    );
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export function VerificationDetailClient({
    verificationId,
}: VerificationDetailClientProps) {
    const router = useRouter();

    const [data, setData] = useState<VerificationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getVerificationApi(verificationId);
            setData(res.data);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ??
                'Failed to load verification attempt.',
            );
        } finally {
            setLoading(false);
        }
    }, [verificationId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <Spinner fullPage label="Loading verification…" />;

    if (error || !data) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ fontSize: 14, color: 'var(--error-text)', marginBottom: 16 }}>
                    {error ?? 'Verification not found.'}
                </div>
                <Button variant="secondary" onClick={() => router.push('/verifications')}>
                    Back to verifications
                </Button>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title={`Attempt #${data.attemptNumber}`}
                subtitle={`${data.userName} · ${data.userEmail}`}
                action={
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<BackIcon />}
                        onClick={() => router.back()}
                    >
                        Back
                    </Button>
                }
            />

            {/* Two-column layout */}
            <div
                className="verification-detail-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
                    gap: 16,
                    alignItems: 'start',
                }}
            >
                {/* Left — score breakdown */}
                <ScoreBreakdown
                    breakdown={data.scoreBreakdown}
                    passed={data.passed}
                />

                {/* Right — attempt metadata */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                    {/* Result summary */}
                    <div
                        className="glass-card"
                        style={{ borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                marginBottom: 12,
                            }}
                        >
                            Attempt details
                        </div>

                        <DetailRow
                            label="Result"
                            value={
                                <Badge variant={data.passed ? 'active' : 'inactive'} dot>
                                    {data.passed ? 'Passed' : 'Failed'}
                                </Badge>
                            }
                        />
                        <DetailRow label="Attempt #" value={data.attemptNumber} />
                        <DetailRow label="Date" value={formatDateTime(data.createdAt)} />
                        <DetailRow label="IP address" value={data.ipAddress} mono />
                        <DetailRow
                            label="Document"
                            value={
                                <Badge variant={data.documentMatch ? 'verified' : 'inactive'}>
                                    {data.documentMatch ? 'Matched' : 'Did not match'}
                                </Badge>
                            }
                        />
                        <DetailRow label="Attempt ID" value={data.id} mono />

                        {/* Fail reason */}
                        {data.failReason && (
                            <div
                                style={{
                                    marginTop: 12,
                                    padding: '10px 12px',
                                    background: 'var(--error-glass)',
                                    border: '1px solid var(--error-border)',
                                    borderRadius: 'var(--radius-md)',
                                    fontSize: 12,
                                    color: 'var(--error-text)',
                                    lineHeight: 1.6,
                                }}
                            >
                                <div style={{ fontWeight: 600, marginBottom: 2, fontSize: 11 }}>
                                    Fail reason
                                </div>
                                {data.failReason}
                            </div>
                        )}
                    </div>

                    {/* User context */}
                    <div
                        className="glass-card"
                        style={{ borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                color: 'var(--text-muted)',
                                marginBottom: 12,
                            }}
                        >
                            User context at time of request
                        </div>

                        <DetailRow
                            label="Account"
                            value={
                                <Badge variant={data.userContext.isActive ? 'active' : 'inactive'}>
                                    {data.userContext.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            }
                        />
                        <DetailRow
                            label="ID status"
                            value={
                                <Badge variant={data.userContext.isIdVerified ? 'verified' : 'pending'}>
                                    {data.userContext.isIdVerified ? 'Verified' : 'Pending'}
                                </Badge>
                            }
                        />
                        <DetailRow
                            label="Total attempts"
                            value={`${data.userContext.totalAttempts} lifetime`}
                        />

                        {/* Link to user detail */}
                        <Link
                            href={`/users/${data.userId}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                marginTop: 14,
                                paddingTop: 12,
                                borderTop: '1px solid var(--glass-interactive-border)',
                                fontSize: 12,
                                color: 'var(--primary-text)',
                                textDecoration: 'none',
                                fontWeight: 500,
                            }}
                        >
                            <UserIcon />
                            View full user profile →
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}