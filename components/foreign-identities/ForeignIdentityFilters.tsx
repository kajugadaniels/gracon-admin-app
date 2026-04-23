'use client';

import React from 'react';
import { Input, Select } from '@/components/ui';
import { CountryDropdown } from './CountryDropdown';
import type { ForeignGender, MaritalStatus } from '@/api/foreign-identity/foreign-identity.types';

export interface ForeignIdentityFilterState {
    search: string;
    countryOfOrigin: string;
    gender: '' | ForeignGender;
    maritalStatus: '' | MaritalStatus;
    includeInactive: boolean;
}

interface ForeignIdentityFiltersProps {
    filters: ForeignIdentityFilterState;
    total?: number;
    loading?: boolean;
    onChange: (filters: ForeignIdentityFilterState) => void;
}

const genderOptions = [
    { value: '', label: 'All genders' },
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
];

const maritalOptions = [
    { value: '', label: 'All statuses' },
    { value: 'SINGLE', label: 'Single' },
    { value: 'MARRIED', label: 'Married' },
    { value: 'DIVORCED', label: 'Divorced' },
    { value: 'WIDOWED', label: 'Widowed' },
];

function FilterMeta({ loading, total }: { loading?: boolean; total?: number }) {
    return (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {loading ? 'Refreshing results…' : `${total ?? 0} matching records`}
        </div>
    );
}

function IncludeInactiveToggle({
    checked,
    onChange,
}: {
    checked: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <button type="button" onClick={() => onChange(!checked)} style={toggleStyle}>
            <span
                style={{
                    width: 16,
                    height: 16,
                    borderRadius: 999,
                    background: checked ? 'var(--primary)' : 'var(--glass-interactive-border)',
                }}
            />
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                Include inactive
            </span>
        </button>
    );
}

export function ForeignIdentityFilters({
    filters,
    total,
    loading,
    onChange,
}: ForeignIdentityFiltersProps) {
    const setField = <K extends keyof ForeignIdentityFilterState>(
        key: K,
        value: ForeignIdentityFilterState[K],
    ) => onChange({ ...filters, [key]: value });

    return (
        <section className="glass-card" style={panelStyle}>
            <div style={headerRowStyle}>
                <FilterMeta loading={loading} total={total} />
                <IncludeInactiveToggle
                    checked={filters.includeInactive}
                    onChange={(next) => setField('includeInactive', next)}
                />
            </div>

            <div style={gridStyle}>
                <Input
                    search
                    value={filters.search}
                    onChange={(event) => setField('search', event.target.value)}
                    placeholder="Search name or nationality"
                />
                <CountryDropdown
                    value={filters.countryOfOrigin}
                    onChange={(value) => setField('countryOfOrigin', value)}
                    placeholder="All countries"
                />
                <Select
                    value={filters.gender}
                    onChange={(event) => setField('gender', event.target.value as ForeignIdentityFilterState['gender'])}
                    options={genderOptions}
                />
                <Select
                    value={filters.maritalStatus}
                    onChange={(event) => setField('maritalStatus', event.target.value as ForeignIdentityFilterState['maritalStatus'])}
                    options={maritalOptions}
                />
            </div>
        </section>
    );
}

const panelStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 'var(--radius-lg)',
    marginBottom: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
};

const headerRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
};

const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
};

const toggleStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 38,
    padding: '0 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-interactive-border)',
    background: 'var(--glass-interactive)',
    cursor: 'pointer',
};
