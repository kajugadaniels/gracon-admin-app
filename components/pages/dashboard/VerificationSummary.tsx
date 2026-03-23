// VerificationSummary — pass vs fail breakdown with a progress bar.
// Shows the composite picture without needing a full chart.
// More information density than a single stat card allows.
'use client';

import React from 'react';

interface VerificationSummaryProps {
    passed: number;
    failed: number;
    passRate: number;
    loading: boolean;
}

export function VerificationSummary({
    passed,
    failed,
    passRate,
    loading,
}: VerificationSummaryProps) {
    const total = passed + failed;

    return (
        <div
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '14px 16px',
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                }}
            >
                <span
                    style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                    }}
                >
                    Verification outcomes
                </span>
                {!loading && (
                    <span
                        style={{
                            fontSize: 12,
                            color: 'var(--text-muted)',
                        }}
                    >
                        {total.toLocaleString()} total
                    </span>
                )}
            </div>

            {loading ? (
                <div
                    style={{
                        height: 60,
                        background: 'rgba(0,0,0,0.04)',
                        borderRadius: 4,
                    }}
                />
            ) : (
                <>
                    {/* Pass rate bar */}
                    <div
                        style={{
                            height: 8,
                            borderRadius: 4,
                            background: 'rgba(0,0,0,0.06)',
                            overflow: 'hidden',
                            marginBottom: 10,
                        }}
                        role="meter"
                        aria-valuenow={passRate}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Pass rate: ${passRate}%`}
                    >
                        <div
                            style={{
                                height: '100%',
                                width: `${Math.max(passRate, 1)}%`,
                                background: passRate >= 75
                                    ? 'var(--success)'
                                    : passRate >= 50
                                        ? 'var(--warning)'
                                        : 'var(--error)',
                                borderRadius: 4,
                                transition: 'width 600ms ease',
                            }}
                        />
                    </div>

                    {/* Legend */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 16,
                        }}
                    >
                        <LegendItem
                            color="var(--success)"
                            label="Passed"
                            value={passed}
                            total={total}
                        />
                        <LegendItem
                            color="var(--error)"
                            label="Failed"
                            value={failed}
                            total={total}
                        />
                        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                            <div
                                style={{
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: passRate >= 75
                                        ? 'var(--success)'
                                        : 'var(--warning)',
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {passRate.toFixed(1)}%
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                pass rate
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function LegendItem({
    color,
    label,
    value,
    total,
}: {
    color: string;
    label: string;
    value: number;
    total: number;
}) {
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: color,
                        flexShrink: 0,
                    }}
                    aria-hidden="true"
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {label}
                </span>
            </div>
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    paddingLeft: 13,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {value.toLocaleString()}
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 400,
                        color: 'var(--text-muted)',
                        marginLeft: 4,
                    }}
                >
                    ({pct}%)
                </span>
            </span>
        </div>
    );
}