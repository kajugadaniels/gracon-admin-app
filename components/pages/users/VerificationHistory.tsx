// VerificationHistory — last 5 verification attempts for a user.
// Shows scores as a mini bar visualization — not just numbers.
// Passed attempts are green, failed are red.
// Score bars give instant visual context on how close each attempt was.
'use client';

import React from 'react';
import { Badge } from '@/components/ui';
import type { VerificationItem } from '@/api/users/get-user.api';

interface VerificationHistoryProps {
    verifications: VerificationItem[];
}

function ScoreBar({
    score,
    weight,
    color,
    label,
}: {
    score: number;
    weight: number;
    color: string;
    label: string;
}) {
    return (
        <div style={{ flex: 1, minWidth: 0 }}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 3,
                }}
            >
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                    {label} ({weight}%)
                </span>
                <span style={{ fontSize: 10, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                    {score.toFixed(1)}
                </span>
            </div>
            <div
                style={{
                    height: 4,
                    borderRadius: 2,
                    background: 'var(--glass-interactive)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${Math.min(score, 100)}%`,
                        background: color,
                        borderRadius: 2,
                        transition: 'width 400ms ease',
                    }}
                />
            </div>
        </div>
    );
}

function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function VerificationHistory({ verifications }: VerificationHistoryProps) {
    if (verifications.length === 0) {
        return (
            <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
                <SectionTitle>Verification attempts</SectionTitle>
                <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
                    No verification attempts yet.
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
            <SectionTitle>
                Verification attempts
                <span
                    style={{
                        marginLeft: 6,
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        fontWeight: 400,
                    }}
                >
                    (last {verifications.length})
                </span>
            </SectionTitle>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {verifications.map((v) => (
                    <div
                        key={v.id}
                        style={{
                            background: v.passed
                                ? 'rgba(52, 211, 153, 0.04)'
                                : 'rgba(251, 113, 133, 0.04)',
                            border: `1px solid ${v.passed
                                ? 'var(--success-border)'
                                : 'var(--error-border)'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '12px 14px',
                        }}
                    >
                        {/* Top row: attempt number + result + composite score + date */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 10,
                                flexWrap: 'wrap',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: 'var(--text-muted)',
                                }}
                            >
                                Attempt #{v.attemptNumber}
                            </span>
                            <Badge variant={v.passed ? 'active' : 'inactive'}>
                                {v.passed ? 'Passed' : 'Failed'}
                            </Badge>
                            <span
                                style={{
                                    marginLeft: 'auto',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: v.passed ? 'var(--success-text)' : 'var(--error-text)',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {v.compositeScore.toFixed(1)}
                                <span style={{ fontSize: 10, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 2 }}>
                                    / 100
                                </span>
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                {formatDateTime(v.createdAt)}
                            </span>
                        </div>

                        {/* Score bars */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <ScoreBar
                                score={v.faceScore}
                                weight={50}
                                color={v.faceScore >= 70 ? 'var(--success)' : 'var(--error)'}
                                label="Face"
                            />
                            <ScoreBar
                                score={v.livenessScore}
                                weight={30}
                                color={v.livenessScore >= 70 ? 'var(--success)' : 'var(--error)'}
                                label="Liveness"
                            />
                            <ScoreBar
                                score={v.documentMatch ? 100 : 0}
                                weight={20}
                                color={v.documentMatch ? 'var(--success)' : 'var(--error)'}
                                label="Document"
                            />
                        </div>

                        {/* Fail reason */}
                        {v.failReason && (
                            <div
                                style={{
                                    marginTop: 8,
                                    fontSize: 11,
                                    color: 'var(--error-text)',
                                    lineHeight: 1.5,
                                }}
                            >
                                {v.failReason}
                            </div>
                        )}

                        {/* IP */}
                        {v.ipAddress && (
                            <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-muted)' }}>
                                From {v.ipAddress}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
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
            {children}
        </div>
    );
}