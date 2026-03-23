// Dashboard page — the first thing an admin sees after login.
// Fetches stats once on mount, passes to child components.
// Error state shown inline — never crashes the whole page.
// Cache metadata shown in the footer so admins know data freshness.
import type { Metadata } from 'next';
import { DashboardClient } from '@/components/pages/dashboard/DashboardClient';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
    return <DashboardClient />;
}