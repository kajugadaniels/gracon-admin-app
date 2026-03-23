// PageHeader — consistent page title + optional action button.
// Every protected page starts with this.
// Keeps page titles, subtitles, and primary actions visually consistent.
import React from 'react';

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    // Extra content to the right of the title — filters, toggles, etc.
    extra?: React.ReactNode;
}

export function PageHeader({
    title,
    subtitle,
    action,
    extra,
}: PageHeaderProps) {
    return (
        <div className="page-header">
            <div>
                <h1 className="page-title">{title}</h1>
                {subtitle && (
                    <p className="page-subtitle">{subtitle}</p>
                )}
            </div>
            {(action || extra) && (
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexShrink: 0,
                    }}
                >
                    {extra}
                    {action}
                </div>
            )}
        </div>
    );
}