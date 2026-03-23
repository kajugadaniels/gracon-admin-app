import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
    title: {
        template: '%s — ID Verify Admin',
        default: 'ID Verify Admin',
    },
    description: 'Internal admin panel — ID Verification Platform',
    robots: 'noindex, nofollow',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="font-sans antialiased">
                {children}
                <Toaster
                    position="top-right"
                    theme="dark"
                    toastOptions={{
                        style: {
                            background:   'var(--glass-overlay)',
                            border:       '1px solid var(--glass-overlay-border)',
                            color:        'var(--text-primary)',
                            fontSize:     '13px',
                            borderRadius: '12px',
                            boxShadow:    '0 8px 32px rgba(0,0,0,0.10)',
                            backdropFilter: 'blur(48px)',
                        },
                    }}
                />
            </body>
        </html>
    );
}
