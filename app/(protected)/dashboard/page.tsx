import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
    return (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            Dashboard — Step 5 builds this.
        </div>
    );
}