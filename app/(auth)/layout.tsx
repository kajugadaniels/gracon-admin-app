// Auth layout — centered, no sidebar, no header.
// Login and set-password are the only pages here.
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 16px',
                background: 'var(--bg)',
            }}
        >
            {children}
        </div>
    );
}