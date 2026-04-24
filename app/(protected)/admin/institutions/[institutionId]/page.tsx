'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shell/PageHeader';
import { Button, EmptyState, Spinner } from '@/components/ui';
import { useAdminAuthStore } from '@/lib/store/admin-auth.store';
import {
    addInstitutionMember,
    changeInstitutionMemberRole,
    createAuthorityResolution,
    deactivateInstitution,
    deleteInstitutionLogo,
    deleteInstitutionStampImage,
    getInstitution,
    listInstitutionStamps,
    reactivateInstitution,
    removeInstitutionMember,
    revokeAuthorityResolution,
    uploadInstitutionLogo,
    uploadInstitutionStampImage,
} from '@/api/institutions/institutions.api';
import type { InstitutionDetail, InstitutionMemberItem, InstitutionStampActivityItem } from '@/api/institutions/institutions.types';
import { getFriendlyErrorMessage } from '@/lib/http';
import { InstitutionTabs } from '@/components/institutions/InstitutionTabs';
import { AddMemberModal } from '@/components/institutions/AddMemberModal';
import { ChangeRoleModal } from '@/components/institutions/ChangeRoleModal';
import { RemoveMemberModal } from '@/components/institutions/RemoveMemberModal';
import { CreateResolutionModal } from '@/components/institutions/CreateResolutionModal';
import { RevokeResolutionModal } from '@/components/institutions/RevokeResolutionModal';
import { InstitutionStatusModal } from '@/components/institutions/InstitutionStatusModal';
import { getStampDetail } from '@/api/stamps/stamps.api';
import type { StampDetail } from '@/api/stamps/stamps.types';

const STAMP_LIMIT = 10;

export default function InstitutionDetailPage() {
    const router = useRouter();
    const params = useParams<{ institutionId: string }>();
    const admin = useAdminAuthStore((state) => state.admin);
    const canManage = admin?.role === 'SUPER_ADMIN';
    const institutionId = typeof params.institutionId === 'string' ? params.institutionId : '';
    const [institution, setInstitution] = useState<InstitutionDetail | null>(null);
    const [stamps, setStamps] = useState<InstitutionStampActivityItem[]>([]);
    const [stampsPage, setStampsPage] = useState(1);
    const [stampsTotalPages, setStampsTotalPages] = useState(1);
    const [selectedStamp, setSelectedStamp] = useState<StampDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [stampLoading, setStampLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mutationLoading, setMutationLoading] = useState(false);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [changeRoleMember, setChangeRoleMember] = useState<InstitutionMemberItem | null>(null);
    const [removeMember, setRemoveMember] = useState<InstitutionMemberItem | null>(null);
    const [createResolutionOpen, setCreateResolutionOpen] = useState(false);
    const [revokeResolutionId, setRevokeResolutionId] = useState<string | null>(null);
    const [statusOpen, setStatusOpen] = useState(false);

    const statusMode = useMemo(
        () => (institution?.status === 'ACTIVE' ? 'deactivate' : 'reactivate'),
        [institution?.status],
    );

    const loadInstitution = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getInstitution(institutionId);
            setInstitution(response.data);
        } catch (error) {
            setError(getFriendlyErrorMessage(error, 'Failed to load institution.'));
        } finally {
            setLoading(false);
        }
    }, [institutionId]);

    const loadStamps = useCallback(async (page = stampsPage) => {
        setStampLoading(true);
        try {
            const response = await listInstitutionStamps(institutionId, { page, limit: STAMP_LIMIT });
            setStamps(response.data.items);
            setStampsTotalPages(response.data.totalPages);
            setStampsPage(response.data.page);
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, 'Failed to load institution stamp activity.'));
        } finally {
            setStampLoading(false);
        }
    }, [institutionId, stampsPage]);

    useEffect(() => {
        void loadInstitution();
    }, [loadInstitution]);

    useEffect(() => {
        void loadStamps(1);
    }, [loadStamps]);

    const refreshAll = async () => {
        await Promise.all([loadInstitution(), loadStamps(stampsPage)]);
    };

    const runMutation = async (task: () => Promise<void>) => {
        setMutationLoading(true);
        try {
            await task();
            await refreshAll();
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, 'Failed to update institution.'));
        } finally {
            setMutationLoading(false);
        }
    };

    const handleViewStamp = async (stampId: string) => {
        if (!stampId) {
            setSelectedStamp(null);
            return;
        }
        try {
            const response = await getStampDetail(stampId);
            setSelectedStamp(response.data);
        } catch (error) {
            toast.error(getFriendlyErrorMessage(error, 'Failed to load stamp detail.'));
        }
    };

    if (loading) {
        return <Spinner fullPage label="Loading institution…" />;
    }

    if (error || !institution) {
        return (
            <EmptyState
                icon="⚠"
                title="Institution unavailable"
                description={error ?? 'The requested institution does not exist.'}
                action={{ label: 'Back to institutions', onClick: () => router.push('/admin/institutions') }}
            />
        );
    }

    return (
        <>
            <PageHeader
                title={institution.name}
                subtitle="Institution profile, authority chain, and stamping infrastructure."
                action={
                    <Button type="button" variant="ghost" onClick={() => router.push('/admin/institutions')}>
                        Back to institutions
                    </Button>
                }
            />

            <InstitutionTabs
                institution={institution}
                canManage={Boolean(canManage)}
                stamps={stamps}
                stampsPage={stampsPage}
                stampsTotalPages={stampsTotalPages}
                stampLoading={stampLoading}
                onStampsPageChange={(page) => void loadStamps(page)}
                onLogoChange={(file) => {
                    if (!file) return;
                    void runMutation(async () => {
                        await uploadInstitutionLogo(institutionId, file);
                        toast.success('Institution logo updated.');
                    });
                }}
                onStampImageChange={(file) => {
                    if (!file) return;
                    void runMutation(async () => {
                        await uploadInstitutionStampImage(institutionId, file);
                        toast.success('Stamp image updated.');
                    });
                }}
                onLogoRemove={() => {
                    void runMutation(async () => {
                        await deleteInstitutionLogo(institutionId);
                        toast.success('Institution logo removed.');
                    });
                }}
                onStampImageRemove={() => {
                    void runMutation(async () => {
                        await deleteInstitutionStampImage(institutionId);
                        toast.success('Stamp image removed.');
                    });
                }}
                onStatusToggle={() => setStatusOpen(true)}
                onAddMember={() => setAddMemberOpen(true)}
                onChangeRole={(member) => setChangeRoleMember(member)}
                onRemoveMember={(member) => setRemoveMember(member)}
                onCreateResolution={() => setCreateResolutionOpen(true)}
                onRevokeResolution={(resolutionId) => setRevokeResolutionId(resolutionId)}
                onViewStamp={handleViewStamp}
                selectedStamp={selectedStamp}
            />

            <AddMemberModal
                open={addMemberOpen}
                loading={mutationLoading}
                onClose={() => setAddMemberOpen(false)}
                onConfirm={(payload) => void runMutation(async () => {
                    await addInstitutionMember(institutionId, payload);
                    setAddMemberOpen(false);
                    toast.success('Member added successfully.');
                })}
            />
            <ChangeRoleModal
                open={Boolean(changeRoleMember)}
                member={changeRoleMember}
                loading={mutationLoading}
                onClose={() => setChangeRoleMember(null)}
                onConfirm={(payload) => void runMutation(async () => {
                    if (!changeRoleMember) return;
                    await changeInstitutionMemberRole(institutionId, changeRoleMember.memberId, payload);
                    setChangeRoleMember(null);
                    toast.success('Member role updated.');
                })}
            />
            <RemoveMemberModal
                open={Boolean(removeMember)}
                member={removeMember}
                loading={mutationLoading}
                onClose={() => setRemoveMember(null)}
                onConfirm={(reason) => void runMutation(async () => {
                    if (!removeMember) return;
                    await removeInstitutionMember(institutionId, removeMember.memberId, { reason });
                    setRemoveMember(null);
                    toast.success('Member removed.');
                })}
            />
            <CreateResolutionModal
                open={createResolutionOpen}
                members={institution.members}
                loading={mutationLoading}
                onClose={() => setCreateResolutionOpen(false)}
                onConfirm={(payload) => void runMutation(async () => {
                    await createAuthorityResolution(institutionId, payload);
                    setCreateResolutionOpen(false);
                    toast.success('Resolution created.');
                })}
            />
            <RevokeResolutionModal
                open={Boolean(revokeResolutionId)}
                loading={mutationLoading}
                onClose={() => setRevokeResolutionId(null)}
                onConfirm={(reason) => void runMutation(async () => {
                    if (!revokeResolutionId) return;
                    await revokeAuthorityResolution(institutionId, revokeResolutionId, { reason });
                    setRevokeResolutionId(null);
                    toast.success('Resolution revoked.');
                })}
            />
            <InstitutionStatusModal
                open={statusOpen}
                mode={statusMode}
                loading={mutationLoading}
                onClose={() => setStatusOpen(false)}
                onConfirm={(reason) => void runMutation(async () => {
                    if (statusMode === 'deactivate') {
                        await deactivateInstitution(institutionId, { reason });
                        toast.success('Institution deactivated.');
                    } else {
                        await reactivateInstitution(institutionId, { reason });
                        toast.success('Institution reactivated.');
                    }
                    setStatusOpen(false);
                })}
            />
        </>
    );
}
