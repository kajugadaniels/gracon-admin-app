// AuditFilters — filter bar for the admin audit log.
// Filters by which admin performed the action, action type, and date range.
// The action type select maps enum values to human-readable labels.
'use client';

import React from 'react';
import { Button } from '@/components/ui';

export interface AuditFilterState {
    action: string;
    createdFrom: string;
    createdTo: string;
}

export const DEFAULT_AUDIT_FILTERS: AuditFilterState = {
    action: '',
    createdFrom: '',
    createdTo: '',
};

interface AuditFiltersProps {
    filters: AuditFilterState;
    onChange: (f: AuditFilterState) => void;
    total?: number;
    loading?: boolean;
}

const ACTION_OPTIONS = [
    { value: '', label: 'All actions' },
    { value: 'USER_DEACTIVATED', label: 'User deactivated' },
    { value: 'USER_REACTIVATED', label: 'User reactivated' },
    { value: 'SESSIONS_REVOKED', label: 'Sessions revoked' },
    { value: 'ID_STATUS_CHANGED', label: 'ID status changed' },
    { value: 'NID_DECRYPTED', label: 'NID decrypted' },
    { value: 'PID_DECRYPTED', label: 'PID decrypted' },
    { value: 'USER_DETAIL_VIEWED', label: 'User detail viewed' },
    { value: 'ADMIN_CREATED', label: 'Admin created' },
    { value: 'ADMIN_DEACTIVATED', label: 'Admin deactivated' },
    { value: 'ADMIN_REACTIVATED', label: 'Admin reactivated' },
    { value: 'ADMIN_INVITE_RESENT', label: 'Admin invite resent' },
];

export function AuditFilters({
    filters,
    onChange,
    total,
    loading,
}: AuditFiltersProps) {
    const isFiltered = Object.values(filters).some((v) => v !== '');
    const set = (key: keyof AuditFilterState, value: string) =>
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
            {/* Action type */}
            <select
                className="select"
                value={filters.action}
                onChange={(e) => set('action', e.target.value)}
                aria-label="Filter by action type"
                style={{ width: 190 }}
            >
                {ACTION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

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
                    onClick={() => onChange(DEFAULT_AUDIT_FILTERS)}
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
                    {total.toLocaleString()} record{total !== 1 ? 's' : ''}
                </span>
            )}
        </div>
    );
}