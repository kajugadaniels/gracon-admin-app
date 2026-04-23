'use client';

import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useRouter } from 'next/navigation';
import { Badge, Button, DataTable, type Column } from '@/components/ui';
import { getCountryName } from './CountryDropdown';
import type { ForeignIdentityProfile } from '@/api/foreign-identity/foreign-identity.types';

interface ForeignIdentityTableProps {
    data: ForeignIdentityProfile[];
    loading: boolean;
    error: string | null;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

function LoadingSkeleton() {
    return (
        <div className="data-table" aria-busy="true">
            <div className="data-table-header data-table-header-grid" style={headerGridStyle}>
                {['FIN', 'Name', 'Country', 'Gender', 'Date of birth', 'Marital', 'Status', 'Created', 'Actions'].map((item) => (
                    <div key={item} className="data-table-header-cell">{item}</div>
                ))}
            </div>
            {Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="data-row static" style={headerGridStyle}>
                    {Array.from({ length: 9 }, (_, cell) => (
                        <div key={cell} className="data-cell">
                            <div style={skeletonBlockStyle} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export function ForeignIdentityTable({
    data,
    loading,
    error,
}: ForeignIdentityTableProps) {
    const router = useRouter();

    const columns: Column<ForeignIdentityProfile>[] = [
        {
            key: 'fin',
            header: 'FIN',
            width: '132px',
            render: (row) => (
                <span style={monoCellStyle}>{row.fin}</span>
            ),
        },
        {
            key: 'name',
            header: 'Full Name',
            width: '1.15fr',
            render: (row) => (
                <div className="data-cell-stack">
                    <span className="primary">{row.firstName} {row.lastName}</span>
                    <span className="sub">Issued version {row.issuanceVersion}</span>
                </div>
            ),
        },
        {
            key: 'country',
            header: 'Country',
            width: '150px',
            render: (row) => (
                <span style={countryCellStyle}>
                    <ReactCountryFlag countryCode={row.countryOfOrigin} svg />
                    {getCountryName(row.countryOfOrigin)}
                </span>
            ),
        },
        {
            key: 'gender',
            header: 'Gender',
            width: '90px',
            render: (row) => row.gender === 'MALE' ? 'Male' : 'Female',
        },
        {
            key: 'dateOfBirth',
            header: 'Date of Birth',
            width: '110px',
            render: (row) => (
                <span style={metaCellStyle}>{formatDate(row.dateOfBirth)}</span>
            ),
        },
        {
            key: 'maritalStatus',
            header: 'Marital Status',
            width: '110px',
            render: (row) => row.maritalStatus.toLowerCase(),
        },
        {
            key: 'status',
            header: 'Status',
            width: '96px',
            render: (row) => (
                <Badge variant={row.isActive ? 'active' : 'neutral'} dot>
                    {row.isActive ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created At',
            width: '120px',
            render: (row) => (
                <span style={metaCellStyle}>{formatDate(row.createdAt)}</span>
            ),
        },
        {
            key: 'actions',
            header: 'Actions',
            width: '90px',
            render: (row) => (
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => router.push(`/admin/foreign-identities/${row.fin}`)}
                >
                    View
                </Button>
            ),
        },
    ];

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ minWidth: 980 }}>
                <DataTable
                    columns={columns}
                    data={data}
                    loading={false}
                    error={error}
                    getRowKey={(row) => row.fin}
                    emptyTitle="No foreign identities found"
                    emptyDescription="Adjust the filters or register a new record."
                />
            </div>
        </div>
    );
}

const headerGridStyle = {
    gridTemplateColumns: '132px 1.15fr 150px 90px 110px 110px 96px 120px 90px',
};

const monoCellStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    color: 'var(--text-primary)',
    fontVariantNumeric: 'tabular-nums',
};

const countryCellStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    color: 'var(--text-primary)',
    fontSize: 13,
};

const metaCellStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontVariantNumeric: 'tabular-nums',
};

const skeletonBlockStyle: React.CSSProperties = {
    height: 12,
    width: '72%',
    borderRadius: 999,
    background: 'var(--glass-overlay-border)',
    opacity: 0.4,
};
