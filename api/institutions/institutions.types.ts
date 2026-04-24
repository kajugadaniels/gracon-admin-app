// Typed contracts for admin institution-management pages.
import type { PaginatedResponse } from '@/api/common/pagination.types';

export type InstitutionType =
    | 'COMPANY'
    | 'NGO'
    | 'GOVERNMENT'
    | 'OTHER';

export type InstitutionStatus = 'ACTIVE' | 'INACTIVE';
export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';
export type VerificationStatus = 'VALID' | 'INVALID' | 'UNKNOWN';

export interface InstitutionListItem {
    institutionId: string;
    name: string;
    logoUrl: string | null;
    type: InstitutionType;
    country: string;
    registrationNumber: string;
    memberCount: number;
    stampsIssued: number;
    status: InstitutionStatus;
    createdAt: string;
}

export interface InstitutionMemberItem {
    memberId: string;
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
    status: MemberStatus;
    joinedAt: string;
    isOwner: boolean;
}

export interface AuthorityResolutionItem {
    resolutionId: string;
    title: string;
    grantedToName: string;
    authorityScope: string;
    validFrom: string;
    validTo: string | null;
    status: InstitutionStatus;
    documentUrl: string | null;
}

export interface InstitutionStampActivityItem {
    stampId: string;
    documentHash: string;
    stampedBy: string;
    coSigner: string;
    stampedAt: string;
    verificationStatus: VerificationStatus;
}

export interface InstitutionDetail {
    institutionId: string;
    name: string;
    type: InstitutionType;
    country: string;
    registrationNumber: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    taxIdentificationNumber: string | null;
    dateOfIncorporation: string | null;
    logoUrl: string | null;
    stampImageUrl: string | null;
    status: InstitutionStatus;
    createdAt: string;
    updatedAt: string;
    keyAlgorithm: string | null;
    keyCreatedAt: string | null;
    publicKeyFingerprint: string | null;
    certificateSerialNumber: string | null;
    certificateNotBefore: string | null;
    certificateNotAfter: string | null;
    certificateSubject: string | null;
    members: InstitutionMemberItem[];
    resolutions: AuthorityResolutionItem[];
}

export interface InstitutionFilters {
    page?: number;
    limit?: number;
    search?: string;
    type?: InstitutionType | '';
    country?: string;
    status?: InstitutionStatus | '';
}

export interface RegisterInstitutionInput {
    name: string;
    type: InstitutionType;
    country: string;
    registrationNumber: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxIdentificationNumber?: string;
    dateOfIncorporation?: string;
}

export interface InstitutionStatusReasonInput {
    reason: string;
}

export interface AddInstitutionMemberInput {
    userId: string;
    role: string;
}

export interface ChangeInstitutionRoleInput {
    role: string;
    reason: string;
}

export interface RemoveInstitutionMemberInput {
    reason: string;
}

export interface CreateResolutionInput {
    title: string;
    grantedToUserId: string;
    authorityScope: string;
    validFrom: string;
    validTo?: string;
}

export interface RevokeResolutionInput {
    reason: string;
}

export type PaginatedInstitutionsResponse =
    PaginatedResponse<InstitutionListItem>;
export type PaginatedInstitutionStampsResponse =
    PaginatedResponse<InstitutionStampActivityItem>;
