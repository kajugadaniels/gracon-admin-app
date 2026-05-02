import { apiClient } from '@/api/client';
import type { IdentityType } from './list-users.api';

export interface UserDetail {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    imageUrl: string | null;
    nid: string;
    pid: string;
    nidDecrypted: boolean;
    identityType: IdentityType | null;
    dateOfBirth: string | null;
    sex: string | null;
    countryOfBirth: string | null;
    isActive: boolean;
    isVerified: boolean;
    isIdVerified: boolean;
    idVerifiedAt: string | null;
    verificationAttempts: number;
    createdAt: string;
    updatedAt: string;
    verifications: VerificationItem[];
    sessions: SessionItem[];
    securityEvents: SecurityEventItem[];
    auditHistory: AuditItem[];
}

export interface VerificationItem {
    id: string;
    attemptNumber: number;
    documentMatch: boolean;
    faceScore: number;
    livenessScore: number;
    compositeScore: number;
    passed: boolean;
    failReason: string | null;
    ipAddress: string | null;
    createdAt: string;
}

export interface SessionItem {
    id: string;
    tokenType: string;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: string;
    createdAt: string;
}

export interface SecurityEventItem {
    id: string;
    eventType: string;
    ipAddress: string | null;
    metadata: Record<string, unknown> | null;
    createdAt: string;
}

export interface AuditItem {
    id: string;
    action: string;
    adminId: string;
    adminName: string;
    metadata: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string;
}

export const getUserApi = (userId: string) =>
    apiClient.get<UserDetail>(`/users/${userId}`);
