// PageHeader — consistent page title + optional action area.
// Every protected page starts with this component.
// Optional icon adds a primary-tinted mark to the left of the title block.
import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    /** Small icon displayed inside a tinted mark to the left of the title. */
    icon?: React.ReactNode;
    action?: React.ReactNode;
    /** Extra content right of the title — filters, toggles, etc. */
    extra?: React.ReactNode;
}

/**
 * Page-level heading with optional icon, subtitle, and right-side action area.
 * Renders with a bottom border separator for clear section delineation.
 */
export function PageHeader({ title, subtitle, icon, action, extra }: PageHeaderProps) {
    return (
        <div className="page-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                {icon && (
                    <div className="page-header-icon" aria-hidden="true">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="page-title">{title}</h1>
                    {subtitle && <p className="page-subtitle">{subtitle}</p>}
                </div>
            </div>
            {(action || extra) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    {extra}
                    {action}
                </div>
            )}
        </div>
    );
}
