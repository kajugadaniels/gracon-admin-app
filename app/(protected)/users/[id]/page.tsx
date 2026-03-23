import type { Metadata } from 'next';
import { UserDetailClient } from '@/components/pages/users/UserDetailClient';

export const metadata: Metadata = { title: 'User detail' };

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    return <UserDetailClient userId={id} />;
}
