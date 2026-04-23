import { PageHeader } from '@/components/shell/PageHeader';
import { RegistrationForm } from '@/components/foreign-identities/RegistrationForm';

export default function RegisterForeignIdentityPage() {
    return (
        <>
            <PageHeader
                title="Register Foreign Identity"
                subtitle="Create a new FIN-backed record for a non-NIDA user."
            />
            <RegistrationForm />
        </>
    );
}
