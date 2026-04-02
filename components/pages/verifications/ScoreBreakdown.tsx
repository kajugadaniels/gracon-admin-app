// ScoreBreakdown — visual decomposition of a verification composite score.
// Shows each component's raw score, weight, and weighted contribution.
// The formula is rendered visually so an admin understands at a glance
// exactly which component caused a failure — no mental arithmetic needed.
// Threshold line is drawn on the composite bar so near-misses are obvious.
'use client';

import React from 'react';
import type { VerificationDetail } from '@/api/verifications/get-verification.api';

interface ScoreBreakdownProps {
    breakdown: VerificationDetail['scoreBreakdown'];
    passed: boolean;
}

interface ComponentBarProps {
    label: string;
    score: number;
    weight: number;
    weighted: number;
    color: string;
    suffix?: string;
}

function ComponentBar({
    label,
    score,
    weight,
    weighted,
    color,
    suffix = '',
}: ComponentBarProps) {
    const isPoor = score < 70;

    return (
        <div
            style={{
                background: isPoor ? 'var(--error-glass)' : 'var(--glass-interactive)',
                border: `1px solid ${isPoor ? 'var(--error-border)' : 'var(--glass-interactive-border)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
            }}
        >
            {/* Header row */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 10,
                }}
            >
                <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {label}
                    </span>
                    <span
                        style={{
                            marginLeft: 6,
                            fontSize: 11,
                            color: 'var(--text-muted)',
                            background: 'var(--glass-interactive)',
                            border: '1px solid var(--glass-interactive-border)',
                            borderRadius: 4,
                            padding: '1px 5px',
                        }}
                    >
                        {weight}% weight
                    </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <span
                        style={{
                            fontSize: 15,
                            fontWeight: 700,
                            color: isPoor ? 'var(--error-text)' : 'var(--text-primary)',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {typeof score === 'boolean'
                            ? (score ? '100' : '0')
                            : score.toFixed(1)}
                        {suffix}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>/ 100</span>
                </div>
            </div>

            {/* Score bar */}
            <div
                style={{
                    height: 6,
                    borderRadius: 3,
                    background: 'rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    marginBottom: 8,
                    position: 'relative',
                }}
                role="meter"
                aria-valuenow={score}
                aria-valuemin={0}
                aria-valuemax={100}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${Math.min(Math.max(score, 0), 100)}%`,
                        background: color,
                        borderRadius: 3,
                        transition: 'width 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                />
            </div>

            {/* Weighted contribution */}
            <div
                style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <span>Contributes to composite</span>
                <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
                    +{weighted.toFixed(2)} pts
                </span>
            </div>
        </div>
    );
}

export function ScoreBreakdown({ breakdown, passed }: ScoreBreakdownProps) {
    const thresholdPercent = breakdown.threshold;

    return (
        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '20px' }}>
            {/* Section title */}
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: 16,
                }}
            >
                Score breakdown
            </div>

            {/* Three component bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                <ComponentBar
                    label="Face similarity"
                    score={breakdown.face.score}
                    weight={breakdown.face.weight}
                    weighted={breakdown.face.weighted}
                    color={breakdown.face.score >= 70 ? 'var(--success)' : 'var(--error)'}
                />
                <ComponentBar
                    label="Liveness detection"
                    score={breakdown.liveness.score}
                    weight={breakdown.liveness.weight}
                    weighted={breakdown.liveness.weighted}
                    color={breakdown.liveness.score >= 70 ? 'var(--success)' : 'var(--error)'}
                />
                <ComponentBar
                    label="Document match"
                    score={breakdown.document.matched ? 100 : 0}
                    weight={breakdown.document.weight}
                    weighted={breakdown.document.weighted}
                    color={breakdown.document.matched ? 'var(--success)' : 'var(--error)'}
                />
            </div>

            {/* Composite score with threshold */}
            <div
                style={{
                    background: passed ? 'var(--success-glass)' : 'var(--error-glass)',
                    border: `1px solid ${passed ? 'var(--success-border)' : 'var(--error-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 12,
                    }}
                >
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        Composite score
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span
                            style={{
                                fontSize: 22,
                                fontWeight: 700,
                                color: passed ? 'var(--success-text)' : 'var(--error-text)',
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {breakdown.composite.toFixed(2)}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>/ 100</span>
                    </div>
                </div>

                {/* Composite bar with threshold marker */}
                <div
                    style={{
                        position: 'relative',
                        height: 10,
                        borderRadius: 5,
                        background: 'rgba(0,0,0,0.15)',
                        overflow: 'visible',
                        marginBottom: 12,
                    }}
                >
                    {/* Fill */}
                    <div
                        style={{
                            height: '100%',
                            width: `${Math.min(breakdown.composite, 100)}%`,
                            background: passed ? 'var(--success)' : 'var(--error)',
                            borderRadius: 5,
                            transition: 'width 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                            overflow: 'hidden',
                        }}
                    />

                    {/* Threshold marker line */}
                    <div
                        style={{
                            position: 'absolute',
                            left: `${thresholdPercent}%`,
                            top: -4,
                            bottom: -4,
                            width: 2,
                            background: 'var(--warning)',
                            borderRadius: 1,
                            zIndex: 1,
                        }}
                        title={`Pass threshold: ${thresholdPercent}`}
                        aria-label={`Pass threshold: ${thresholdPercent}`}
                    />
                </div>

                {/* Threshold label + result */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Pass threshold:{' '}
                        <span style={{ color: 'var(--warning-text)', fontWeight: 600 }}>
                            {thresholdPercent}.0
                        </span>
                    </span>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            color: passed ? 'var(--success-text)' : 'var(--error-text)',
                        }}
                    >
                        <div
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                background: passed ? 'var(--success)' : 'var(--error)',
                                boxShadow: `0 0 6px ${passed ? 'var(--success)' : 'var(--error)'}`,
                            }}
                            aria-hidden="true"
                        />
                        {passed
                            ? `Passed (+${(breakdown.composite - thresholdPercent).toFixed(2)} above threshold)`
                            : `Failed (${(breakdown.composite - thresholdPercent).toFixed(2)} below threshold)`
                        }
                    </div>
                </div>
            </div>

            {/* Formula reminder */}
            <div
                style={{
                    marginTop: 12,
                    padding: '8px 12px',
                    background: 'var(--glass-interactive)',
                    border: '1px solid var(--glass-interactive-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    lineHeight: 1.6,
                    fontFamily: 'monospace',
                }}
            >
                composite = (face × 0.50) + (liveness × 0.30) + (document_match × 20)
            </div>
        </div>
    );
}