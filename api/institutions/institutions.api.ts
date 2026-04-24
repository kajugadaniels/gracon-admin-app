// API client for admin institution-management pages.
import { createAuthedApiClient } from '@/api/common/axios-factory';
import type {
    AddInstitutionMemberInput,
    ChangeInstitutionRoleInput,
    CreateResolutionInput,
    InstitutionDetail,
    InstitutionFilters,
    InstitutionStatusReasonInput,
    PaginatedInstitutionsResponse,
    PaginatedInstitutionStampsResponse,
    RegisterInstitutionInput,
    RemoveInstitutionMemberInput,
    RevokeResolutionInput,
} from './institutions.types';

const INSTITUTION_API_URL =
    process.env.NEXT_PUBLIC_INSTITUTION_API_URL ??
    'http://localhost:3004/api/v1';

const institutionsClient = createAuthedApiClient(INSTITUTION_API_URL);

function buildImageFormData(field: string, file: File) {
    const formData = new FormData();
    formData.append(field, file);
    return formData;
}

/**
 * Lists institutions for the admin dashboard.
 */
export function listInstitutions(params: InstitutionFilters) {
    return institutionsClient.get<PaginatedInstitutionsResponse>(
        '/admin/institutions',
        { params },
    );
}

/**
 * Creates a new institution.
 */
export function createInstitution(data: RegisterInstitutionInput) {
    return institutionsClient.post<InstitutionDetail>(
        '/admin/institutions',
        data,
    );
}

/**
 * Fetches one institution detail payload.
 */
export function getInstitution(institutionId: string) {
    return institutionsClient.get<InstitutionDetail>(
        `/admin/institutions/${institutionId}`,
    );
}

/**
 * Updates institution core profile fields.
 */
export function updateInstitution(
    institutionId: string,
    data: Partial<RegisterInstitutionInput>,
) {
    return institutionsClient.patch<InstitutionDetail>(
        `/admin/institutions/${institutionId}`,
        data,
    );
}

/**
 * Deactivates one institution.
 */
export function deactivateInstitution(
    institutionId: string,
    data: InstitutionStatusReasonInput,
) {
    return institutionsClient.post<InstitutionDetail>(
        `/admin/institutions/${institutionId}/deactivate`,
        data,
    );
}

/**
 * Reactivates one institution.
 */
export function reactivateInstitution(
    institutionId: string,
    data: InstitutionStatusReasonInput,
) {
    return institutionsClient.post<InstitutionDetail>(
        `/admin/institutions/${institutionId}/reactivate`,
        data,
    );
}

/**
 * Uploads or replaces an institution logo.
 */
export function uploadInstitutionLogo(institutionId: string, file: File) {
    return institutionsClient.post<InstitutionDetail>(
        `/admin/institutions/${institutionId}/logo`,
        buildImageFormData('logo', file),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
}

/**
 * Uploads or replaces an institution stamp image.
 */
export function uploadInstitutionStampImage(
    institutionId: string,
    file: File,
) {
    return institutionsClient.post<InstitutionDetail>(
        `/admin/institutions/${institutionId}/stamp-image`,
        buildImageFormData('stampImage', file),
        { headers: { 'Content-Type': 'multipart/form-data' } },
    );
}

/**
 * Removes the current institution logo.
 */
export function deleteInstitutionLogo(institutionId: string) {
    return institutionsClient.delete<InstitutionDetail>(
        `/admin/institutions/${institutionId}/logo`,
    );
}

/**
 * Removes the current institution stamp image.
 */
export function deleteInstitutionStampImage(institutionId: string) {
    return institutionsClient.delete<InstitutionDetail>(
        `/admin/institutions/${institutionId}/stamp-image`,
    );
}

/**
 * Lists institution stamp activity rows.
 */
export function listInstitutionStamps(
    institutionId: string,
    params: { page?: number; limit?: number },
) {
    return institutionsClient.get<PaginatedInstitutionStampsResponse>(
        `/admin/institutions/${institutionId}/stamps`,
        { params },
    );
}

/**
 * Adds a member to an institution.
 */
export function addInstitutionMember(
    institutionId: string,
    data: AddInstitutionMemberInput,
) {
    return institutionsClient.post<InstitutionDetail>(
        `/admin/institutions/${institutionId}/members`,
        data,
    );
}

/**
 * Changes one institution member role.
 */
export function changeInstitutionMemberRole(
    institutionId: string,
    memberId: string,
    data: ChangeInstitutionRoleInput,
) {
    return institutionsClient.post<InstitutionDetail>(
        `/admin/institutions/${institutionId}/members/${memberId}/role`,
        data,
    );
}

/**
 * Removes one institution member.
 */
export function removeInstitutionMember(
    institutionId: string,
    memberId: string,
    data: RemoveInstitutionMemberInput,
) {
    return institutionsClient.post<InstitutionDetail>(
        `/admin/institutions/${institutionId}/members/${memberId}/remove`,
        data,
    );
}

/**
 * Creates an authority resolution.
 */
export function createAuthorityResolution(
    institutionId: string,
    data: CreateResolutionInput,
) {
    return institutionsClient.post<InstitutionDetail>(
        `/admin/institutions/${institutionId}/resolutions`,
        data,
    );
}

/**
 * Revokes an authority resolution.
 */
export function revokeAuthorityResolution(
    institutionId: string,
    resolutionId: string,
    data: RevokeResolutionInput,
) {
    return institutionsClient.post<InstitutionDetail>(
        `/admin/institutions/${institutionId}/resolutions/${resolutionId}/revoke`,
        data,
    );
}
