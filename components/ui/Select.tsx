// Select primitive — wraps native select with consistent admin styling.
// Native select is deliberate — custom dropdowns are accessibility nightmares.
import React from 'react';

interface SelectOption {
    value: string | number;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    function Select(
        { label, error, options, placeholder, className = '', id, ...props },
        ref,
    ) {
        const selectId = id ?? `select-${Math.random().toString(36).slice(2, 7)}`;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {label && (
                    <label
                        htmlFor={selectId}
                        style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={['select', className].filter(Boolean).join(' ')}
                    style={{ borderColor: error ? 'var(--error-border)' : undefined }}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <span role="alert" style={{ fontSize: 12, color: 'var(--error)' }}>
                        {error}
                    </span>
                )}
            </div>
        );
    },
);