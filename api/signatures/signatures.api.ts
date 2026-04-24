// API client for admin signature-management pages.
import { createAuthedApiClient } from '@/api/common/axios-factory';
import type {
    PaginatedSignatureDocumentsResponse,
    PaginatedSignaturesResponse,
    RevokeSignatureInput,
    SignatureDetail,
    SignatureFilters,
} from './signatures.types';

const SIGNATURE_API_URL =
    process.env.NEXT_PUBLIC_SIGNATURE_API_URL ??
    'http://localhost:3002/api/v1';

const signaturesClient = createAuthedApiClient(SIGNATURE_API_URL);

/**
 * Lists signatures across all users for the admin dashboard.
 */
export function listSignatures(params: SignatureFilters) {
    return signaturesClient.get<PaginatedSignaturesResponse>(
        '/admin/signatures',
        { params },
    );
}

/**
 * Fetches one signature detail payload by its admin-facing id.
 */
export function getSignature(signatureId: string) {
    return signaturesClient.get<SignatureDetail>(
        `/admin/signatures/${signatureId}`,
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
        `/admin/signatures/${signatureId}/documents`,
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
        `/admin/signatures/${signatureId}/revoke`,
        data,
    );
}
