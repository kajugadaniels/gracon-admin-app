// StatCard — luminous glass tile for a single dashboard metric.
// The accent color is set as a CSS custom property (--accent) on the card element,
// enabling the top border glow, icon tint, and shimmer all through CSS without
// hardcoding hex values in the component.
'use client';

import React from 'react';
import type { CSSProperties } from 'react';
import { useCountUp } from '@/lib/hooks/useCountUp';

interface StatCardProps {
    label: string;
    value: number;
    /** Formatted suffix appended after the count — e.g. "%" */
    suffix?: string;
    delta?: string;
    deltaType?: 'positive' | 'negative' | 'neutral';
    icon: React.ReactNode;
    /** CSS color value for the accent — use CSS variables e.g. "var(--success)" */
    accentColor: string;
    loading?: boolean;
}

const deltaColors: Record<string, string> = {
    positive: 'var(--success-text)',
    negative: 'var(--error-text)',
    neutral:  'var(--text-muted)',
};

/**
 * Renders a luminous stat card with an animated count-up value, colored top
 * border glow, icon in the corner, and a single shimmer sweep on mount.
 */
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

    return (
        // --accent is consumed by .stat-card CSS rules for border-top, ::before glow,
        // ::after shimmer, and the icon box background/border tints.
        <div
            className="stat-card"
            style={{ '--accent': accentColor } as CSSProperties}
        >
            {/* Top row: label left, icon right */}
            <div style={{
                display:        'flex',
                alignItems:     'flex-start',
                justifyContent: 'space-between',
                marginBottom:   12,
                position:       'relative', /* sit above ::before glow */
                zIndex:         1,
            }}>
                <span className="stat-label">{label}</span>
                <div className="stat-card-icon" aria-hidden="true">
                    {icon}
                </div>
            </div>

            {/* Value — count-up or skeleton */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {loading ? (
                    <div style={{
                        height:       32,
                        width:        100,
                        background:   'rgba(255,255,255,0.06)',
                        borderRadius: 6,
                        marginBottom: 6,
                    }} aria-label="Loading…" />
                ) : (
                    <div
                        className="stat-value"
                        aria-live="polite"
                        aria-label={`${label}: ${value.toLocaleString()}${suffix}`}
                    >
                        {animated.toLocaleString()}{suffix}
                    </div>
                )}

                {delta && !loading && (
                    <div className="stat-delta" style={{ color: deltaColors[deltaType] }}>
                        {delta}
                    </div>
                )}
            </div>
        </div>
    );
}
