import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-dm-sans',
    display: 'swap',
});

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
        <html lang="en" className={dmSans.variable}>
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
                            boxShadow:    '0 16px 48px rgba(0,0,0,0.50)',
                            backdropFilter: 'blur(48px)',
                        },
                    }}
                />
            </body>
        </html>
    );
}