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

const FOREIGN_IDENTITY_API_URL =
    process.env.NEXT_PUBLIC_FOREIGN_IDENTITY_API_URL ??
    'http://localhost:3006/api/v1';

const foreignIdentityClient = createAdminApiClient(
    FOREIGN_IDENTITY_API_URL,
);

const LIST_REQUEST_COOLDOWN_MS = 800;

let pendingListRequest:
    | {
        key: string;
        promise: Promise<AxiosResponse<PaginatedForeignIdentitiesResponse>>;
    }
    | null = null;

let recentListResponse:
    | {
        key: string;
        response: AxiosResponse<PaginatedForeignIdentitiesResponse>;
        expiresAt: number;
    }
    | null = null;

interface ReasonPayload {
    reason: string;
}

function buildImageFormData(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return formData;
}

function buildListRequestKey(params?: ListForeignIdentitiesParams) {
    return JSON.stringify({
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        countryOfOrigin: params?.countryOfOrigin ?? '',
        gender: params?.gender ?? '',
        maritalStatus: params?.maritalStatus ?? '',
        includeInactive: params?.includeInactive ?? false,
        search: params?.search ?? '',
    });
}

export function registerForeignIdentity(data: RegisterForeignIdentityInput) {
    return foreignIdentityClient.post<ForeignIdentityProfile>(
        '/foreign-identities/register',
        data,
    );
}

export function listForeignIdentities(params?: ListForeignIdentitiesParams) {
    const key = buildListRequestKey(params);
    const now = Date.now();

    if (pendingListRequest?.key === key) {
        return pendingListRequest.promise;
    }

    if (recentListResponse?.key === key && recentListResponse.expiresAt > now) {
        return Promise.resolve(recentListResponse.response);
    }

    const promise = foreignIdentityClient.get<PaginatedForeignIdentitiesResponse>(
        '/foreign-identities',
        { params },
    );

    pendingListRequest = { key, promise };

    promise
        .then((response) => {
            recentListResponse = {
                key,
                response,
                expiresAt: Date.now() + LIST_REQUEST_COOLDOWN_MS,
            };
        })
        .finally(() => {
            if (pendingListRequest?.key === key) {
                pendingListRequest = null;
            }
        });

    return promise;
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
