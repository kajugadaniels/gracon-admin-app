// Flat button primitive — no 3D effects, no shadows.
// Supports 4 variants, 2 sizes, icon-only mode, and loading state.
// Loading state shows a spinner and disables interaction —
// never let an admin double-submit a destructive action.
import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    iconOnly?: boolean;
    icon?: React.ReactNode;
    children?: React.ReactNode;
}

export function Button({
    variant = 'secondary',
    size = 'md',
    loading = false,
    iconOnly = false,
    icon,
    children,
    disabled,
    className = '',
    style,
    ...props
}: ButtonProps) {
    const classes = [
        'btn',
        `btn-${variant}`,
        size === 'sm' ? 'btn-sm' : '',
        iconOnly ? 'btn-icon' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const isDisabled = disabled || loading;

    return (
        <button
            className={classes}
            disabled={isDisabled}
            style={style}
            aria-busy={loading}
            {...props}
        >
            {loading ? (
                // Inline SVG spinner — no external dependency
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{ animation: 'btn-spin 0.7s linear infinite', flexShrink: 0 }}
                    aria-hidden="true"
                >
                    <circle
                        cx="7" cy="7" r="5.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeOpacity="0.25"
                    />
                    <path
                        d="M7 1.5a5.5 5.5 0 0 1 5.5 5.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            ) : icon ? (
                <span style={{ display: 'flex', flexShrink: 0 }} aria-hidden="true">
                    {icon}
                </span>
            ) : null}
            {!iconOnly && children && (
                <span>{loading ? 'Please wait…' : children}</span>
            )}
        </button>
    );
}