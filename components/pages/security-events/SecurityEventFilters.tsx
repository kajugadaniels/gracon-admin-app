// SecurityEventFilters — filter bar for the security events page.
// Supports event type, IP address, and date range.
// Event type select shows human-readable labels with threat grouping.
'use client';

import React from 'react';
import { Button } from '@/components/ui';

export interface SecurityEventFilterState {
    eventType: string;
    ipAddress: string;
    createdFrom: string;
    createdTo: string;
}

export const DEFAULT_SECURITY_EVENT_FILTERS: SecurityEventFilterState = {
    eventType: '',
    ipAddress: '',
    createdFrom: '',
    createdTo: '',
};

interface SecurityEventFiltersProps {
    filters: SecurityEventFilterState;
    onChange: (f: SecurityEventFilterState) => void;
    total?: number;
    loading?: boolean;
}

const EVENT_TYPE_OPTIONS = [
    { value: '', label: 'All events' },
    // ── Authentication
    { value: 'LOGIN_FAILED', label: 'Login failed' },
    { value: 'LOGIN_SUCCESS', label: 'Login successful' },
    // ── Verification
    { value: 'VERIFICATION_FAILED', label: 'Verification failed' },
    { value: 'VERIFICATION_PASSED', label: 'Verification passed' },
    // ── Password
    { value: 'PASSWORD_RESET_REQUESTED', label: 'Password reset requested' },
    { value: 'PASSWORD_CHANGED', label: 'Password changed' },
    // ── Session
    { value: 'SESSIONS_REVOKED_BY_USER', label: 'Sessions revoked by user' },
    // ── Threats
    { value: 'REVOKED_TOKEN_REUSE', label: '⚠ Token reuse detected' },
    { value: 'RATE_LIMIT_EXCEEDED', label: '⚠ Rate limit exceeded' },
];

export function SecurityEventFilters({
    filters,
    onChange,
    total,
    loading,
}: SecurityEventFiltersProps) {
    const isFiltered = Object.values(filters).some((v) => v !== '');
    const set = (key: keyof SecurityEventFilterState, value: string) =>
        onChange({ ...filters, [key]: value });

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 12,
                flexWrap: 'wrap',
            }}
        >
            {/* Event type */}
            <select
                className="select"
                value={filters.eventType}
                onChange={(e) => set('eventType', e.target.value)}
                aria-label="Filter by event type"
                style={{ width: 220 }}
            >
                {EVENT_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

            {/* IP address */}
            <input
                className="input"
                placeholder="Filter by IP…"
                value={filters.ipAddress}
                onChange={(e) => set('ipAddress', e.target.value)}
                aria-label="Filter by IP address"
                style={{ width: 150 }}
            />

            {/* Date range */}
            <input
                className="input"
                type="date"
                value={filters.createdFrom}
                onChange={(e) => set('createdFrom', e.target.value)}
                aria-label="From date"
                style={{ width: 140 }}
            />
            <input
                className="input"
                type="date"
                value={filters.createdTo}
                onChange={(e) => set('createdTo', e.target.value)}
                aria-label="To date"
                style={{ width: 140 }}
            />

            {isFiltered && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(DEFAULT_SECURITY_EVENT_FILTERS)}
                >
                    Clear
                </Button>
            )}

            {total !== undefined && !loading && (
                <span
                    style={{
                        marginLeft: 'auto',
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {total.toLocaleString()} event{total !== 1 ? 's' : ''}
                </span>
            )}
        </div>
    );
}