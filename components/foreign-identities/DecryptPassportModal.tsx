'use client';

import React from 'react';
import type { DecryptedPassportResponse } from '@/api/foreign-identity/foreign-identity.types';
import { SensitiveValueRevealModal } from '@/components/security/SensitiveValueRevealModal';

interface DecryptPassportModalProps {
    open: boolean;
    loading?: boolean;
    error?: string | null;
    result: DecryptedPassportResponse | null;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void> | void;
}

export function DecryptPassportModal({
    open,
    loading,
    error,
    result,
    onClose,
    onSubmit,
}: DecryptPassportModalProps) {
    return (
        <SensitiveValueRevealModal
            open={open}
            loading={loading}
            error={error}
            value={result?.passportNumber ?? null}
            resetKey={result?.decryptedAt ?? 'passport-reveal'}
            title="Request decrypted passport view"
            submitLabel="Decrypt Passport"
            warningText="Passport decryption is logged and rate-limited. Use only for documented legitimate reasons."
            doneText="This value will not be displayed again. Copy it now if needed."
            countdownSeconds={30}
            onClose={onClose}
            onSubmit={onSubmit}
        />
    );
}
