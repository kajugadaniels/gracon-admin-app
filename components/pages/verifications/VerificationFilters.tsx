// VerificationFilters — filter bar for the verifications list.
// Supports outcome, date range, score range, and IP address filters.
// Score range is a two-input min/max — useful for finding borderline failures.
// All filters are URL-synced so the view is bookmarkable.
'use client';

import React from 'react';
import { Button } from '@/components/ui';

export interface VerificationFilterState {
    passed: string;   // '' | 'true' | 'false'
    ipAddress: string;
    createdFrom: string;
    createdTo: string;
    scoreMin: string;
    scoreMax: string;
}

export const DEFAULT_VERIFICATION_FILTERS: VerificationFilterState = {
    passed: '',
    ipAddress: '',
    createdFrom: '',
    createdTo: '',
    scoreMin: '',
    scoreMax: '',
};

interface VerificationFiltersProps {
    filters: VerificationFilterState;
    onChange: (f: VerificationFilterState) => void;
    total?: number;
    loading?: boolean;
}

const OUTCOME_OPTIONS = [
    { value: '', label: 'All outcomes' },
    { value: 'true', label: 'Passed only' },
    { value: 'false', label: 'Failed only' },
];

export function VerificationFilters({
    filters,
    onChange,
    total,
    loading,
}: VerificationFiltersProps) {
    const isFiltered = Object.values(filters).some((v) => v !== '');

    const set = (key: keyof VerificationFilterState, value: string) =>
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
            {/* Outcome */}
            <select
                className="select"
                value={filters.passed}
                onChange={(e) => set('passed', e.target.value)}
                aria-label="Filter by outcome"
                style={{ width: 140 }}
            >
                {OUTCOME_OPTIONS.map((o) => (
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

            {/* Score range */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                    className="input"
                    type="number"
                    placeholder="Score min"
                    min={0}
                    max={100}
                    value={filters.scoreMin}
                    onChange={(e) => set('scoreMin', e.target.value)}
                    aria-label="Minimum composite score"
                    style={{ width: 100 }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>—</span>
                <input
                    className="input"
                    type="number"
                    placeholder="Score max"
                    min={0}
                    max={100}
                    value={filters.scoreMax}
                    onChange={(e) => set('scoreMax', e.target.value)}
                    aria-label="Maximum composite score"
                    style={{ width: 100 }}
                />
            </div>

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
                    onClick={() => onChange(DEFAULT_VERIFICATION_FILTERS)}
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
                    {total.toLocaleString()} attempt{total !== 1 ? 's' : ''}
                </span>
            )}
        </div>
    );
}