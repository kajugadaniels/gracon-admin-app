'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import { PageHeader } from '@/components/shell/PageHeader';
import { Badge, Button, Spinner } from '@/components/ui';
import {
    deactivateForeignIdentity,
    decryptPassport,
    deleteImage,
    getForeignIdentity,
    getImage,
    reactivateForeignIdentity,
    updateForeignIdentity,
    uploadImage,
} from '@/api/foreign-identity/foreign-identity.api';
import type {
    DecryptedPassportResponse,
    ForeignIdentityProfile,
} from '@/api/foreign-identity/foreign-identity.types';
import { getCountryName } from '@/components/foreign-identities/CountryDropdown';
import { FinStructureDisplay } from '@/components/foreign-identities/FinStructureDisplay';
import { ProfileImageUpload } from '@/components/foreign-identities/ProfileImageUpload';
import { UpdateModal } from '@/components/foreign-identities/UpdateModal';
import { DeactivateReactivateModal } from '@/components/foreign-identities/DeactivateReactivateModal';
import { DecryptPassportModal } from '@/components/foreign-identities/DecryptPassportModal';

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

function copyText(value: string, label: string) {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied.`);
}

function InitialsAvatar({
    imageUrl,
    firstName,
    lastName,
}: {
    imageUrl: string | null;
    firstName: string;
    lastName: string;
}) {
    if (imageUrl) {
        return <img src={imageUrl} alt={`${firstName} ${lastName}`} style={avatarImageStyle} />;
    }

    return (
        <div style={avatarFallbackStyle}>
            {firstName[0]}{lastName[0]}
        </div>
    );
}

function FieldPair({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={fieldPairStyle}>
            <div style={fieldLabelStyle}>{label}</div>
            <div style={fieldValueStyle}>{value}</div>
        </div>
    );
}

function ActivityPlaceholder() {
    return (
        <section className="glass-card" style={sectionCardStyle}>
            <h3 style={sectionTitleStyle}>Activity Log</h3>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden="true">◌</span>
                Audit history will appear here in a future update.
            </div>
        </section>
    );
}

function DetailFields({
    profile,
    onDecrypt,
    isSuperAdmin,
}: {
    profile: ForeignIdentityProfile;
    onDecrypt: () => void;
    isSuperAdmin: boolean;
}) {
    return (
        <section className="glass-card" style={sectionCardStyle}>
            <div style={detailsGridStyle}>
                <FieldPair label="First Name" value={profile.firstName} />
                <FieldPair label="Last Name" value={profile.lastName} />
                <FieldPair label="Gender" value={profile.gender === 'MALE' ? 'Male' : 'Female'} />
                <FieldPair label="Date of Birth" value={formatDate(profile.dateOfBirth)} />
                <FieldPair
                    label="Country of Origin"
                    value={
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            <ReactCountryFlag countryCode={profile.countryOfOrigin} svg />
                            {getCountryName(profile.countryOfOrigin)}
                        </span>
                    }
                />
                <FieldPair label="Nationality" value={profile.nationality} />
                <FieldPair label="Marital Status" value={profile.maritalStatus.toLowerCase()} />
                <FieldPair label="Issuance Version" value={profile.issuanceVersion} />
                <FieldPair label="Created At" value={formatDate(profile.createdAt)} />
                <FieldPair label="Updated At" value={formatDate(profile.updatedAt)} />
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <FieldPair label="Passport Number" value="••••••••" />
                {isSuperAdmin && (
                    <Button type="button" size="sm" variant="secondary" onClick={onDecrypt}>
                        Request decrypted view
                    </Button>
                )}
            </div>
            <div style={{ marginTop: 22 }}>
                <div style={fieldLabelStyle}>FIN Structure</div>
                <div style={{ marginTop: 10 }}>
                    <FinStructureDisplay fin={profile.fin} gender={profile.gender} />
                </div>
            </div>
        </section>
    );
}

function extractMessage(error: unknown, fallback: string) {
    if (typeof error !== 'object' || !error) return fallback;
    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) return fallback;
    const data = Reflect.get(response, 'data');
    if (typeof data !== 'object' || !data) return fallback;
    const message = Reflect.get(data, 'message');
    return typeof message === 'string' ? message : fallback;
}

function extractStatus(error: unknown) {
    if (typeof error !== 'object' || !error) return 0;
    const response = Reflect.get(error, 'response');
    if (typeof response !== 'object' || !response) return 0;
    const status = Reflect.get(response, 'status');
    return typeof status === 'number' ? status : 0;
}

export default function ForeignIdentityDetailPage() {
    const params = useParams<{ fin: string }>();
    const router = useRouter();
    const admin = useAdminAuthStore((state) => state.admin);
    const fin = typeof params.fin === 'string' ? params.fin : '';
    const isSuperAdmin = admin?.role === 'SUPER_ADMIN';
    const [profile, setProfile] = useState<ForeignIdentityProfile | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [statusMode, setStatusMode] = useState<'deactivate' | 'reactivate' | null>(null);
    const [decryptOpen, setDecryptOpen] = useState(false);
    const [decryptLoading, setDecryptLoading] = useState(false);
    const [decryptError, setDecryptError] = useState<string | null>(null);
    const [decryptResult, setDecryptResult] = useState<DecryptedPassportResponse | null>(null);
    const [imageUploading, setImageUploading] = useState(false);

    const registeredLine = useMemo(() => {
        if (!profile) return '';
        return `Registered by admin ID ${profile.registeredByAdminId} on ${formatDate(profile.createdAt)}`;
    }, [profile]);

    const refreshImage = useCallback(async () => {
        try {
            const response = await getImage(fin);
            setImageUrl(response.data.url);
        } catch {
            setImageUrl(null);
        }
    }, [fin]);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getForeignIdentity(fin);
            setProfile(response.data);
            await refreshImage();
        } catch (nextError: unknown) {
            setError(extractMessage(nextError, 'Failed to load foreign identity.'));
        } finally {
            setLoading(false);
        }
    }, [fin, refreshImage]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleImageSelection = async (file: File | null) => {
        if (!file) return;
        setImageUploading(true);
        try {
            const response = await uploadImage(fin, file);
            setProfile(response.data);
            await refreshImage();
            toast.success('Profile image updated.');
        } catch (nextError: unknown) {
            toast.error(extractMessage(nextError, 'Failed to upload image.'));
        } finally {
            setImageUploading(false);
        }
    };

    const handleRemoveImage = async () => {
        try {
            const response = await deleteImage(fin);
            setProfile(response.data);
            setImageUrl(null);
            toast.success('Profile image removed.');
        } catch (nextError: unknown) {
            toast.error(extractMessage(nextError, 'Failed to remove image.'));
        }
    };

    const handleUpdate = async (data: Partial<ForeignIdentityProfile> & { reason?: string }) => {
        try {
            const response = await updateForeignIdentity(fin, data);
            toast.success(`Profile updated. New FIN: ${response.data.fin}`);
            setUpdateOpen(false);
            router.replace(`/admin/foreign-identities/${response.data.fin}`);
        } catch (nextError: unknown) {
            toast.error(extractMessage(nextError, 'Failed to update profile.'));
        }
    };

    const handleStatusChange = async (reason: string) => {
        if (!statusMode) return;
        try {
            const response = statusMode === 'deactivate'
                ? await deactivateForeignIdentity(fin, reason)
                : await reactivateForeignIdentity(fin, reason);
            setProfile(response.data);
            setStatusMode(null);
            toast.success(
                statusMode === 'deactivate'
                    ? 'Foreign identity deactivated.'
                    : 'Foreign identity reactivated.',
            );
        } catch (nextError: unknown) {
            toast.error(extractMessage(nextError, 'Request failed.'));
        }
    };

    const handleDecrypt = async (reason: string) => {
        setDecryptLoading(true);
        setDecryptError(null);
        try {
            const response = await decryptPassport(fin, reason);
            setDecryptResult(response.data);
        } catch (nextError: unknown) {
            const status = extractStatus(nextError);
            const message = status === 403
                ? 'You do not have SUPER_ADMIN privileges required for this action.'
                : status === 429
                    ? 'Rate limit exceeded. You can decrypt up to 5 passports per hour.'
                    : extractMessage(nextError, 'Failed to decrypt passport.');
            setDecryptError(message);
        } finally {
            setDecryptLoading(false);
        }
    };

    if (loading) {
        return <Spinner fullPage label="Loading foreign identity…" />;
    }

    if (error || !profile) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                <div style={{ fontSize: 14, color: 'var(--error-text)' }}>{error ?? 'Record not found.'}</div>
                <Button type="button" variant="secondary" onClick={() => router.push('/admin/foreign-identities')}>
                    Back to registry
                </Button>
            </div>
        );
    }

    return (
        <>
            <PageHeader
                title={`${profile.firstName} ${profile.lastName}`}
                subtitle={registeredLine}
                action={
                    <Button type="button" variant="ghost" size="sm" onClick={() => router.push('/admin/foreign-identities')}>
                        Back
                    </Button>
                }
            />

            <section style={detailLayoutStyle}>
                <div className="glass-card" style={sectionCardStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                        <InitialsAvatar
                            imageUrl={imageUrl}
                            firstName={profile.firstName}
                            lastName={profile.lastName}
                        />
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
                                {profile.firstName} {profile.lastName}
                            </div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                                <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 13 }}>
                                    {profile.fin}
                                </span>
                                <Button type="button" size="sm" variant="ghost" onClick={() => copyText(profile.fin, 'FIN')}>
                                    Copy
                                </Button>
                            </div>
                            <div style={{ marginTop: 10 }}>
                                <Badge variant={profile.isActive ? 'active' : 'neutral'} dot>
                                    {profile.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                            <ProfileImageUpload
                                mode="compact"
                                file={null}
                                disabled={imageUploading}
                                buttonLabel={imageUrl ? 'Replace Image' : 'Upload Image'}
                                onFileChange={handleImageSelection}
                            />
                            {imageUrl && (
                                <Button type="button" size="sm" variant="ghost" onClick={handleRemoveImage}>
                                    Remove Image
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <DetailFields
                    profile={profile}
                    onDecrypt={() => setDecryptOpen(true)}
                    isSuperAdmin={isSuperAdmin}
                />
            </section>

            <section className="glass-card" style={sectionCardStyle}>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <Button type="button" variant="primary" onClick={() => setUpdateOpen(true)}>
                        Update Profile
                    </Button>
                    {isSuperAdmin && profile.isActive && (
                        <Button type="button" variant="danger" onClick={() => setStatusMode('deactivate')}>
                            Deactivate
                        </Button>
                    )}
                    {isSuperAdmin && !profile.isActive && (
                        <Button type="button" variant="primary" onClick={() => setStatusMode('reactivate')}>
                            Reactivate
                        </Button>
                    )}
                </div>
            </section>

            <ActivityPlaceholder />

            <UpdateModal
                open={updateOpen}
                profile={profile}
                onClose={() => setUpdateOpen(false)}
                onSave={handleUpdate}
            />

            <DeactivateReactivateModal
                open={statusMode !== null}
                mode={statusMode ?? 'deactivate'}
                onClose={() => setStatusMode(null)}
                onConfirm={handleStatusChange}
            />

            <DecryptPassportModal
                open={decryptOpen}
                loading={decryptLoading}
                error={decryptError}
                result={decryptResult}
                onClose={() => {
                    setDecryptOpen(false);
                    setDecryptError(null);
                    setDecryptResult(null);
                }}
                onSubmit={handleDecrypt}
            />
        </>
    );
}

const detailLayoutStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 16,
    marginBottom: 16,
};

const sectionCardStyle: React.CSSProperties = {
    padding: '22px 24px',
    borderRadius: 'var(--radius-xl)',
    marginBottom: 16,
};

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 12,
};

const avatarImageStyle: React.CSSProperties = {
    width: 160,
    height: 160,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid var(--glass-panel-border)',
};

const avatarFallbackStyle: React.CSSProperties = {
    width: 160,
    height: 160,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--primary-glass)',
    border: '1px solid var(--primary-border)',
    color: 'var(--primary-text)',
    fontSize: 38,
    fontWeight: 700,
};

const detailsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14,
};

const fieldPairStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
};

const fieldLabelStyle: React.CSSProperties = {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
};

const fieldValueStyle: React.CSSProperties = {
    fontSize: 14,
    color: 'var(--text-primary)',
};
