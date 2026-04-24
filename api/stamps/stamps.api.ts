// API client for admin stamp-management pages.
import { createAuthedApiClient } from '@/api/common/axios-factory';
import type {
    PaginatedStampsResponse,
    StampDetail,
    StampFilters,
} from './stamps.types';

const STAMP_API_URL =
    process.env.NEXT_PUBLIC_STAMP_API_URL ??
    'http://localhost:3003/api/v1';

const stampsClient = createAuthedApiClient(STAMP_API_URL);

/**
 * Lists stamp events across all institutions.
 */
export function listStamps(params: StampFilters) {
    return stampsClient.get<PaginatedStampsResponse>(
        '/admin/stamps',
        { params },
    );
}

/**
 * Fetches one stamp detail payload.
 */
export function getStampDetail(stampId: string) {
    return stampsClient.get<StampDetail>(`/admin/stamps/${stampId}`);
}

/**
 * Lists stamp events for one institution.
 */
export function listStampsByInstitution(
    institutionId: string,
    params: { page?: number; limit?: number },
) {
    return stampsClient.get<PaginatedStampsResponse>(
        `/admin/institutions/${institutionId}/stamps`,
        { params },
    );
}
