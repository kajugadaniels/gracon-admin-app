'use client';

import React, { useMemo, useState } from 'react';
import type {
    InstitutionDetail,
    InstitutionMemberItem,
    InstitutionStampActivityItem,
} from '@/api/institutions/institutions.types';
import type { StampDetail } from '@/api/stamps/stamps.types';
import { InstitutionOverviewTab } from './InstitutionOverviewTab';
import { InstitutionMembersTab } from './InstitutionMembersTab';
import { InstitutionResolutionsTab } from './InstitutionResolutionsTab';
import { InstitutionStampsTab } from './InstitutionStampsTab';

type TabId = 'overview' | 'members' | 'resolutions' | 'stamps';

interface InstitutionTabsProps {
    institution: InstitutionDetail;
    canManage: boolean;
    stamps: InstitutionStampActivityItem[];
    stampsPage: number;
    stampsTotalPages: number;
    stampLoading: boolean;
    onStampsPageChange: (page: number) => void;
    onLogoChange: (file: File | null) => void;
    onStampImageChange: (file: File | null) => void;
    onLogoRemove: () => void;
    onStampImageRemove: () => void;
    onStatusToggle: () => void;
    onAddMember: () => void;
    onChangeRole: (member: InstitutionMemberItem) => void;
    onRemoveMember: (member: InstitutionMemberItem) => void;
    onCreateResolution: () => void;
    onRevokeResolution: (resolutionId: string) => void;
    onViewStamp: (stampId: string) => void;
    selectedStamp: StampDetail | null;
}

const TABS: Array<{ id: TabId; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'resolutions', label: 'Authority Resolutions' },
    { id: 'stamps', label: 'Stamping Activity' },
];

export function InstitutionTabs(props: InstitutionTabsProps) {
    const [active, setActive] = useState<TabId>('overview');
    const counts = useMemo(
        () => ({
            members: props.institution.members.length,
            resolutions: props.institution.resolutions.length,
            stamps: props.stamps.length,
        }),
        [props.institution.members.length, props.institution.resolutions.length, props.stamps.length],
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={tabBarStyle} role="tablist" aria-label="Institution detail sections">
                {TABS.map((tab) => {
                    const isActive = active === tab.id;
                    const count =
                        tab.id === 'members'
                            ? counts.members
                            : tab.id === 'resolutions'
                                ? counts.resolutions
                                : tab.id === 'stamps'
                                    ? counts.stamps
                                    : undefined;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActive(tab.id)}
                            style={getTabStyle(isActive)}
                        >
                            {tab.label}
                            {typeof count === 'number' && (
                                <span style={getCountStyle(isActive)}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            {active === 'overview' && (
                <InstitutionOverviewTab
                    institution={props.institution}
                    canManage={props.canManage}
                    onLogoChange={props.onLogoChange}
                    onStampImageChange={props.onStampImageChange}
                    onLogoRemove={props.onLogoRemove}
                    onStampImageRemove={props.onStampImageRemove}
                    onStatusToggle={props.onStatusToggle}
                />
            )}
            {active === 'members' && (
                <InstitutionMembersTab
                    members={props.institution.members}
                    canManage={props.canManage}
                    onAddMember={props.onAddMember}
                    onChangeRole={props.onChangeRole}
                    onRemove={props.onRemoveMember}
                />
            )}
            {active === 'resolutions' && (
                <InstitutionResolutionsTab
                    resolutions={props.institution.resolutions}
                    canManage={props.canManage}
                    onCreate={props.onCreateResolution}
                    onRevoke={props.onRevokeResolution}
                />
            )}
            {active === 'stamps' && (
                <InstitutionStampsTab
                    institutionId={props.institution.institutionId}
                    stamps={props.stamps}
                    loading={props.stampLoading}
                    page={props.stampsPage}
                    totalPages={props.stampsTotalPages}
                    onPageChange={props.onStampsPageChange}
                    onView={props.onViewStamp}
                    selectedStamp={props.selectedStamp}
                />
            )}
        </div>
    );
}

const tabBarStyle: React.CSSProperties = {
    display: 'flex',
    gap: 4,
    padding: 4,
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--glass-interactive-border)',
    background: 'var(--glass-interactive)',
    flexWrap: 'wrap',
};

function getTabStyle(isActive: boolean): React.CSSProperties {
    return {
        minHeight: 40,
        padding: '0 14px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${isActive ? 'var(--primary-border)' : 'transparent'}`,
        background: isActive ? 'var(--primary-glass)' : 'transparent',
        color: isActive ? 'var(--primary-text)' : 'var(--text-secondary)',
        fontSize: 13,
        fontWeight: isActive ? 600 : 500,
        cursor: 'pointer',
    };
}

function getCountStyle(isActive: boolean): React.CSSProperties {
    return {
        minWidth: 20,
        height: 20,
        padding: '0 6px',
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        background: isActive ? 'rgba(91, 35, 255, 0.18)' : 'var(--glass-panel)',
        color: isActive ? 'var(--primary-text)' : 'var(--text-muted)',
    };
}
