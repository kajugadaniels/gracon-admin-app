// UserDetailCard — left column top section.
// Shows personal info, citizen identity, and account status flags.
// NID and PID stay masked by default and require a timed reveal flow.
// Profile image uses the S3 presigned URL if available,
// falls back to initials avatar.
'use client';

import React from 'react';
import Image from 'next/image';
import { Badge, Button } from '@/components/ui';
import type { UserDetail } from '@/api/users/get-user.api';

interface UserDetailCardProps {
    user: UserDetail;
    isSuperAdmin: boolean;
    onRevealNid: () => void;
    onRevealPid: () => void;
}

function DetailRow({
    label,
    value,
    mono = false,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 8,
                padding: '8px 0',
                borderBottom: '1px solid var(--glass-interactive-border)',
                alignItems: 'start',
            }}
        >
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    paddingTop: 1,
                    flexShrink: 0,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: 13,
                    color: value ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: mono ? 'var(--font-mono, monospace)' : undefined,
                    wordBreak: 'break-all',
                    lineHeight: 1.5,
                }}
            >
                {value || '—'}
            </span>
        </div>
    );
}

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function formatDateTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getRenderableImageSrc(imageUrl: string | null): string | null {
    if (!imageUrl) return null;

    if (imageUrl.startsWith('/')) {
        return imageUrl;
    }

    try {
        const parsedUrl = new URL(imageUrl);

        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
            return imageUrl;
        }
    } catch {
        // The admin API can still return a raw storage key here.
        // Falling back to initials is safer than crashing the detail page.
    }

    return null;
}

function SensitiveValueRow({
    label,
    value,
    canReveal,
    onReveal,
}: {
    label: string;
    value: string;
    canReveal: boolean;
    onReveal: () => void;
}) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                gap: 8,
                padding: '8px 0',
                borderBottom: '1px solid var(--glass-interactive-border)',
                alignItems: 'start',
            }}
        >
            <span style={labelTextStyle}>{label}</span>
            <div style={sensitiveRowValueWrapStyle}>
                <span style={monoValueStyle}>{value || '—'}</span>
                {canReveal && (
                    <Button type="button" size="sm" variant="secondary" onClick={onReveal}>
                        Request decrypted view
                    </Button>
                )}
            </div>
        </div>
    );
}

function getIdentitySourceLabel(identityType: UserDetail['identityType']) {
    if (identityType === 'FIN') return 'Foreign Identity Number (FIN)';
    if (identityType === 'NID') return 'Rwandan National ID (NID)';
    return 'Not linked';
}

export function UserDetailCard({
    user,
    isSuperAdmin,
    onRevealNid,
    onRevealPid,
}: UserDetailCardProps) {
    const initials =
        `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';
    const profileImageSrc = getRenderableImageSrc(user.imageUrl);

    return (
        <div className="glass-card" style={{ borderRadius: 'var(--radius-lg)', padding: '20px' }}>

            {/* Avatar + name header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    marginBottom: 20,
                    paddingBottom: 16,
                    borderBottom: '1px solid var(--glass-interactive-border)',
                }}
            >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    {profileImageSrc ? (
                        <Image
                            src={profileImageSrc}
                            alt={`${user.firstName} ${user.lastName}`}
                            width={56}
                            height={56}
                            style={{
                                borderRadius: '50%',
                                border: '2px solid var(--glass-panel-border)',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <div
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'var(--primary-glass)',
                                border: '2px solid var(--primary-border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 18,
                                fontWeight: 700,
                                color: 'var(--primary-text)',
                            }}
                            aria-hidden="true"
                        >
                            {initials}
                        </div>
                    )}

                    {/* Active indicator dot */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 2,
                            right: 2,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            background: user.isActive ? 'var(--success)' : 'var(--error)',
                            border: '2px solid var(--void-2)',
                        }}
                        title={user.isActive ? 'Account active' : 'Account deactivated'}
                        aria-label={user.isActive ? 'Account active' : 'Account deactivated'}
                    />
                </div>

                {/* Name + email */}
                <div style={{ minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: 16,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {user.firstName} {user.lastName}
                    </div>
                    <div
                        style={{
                            fontSize: 12,
                            color: 'var(--text-muted)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {user.email}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        <Badge variant={user.isActive ? 'active' : 'inactive'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant={user.isVerified ? 'verified' : 'pending'}>
                            {user.isVerified ? 'Email verified' : 'Email pending'}
                        </Badge>
                        <Badge variant={user.isIdVerified ? 'verified' : 'pending'}>
                            {user.isIdVerified ? 'ID verified' : 'ID pending'}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Personal details */}
            <div style={{ marginBottom: 16 }}>
                <SectionLabel>Personal</SectionLabel>
                <DetailRow label="Phone" value={user.phoneNumber} />
                <DetailRow label="Date of birth" value={formatDate(user.dateOfBirth)} />
                <DetailRow label="Sex" value={user.sex} />
                <DetailRow label="Country" value={user.countryOfBirth} />
            </div>

            {/* Identity */}
            <div style={{ marginBottom: 16 }}>
                <SectionLabel>Identity</SectionLabel>
                <DetailRow
                    label="Source"
                    value={(
                        <Badge variant={user.identityType === 'FIN' ? 'info' : 'primary'}>
                            {getIdentitySourceLabel(user.identityType)}
                        </Badge>
                    )}
                />
                <SensitiveValueRow
                    label="NID"
                    value={user.nid}
                    canReveal={isSuperAdmin && user.nid !== '—'}
                    onReveal={onRevealNid}
                />
                <SensitiveValueRow
                    label="PID"
                    value={user.pid}
                    canReveal={isSuperAdmin && user.pid !== '—'}
                    onReveal={onRevealPid}
                />
                <DetailRow label="User ID" value={user.userId} mono />
            </div>

            {/* Account timeline */}
            <div>
                <SectionLabel>Timeline</SectionLabel>
                <DetailRow label="Registered" value={formatDateTime(user.createdAt)} />
                <DetailRow label="Last updated" value={formatDateTime(user.updatedAt)} />
                <DetailRow
                    label="ID verified"
                    value={user.idVerifiedAt ? formatDateTime(user.idVerifiedAt) : null}
                />
                <DetailRow
                    label="Attempts"
                    value={`${user.verificationAttempts} total`}
                />
            </div>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: 8,
                marginTop: 4,
            }}
        >
            {children}
        </div>
    );
}

const labelTextStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    paddingTop: 1,
    flexShrink: 0,
};

const monoValueStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono, monospace)',
    wordBreak: 'break-all',
    lineHeight: 1.5,
};

const sensitiveRowValueWrapStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
};
