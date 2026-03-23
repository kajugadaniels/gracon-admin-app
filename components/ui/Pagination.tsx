// Pagination controls — page numbers with prev/next.
// Shows at most 7 page buttons — collapses with ellipsis beyond that.
// This is the pattern used by GitHub, Linear, and Vercel dashboards.
// Never show more than 7 — beyond that it becomes noise not navigation.
import React from 'react';

interface PaginationProps {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onChange: (page: number) => void;
}

export function Pagination({
    page,
    totalPages,
    total,
    limit,
    onChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    // Build the page number array with ellipsis
    const buildPages = (): (number | '...')[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | '...')[] = [1];

        if (page > 3) pages.push('...');
        for (
            let i = Math.max(2, page - 1);
            i <= Math.min(totalPages - 1, page + 1);
            i++
        ) {
            pages.push(i);
        }
        if (page < totalPages - 2) pages.push('...');
        pages.push(totalPages);

        return pages;
    };

    const pages = buildPages();
    const fromItem = (page - 1) * limit + 1;
    const toItem = Math.min(page * limit, total);

    const btnStyle = (isActive: boolean, isDisabled = false): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 28,
        height: 28,
        borderRadius: 'var(--radius)',
        fontSize: 12,
        fontWeight: isActive ? 600 : 400,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        border: isActive
            ? '1px solid var(--primary-border)'
            : '1px solid var(--border)',
        background: isActive ? 'var(--primary-muted)' : 'transparent',
        color: isActive
            ? 'var(--primary)'
            : isDisabled
                ? 'var(--text-disabled)'
                : 'var(--text-secondary)',
        transition: 'background 100ms ease, border-color 100ms ease',
        userSelect: 'none',
        fontFamily: 'var(--font-sans)',
    });

    return (
        <div
            className="pagination"
            role="navigation"
            aria-label="Pagination"
        >
            {/* Previous */}
            <button
                style={btnStyle(false, page === 1)}
                onClick={() => page > 1 && onChange(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                >
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>

            {/* Page numbers */}
            {pages.map((p, i) =>
                p === '...' ? (
                    <span
                        key={`ellipsis-${i}`}
                        style={{
                            width: 28,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 12,
                            color: 'var(--text-muted)',
                        }}
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={p}
                        style={btnStyle(p === page)}
                        onClick={() => onChange(p as number)}
                        aria-label={`Page ${p}`}
                        aria-current={p === page ? 'page' : undefined}
                    >
                        {p}
                    </button>
                ),
            )}

            {/* Next */}
            <button
                style={btnStyle(false, page === totalPages)}
                onClick={() => page < totalPages && onChange(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                >
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            {/* Record count */}
            <span className="pagination-info">
                {fromItem.toLocaleString()}–{toItem.toLocaleString()} of {total.toLocaleString()}
            </span>
        </div>
    );
}