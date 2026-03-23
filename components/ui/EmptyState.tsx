// Empty state — shown when a table or list has no data.
// Always gives the admin context on why it is empty and what to do.
// action is optional — some empty states have no action (audit logs, events).
import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({
    icon,
    title,
    description,
    action,
}: EmptyStateProps) {
    return (
        <div className="empty-state">
            {icon && (
                <div
                    className="empty-state-icon"
                    aria-hidden="true"
                >
                    {icon}
                </div>
            )}
            <div
                style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'var(--text-secondary)',
                    marginBottom: description ? 4 : 0,
                }}
            >
                {title}
            </div>
            {description && (
                <div
                    style={{
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        maxWidth: 320,
                        lineHeight: 1.6,
                        marginBottom: action ? 16 : 0,
                    }}
                >
                    {description}
                </div>
            )}
            {action && (
                <Button variant="secondary" size="sm" onClick={action.onClick}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}