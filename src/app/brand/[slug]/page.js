import { notFound } from 'next/navigation';
import Link from 'next/link';
import BrandUnlockClient from './BrandUnlockClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co';

export const revalidate = 3600;

async function fetchBrand(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/public/brands/${slug}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchRelatedBrands(category, currentSlug) {
  if (!category) return [];
  try {
    const res = await fetch(`${API_BASE}/api/public/brands?category=${encodeURIComponent(category)}&limit=7`, {
      next: { revalidate },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const brands = data.brands || data || [];
    return brands.filter(b => b.slug !== currentSlug).slice(0, 6);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/public/brands?limit=100`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const brands = data.brands || data || [];
    return brands.map(b => ({ slug: b.slug })).filter(b => b.slug);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const brand = await fetchBrand(slug);

  if (!brand) {
    return { title: 'Brand Not Found | Newcollab' };
  }

  const title = brand?.seo?.title || `${brand.name} PR List & Application | Newcollab`;
  const description =
    brand?.seo?.description ||
    `Apply to ${brand.name} PR list. ${brand.description ? brand.description.slice(0, 120) : `Get free products and collaborate with ${brand.name}.`}`;

  return {
    title,
    description,
    alternates: { canonical: `https://newcollab.co/brand/${brand.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `https://newcollab.co/brand/${brand.slug}`,
      images: brand.logo ? [{ url: brand.logo, width: 200, height: 200, alt: `${brand.name} logo` }] : [],
      siteName: 'Newcollab',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: brand.logo ? [brand.logo] : [],
    },
  };
}

function JsonLd({ brand }) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.name,
    url: brand.website || `https://newcollab.co/brand/${brand.slug}`,
    ...(brand.logo && { logo: brand.logo }),
    ...(brand.description && { description: brand.description }),
    ...(brand.instagram && {
      sameAs: [`https://instagram.com/${brand.instagram.replace('@', '')}`],
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Directory', item: 'https://newcollab.co/directory' },
      ...(brand.category
        ? [{ '@type': 'ListItem', position: 2, name: brand.category.charAt(0).toUpperCase() + brand.category.slice(1), item: `https://newcollab.co/directory?category=${brand.category}` }]
        : []),
      { '@type': 'ListItem', position: brand.category ? 3 : 2, name: brand.name, item: `https://newcollab.co/brand/${brand.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </>
  );
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const brand = await fetchBrand(slug);

  if (!brand) notFound();

  const relatedBrands = await fetchRelatedBrands(brand.category, brand.slug);

  const requirements = brand.requirements || {};
  const stats = brand.stats || {};
  const platforms = requirements.platforms || brand.platforms || [];
  const regions = requirements.regions || brand.regions || [];
  const niches = brand.niches || [];
  const minFollowers = requirements.minFollowers || brand.minFollowers;
  const maxFollowers = requirements.maxFollowers || brand.maxFollowers;
  const responseRate = stats.responseRate || brand.responseRate;
  const avgResponseTime = stats.avgResponseTime || brand.avgResponseTime;
  const hasDirectLink = Boolean(brand?.gated?.hasDirectLink);
  const hasEmail = Boolean(brand?.gated?.hasEmailContact);

  const categoryLabel = brand.category
    ? brand.category.charAt(0).toUpperCase() + brand.category.slice(1)
    : null;

  return (
    <>
      <JsonLd brand={brand} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 24px 4rem' }}>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: 24, fontSize: 14, color: '#64748b' }}>
          <Link href="/directory" style={{ color: '#6366f1', textDecoration: 'none' }}>Directory</Link>
          {categoryLabel && (
            <>
              <span style={{ margin: '0 8px' }}>›</span>
              <Link href={`/directory?category=${brand.category}`} style={{ color: '#6366f1', textDecoration: 'none' }}>{categoryLabel}</Link>
            </>
          )}
          <span style={{ margin: '0 8px' }}>›</span>
          <span>{brand.name}</span>
        </nav>

        {/* Header */}
        <header style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{ width: 88, height: 88, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)', background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {brand.logo ? (
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logo} alt={`${brand.name} logo`} width={88} height={88} style={{ objectFit: 'cover' }} />
            ) : (
              <span style={{ fontWeight: 900, color: '#6366f1', fontSize: 32 }}>
                {brand.name?.slice(0, 1) || 'B'}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.2, color: '#0f172a' }}>{brand.name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              {categoryLabel && (
                <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                  {categoryLabel}
                </span>
              )}
              {brand.isFeatured && (
                <span style={{ background: '#fefce8', color: '#ca8a04', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                  ⭐ Featured
                </span>
              )}
              {minFollowers > 0 && (
                <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                  {minFollowers >= 1000 ? `${Math.round(minFollowers / 1000)}K` : minFollowers}+ followers required
                </span>
              )}
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
          {/* Main content */}
          <div>
            {/* About section */}
            {brand.description && (
              <section style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 20, color: '#0f172a' }}>About {brand.name}</h2>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: 16 }}>{brand.description}</p>
              </section>
            )}

            {/* Requirements section */}
            {(minFollowers > 0 || platforms.length > 0 || regions.length > 0 || niches.length > 0) && (
              <section style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#0f172a' }}>Requirements & Details</h2>
                <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}>
                  {minFollowers > 0 && (
                    <div>
                      <dt style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Minimum Followers</dt>
                      <dd style={{ margin: 0, fontSize: 16, color: '#0f172a', fontWeight: 600 }}>
                        {minFollowers >= 1000 ? `${(minFollowers / 1000).toFixed(0)}K` : minFollowers}
                        {maxFollowers ? ` – ${maxFollowers >= 1000 ? `${(maxFollowers / 1000).toFixed(0)}K` : maxFollowers}` : '+'}
                      </dd>
                    </div>
                  )}
                  {platforms.length > 0 && (
                    <div>
                      <dt style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Platforms</dt>
                      <dd style={{ margin: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {platforms.map(p => (
                          <span key={p} style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: 12, fontSize: 13, color: '#334155' }}>{p}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {regions.length > 0 && (
                    <div>
                      <dt style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Regions</dt>
                      <dd style={{ margin: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {regions.map(r => (
                          <span key={r} style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: 12, fontSize: 13, color: '#334155' }}>{r}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {niches.length > 0 && (
                    <div style={{ gridColumn: niches.length > 3 ? 'span 2' : undefined }}>
                      <dt style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Niches</dt>
                      <dd style={{ margin: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {niches.map(n => (
                          <span key={n} style={{ background: '#faf5ff', padding: '3px 10px', borderRadius: 12, fontSize: 13, color: '#7c3aed' }}>{n}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {brand.productTypes && (
                    <div>
                      <dt style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Product Types</dt>
                      <dd style={{ margin: 0, fontSize: 15, color: '#334155' }}>{brand.productTypes}</dd>
                    </div>
                  )}
                  {brand.applicationMethod && (
                    <div>
                      <dt style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontWeight: 500 }}>Application Method</dt>
                      <dd style={{ margin: 0, fontSize: 15, color: '#334155', textTransform: 'capitalize' }}>{brand.applicationMethod}</dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {/* Stats section */}
            {(responseRate || avgResponseTime) && (
              <section style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 20, color: '#0f172a' }}>Response Stats</h2>
                <div style={{ display: 'flex', gap: 32 }}>
                  {responseRate > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 36, fontWeight: 700, color: '#16a34a' }}>{responseRate}%</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Response Rate</div>
                    </div>
                  )}
                  {avgResponseTime > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 36, fontWeight: 700, color: '#6366f1' }}>{avgResponseTime}</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Avg. Days to Respond</div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Social handles */}
            {(brand.instagram || brand.tiktok || brand.website) && (
              <section style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 24, marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 20, color: '#0f172a' }}>Connect</h2>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {brand.website && (
                    <a href={brand.website} target="_blank" rel="noopener noreferrer nofollow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', color: '#334155', textDecoration: 'none', fontSize: 14 }}>
                      🌐 Website
                    </a>
                  )}
                  {brand.instagram && (
                    <a href={`https://instagram.com/${brand.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer nofollow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', color: '#334155', textDecoration: 'none', fontSize: 14 }}>
                      📸 @{brand.instagram.replace('@', '')}
                    </a>
                  )}
                  {brand.tiktok && (
                    <a href={`https://tiktok.com/@${brand.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer nofollow" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1px solid #e2e8f0', color: '#334155', textDecoration: 'none', fontSize: 14 }}>
                      🎵 @{brand.tiktok.replace('@', '')}
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside>
            {/* Apply / Unlock CTA */}
            <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.04)', position: 'sticky', top: 100 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, color: '#0f172a' }}>Apply to {brand.name}</h2>
              <p style={{ margin: '0 0 16px', color: '#64748b', lineHeight: 1.6, fontSize: 14 }}>
                Unlock the PR application link{hasEmail ? ' and contact email' : ''} to start collaborating with {brand.name}.
              </p>

              <BrandUnlockClient
                slug={brand.slug}
                hasDirectLink={hasDirectLink}
                hasEmail={hasEmail}
              />

              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: '#64748b' }}>
                  Want to track your applications and discover more brands?
                </p>
                <a href="/register/creator" style={{ display: 'block', textAlign: 'center', background: '#6366f1', color: 'white', padding: '10px 20px', borderRadius: 10, textDecoration: 'none', fontWeight: 600, fontSize: 15 }}>
                  Create free account
                </a>
                <a href="/login" style={{ display: 'block', textAlign: 'center', color: '#6366f1', padding: '8px 20px', textDecoration: 'none', fontSize: 14, marginTop: 8 }}>
                  Already have an account? Log in
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related brands */}
        {relatedBrands.length > 0 && (
          <section style={{ marginTop: 40 }}>
            <h2 style={{ fontSize: 24, color: '#0f172a', marginBottom: 20 }}>
              More {categoryLabel || ''} Brands on Newcollab
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {relatedBrands.map(rb => {
                const rbName = rb.name || rb.brand_name;
                const rbLogo = rb.logo || rb.logo_url;
                const rbMinFollowers = rb.minFollowers || rb.min_followers;
                return (
                <Link
                  key={rb.slug}
                  href={`/brand/${rb.slug}`}
                  style={{ display: 'block', background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: 20, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' }}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {rbLogo ? (
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={rbLogo} alt={rbName} width={48} height={48} style={{ objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontWeight: 800, color: '#6366f1', fontSize: 18 }}>
                          {rbName?.slice(0, 1) || 'B'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 16 }}>{rbName}</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
                        {rb.category && <span style={{ textTransform: 'capitalize' }}>{rb.category}</span>}
                        {rbMinFollowers > 0 && <span> · {rbMinFollowers >= 1000 ? `${Math.round(rbMinFollowers / 1000)}K` : rbMinFollowers}+ followers</span>}
                      </div>
                    </div>
                  </div>
                  {rb.description && (
                    <p style={{ margin: '10px 0 0', fontSize: 13, color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rb.description}
                    </p>
                  )}
                </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* SEO content footer */}
        <section style={{ marginTop: 40, padding: 24, background: '#f8fafc', borderRadius: 16 }}>
          <h2 style={{ fontSize: 20, color: '#0f172a', marginBottom: 12 }}>How to Apply to {brand.name} PR List</h2>
          <p style={{ color: '#475569', lineHeight: 1.8, fontSize: 15, margin: 0 }}>
            {brand.name} accepts PR applications from content creators{minFollowers > 0 ? ` with ${minFollowers >= 1000 ? `${Math.round(minFollowers / 1000)}K` : minFollowers}+ followers` : ''}{platforms.length > 0 ? ` on ${platforms.join(', ')}` : ''}.
            {brand.applicationMethod === 'form' ? ` Apply directly through their application form.` : brand.applicationMethod === 'email' ? ` Reach out via their PR email.` : ` Unlock the application details above to get started.`}
            {' '}Create a free Newcollab account to track your application, discover more brands, and manage your PR pipeline.
          </p>
        </section>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 360px"] {
            display: flex !important;
            flex-direction: column-reverse !important;
          }
        }
      `}</style>
    </>
  );
}
