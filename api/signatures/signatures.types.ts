// Typed contracts for admin signature-management pages.
import type { PaginatedResponse } from '@/api/common/pagination.types';

export type SignatureAlgorithm = 'RSA_2048' | 'ED25519';
export type SignatureStatus = 'ACTIVE' | 'REVOKED';
export type VerificationStatus = 'VALID' | 'INVALID' | 'UNKNOWN';

export interface SignatureListItem {
    signatureId: string;
    userId: string;
    userName: string;
    userEmail: string;
    algorithm: SignatureAlgorithm;
    createdAt: string;
    lastUsedAt: string | null;
    documentsSigned: number;
    status: SignatureStatus;
}

export interface SignatureDocumentItem {
    documentId: string;
    documentHash: string;
    documentName: string;
    signedAt: string;
    verificationStatus: VerificationStatus;
    documentSource: string;
}

export interface SignatureAuditItem {
    id: string;
    action: string;
    actorName: string;
    actorRole: 'ADMIN' | 'SUPER_ADMIN';
    createdAt: string;
    metadata?: Record<string, string | number | boolean | null>;
}

export interface SignatureDetail {
    signatureId: string;
    userId: string;
    userName: string;
    userEmail: string;
    userImageUrl: string | null;
    algorithm: SignatureAlgorithm;
    createdAt: string;
    lastUsedAt: string | null;
    status: SignatureStatus;
    documentsSigned: number;
    auditLog: SignatureAuditItem[];
}

export interface SignatureFilters {
    page?: number;
    limit?: number;
    search?: string;
    algorithm?: SignatureAlgorithm | '';
    status?: SignatureStatus | '';
    createdFrom?: string;
    createdTo?: string;
}

export interface RevokeSignatureInput {
    reason: string;
}

export type PaginatedSignaturesResponse = PaginatedResponse<SignatureListItem>;
export type PaginatedSignatureDocumentsResponse =
    PaginatedResponse<SignatureDocumentItem>;
