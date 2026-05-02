// Typed contracts for admin certificate-management pages.
import type { PaginatedResponse } from '@/api/common/pagination.types';

export type IdentityType = 'NID' | 'FIN';
export type CertificateStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';
export type CertificateRequestStatus =
    | 'PENDING'
    | 'APPROVED'
    | 'REJECTED'
    | 'CANCELLED';
export type CertificateAccessPolicyStatus = 'ALLOWED' | 'BANNED';
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
    certificateAccessPolicy: CertificateAccessPolicy;
}

export interface CertificateRequestListItem {
    requestId: string;
    userId: string;
    userName: string;
    userEmail: string;
    identityType: IdentityType;
    status: CertificateRequestStatus;
    requestedValidityYears: number;
    keyAlgorithm: string;
    requestedAt: string;
    reviewedAt: string | null;
    issuedCertificateId: string | null;
    certificateAccessPolicy: CertificateAccessPolicy;
}

export interface CertificateRequestDetail {
    requestId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userImageUrl: string | null;
    identityType: IdentityType;
    status: CertificateRequestStatus;
    requestedValidityYears: number;
    keyPairId: string;
    keyAlgorithm: string;
    keyFingerprint: string;
    keyCreatedAt: string;
    reviewReason: string | null;
    cancellationReason: string | null;
    reviewedByAdminId: string | null;
    reviewedAt: string | null;
    cancelledAt: string | null;
    issuedCertificateId: string | null;
    requestedAt: string;
    updatedAt: string;
    certificateAccessPolicy: CertificateAccessPolicy;
}

export interface CertificateAccessPolicy {
    status: CertificateAccessPolicyStatus;
    isBanned: boolean;
    banReason: string | null;
    bannedAt: string | null;
    unbanReason: string | null;
    unbannedAt: string | null;
    updatedAt: string | null;
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

export interface CertificateRequestFilters {
    page?: number;
    limit?: number;
    search?: string;
    status?: CertificateRequestStatus | '';
}

export interface RevokeCertificateInput {
    reason: string;
    crlReasonCode: CrlReasonCode;
}

export interface ReissueCertificateInput {
    reason: string;
}

export interface ReviewCertificateRequestInput {
    reason: string;
}

export interface CertificateAccessPolicyInput {
    reason: string;
}

export type PaginatedCertificatesResponse =
    PaginatedResponse<CertificateListItem>;
export type PaginatedCertificateRequestsResponse =
    PaginatedResponse<CertificateRequestListItem>;
