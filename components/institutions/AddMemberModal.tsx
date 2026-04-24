'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, Select } from '@/components/ui';
import { listUsersApi, type UserListItem } from '@/api/users/list-users.api';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { getFriendlyErrorMessage } from '@/lib/http';
import { toast } from 'sonner';

interface AddMemberModalProps {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: (payload: { userId: string; role: string }) => void;
}

const ROLE_OPTIONS = ['Owner', 'Admin', 'Member', 'Signer'];

export function AddMemberModal({
    open,
    loading,
    onClose,
    onConfirm,
}: AddMemberModalProps) {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<UserListItem[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [role, setRole] = useState('Member');
    const [searchLoading, setSearchLoading] = useState(false);
    const debouncedSearch = useDebounce(search, 350);

    useEffect(() => {
        if (!open || !debouncedSearch.trim()) {
            setResults([]);
            return;
        }

        const load = async () => {
            setSearchLoading(true);
            try {
                const response = await listUsersApi({ search: debouncedSearch.trim(), limit: 8 });
                setResults(response.data.data);
            } catch (error) {
                toast.error(getFriendlyErrorMessage(error, 'Failed to search users.'));
            } finally {
                setSearchLoading(false);
            }
        };

        void load();
    }, [debouncedSearch, open]);

    const selectedUser = useMemo(
        () => results.find((item) => item.userId === selectedUserId) ?? null,
        [results, selectedUserId],
    );

    if (!open) return null;

    return (
        <div style={backdropStyle} onClick={onClose} role="dialog" aria-modal="true">
            <div style={panelStyle} onClick={(event) => event.stopPropagation()}>
                <h3 style={titleStyle}>Add Institution Member</h3>
                <Input
                    label="Search by email"
                    search
                    placeholder="Search admin users by email"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <div style={resultsWrapStyle}>
                    {searchLoading && <div style={helperStyle}>Searching users…</div>}
                    {!searchLoading && results.map((user) => (
                        <button
                            key={user.userId}
                            type="button"
                            style={getUserRowStyle(user.userId === selectedUserId)}
                            onClick={() => setSelectedUserId(user.userId)}
                        >
                            <span style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{user.email}</span>
                        </button>
                    ))}
                    {!searchLoading && search.trim() && results.length === 0 && (
                        <div style={helperStyle}>No matching users found.</div>
                    )}
                </div>
                <Select
                    label="Role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    options={ROLE_OPTIONS.map((item) => ({ value: item, label: item }))}
                />
                {selectedUser && (
                    <div style={selectedStyle}>
                        Selected: {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.email})
                    </div>
                )}
                <div style={actionsStyle}>
                    <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        loading={loading}
                        disabled={!selectedUserId}
                        onClick={() => onConfirm({ userId: selectedUserId, role })}
                    >
                        Add Member
                    </Button>
                </div>
            </div>
        </div>
    );
}

const backdropStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 120,
    background: 'rgba(0, 0, 0, 0.62)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
};

const panelStyle: React.CSSProperties = {
    width: 'min(100%, 580px)',
    background: 'var(--surface-overlay)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
};

const titleStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const resultsWrapStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxHeight: 220,
    overflowY: 'auto',
};

function getUserRowStyle(selected: boolean): React.CSSProperties {
    return {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: 12,
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${selected ? 'var(--primary-border)' : 'var(--border)'}`,
        background: selected ? 'var(--primary-glass)' : 'var(--glass-panel)',
        cursor: 'pointer',
        textAlign: 'left',
    };
}

const helperStyle: React.CSSProperties = {
    padding: 12,
    borderRadius: 'var(--radius-md)',
    background: 'var(--glass-panel)',
    color: 'var(--text-muted)',
    fontSize: 12,
};

const selectedStyle: React.CSSProperties = {
    padding: 10,
    borderRadius: 'var(--radius-md)',
    background: 'var(--glass-panel)',
    color: 'var(--text-secondary)',
    fontSize: 12,
};

const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
};
