// Input primitive with optional label, error state, and search variant.
// Forwarded ref so react-hook-form register() works directly.
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    // Shows a magnifying glass icon — use for search inputs
    search?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    function Input(
        { label, error, hint, search = false, className = '', style, id, ...props },
        ref,
    ) {
        // Generate a stable id if none provided — needed for label htmlFor
        const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {label && (
                    <label
                        htmlFor={inputId}
                        style={{
                            fontSize: 12,
                            fontWeight: 500,
                            color: 'var(--text-secondary)',
                        }}
                    >
                        {label}
                    </label>
                )}

                {search ? (
                    <div className="input-search-wrap">
                        {/* Search icon */}
                        <span className="input-search-icon">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            ref={ref}
                            id={inputId}
                            className={[
                                'input',
                                error ? 'input-error' : '',
                                className,
                            ].filter(Boolean).join(' ')}
                            style={{
                                borderColor: error ? 'var(--error-border)' : undefined,
                                ...style,
                            }}
                            aria-describedby={error ? `${inputId}-error` : undefined}
                            aria-invalid={!!error}
                            {...props}
                        />
                    </div>
                ) : (
                    <input
                        ref={ref}
                        id={inputId}
                        className={[
                            'input',
                            error ? 'input-error' : '',
                            className,
                        ].filter(Boolean).join(' ')}
                        style={{
                            borderColor: error ? 'var(--error-border)' : undefined,
                            ...style,
                        }}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                        aria-invalid={!!error}
                        {...props}
                    />
                )}

                {error && (
                    <span
                        id={`${inputId}-error`}
                        role="alert"
                        style={{ fontSize: 12, color: 'var(--error)' }}
                    >
                        {error}
                    </span>
                )}

                {hint && !error && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {hint}
                    </span>
                )}
            </div>
        );
    },
);
Input.displayName = 'Input';