// API client for admin certificate-management pages.
import { createAuthedApiClient } from '@/api/common/axios-factory';
import type {
    CertificateDetail,
    CertificateFilters,
    PaginatedCertificatesResponse,
    ReissueCertificateInput,
    RevokeCertificateInput,
} from './certificates.types';

const SIGNATURE_API_URL =
    process.env.NEXT_PUBLIC_SIGNATURE_API_URL ??
    'http://localhost:3002/api/v1';

const certificatesClient = createAuthedApiClient(SIGNATURE_API_URL);

/**
 * Lists personal certificates across all users for admins.
 */
export function listCertificates(params: CertificateFilters) {
    return certificatesClient.get<PaginatedCertificatesResponse>(
        '/admin/certificates',
        { params },
    );
}

/**
 * Fetches one certificate detail payload.
 */
export function getCertificate(certificateId: string) {
    return certificatesClient.get<CertificateDetail>(
        `/admin/certificates/${certificateId}`,
    );
}

/**
 * Downloads certificate PEM content.
 */
export function downloadCertificatePem(certificateId: string) {
    return certificatesClient.get<string>(
        `/admin/certificates/${certificateId}/download/pem`,
        { responseType: 'text' as const },
    );
}

/**
 * Downloads certificate DER bytes.
 */
export function downloadCertificateDer(certificateId: string) {
    return certificatesClient.get<Blob>(
        `/admin/certificates/${certificateId}/download/der`,
        { responseType: 'blob' },
    );
}

/**
 * Revokes one certificate from the admin dashboard.
 */
export function revokeCertificate(
    certificateId: string,
    data: RevokeCertificateInput,
) {
    return certificatesClient.post<CertificateDetail>(
        `/admin/certificates/${certificateId}/revoke`,
        data,
    );
}

/**
 * Reissues a certificate for the same user.
 */
export function reissueCertificate(
    certificateId: string,
    data: ReissueCertificateInput,
) {
    return certificatesClient.post<CertificateDetail>(
        `/admin/certificates/${certificateId}/reissue`,
        data,
    );
}
