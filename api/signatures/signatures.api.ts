// API client for admin signature-management pages.
//
// These endpoints live in api/admin (the admin trust boundary) — never
// reach into api/signature directly from the admin app. The base URL is
// the admin API and routes are mounted under /signatures (no /admin prefix
// needed — the entire admin API is admin-scoped by guard).
import { createAuthedApiClient } from '@/api/common/axios-factory';
import type {
    PaginatedSignatureDocumentsResponse,
    PaginatedSignaturesResponse,
    RevokeSignatureInput,
    SignatureDetail,
    SignatureFilters,
} from './signatures.types';

const ADMIN_API_URL =
    process.env.NEXT_PUBLIC_ADMIN_API_URL ??
    'http://localhost:3001/api/v1';

const signaturesClient = createAuthedApiClient(ADMIN_API_URL);

/**
 * Lists signatures across all users for the admin dashboard.
 */
export function listSignatures(params: SignatureFilters) {
    return signaturesClient.get<PaginatedSignaturesResponse>(
        '/signatures',
        { params },
    );
}

/**
 * Fetches one signature detail payload by its admin-facing id.
 */
export function getSignature(signatureId: string) {
    return signaturesClient.get<SignatureDetail>(
        `/signatures/${signatureId}`,
    );
}

/**
 * Lists the documents signed by one signature.
 */
export function listSignatureDocuments(
    signatureId: string,
    params: { page?: number; limit?: number },
) {
    return signaturesClient.get<PaginatedSignatureDocumentsResponse>(
        `/signatures/${signatureId}/documents`,
        { params },
    );
}

/**
 * Revokes a signature from the admin dashboard.
 */
export function revokeSignature(
    signatureId: string,
    data: RevokeSignatureInput,
) {
    return signaturesClient.post<SignatureDetail>(
        `/signatures/${signatureId}/revoke`,
        data,
    );
}
