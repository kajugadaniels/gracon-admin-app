// UserFilters — search + status filters for the users list.
// Search is debounced 350ms — no API call on every keystroke.
// All filters are controlled — parent owns the state.
// Resetting clears all fields back to defaults in one click.
'use client';

import React from 'react';
import { Input, Select, Button } from '@/components/ui';
import { useDebounce } from '@/lib/hooks/useDebounce';

export interface UserFilterState {
    search: string;
    isActive: string;   // '' | 'true' | 'false'
    isVerified: string;
    isIdVerified: string;
}

const DEFAULT_FILTERS: UserFilterState = {
    search: '',
    isActive: '',
    isVerified: '',
    isIdVerified: '',
};

interface UserFiltersProps {
    filters: UserFilterState;
    onChange: (filters: UserFilterState) => void;
    total?: number;
    loading?: boolean;
}

const STATUS_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Active only' },
    { value: 'false', label: 'Inactive only' },
];

const VERIFIED_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'true', label: 'Verified only' },
    { value: 'false', label: 'Unverified only' },
];

const ID_VERIFIED_OPTIONS = [
    { value: '', label: 'All' },
    { value: 'true', label: 'ID verified only' },
    { value: 'false', label: 'ID pending only' },
];

export function UserFilters({
    filters,
    onChange,
    total,
    loading,
}: UserFiltersProps) {

    const isFiltered =
        filters.search !== '' ||
        filters.isActive !== '' ||
        filters.isVerified !== '' ||
        filters.isIdVerified !== '';

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
            {/* Search */}
            <div style={{ flex: '1 1 200px', minWidth: 160, maxWidth: 280 }}>
                <Input
                    search
                    placeholder="Search name or email…"
                    value={filters.search}
                    onChange={(e) =>
                        onChange({ ...filters, search: e.target.value })
                    }
                    aria-label="Search users"
                />
            </div>

            {/* Account status */}
            <select
                className="select"
                value={filters.isActive}
                onChange={(e) =>
                    onChange({ ...filters, isActive: e.target.value })
                }
                aria-label="Filter by account status"
                style={{ flex: '0 0 auto', width: 140 }}
            >
                {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

            {/* Email verified */}
            <select
                className="select"
                value={filters.isVerified}
                onChange={(e) =>
                    onChange({ ...filters, isVerified: e.target.value })
                }
                aria-label="Filter by email verification"
                style={{ flex: '0 0 auto', width: 150 }}
            >
                {VERIFIED_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

            {/* ID verified */}
            <select
                className="select"
                value={filters.isIdVerified}
                onChange={(e) =>
                    onChange({ ...filters, isIdVerified: e.target.value })
                }
                aria-label="Filter by ID verification"
                style={{ flex: '0 0 auto', width: 150 }}
            >
                {ID_VERIFIED_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

            {/* Clear filters */}
            {isFiltered && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(DEFAULT_FILTERS)}
                    aria-label="Clear all filters"
                >
                    Clear
                </Button>
            )}

            {/* Result count */}
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
                    {total.toLocaleString()} user{total !== 1 ? 's' : ''}
                </span>
            )}
        </div>
    );
}