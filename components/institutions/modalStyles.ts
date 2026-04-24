import React from 'react';

export const backdropStyleShared: React.CSSProperties = {
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

export const panelStyleShared: React.CSSProperties = {
    width: 'min(100%, 580px)',
    background: 'var(--surface-overlay)',
    border: '1px solid var(--border-strong)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
};

export const titleStyleShared: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

export const descriptionStyleShared: React.CSSProperties = {
    fontSize: 13,
    lineHeight: 1.6,
    color: 'var(--text-secondary)',
};

export const labelStyleShared: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-secondary)',
};

export const textareaStyleShared: React.CSSProperties = {
    width: '100%',
    minHeight: 132,
    resize: 'vertical',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 12,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
};

export const counterStyleShared: React.CSSProperties = {
    fontSize: 11,
    color: 'var(--text-muted)',
    textAlign: 'right',
};

export const actionsStyleShared: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
};
