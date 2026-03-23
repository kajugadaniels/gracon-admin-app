// Admin not-found page.
// Keeps unmatched routes inside the same light command-center visual language
// and gives the operator clear routes back to valid areas of the app.
import Link from 'next/link';

const QUICK_LINKS = [
    {
        href: '/dashboard',
        label: 'Return to dashboard',
        description: 'Go back to the command center overview.',
    },
    {
        href: '/users',
        label: 'Open users',
        description: 'Continue with identity review and account actions.',
    },
    {
        href: '/login',
        label: 'Re-enter admin login',
        description: 'Use this if your session was cleared or the link was stale.',
    },
] as const;

const RECOVERY_STEPS = [
    'The page may have been renamed or removed from this build.',
    'A copied deep link may be incomplete or no longer valid.',
    'Protected routes can also look broken when the session has expired.',
] as const;

function ActionLink({
    href,
    label,
    primary = false,
}: {
    href: string;
    label: string;
    primary?: boolean;
}) {
    return (
        <Link
            href={href}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                minHeight: 42,
                padding: '0 18px',
                borderRadius: 12,
                border: primary
                    ? '1px solid var(--primary-border)'
                    : '1px solid var(--glass-interactive-border)',
                background: primary ? 'var(--primary-glass)' : 'var(--glass-card)',
                color: primary ? 'var(--primary-text)' : 'var(--text-primary)',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
            }}
        >
            {label}
        </Link>
    );
}

function InfoTile({
    title,
    body,
}: {
    title: string;
    body: string;
}) {
    return (
        <div
            className="glass-card"
            style={{
                padding: '16px 18px',
                borderRadius: 16,
            }}
        >
            <div
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 6,
                }}
            >
                {title}
            </div>
            <div
                style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                }}
            >
                {body}
            </div>
        </div>
    );
}

/**
 * Renders the branded admin 404 page for unmatched routes.
 *
 * @returns A recovery-focused not-found view with routes back into the console.
 */
export default function NotFoundPage() {
    return (
        <main
            style={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                padding: '32px 20px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: [
                        'radial-gradient(circle at 18% 16%, rgba(91, 35, 255, 0.14), transparent 28%)',
                        'radial-gradient(circle at 84% 22%, rgba(59, 130, 246, 0.10), transparent 24%)',
                        'radial-gradient(circle at 78% 82%, rgba(16, 185, 129, 0.10), transparent 24%)',
                    ].join(', '),
                    pointerEvents: 'none',
                }}
            />

            <section
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: 980,
                    borderRadius: 28,
                    padding: '28px',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: 22,
                        alignItems: 'stretch',
                    }}
                >
                    <div
                        className="glass-card"
                        style={{
                            borderRadius: 24,
                            padding: '28px',
                            background:
                                'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(255,255,255,0.88))',
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 10px',
                                borderRadius: 999,
                                marginBottom: 18,
                                background: 'var(--primary-glass)',
                                border: '1px solid var(--primary-border)',
                                color: 'var(--primary-text)',
                                fontSize: 11,
                                fontWeight: 700,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                            }}
                        >
                            Route Missing
                        </div>

                        <div
                            style={{
                                fontSize: 'clamp(64px, 12vw, 120px)',
                                lineHeight: 0.9,
                                fontWeight: 700,
                                letterSpacing: '-0.06em',
                                color: 'var(--text-primary)',
                                marginBottom: 14,
                            }}
                        >
                            404
                        </div>

                        <h1
                            style={{
                                fontSize: 'clamp(28px, 4vw, 42px)',
                                lineHeight: 1.02,
                                letterSpacing: '-0.04em',
                                marginBottom: 12,
                                color: 'var(--text-primary)',
                            }}
                        >
                            This admin route does not exist.
                        </h1>

                        <p
                            style={{
                                maxWidth: 520,
                                fontSize: 14,
                                lineHeight: 1.7,
                                color: 'var(--text-secondary)',
                                marginBottom: 20,
                            }}
                        >
                            The link is stale, incomplete, or points to a page that is no longer
                            part of this build. Use one of the recovery routes below to get back
                            to a valid workspace.
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 10,
                            }}
                        >
                            <ActionLink href="/dashboard" label="Open dashboard" primary />
                            <ActionLink href="/users" label="Review users" />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: 14 }}>
                        <div
                            className="glass-card"
                            style={{
                                borderRadius: 24,
                                padding: '22px',
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                    color: 'var(--text-muted)',
                                    marginBottom: 14,
                                }}
                            >
                                Recovery checklist
                            </div>

                            <div style={{ display: 'grid', gap: 10 }}>
                                {RECOVERY_STEPS.map((step, index) => (
                                    <div
                                        key={step}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '28px 1fr',
                                            gap: 10,
                                            alignItems: 'start',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 28,
                                                height: 28,
                                                borderRadius: 10,
                                                display: 'grid',
                                                placeItems: 'center',
                                                background: 'var(--glass-interactive)',
                                                border: '1px solid var(--glass-interactive-border)',
                                                color: 'var(--text-primary)',
                                                fontSize: 12,
                                                fontWeight: 700,
                                            }}
                                        >
                                            0{index + 1}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: 13,
                                                color: 'var(--text-secondary)',
                                                lineHeight: 1.6,
                                                paddingTop: 3,
                                            }}
                                        >
                                            {step}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: 12,
                            }}
                        >
                            {QUICK_LINKS.map((link) => (
                                <InfoTile
                                    key={link.href}
                                    title={link.label}
                                    body={link.description}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
