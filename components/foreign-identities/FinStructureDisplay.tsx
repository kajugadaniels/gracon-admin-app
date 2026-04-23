import React from 'react';

interface FinStructureDisplayProps {
    fin: string;
    gender: 'MALE' | 'FEMALE';
}

interface FinSegment {
    label: string;
    value: string;
    helper: string;
}

function buildSegments(fin: string, gender: 'MALE' | 'FEMALE'): FinSegment[] {
    return [
        { label: 'Foreigner', value: fin.slice(0, 1), helper: 'Registry marker' },
        { label: 'Birth Year', value: fin.slice(1, 5), helper: 'Positions 2–5' },
        { label: 'Gender', value: fin.slice(5, 6), helper: gender === 'MALE' ? 'Male marker' : 'Female marker' },
        { label: 'Sequence', value: fin.slice(6, 13), helper: 'Issuance order' },
        { label: 'Issuance', value: fin.slice(13, 14), helper: 'Update count' },
        { label: 'Checksum', value: fin.slice(14, 16), helper: 'Integrity digits' },
    ];
}

function SegmentCard({ helper, label, value }: FinSegment) {
    return (
        <div
            style={{
                minWidth: 110,
                flex: '1 1 120px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-interactive-border)',
                background: 'var(--glass-interactive)',
                padding: '12px 14px',
            }}
        >
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                {label}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                {value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {helper}
            </div>
        </div>
    );
}

export function FinStructureDisplay({ fin, gender }: FinStructureDisplayProps) {
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {buildSegments(fin, gender).map((segment) => (
                <SegmentCard key={segment.label} {...segment} />
            ))}
        </div>
    );
}
