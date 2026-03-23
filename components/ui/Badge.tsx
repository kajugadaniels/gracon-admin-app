// Status badge — the most-used visual signal in the admin panel.
// Every user row, every event row, every verification row uses one.
// Variants map directly to semantic states — never use color for decoration.
import React from 'react';

export type BadgeVariant =
    | 'active'    // green  — account active, verification passed
    | 'inactive'  // red    — account deactivated, blocked
    | 'verified'  // green  — ID verified
    | 'pending'   // amber  — awaiting action
    | 'info'      // blue   — neutral info
    | 'primary'   // purple — admin role, primary state
    | 'neutral'   // gray   — default, no semantic meaning
    | 'danger';   // red    — error, failed, high-risk event

interface BadgeProps {
    variant?: BadgeVariant;
    children: React.ReactNode;
    dot?: boolean;   // shows a colored dot before text
    className?: string;
    style?: React.CSSProperties;
}

// Maps security event types to badge variants — keeps switch logic out of tables
export const EVENT_TYPE_VARIANT: Record<string, BadgeVariant> = {
    LOGIN_FAILED: 'danger',
    LOGIN_SUCCESS: 'active',
    VERIFICATION_FAILED: 'danger',
    VERIFICATION_PASSED: 'active',
    PASSWORD_RESET_REQUESTED: 'pending',
    PASSWORD_CHANGED: 'info',
    SESSIONS_REVOKED_BY_USER: 'info',
    REVOKED_TOKEN_REUSE: 'danger',
    RATE_LIMIT_EXCEEDED: 'danger',
};

// Maps admin action types to badge variants
export const ADMIN_ACTION_VARIANT: Record<string, BadgeVariant> = {
    USER_DEACTIVATED: 'danger',
    USER_REACTIVATED: 'active',
    SESSIONS_REVOKED: 'pending',
    ID_STATUS_CHANGED: 'info',
    NID_DECRYPTED: 'danger',
    PID_DECRYPTED: 'danger',
    USER_DETAIL_VIEWED: 'neutral',
    ADMIN_CREATED: 'primary',
    ADMIN_DEACTIVATED: 'danger',
    ADMIN_REACTIVATED: 'active',
    ADMIN_INVITE_RESENT: 'info',
};

export function Badge({
    variant = 'neutral',
    children,
    dot = false,
    className = '',
    style,
}: BadgeProps) {
    return (
        <span className={['badge', `badge-${variant}`, className].filter(Boolean).join(' ')} style={style}>
            {dot && (
                <span
                    style={{
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'currentColor',
                        flexShrink: 0,
                    }}
                    aria-hidden="true"
                />
            )}
            {children}
        </span>
    );
}