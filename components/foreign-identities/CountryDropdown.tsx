'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';

const COUNTRY_CODES = Array.from(
    new Set([
        'AF', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW',
        'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM',
        'BT', 'BO', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'KH',
        'CM', 'CA', 'CV', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM',
        'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DJ', 'DM',
        'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FK', 'FO', 'FJ', 'FI',
        'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL',
        'GD', 'GP', 'GU', 'GT', 'GN', 'GW', 'GY', 'HT', 'HM', 'VA', 'HN', 'HK',
        'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT', 'JM', 'JP', 'JO',
        'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR',
        'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT',
        'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS',
        'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG',
        'NU', 'NF', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE',
        'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH',
        'KN', 'LC', 'MF', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC',
        'SL', 'SG', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'ES', 'LK', 'SD', 'SR',
        'SJ', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK',
        'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US',
        'UM', 'UY', 'UZ', 'VU', 'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM',
        'ZW', 'AX', 'BQ', 'CW', 'GG', 'IM', 'JE', 'SS', 'SX',
    ]),
);

export interface CountryOption {
    code: string;
    name: string;
}

function createCountryOptions(): CountryOption[] {
    const names = new Intl.DisplayNames(['en'], { type: 'region' });
    return COUNTRY_CODES
        .map((code) => ({ code, name: names.of(code) ?? code }))
        .sort((left, right) => left.name.localeCompare(right.name));
}

export const COUNTRY_OPTIONS = createCountryOptions();

export function getCountryName(code: string | null | undefined): string {
    if (!code) return 'Unknown';
    return COUNTRY_OPTIONS.find((item) => item.code === code)?.name ?? code;
}

interface CountryDropdownProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
    disabled?: boolean;
}

function CountryRow({
    code,
    name,
    onSelect,
}: CountryOption & { onSelect: (code: string) => void }) {
    return (
        <button
            type="button"
            onClick={() => onSelect(code)}
            style={countryRowStyle}
        >
            <ReactCountryFlag countryCode={code} svg style={{ fontSize: '1rem' }} />
            <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>{name}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11 }}>
                {code}
            </span>
        </button>
    );
}

function CountryTrigger({
    open,
    disabled,
    selected,
    placeholder,
    onClick,
}: {
    open: boolean;
    disabled?: boolean;
    selected?: CountryOption;
    placeholder: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-expanded={open}
            style={triggerStyle}
        >
            {selected ? (
                <>
                    <ReactCountryFlag
                        countryCode={selected.code}
                        svg
                        style={{ fontSize: '1rem' }}
                    />
                    <span style={{ color: 'var(--text-primary)', fontSize: 13 }}>
                        {selected.name}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                        {selected.code}
                    </span>
                </>
            ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {placeholder}
                </span>
            )}
            <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>▾</span>
        </button>
    );
}

export function CountryDropdown({
    label,
    value,
    onChange,
    error,
    placeholder = 'Select country',
    disabled,
}: CountryDropdownProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');

    const selected = COUNTRY_OPTIONS.find((item) => item.code === value);
    const filtered = useMemo(() => {
        const needle = query.trim().toLowerCase();
        if (!needle) return COUNTRY_OPTIONS;
        return COUNTRY_OPTIONS.filter((item) =>
            `${item.name} ${item.code}`.toLowerCase().includes(needle),
        );
    }, [query]);

    useEffect(() => {
        if (!open) return;
        const handleOutsideClick = (event: MouseEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [open]);

    const handleSelect = (code: string) => {
        onChange(code);
        setOpen(false);
        setQuery('');
    };

    return (
        <div ref={rootRef} style={{ display: 'flex', flexDirection: 'column', gap: 4, position: 'relative' }}>
            {label && (
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {label}
                </label>
            )}

            <CountryTrigger
                open={open}
                disabled={disabled}
                selected={selected}
                placeholder={placeholder}
                onClick={() => setOpen((current) => !current)}
            />

            {error && (
                <span role="alert" style={{ fontSize: 12, color: 'var(--error-text)' }}>
                    {error}
                </span>
            )}

            {open && (
                <div className="glass-overlay" style={panelStyle}>
                    <input
                        autoFocus
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search country"
                        className="input"
                    />
                    <div style={listStyle}>
                        {filtered.map((country) => (
                            <CountryRow
                                key={country.code}
                                {...country}
                                onSelect={handleSelect}
                            />
                        ))}
                        {filtered.length === 0 && (
                            <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '10px 12px' }}>
                                No country matches your search.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const triggerStyle: React.CSSProperties = {
    width: '100%',
    minHeight: 38,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '0 12px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--glass-panel-border)',
    background: 'rgba(255, 255, 255, 0.90)',
    cursor: 'pointer',
    textAlign: 'left',
};

const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    zIndex: 50,
    borderRadius: 'var(--radius-lg)',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.14)',
};

const listStyle: React.CSSProperties = {
    maxHeight: 240,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
};

const countryRowStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 10px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    background: 'var(--glass-interactive)',
    cursor: 'pointer',
};
