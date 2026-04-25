// API client for admin certificate-management pages.
//
// These endpoints live in api/admin (the admin trust boundary) — never
// reach into api/signature directly from the admin app. The base URL is
// the admin API and routes are mounted under /certificates.
import { createAuthedApiClient } from '@/api/common/axios-factory';
import type {
    CertificateDetail,
    CertificateFilters,
    PaginatedCertificatesResponse,
    ReissueCertificateInput,
    RevokeCertificateInput,
} from './certificates.types';

const ADMIN_API_URL =
    process.env.NEXT_PUBLIC_ADMIN_API_URL ??
    'http://localhost:3001/api/v1';

const certificatesClient = createAuthedApiClient(ADMIN_API_URL);

/**
 * Lists personal certificates across all users for admins.
 */
export function listCertificates(params: CertificateFilters) {
    return certificatesClient.get<PaginatedCertificatesResponse>(
        '/certificates',
        { params },
    );
}

/**
 * Fetches one certificate detail payload.
 */
export function getCertificate(certificateId: string) {
    return certificatesClient.get<CertificateDetail>(
        `/certificates/${certificateId}`,
    );
}

/**
 * Downloads certificate PEM content.
 */
export function downloadCertificatePem(certificateId: string) {
    return certificatesClient.get<string>(
        `/certificates/${certificateId}/download/pem`,
        { responseType: 'text' as const },
    );
}

/**
 * Downloads certificate DER bytes.
 */
export function downloadCertificateDer(certificateId: string) {
    return certificatesClient.get<Blob>(
        `/certificates/${certificateId}/download/der`,
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
        `/certificates/${certificateId}/revoke`,
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
        `/certificates/${certificateId}/reissue`,
        data,
    );
}
