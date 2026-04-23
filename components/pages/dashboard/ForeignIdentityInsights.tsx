'use client';

import React from 'react';
import Link from 'next/link';
import ReactCountryFlag from 'react-country-flag';
import { Badge } from '@/components/ui';
import type {
    CountryCount,
    ForeignIdentityRecentRegistration,
    ForeignIdentityStats,
} from '@/api/stats/get-stats.api';
import { ActivityChart } from './ActivityChart';

interface ForeignIdentityInsightsProps {
    insights?: ForeignIdentityStats;
    loading: boolean;
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

function getCountryLabel(code: string) {
    return regionNames.of(code) ?? code;
}

function formatTimeAgo(isoDate: string) {
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

export function ForeignIdentityInsights({
    insights,
    loading,
}: ForeignIdentityInsightsProps) {
    return (
        <section style={sectionStyle}>
            <div style={headerStyle}>
                <div>
                    <div style={eyebrowStyle}>Registry Intelligence</div>
                    <h2 style={titleStyle}>Foreign identity registry</h2>
                    <p style={subtitleStyle}>
                        FIN issuance, lifecycle health, and recent registry movement.
                    </p>
                </div>
                <Link href="/admin/foreign-identities" style={linkStyle}>
                    Open registry →
                </Link>
            </div>

            <MetricRow insights={insights} loading={loading} />

            <div style={contentGridStyle}>
                <ChartCard insights={insights} loading={loading} />
                <div style={sideColumnStyle}>
                    <CountryMix countries={insights?.topCountriesOfOrigin ?? []} loading={loading} />
                    <RecentRegistrations
                        items={insights?.recentRegistrations ?? []}
                        loading={loading}
                    />
                </div>
            </div>
        </section>
    );
}

function MetricRow({
    insights,
    loading,
}: {
    insights?: ForeignIdentityStats;
    loading: boolean;
}) {
    const metrics = [
        {
            label: 'FIN records',
            value: insights?.totalRegistered ?? 0,
            delta: insights
                ? `${insights.active.toLocaleString()} active`
                : 'Loading registry totals',
        },
        {
            label: 'Active rate',
            value: Math.round(insights?.activeRate ?? 0),
            suffix: '%',
            delta: insights
                ? `${insights.inactive.toLocaleString()} inactive`
                : 'Loading lifecycle split',
        },
        {
            label: 'Registered today',
            value: insights?.registeredToday ?? 0,
            delta: insights
                ? `${insights.registrationsLast7Days.reduce((sum, day) => sum + day.count, 0).toLocaleString()} in 7 days`
                : 'Loading issuance trend',
        },
        {
            label: 'Gender split',
            value: insights?.maleCount ?? 0,
            delta: insights
                ? `${insights.femaleCount.toLocaleString()} female`
                : 'Loading demographic mix',
        },
    ];

    return (
        <div style={metricGridStyle}>
            {metrics.map((metric) => (
                <RegistryMetricTile key={metric.label} {...metric} loading={loading} />
            ))}
        </div>
    );
}

function RegistryMetricTile({
    label,
    value,
    delta,
    suffix,
    loading,
}: {
    label: string;
    value: number;
    delta: string;
    suffix?: string;
    loading: boolean;
}) {
    return (
        <div style={metricTileStyle}>
            <div style={metricLabelStyle}>{label}</div>
            {loading ? (
                <div style={metricSkeletonStyle} aria-label="Loading metric" />
            ) : (
                <div style={metricValueStyle}>
                    {value.toLocaleString()}
                    {suffix ?? ''}
                </div>
            )}
            <div style={metricDeltaStyle}>{delta}</div>
        </div>
    );
}

function ChartCard({
    insights,
    loading,
}: {
    insights?: ForeignIdentityStats;
    loading: boolean;
}) {
    const totalGender = (insights?.maleCount ?? 0) + (insights?.femaleCount ?? 0);
    const maleShare = totalGender > 0
        ? ((insights?.maleCount ?? 0) / totalGender) * 100
        : 0;

    return (
        <div style={cardStyle}>
            <div style={cardHeaderStyle}>
                <div style={cardTitleStyle}>FIN issuance</div>
                {!loading && (
                    <div style={cardMetaStyle}>
                        {insights?.totalRegistered.toLocaleString() ?? 0} total records
                    </div>
                )}
            </div>
            <ActivityChart
                data={insights?.registrationsLast7Days ?? []}
                color="var(--primary)"
                label="FIN registrations"
                loading={loading}
            />
            <div style={splitSectionStyle}>
                <div style={splitHeaderStyle}>
                    <span style={cardTitleStyle}>Gender balance</span>
                    {!loading && (
                        <span style={cardMetaStyle}>
                            {Math.round(maleShare)}% male · {Math.round(100 - maleShare)}% female
                        </span>
                    )}
                </div>
                {loading ? (
                    <div style={{ ...metricSkeletonStyle, width: '100%', height: 58 }} />
                ) : (
                    <>
                        <div style={progressTrackStyle}>
                            <div
                                style={{
                                    ...progressFillStyle,
                                    width: `${Math.max(maleShare, insights?.maleCount ? 6 : 0)}%`,
                                }}
                            />
                        </div>
                        <div style={genderLegendStyle}>
                            <span style={legendTextStyle}>
                                Male {(insights?.maleCount ?? 0).toLocaleString()}
                            </span>
                            <span style={legendTextStyle}>
                                Female {(insights?.femaleCount ?? 0).toLocaleString()}
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function CountryMix({
    countries,
    loading,
}: {
    countries: CountryCount[];
    loading: boolean;
}) {
    const maxCount = countries[0]?.count ?? 0;

    return (
        <div style={cardStyle}>
            <div style={cardHeaderStyle}>
                <div style={cardTitleStyle}>Top origin countries</div>
                <div style={cardMetaStyle}>Across all foreign identity records</div>
            </div>
            {loading ? (
                <CardSkeletonRows rows={4} />
            ) : countries.length === 0 ? (
                <EmptyCopy text="No foreign identity country data yet." />
            ) : (
                <div style={stackStyle}>
                    {countries.map((country) => (
                        <div key={country.country} style={countryRowStyle}>
                            <div style={countryLabelStyle}>
                                <ReactCountryFlag countryCode={country.country} svg />
                                <span>{getCountryLabel(country.country)}</span>
                            </div>
                            <div style={countryBarStyle}>
                                <div
                                    style={{
                                        ...countryBarFillStyle,
                                        width: `${maxCount > 0 ? (country.count / maxCount) * 100 : 0}%`,
                                    }}
                                />
                            </div>
                            <span style={countryCountStyle}>
                                {country.count.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function RecentRegistrations({
    items,
    loading,
}: {
    items: ForeignIdentityRecentRegistration[];
    loading: boolean;
}) {
    return (
        <div style={cardStyle}>
            <div style={cardHeaderStyle}>
                <div style={cardTitleStyle}>Latest issued FINs</div>
                <div style={cardMetaStyle}>Most recent registry activity</div>
            </div>
            {loading ? (
                <CardSkeletonRows rows={5} />
            ) : items.length === 0 ? (
                <EmptyCopy text="No foreign identities registered yet." />
            ) : (
                <div style={stackStyle}>
                    {items.map((item) => (
                        <Link
                            key={item.fin}
                            href={`/admin/foreign-identities/${item.fin}`}
                            style={registrationRowStyle}
                        >
                            <div style={registrationTopStyle}>
                                <span style={registrationNameStyle}>
                                    {item.firstName} {item.lastName}
                                </span>
                                <Badge variant={item.isActive ? 'active' : 'inactive'} dot>
                                    {item.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <div style={registrationMetaStyle}>
                                <span style={finStyle}>{item.fin}</span>
                                <span>·</span>
                                <span>{getCountryLabel(item.countryOfOrigin)}</span>
                                <span>·</span>
                                <span>v{item.issuanceVersion}</span>
                                <span>·</span>
                                <span>{formatTimeAgo(item.createdAt)}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function CardSkeletonRows({ rows }: { rows: number }) {
    return (
        <div style={stackStyle}>
            {Array.from({ length: rows }).map((_, index) => (
                <div key={index} style={skeletonRowStyle} />
            ))}
        </div>
    );
}

function EmptyCopy({ text }: { text: string }) {
    return <div style={emptyStateStyle}>{text}</div>;
}

const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    marginBottom: 20,
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 16,
    flexWrap: 'wrap',
};

const eyebrowStyle: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--primary)',
    fontWeight: 700,
    marginBottom: 6,
};

const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const subtitleStyle: React.CSSProperties = {
    margin: '6px 0 0',
    fontSize: 13,
    color: 'var(--text-muted)',
    maxWidth: 560,
};

const linkStyle: React.CSSProperties = {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontSize: 12,
    fontWeight: 600,
};

const metricGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 12,
};

const metricTileStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
};

const metricLabelStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontWeight: 600,
};

const metricValueStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontVariantNumeric: 'tabular-nums',
};

const metricDeltaStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
};

const metricSkeletonStyle: React.CSSProperties = {
    height: 30,
    width: 96,
    borderRadius: 8,
    background: 'rgba(0,0,0,0.06)',
};

const contentGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: 12,
};

const sideColumnStyle: React.CSSProperties = {
    display: 'grid',
    gap: 12,
    alignContent: 'start',
};

const cardStyle: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 16px',
};

const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 12,
    flexWrap: 'wrap',
};

const cardTitleStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--text-primary)',
};

const cardMetaStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
};

const splitSectionStyle: React.CSSProperties = {
    marginTop: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
};

const splitHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
};

const progressTrackStyle: React.CSSProperties = {
    height: 10,
    borderRadius: 999,
    background: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
};

const progressFillStyle: React.CSSProperties = {
    height: '100%',
    borderRadius: 999,
    background: 'var(--primary)',
};

const genderLegendStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
};

const legendTextStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
};

const stackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
};

const countryRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) minmax(90px, 1fr) auto',
    gap: 10,
    alignItems: 'center',
};

const countryLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: 'var(--text-primary)',
    minWidth: 0,
};

const countryBarStyle: React.CSSProperties = {
    height: 8,
    borderRadius: 999,
    background: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
};

const countryBarFillStyle: React.CSSProperties = {
    height: '100%',
    borderRadius: 999,
    background: 'var(--primary)',
};

const countryCountStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontVariantNumeric: 'tabular-nums',
};

const registrationRowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'var(--surface-raised)',
    textDecoration: 'none',
};

const registrationTopStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
};

const registrationNameStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--text-primary)',
};

const registrationMetaStyle: React.CSSProperties = {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    fontSize: 12,
    color: 'var(--text-muted)',
    alignItems: 'center',
};

const finStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    color: 'var(--text-primary)',
};

const skeletonRowStyle: React.CSSProperties = {
    height: 48,
    borderRadius: 'var(--radius-sm)',
    background: 'rgba(0,0,0,0.06)',
};

const emptyStateStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-muted)',
    padding: '12px 0',
};
