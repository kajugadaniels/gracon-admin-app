// DataTable — the core list component used on every admin page.
// Wraps the .data-table CSS structure with loading, empty, and error states.
// Column definitions are passed as props — each page defines its own columns.
// Does not handle sorting or filtering — those belong at the page level.
import React from 'react';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

export interface Column<T> {
    key: string;
    header: string;
    width?: string;   // CSS grid template column value e.g. "1fr", "120px"
    sortable?: boolean;
    render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    error?: string | null;
    emptyTitle?: string;
    emptyDescription?: string;
    onRowClick?: (row: T) => void;
    getRowKey: (row: T) => string;
    // Sort state — controlled by parent
    sortKey?: string;
    sortDir?: 'asc' | 'desc';
    onSort?: (key: string) => void;
}

export function DataTable<T>({
    columns,
    data,
    loading = false,
    error = null,
    emptyTitle = 'No records found',
    emptyDescription,
    onRowClick,
    getRowKey,
    sortKey,
    sortDir,
    onSort,
}: DataTableProps<T>) {
    // Build CSS grid template from column widths
    const gridTemplate = columns
        .map((c) => c.width ?? '1fr')
        .join(' ');

    if (error) {
        return (
            <div className="data-table">
                <EmptyState
                    icon="⚠"
                    title="Failed to load data"
                    description={error}
                />
            </div>
        );
    }

    return (
        <div className="data-table" role="table" aria-busy={loading}>
            {/* Header */}
            <div
                className="data-table-header data-table-header-grid"
                role="row"
                style={{ gridTemplateColumns: gridTemplate }}
            >
                {columns.map((col) => (
                    <div
                        key={col.key}
                        role="columnheader"
                        className={[
                            'data-table-header-cell',
                            col.sortable ? 'sortable' : '',
                            sortKey === col.key ? 'sorted' : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => col.sortable && onSort?.(col.key)}
                        aria-sort={
                            sortKey === col.key
                                ? sortDir === 'asc' ? 'ascending' : 'descending'
                                : undefined
                        }
                    >
                        {col.header}
                        {col.sortable && sortKey === col.key && (
                            <svg
                                width="10" height="10" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round"
                                style={{
                                    transform: sortDir === 'asc'
                                        ? 'rotate(180deg)'
                                        : 'none',
                                    transition: 'transform 150ms ease',
                                    flexShrink: 0,
                                }}
                                aria-hidden="true"
                            >
                                <path d="M12 5v14M5 12l7 7 7-7" />
                            </svg>
                        )}
                    </div>
                ))}
            </div>

            {/* Body */}
            {loading ? (
                <Spinner fullPage label="Loading records…" />
            ) : data.length === 0 ? (
                <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                />
            ) : (
                data.map((row) => (
                    <div
                        key={getRowKey(row)}
                        className={[
                            'data-row',
                            onRowClick ? '' : 'static',
                        ].filter(Boolean).join(' ')}
                        role="row"
                        style={{ gridTemplateColumns: gridTemplate }}
                        onClick={() => onRowClick?.(row)}
                        tabIndex={onRowClick ? 0 : undefined}
                        onKeyDown={(e) => {
                            if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                                e.preventDefault();
                                onRowClick(row);
                            }
                        }}
                    >
                        {columns.map((col) => (
                            <div
                                key={col.key}
                                className="data-cell"
                                role="cell"
                            >
                                {col.render(row)}
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}