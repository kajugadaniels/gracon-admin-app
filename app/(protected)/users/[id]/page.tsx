import type { Metadata } from 'next';
import { UserDetailClient } from '@/components/pages/users/UserDetailClient';

export const metadata: Metadata = { title: 'User detail' };

export default function UserDetailPage({
    params,
}: {
    params: { id: string };
}) {
    return <UserDetailClient userId={params.id} />;
}