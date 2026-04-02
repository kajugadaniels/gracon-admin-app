import type { Metadata } from 'next';
import { AdminsClient } from '@/components/pages/admins';

export const metadata: Metadata = { title: 'Admins' };

export default function AdminsPage() {
    return <AdminsClient />;
}