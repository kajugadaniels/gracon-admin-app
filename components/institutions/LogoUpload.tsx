// LogoUpload handles institution logo selection with preview.
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui';

interface LogoUploadProps {
    label: string;
    currentUrl?: string | null;
    onFileChange: (file: File | null) => void;
    onRemove?: () => void;
}

/**
 * Lightweight institution logo uploader with client-side preview.
 */
export function LogoUpload({
    label,
    currentUrl,
    onFileChange,
    onRemove,
}: LogoUploadProps) {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    const preview = objectUrl ?? currentUrl ?? null;

    const handleFileChange = (file: File | null) => {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
            setObjectUrl(null);
        }
        onFileChange(file);
        if (file) {
            setObjectUrl(URL.createObjectURL(file));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {label}
            </span>
            <div style={previewWrapStyle}>
                {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="Institution logo preview" style={imageStyle} />
                ) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>No logo selected</span>
                )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Button type="button" variant="secondary" onClick={() => document.getElementById('institution-logo-input')?.click()}>
                    {preview ? 'Replace Logo' : 'Choose Logo'}
                </Button>
                {onRemove && (
                    <Button type="button" variant="ghost" onClick={onRemove}>
                        Remove
                    </Button>
                )}
            </div>
            <input
                id="institution-logo-input"
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                hidden
                onChange={(event) => {
                    handleFileChange(event.target.files?.[0] ?? null);
                }}
            />
        </div>
    );
}

const previewWrapStyle: React.CSSProperties = {
    width: 120,
    height: 120,
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--border)',
    background: 'var(--glass-interactive)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
};

const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
};
