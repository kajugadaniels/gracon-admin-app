import { AxiosResponse } from 'axios';
import { createAdminApiClient } from '@/api/client';
import type {
    DecryptedPassportResponse,
    ForeignIdentityImageResponse,
    ForeignIdentityProfile,
    ListForeignIdentitiesParams,
    PaginatedForeignIdentitiesResponse,
    RegisterForeignIdentityInput,
    UpdateForeignIdentityInput,
} from './foreign-identity.types';

const foreignIdentityClient = createAdminApiClient(
    process.env.NEXT_PUBLIC_FOREIGN_IDENTITY_API_URL!,
);

interface ReasonPayload {
    reason: string;
}

function buildImageFormData(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return formData;
}

export function registerForeignIdentity(data: RegisterForeignIdentityInput) {
    return foreignIdentityClient.post<ForeignIdentityProfile>(
        '/foreign-identities/register',
        data,
    );
}

export function listForeignIdentities(params?: ListForeignIdentitiesParams) {
    return foreignIdentityClient.get<PaginatedForeignIdentitiesResponse>(
        '/foreign-identities',
        { params },
    );
}

export function lookupForeignIdentity(passportNumber: string) {
    return foreignIdentityClient.get<ForeignIdentityProfile>(
        '/foreign-identities/lookup',
        { params: { passportNumber } },
    );
}

export function getForeignIdentity(fin: string) {
    return foreignIdentityClient.get<ForeignIdentityProfile>(
        `/foreign-identities/${fin}`,
    );
}

export function updateForeignIdentity(
    fin: string,
    data: UpdateForeignIdentityInput,
) {
    return foreignIdentityClient.post<ForeignIdentityProfile>(
        `/foreign-identities/${fin}/update`,
        data,
    );
}

export function deactivateForeignIdentity(fin: string, reason: string) {
    return foreignIdentityClient.post<ForeignIdentityProfile, AxiosResponse<ForeignIdentityProfile>, ReasonPayload>(
        `/foreign-identities/${fin}/deactivate`,
        { reason },
    );
}

export function reactivateForeignIdentity(fin: string, reason: string) {
    return foreignIdentityClient.post<ForeignIdentityProfile, AxiosResponse<ForeignIdentityProfile>, ReasonPayload>(
        `/foreign-identities/${fin}/reactivate`,
        { reason },
    );
}

export function decryptPassport(fin: string, reason: string) {
    return foreignIdentityClient.post<DecryptedPassportResponse, AxiosResponse<DecryptedPassportResponse>, ReasonPayload>(
        `/foreign-identities/${fin}/decrypt-passport`,
        { reason },
    );
}

export function uploadImage(fin: string, file: File) {
    return foreignIdentityClient.post<ForeignIdentityProfile>(
        `/foreign-identities/${fin}/image`,
        buildImageFormData(file),
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    );
}

export function getImage(fin: string) {
    return foreignIdentityClient.get<ForeignIdentityImageResponse>(
        `/foreign-identities/${fin}/image`,
    );
}

export function deleteImage(fin: string) {
    return foreignIdentityClient.delete<ForeignIdentityProfile>(
        `/foreign-identities/${fin}/image`,
    );
}
