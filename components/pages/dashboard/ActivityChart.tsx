// ActivityChart — bar chart showing 7 days of activity.
// Used twice on the dashboard: registrations and verifications.
// Built with recharts — already installed.
// X-axis shows short day names (Mon, Tue, etc.)
// Tooltip shows the full date and count.
// Empty days render as zero-height bars — no gaps in the chart.
'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface DailyCount {
    date: string;   // ISO date string "2024-11-19"
    count: number;
}

interface ActivityChartProps {
    data: DailyCount[];
    color: string;   // bar fill color
    label: string;   // tooltip label e.g. "Registrations"
    loading: boolean;
}

// Convert ISO date string to short day name
function toShortDay(isoDate: string): string {
    const date = new Date(isoDate + 'T12:00:00Z');
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        timeZone: 'UTC',
    });
}

// Custom tooltip — cleaner than recharts default
interface ActivityTooltipProps {
    active?: boolean;
    payload?: Array<{ value?: number; payload?: { date?: string } }>;
    metricLabel: string;
}

function CustomTooltip({
    active,
    payload,
    metricLabel,
}: ActivityTooltipProps) {
    if (!active || !payload?.length) return null;

    const entry = payload[0];
    const isoDate = entry?.payload?.date;
    const count = entry?.value ?? 0;

    const formatted = isoDate
        ? new Date(isoDate + 'T12:00:00Z').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'UTC',
        })
        : '';

    return (
        <div
            style={{
                background: 'var(--surface)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius)',
                padding: '8px 12px',
                fontSize: 12,
                color: 'var(--text-secondary)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                pointerEvents: 'none',
            }}
        >
            <div
                style={{
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 2,
                }}
            >
                {count.toLocaleString()}
            </div>
            <div>{metricLabel}</div>
            <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                {formatted}
            </div>
        </div>
    );
}

export function ActivityChart({
    data,
    color,
    label,
    loading,
}: ActivityChartProps) {
    // Transform data — add shortDay label for x-axis
    const chartData = data.map((d) => ({
        ...d,
        day: toShortDay(d.date),
    }));

    if (loading) {
        return (
            <div
                style={{
                    height: 200,
                    background: 'rgba(0,0,0,0.03)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 13,
                }}
            >
                Loading chart…
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={200}>
            <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
                barCategoryGap="35%"
            >
                <CartesianGrid
                    vertical={false}
                    stroke="rgba(0,0,0,0.06)"
                    strokeDasharray="0"
                />
                <XAxis
                    dataKey="day"
                    tick={{
                        fontSize: 11,
                        fill: 'var(--text-muted)',
                        fontFamily: 'var(--font-sans)',
                    }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    tick={{
                        fontSize: 11,
                        fill: 'var(--text-muted)',
                        fontFamily: 'var(--font-sans)',
                    }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                    width={32}
                />
                <Tooltip
                    content={<CustomTooltip metricLabel={label} />}
                    cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 4 }}
                />
                <Bar
                    dataKey="count"
                    fill={color}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
