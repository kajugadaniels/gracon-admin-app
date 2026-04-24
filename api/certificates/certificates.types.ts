// Typed contracts for admin certificate-management pages.
import type { PaginatedResponse } from '@/api/common/pagination.types';

export type IdentityType = 'NID' | 'FIN';
export type CertificateStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';
export type CrlReasonCode =
    | 'keyCompromise'
    | 'affiliationChanged'
    | 'superseded'
    | 'cessationOfOperation'
    | 'unspecified';

export interface CertificateListItem {
    certificateId: string;
    userId: string;
    userName: string;
    identityType: IdentityType;
    country: string;
    issuedAt: string;
    expiresAt: string;
    daysToExpiry: number;
    status: CertificateStatus;
}

export interface ParsedDistinguishedName {
    commonName: string;
    organization: string;
    organizationalUnit?: string | null;
    country: string;
    serialNumber?: string | null;
    subjectUserId?: string | null;
}

export interface CertificateDetail {
    certificateId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userImageUrl: string | null;
    identityType: IdentityType;
    serialNumber: string;
    issuer: ParsedDistinguishedName;
    subject: ParsedDistinguishedName;
    keyAlgorithm: string;
    keySize: number | null;
    fingerprintSha256: string;
    certificatePem: string;
    issuedAt: string;
    notBefore: string;
    notAfter: string;
    revokedAt: string | null;
    revokedReason: string | null;
    status: CertificateStatus;
}

export interface CertificateFilters {
    page?: number;
    limit?: number;
    search?: string;
    identityType?: IdentityType | '';
    status?: CertificateStatus | '';
    country?: string;
    expiringSoon?: boolean;
}

export interface RevokeCertificateInput {
    reason: string;
    crlReasonCode: CrlReasonCode;
}

export interface ReissueCertificateInput {
    reason: string;
}

export type PaginatedCertificatesResponse =
    PaginatedResponse<CertificateListItem>;
