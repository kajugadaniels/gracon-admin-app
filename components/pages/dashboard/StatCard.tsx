// StatCard — one of the four metric tiles at the top of the dashboard.
// Shows a label, animated count-up value, optional delta, and an icon.
// Delta shows change context — e.g. "+12 today" or "78.4% pass rate".
// Icon is tinted with the card's accent color for quick visual scanning.
'use client';

import React from 'react';
import { useCountUp } from '@/lib/hooks/useCountUp';

interface StatCardProps {
    label: string;
    value: number;
    // Formatted suffix appended after the count — e.g. "%" or " users"
    suffix?: string;
    delta?: string;
    deltaType?: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
    accentColor: string;   // CSS color value for icon tint
    loading?: boolean;
}

export function StatCard({
    label,
    value,
    suffix = '',
    delta,
    deltaType = 'neutral',
    icon,
    accentColor,
    loading = false,
}: StatCardProps) {
    const animated = useCountUp(loading ? 0 : value, 800);

    const deltaColors: Record<string, string> = {
        positive: 'var(--success)',
        negative: 'var(--error)',
        neutral: 'var(--text-muted)',
    };

    return (
        <div className="stat-card">
            {/* Top row: label + icon */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                }}
            >
                <span className="stat-label">{label}</span>
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        background: `${accentColor}15`,
                        border: `1px solid ${accentColor}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: accentColor,
                        flexShrink: 0,
                    }}
                    aria-hidden="true"
                >
                    {icon}
                </div>
            </div>

            {/* Value */}
            {loading ? (
                <div
                    style={{
                        height: 32,
                        width: 100,
                        background: 'rgba(0,0,0,0.06)',
                        borderRadius: 4,
                        marginBottom: 6,
                    }}
                    aria-label="Loading…"
                />
            ) : (
                <div
                    className="stat-value"
                    aria-live="polite"
                    aria-label={`${label}: ${value.toLocaleString()}${suffix}`}
                >
                    {animated.toLocaleString()}{suffix}
                </div>
            )}

            {/* Delta */}
            {delta && !loading && (
                <div
                    className="stat-delta"
                    style={{ color: deltaColors[deltaType] }}
                >
                    {delta}
                </div>
            )}
        </div>
    );
}