// CertificateDownloadButtons handles PEM and DER downloads from the admin detail page.
'use client';

import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import {
    downloadCertificateDer,
    downloadCertificatePem,
} from '@/api/certificates/certificates.api';
import { getFriendlyErrorMessage } from '@/lib/http';

interface CertificateDownloadButtonsProps {
    certificateId: string;
}

function triggerDownload(name: string, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
}

/**
 * Certificate download actions for PEM and DER variants.
 */
export function CertificateDownloadButtons({
    certificateId,
}: CertificateDownloadButtonsProps) {
    const handlePem = async () => {
        try {
            const response = await downloadCertificatePem(certificateId);
            triggerDownload(
                `${certificateId}.pem`,
                new Blob([response.data], { type: 'text/plain' }),
            );
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, 'Failed to download PEM.'));
        }
    };

    const handleDer = async () => {
        try {
            const response = await downloadCertificateDer(certificateId);
            triggerDownload(`${certificateId}.der`, response.data);
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, 'Failed to download DER.'));
        }
    };

    return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button type="button" variant="secondary" onClick={handlePem}>
                Download PEM
            </Button>
            <Button type="button" variant="ghost" onClick={handleDer}>
                Download DER
            </Button>
        </div>
    );
}
