// InstitutionsTable renders the global admin institutions list.
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ReactCountryFlag from 'react-country-flag';
import { Badge, Button, DataTable } from '@/components/ui';
import type { Column } from '@/components/ui/DataTable';
import type { InstitutionListItem } from '@/api/institutions/institutions.types';

interface InstitutionsTableProps {
    data: InstitutionListItem[];
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

/**
 * Institutions list table.
 */
export function InstitutionsTable({
    data,
    loading,
    error,
}: InstitutionsTableProps) {
    const router = useRouter();

    const columns: Column<InstitutionListItem>[] = [
        {
            key: 'name',
            header: 'Institution',
            width: '1.2fr',
            render: (row) => (
                <div className="data-cell-stack">
                    <span className="primary">{row.name}</span>
                    <span className="sub">{row.registrationNumber}</span>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'Type',
            width: '120px',
            render: (row) => row.type,
        },
        {
            key: 'country',
            header: 'Country',
            width: '110px',
            render: (row) => (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <ReactCountryFlag countryCode={row.country} svg />
                    {row.country}
                </span>
            ),
        },
        {
            key: 'memberCount',
            header: 'Members',
            width: '80px',
            render: (row) => row.memberCount,
        },
        {
            key: 'stampsIssued',
            header: 'Stamps',
            width: '80px',
            render: (row) => row.stampsIssued,
        },
        {
            key: 'status',
            header: 'Status',
            width: '100px',
            render: (row) => (
                <Badge variant={row.status === 'ACTIVE' ? 'active' : 'neutral'}>
                    {row.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            header: 'Created',
            width: '110px',
            render: (row) => formatDate(row.createdAt),
        },
        {
            key: 'actions',
            header: 'Actions',
            width: '90px',
            render: (row) => (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(event) => {
                        event.stopPropagation();
                        router.push(`/admin/institutions/${row.institutionId}`);
                    }}
                >
                    View
                </Button>
            ),
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={data}
            loading={loading}
            error={error}
            emptyTitle="No institutions found"
            emptyDescription="Register an institution to start tracking institutional trust material."
            getRowKey={(row) => row.institutionId}
            onRowClick={(row) => router.push(`/admin/institutions/${row.institutionId}`)}
        />
    );
}
