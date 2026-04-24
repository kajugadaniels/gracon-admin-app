// Typed contracts for admin stamp-management pages.
import type { PaginatedResponse } from '@/api/common/pagination.types';

export type StampVerificationStatus = 'VALID' | 'INVALID';

export interface StampListItem {
    stampId: string;
    institutionId: string;
    institutionName: string;
    documentHash: string;
    stampedBy: string;
    coSigner: string;
    stampedAt: string;
    verificationStatus: StampVerificationStatus;
}

export interface StampChainActor {
    memberId: string;
    name: string;
    role: string;
    signedAt: string;
}

export interface StampAuthorityChain {
    resolutionId: string;
    resolutionTitle: string;
    validAtStampTime: boolean;
}

export interface StampCertificateSummary {
    certificateId: string;
    serialNumber: string;
}

export interface StampVerificationSummary {
    cryptographicValidity: boolean;
    signatureChainStatus: string;
    certificateValidityAtStampTime: string;
}

export interface StampDetail {
    stampId: string;
    institutionId: string;
    institutionName: string;
    documentHash: string;
    primarySigner: StampChainActor;
    coSigner: StampChainActor;
    authorityChain: StampAuthorityChain;
    certificate: StampCertificateSummary;
    verification: StampVerificationSummary;
    rawSignatureBytes: string;
    stampedAt: string;
}

export interface StampFilters {
    page?: number;
    limit?: number;
    search?: string;
    institutionId?: string;
    verificationStatus?: StampVerificationStatus | '';
    stampedFrom?: string;
    stampedTo?: string;
}

export type PaginatedStampsResponse = PaginatedResponse<StampListItem>;
