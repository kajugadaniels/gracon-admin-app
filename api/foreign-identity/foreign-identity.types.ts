export type ForeignGender = 'MALE' | 'FEMALE';
export type MaritalStatus = 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';

export interface ForeignIdentityProfile {
    fin: string;
    firstName: string;
    lastName: string;
    gender: ForeignGender;
    dateOfBirth: string;
    countryOfOrigin: string;
    nationality: string;
    maritalStatus: MaritalStatus;
    imageUrl: string | null;
    issuanceVersion: number;
    isActive: boolean;
    registeredByAdminId: string;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterForeignIdentityInput {
    firstName: string;
    lastName: string;
    passportNumber: string;
    gender: ForeignGender;
    dateOfBirth: string;
    countryOfOrigin: string;
    nationality: string;
    maritalStatus: MaritalStatus;
}

export interface UpdateForeignIdentityInput {
    firstName?: string;
    lastName?: string;
    nationality?: string;
    maritalStatus?: MaritalStatus;
    reason?: string;
}

export interface ListForeignIdentitiesParams {
    page?: number;
    limit?: number;
    countryOfOrigin?: string;
    gender?: ForeignGender;
    maritalStatus?: MaritalStatus;
    includeInactive?: boolean;
    search?: string;
}

export interface PaginatedForeignIdentitiesResponse {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    items: ForeignIdentityProfile[];
}

export interface DecryptedPassportResponse {
    fin: string;
    passportNumber: string;
    decryptedAt: string;
    decryptedByAdminId: string;
}

export interface ForeignIdentityImageResponse {
    fin: string;
    url: string;
    expiresInSeconds: number;
}
