import { AxiosError, AxiosResponse } from 'axios';
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
const LIST_SESSION_CACHE_TTL_MS = 15_000;
const LIST_SESSION_CACHE_PREFIX = 'foreign-identity:list:';

interface ApiResult<T> {
    data: T;
}

interface CachedListResponse {
    key: string;
    data: PaginatedForeignIdentitiesResponse;
    expiresAt: number;
}

let pendingListRequest:
    | {
        key: string;
        promise: Promise<ApiResult<PaginatedForeignIdentitiesResponse>>;
    }
    | null = null;

let recentListResponse:
    | {
        key: string;
        response: ApiResult<PaginatedForeignIdentitiesResponse>;
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

function buildListStorageKey(key: string) {
    return `${LIST_SESSION_CACHE_PREFIX}${key}`;
}

function readCachedListResponse(key: string) {
    if (typeof window === 'undefined') {
        return null;
    }

    const raw = window.sessionStorage.getItem(buildListStorageKey(key));
    if (!raw) {
        return null;
    }

    try {
        const cached = JSON.parse(raw) as CachedListResponse;
        if (cached.expiresAt <= Date.now()) {
            window.sessionStorage.removeItem(buildListStorageKey(key));
            return null;
        }

        return { data: cached.data };
    } catch {
        window.sessionStorage.removeItem(buildListStorageKey(key));
        return null;
    }
}

function storeCachedListResponse(
    key: string,
    data: PaginatedForeignIdentitiesResponse,
) {
    if (typeof window === 'undefined') {
        return;
    }

    const payload: CachedListResponse = {
        key,
        data,
        expiresAt: Date.now() + LIST_SESSION_CACHE_TTL_MS,
    };

    window.sessionStorage.setItem(
        buildListStorageKey(key),
        JSON.stringify(payload),
    );
}

function buildListResult(data: PaginatedForeignIdentitiesResponse) {
    return { data };
}

function isRateLimited(error: unknown) {
    return error instanceof AxiosError && error.response?.status === 429;
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
    const cachedResponse = readCachedListResponse(key);

    if (pendingListRequest?.key === key) {
        return pendingListRequest.promise;
    }

    if (recentListResponse?.key === key && recentListResponse.expiresAt > now) {
        return Promise.resolve(recentListResponse.response);
    }

    if (cachedResponse) {
        return Promise.resolve(cachedResponse);
    }

    const promise = foreignIdentityClient
        .get<PaginatedForeignIdentitiesResponse>('/foreign-identities', { params })
        .then((response) => {
            const result = buildListResult(response.data);
            recentListResponse = {
                key,
                response: result,
                expiresAt: Date.now() + LIST_REQUEST_COOLDOWN_MS,
            };
            storeCachedListResponse(key, response.data);
            return result;
        })
        .catch((error: unknown) => {
            if (isRateLimited(error) && cachedResponse) {
                return cachedResponse;
            }

            throw error;
        })
        .finally(() => {
            if (pendingListRequest?.key === key) {
                pendingListRequest = null;
            }
        });

    pendingListRequest = { key, promise };

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
