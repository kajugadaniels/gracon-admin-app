// Root layout for the admin app.
// Binds the local DM Sans font bundle and global toast styling once.
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';
import './globals.css';

const dmSans = localFont({
    src: [
        { path: './fonts/DM-Sans-300.ttf', weight: '300', style: 'normal' },
        { path: './fonts/DM-Sans-400.ttf', weight: '400', style: 'normal' },
        { path: './fonts/DM-Sans-500.ttf', weight: '500', style: 'normal' },
        { path: './fonts/DM-Sans-600.ttf', weight: '600', style: 'normal' },
        { path: './fonts/DM-Sans-700.ttf', weight: '700', style: 'normal' },
    ],
    variable: '--font-dm-sans',
    display: 'swap',
    fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
    title: {
        template: '%s — ID Verify Admin',
        default: 'ID Verify Admin',
    },
    description: 'Internal admin panel — ID Verification Platform',
    robots: 'noindex, nofollow',
};

/**
 * Wraps the admin app with global styles, font variables, and toast UI.
 */
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
                            boxShadow:    '0 8px 32px rgba(0,0,0,0.10)',
                            backdropFilter: 'blur(48px)',
                        },
                    }}
                />
            </body>
        </html>
    );
}
