// UserTabs — tab bar for the user detail page.
// Four tabs: Profile, Verifications, Sessions, Activity.
// Active tab has primary glass tint — same visual language as nav items.
// Tab content transitions with a fast opacity fade — not a slide,
// because slides fight the sticky bar when scrolling.
'use client';

import React, { useState } from 'react';
import type { UserDetail } from '@/api/users/get-user.api';
import { UserDetailCard } from './UserDetailCard';
import { VerificationHistory } from './VerificationHistory';
import { SessionList } from './SessionList';
import { SecurityEventTimeline } from './SecurityEventTimeline';
import { AuditHistory } from './AuditHistory';

type Tab = 'profile' | 'verifications' | 'sessions' | 'activity';

const TABS: { id: Tab; label: string; count?: (u: UserDetail) => number }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'verifications', label: 'Verifications', count: (u) => u.verifications.length },
    { id: 'sessions', label: 'Sessions', count: (u) => u.sessions.length },
    { id: 'activity', label: 'Activity', count: (u) => u.securityEvents.length + u.auditHistory.length },
];

interface UserTabsProps {
    user: UserDetail;
}

export function UserTabs({ user }: UserTabsProps) {
    const [active, setActive] = useState<Tab>('profile');

    return (
        <div>
            {/* Tab bar */}
            <div
                style={{
                    display: 'flex',
                    gap: 2,
                    padding: 4,
                    background: 'var(--glass-interactive)',
                    border: '1px solid var(--glass-interactive-border)',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 16,
                }}
                role="tablist"
                aria-label="User detail sections"
            >
                {TABS.map((tab) => {
                    const isActive = active === tab.id;
                    const count = tab.count?.(user);

                    return (
                        <button
                            key={tab.id}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`tabpanel-${tab.id}`}
                            onClick={() => setActive(tab.id)}
                            style={{
                                flex: 1,
                                height: 34,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 6,
                                border: `1px solid ${isActive ? 'var(--primary-border)' : 'transparent'}`,
                                borderRadius: 'var(--radius-md)',
                                background: isActive ? 'var(--primary-glass)' : 'transparent',
                                color: isActive ? 'var(--primary-text)' : 'var(--text-secondary)',
                                fontSize: 13,
                                fontWeight: isActive ? 600 : 400,
                                fontFamily: 'var(--font-sans)',
                                cursor: 'pointer',
                                transition: 'all 150ms ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {tab.label}
                            {count !== undefined && count > 0 && (
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 600,
                                        padding: '1px 5px',
                                        borderRadius: 10,
                                        background: isActive
                                            ? 'rgba(91,35,255,0.25)'
                                            : 'var(--glass-interactive)',
                                        color: isActive ? 'var(--primary-text)' : 'var(--text-muted)',
                                        border: `1px solid ${isActive ? 'var(--primary-border)' : 'var(--glass-interactive-border)'}`,
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab panels */}
            <div
                id={`tabpanel-profile`}
                role="tabpanel"
                aria-labelledby="tab-profile"
                hidden={active !== 'profile'}
                style={{ animation: active === 'profile' ? 'tabFadeIn 150ms ease' : undefined }}
            >
                {active === 'profile' && <UserDetailCard user={user} />}
            </div>

            <div
                id={`tabpanel-verifications`}
                role="tabpanel"
                aria-labelledby="tab-verifications"
                hidden={active !== 'verifications'}
                style={{ animation: active === 'verifications' ? 'tabFadeIn 150ms ease' : undefined }}
            >
                {active === 'verifications' && (
                    <VerificationHistory verifications={user.verifications} />
                )}
            </div>

            <div
                id={`tabpanel-sessions`}
                role="tabpanel"
                aria-labelledby="tab-sessions"
                hidden={active !== 'sessions'}
                style={{ animation: active === 'sessions' ? 'tabFadeIn 150ms ease' : undefined }}
            >
                {active === 'sessions' && <SessionList sessions={user.sessions} />}
            </div>

            <div
                id={`tabpanel-activity`}
                role="tabpanel"
                aria-labelledby="tab-activity"
                hidden={active !== 'activity'}
                style={{ animation: active === 'activity' ? 'tabFadeIn 150ms ease' : undefined }}
            >
                {active === 'activity' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <SecurityEventTimeline events={user.securityEvents} />
                        <AuditHistory userId={user.userId} history={user.auditHistory} />
                    </div>
                )}
            </div>
        </div>
    );
}