'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui';

interface ProfileImageUploadProps {
    mode?: 'dropzone' | 'compact';
    file: File | null;
    previewUrl?: string | null;
    disabled?: boolean;
    buttonLabel?: string;
    onFileChange: (file: File | null) => void;
}

function readPreview(file: File | null, previewUrl?: string | null) {
    if (file) return null;
    return previewUrl ?? null;
}

function CompactPicker({
    disabled,
    buttonLabel,
    onPick,
}: {
    disabled?: boolean;
    buttonLabel: string;
    onPick: () => void;
}) {
    return (
        <Button type="button" size="sm" variant="secondary" onClick={onPick} disabled={disabled}>
            {buttonLabel}
        </Button>
    );
}

function Dropzone({
    disabled,
    preview,
    onDrop,
    onPick,
}: {
    disabled?: boolean;
    preview: string | null;
    onDrop: (file: File) => void;
    onPick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onPick}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
                event.preventDefault();
                const nextFile = event.dataTransfer.files.item(0);
                if (nextFile) onDrop(nextFile);
            }}
            disabled={disabled}
            style={dropzoneStyle}
        >
            {preview ? (
                <img src={preview} alt="Profile preview" style={previewStyle} />
            ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
                    Drag and drop a JPG or PNG here, or click to choose a file.
                </span>
            )}
        </button>
    );
}

export function ProfileImageUpload({
    mode = 'dropzone',
    file,
    previewUrl,
    disabled,
    buttonLabel = 'Choose image',
    onFileChange,
}: ProfileImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localPreview, setLocalPreview] = useState<string | null>(null);
    const preview = useMemo(() => readPreview(file, previewUrl), [file, previewUrl]);

    const resolvedPreview = localPreview ?? preview;
    const handlePick = () => inputRef.current?.click();
    const handleFileChange = (nextFile: File | null) => {
        if (localPreview) URL.revokeObjectURL(localPreview);
        setLocalPreview(nextFile ? URL.createObjectURL(nextFile) : null);
        onFileChange(nextFile);
    };

    useEffect(() => {
        return () => {
            if (localPreview) URL.revokeObjectURL(localPreview);
        };
    }, [localPreview]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg"
                hidden
                onChange={(event) => handleFileChange(event.target.files?.item(0) ?? null)}
            />
            {mode === 'compact' ? (
                <CompactPicker
                    disabled={disabled}
                    buttonLabel={buttonLabel}
                    onPick={handlePick}
                />
            ) : (
                <Dropzone
                    disabled={disabled}
                    preview={resolvedPreview}
                    onDrop={handleFileChange}
                    onPick={handlePick}
                />
            )}
            {resolvedPreview && mode === 'dropzone' && (
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleFileChange(null)}
                    disabled={disabled}
                >
                    Remove selected image
                </Button>
            )}
        </div>
    );
}

const dropzoneStyle: React.CSSProperties = {
    minHeight: 180,
    borderRadius: 'var(--radius-lg)',
    border: '1px dashed var(--glass-overlay-border)',
    background: 'var(--glass-interactive)',
    padding: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    overflow: 'hidden',
};

const previewStyle: React.CSSProperties = {
    width: '100%',
    maxHeight: 220,
    objectFit: 'cover',
    borderRadius: 'var(--radius-md)',
};
