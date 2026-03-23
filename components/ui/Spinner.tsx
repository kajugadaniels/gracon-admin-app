// Full-page and inline loading spinner.
// fullPage: centers in the available space — used while data fetches.
// inline: small inline version — used inside table cells and detail sections.
import React from 'react';

interface SpinnerProps {
    fullPage?: boolean;
    size?: number;
    label?: string;   // screen-reader label
}

export function Spinner({
    fullPage = false,
    size = 20,
    label = 'Loading',
}: SpinnerProps) {
    const spinner = (
        <svg
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill="none"
            style={{ animation: 'btn-spin 0.7s linear infinite', flexShrink: 0 }}
            aria-label={label}
            role="status"
        >
            <circle
                cx="10" cy="10" r="8"
                stroke="var(--border-strong)"
                strokeWidth="2"
            />
            <path
                d="M10 2a8 8 0 0 1 8 8"
                stroke="var(--primary)"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );

    if (!fullPage) return spinner;

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                height: '100%',
                minHeight: 200,
                color: 'var(--text-muted)',
                fontSize: 13,
            }}
        >
            {spinner}
            {label !== 'Loading' && <span>{label}</span>}
        </div>
    );
}