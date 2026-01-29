import { notFound } from 'next/navigation';
import Link from 'next/link';
import BrandUnlockClient from './BrandUnlockClient';
import BrandPageLayout from './BrandPageLayout';

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
    // Pre-generate top 50 pages at build time to speed up deployment
    // Remaining pages are generated on-demand via ISR (revalidate: 3600)
    const res = await fetch(`${API_BASE}/api/public/brands?limit=50`, {
      signal: AbortSignal.timeout(10000),
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
    <BrandPageLayout canonicalUrl={`https://newcollab.co/brand/${brand.slug}`}>
      <JsonLd brand={brand} />
      <style>{`
        .bp-page { max-width: 1100px; margin: 0 auto; padding: 2rem 24px 4rem; }
        .bp-breadcrumb { margin-bottom: 24px; font-size: 14px; color: #64748b; }
        .bp-breadcrumb a { color: #6366f1; text-decoration: none; }
        .bp-breadcrumb .bp-sep { margin: 0 8px; }

        .bp-header { display: flex; gap: 20px; align-items: center; margin-bottom: 24px; }
        .bp-logo { width: 88px; height: 88px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); background: #f3f4f6; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .bp-logo img { width: 100%; height: 100%; object-fit: cover; }
        .bp-header-info { flex: 1; min-width: 0; }
        .bp-title { margin: 0; font-size: 32px; line-height: 1.2; color: #0f172a; }
        .bp-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
        .bp-tag { padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 500; }

        .bp-grid { display: grid; grid-template-columns: 1fr 360px; gap: 24px; align-items: start; }
        .bp-main { min-width: 0; }

        .bp-card { background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        .bp-card h2 { margin: 0 0 12px; font-size: 20px; color: #0f172a; }

        .bp-req-grid { margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 16px 32px; }
        .bp-req-grid dt { font-size: 13px; color: #64748b; margin-bottom: 4px; font-weight: 500; }
        .bp-req-grid dd { margin: 0; font-size: 16px; color: #0f172a; font-weight: 600; }

        .bp-stats { display: flex; gap: 32px; }
        .bp-stat-value { font-size: 36px; font-weight: 700; }
        .bp-stat-label { font-size: 13px; color: #64748b; margin-top: 4px; }

        .bp-social-links { display: flex; gap: 12px; flex-wrap: wrap; }
        .bp-social-link { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; border: 1px solid #e2e8f0; color: #334155; text-decoration: none; font-size: 14px; }

        .bp-sidebar .bp-cta-box { background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); position: sticky; top: 100px; }
        .bp-cta-box h2 { margin: 0 0 8px; font-size: 20px; color: #0f172a; }
        .bp-cta-box .bp-cta-desc { margin: 0 0 16px; color: #64748b; line-height: 1.6; font-size: 14px; }
        .bp-cta-footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.06); }
        .bp-cta-footer p { margin: 0 0 12px; font-size: 14px; color: #64748b; }
        .bp-btn-primary { display: block; text-align: center; background: #6366f1; color: white; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px; }
        .bp-btn-secondary { display: block; text-align: center; color: #6366f1; padding: 8px 20px; text-decoration: none; font-size: 14px; margin-top: 8px; }

        .bp-related { margin-top: 40px; }
        .bp-related h2 { font-size: 24px; color: #0f172a; margin-bottom: 20px; }
        .bp-related-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .bp-related-card { display: block; background: white; border: 1px solid rgba(0,0,0,0.06); border-radius: 14px; padding: 20px; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .bp-related-header { display: flex; gap: 12px; align-items: center; }
        .bp-related-logo { width: 48px; height: 48px; border-radius: 10px; overflow: hidden; background: #f3f4f6; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
        .bp-related-logo img { width: 100%; height: 100%; object-fit: cover; }
        .bp-related-name { font-weight: 600; color: #0f172a; font-size: 16px; }
        .bp-related-meta { font-size: 13px; color: #64748b; margin-top: 2px; }
        .bp-related-desc { margin: 10px 0 0; font-size: 13px; color: #64748b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        .bp-seo-footer { margin-top: 40px; padding: 24px; background: #f8fafc; border-radius: 16px; }
        .bp-seo-footer h2 { font-size: 20px; color: #0f172a; margin: 0 0 12px; }
        .bp-seo-footer p { color: #475569; line-height: 1.8; font-size: 15px; margin: 0; }

        .bp-pill { background: #f1f5f9; padding: 3px 10px; border-radius: 12px; font-size: 13px; color: #334155; display: inline-block; }
        .bp-pill-purple { background: #faf5ff; color: #7c3aed; }

        /* ===== MOBILE: up to 768px ===== */
        @media (max-width: 768px) {
          .bp-page { padding: 1rem 16px 3rem; }

          .bp-header { gap: 14px; }
          .bp-logo { width: 64px; height: 64px; border-radius: 12px; }
          .bp-title { font-size: 24px; }
          .bp-tags { gap: 6px; margin-top: 8px; }
          .bp-tag { font-size: 12px; padding: 3px 10px; }

          .bp-grid {
            display: flex;
            flex-direction: column;
          }
          /* CTA sidebar appears FIRST on mobile */
          .bp-sidebar { order: -1; }
          .bp-sidebar .bp-cta-box {
            position: static;
            margin-bottom: 20px;
          }

          .bp-card { padding: 18px; border-radius: 14px; margin-bottom: 16px; }
          .bp-card h2 { font-size: 18px; margin-bottom: 10px; }

          .bp-req-grid { grid-template-columns: 1fr; gap: 14px; }
          .bp-req-grid dd { font-size: 15px; }

          .bp-stats { gap: 24px; }
          .bp-stat-value { font-size: 28px; }

          .bp-social-links { gap: 8px; }
          .bp-social-link { padding: 6px 12px; font-size: 13px; }

          .bp-related h2 { font-size: 20px; }
          .bp-related-grid { grid-template-columns: 1fr; gap: 12px; }
          .bp-related-card { padding: 16px; }

          .bp-seo-footer { padding: 18px; margin-top: 32px; }
          .bp-seo-footer h2 { font-size: 18px; }
          .bp-seo-footer p { font-size: 14px; }

          .bp-btn-primary { padding: 12px 20px; font-size: 16px; }
        }

        /* ===== TABLET: 769px - 1024px ===== */
        @media (min-width: 769px) and (max-width: 1024px) {
          .bp-grid { grid-template-columns: 1fr 300px; gap: 20px; }
          .bp-title { font-size: 28px; }
        }
      `}</style>

      <div className="bp-page">

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="bp-breadcrumb">
          <Link href="/directory">Directory</Link>
          {categoryLabel && (
            <>
              <span className="bp-sep">›</span>
              <Link href={`/directory?category=${brand.category}`}>{categoryLabel}</Link>
            </>
          )}
          <span className="bp-sep">›</span>
          <span>{brand.name}</span>
        </nav>

        {/* Header */}
        <header className="bp-header">
          <div className="bp-logo">
            {brand.logo ? (
              <img src={brand.logo} alt={`${brand.name} logo`} />
            ) : (
              <span style={{ fontWeight: 900, color: '#6366f1', fontSize: 32 }}>
                {brand.name?.slice(0, 1) || 'B'}
              </span>
            )}
          </div>
          <div className="bp-header-info">
            <h1 className="bp-title">{brand.name}</h1>
            <div className="bp-tags">
              {categoryLabel && (
                <span className="bp-tag" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  {categoryLabel}
                </span>
              )}
              {brand.isFeatured && (
                <span className="bp-tag" style={{ background: '#fefce8', color: '#ca8a04' }}>
                  Featured
                </span>
              )}
              {minFollowers > 0 && (
                <span className="bp-tag" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  {minFollowers >= 1000 ? `${Math.round(minFollowers / 1000)}K` : minFollowers}+ followers
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="bp-grid">
          {/* Main content */}
          <div className="bp-main">
            {/* About section */}
            {brand.description && (
              <section className="bp-card">
                <h2>About {brand.name}</h2>
                <p style={{ margin: 0, color: '#475569', lineHeight: 1.8, fontSize: 16 }}>{brand.description}</p>
              </section>
            )}

            {/* Requirements section */}
            {(minFollowers > 0 || platforms.length > 0 || regions.length > 0 || niches.length > 0) && (
              <section className="bp-card">
                <h2 style={{ marginBottom: 16 }}>Requirements & Details</h2>
                <dl className="bp-req-grid">
                  {minFollowers > 0 && (
                    <div>
                      <dt>Minimum Followers</dt>
                      <dd>
                        {minFollowers >= 1000 ? `${(minFollowers / 1000).toFixed(0)}K` : minFollowers}
                        {maxFollowers ? ` – ${maxFollowers >= 1000 ? `${(maxFollowers / 1000).toFixed(0)}K` : maxFollowers}` : '+'}
                      </dd>
                    </div>
                  )}
                  {platforms.length > 0 && (
                    <div>
                      <dt>Platforms</dt>
                      <dd style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {platforms.map(p => (
                          <span key={p} className="bp-pill">{p}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {regions.length > 0 && (
                    <div>
                      <dt>Regions</dt>
                      <dd style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {regions.map(r => (
                          <span key={r} className="bp-pill">{r}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {niches.length > 0 && (
                    <div style={{ gridColumn: niches.length > 3 ? 'span 2' : undefined }}>
                      <dt>Niches</dt>
                      <dd style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {niches.map(n => (
                          <span key={n} className="bp-pill bp-pill-purple">{n}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {brand.productTypes && (
                    <div>
                      <dt>Product Types</dt>
                      <dd style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(Array.isArray(brand.productTypes) ? brand.productTypes : String(brand.productTypes).split(/[,;]+/)).map(t => String(t).trim()).filter(Boolean).map(t => (
                          <span key={t} className="bp-pill" style={{ textTransform: 'capitalize' }}>{t}</span>
                        ))}
                      </dd>
                    </div>
                  )}
                  {brand.applicationMethod && (
                    <div>
                      <dt>Application Method</dt>
                      <dd style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(() => {
                          const m = brand.applicationMethod.toLowerCase();
                          const badges = [];
                          if (m.includes('link') || m.includes('form') || m.includes('direct')) {
                            badges.push({ label: 'PR Form', color: '#6366f1', bg: '#eef2ff' });
                          }
                          if (m.includes('email') || m.includes('mail')) {
                            badges.push({ label: 'PR Email', color: '#0891b2', bg: '#ecfeff' });
                          }
                          if (badges.length === 0) {
                            badges.push({ label: brand.applicationMethod, color: '#6366f1', bg: '#eef2ff' });
                          }
                          return badges.map(b => (
                            <span key={b.label} style={{ background: b.bg, color: b.color, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                              {b.label}
                            </span>
                          ));
                        })()}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {/* Stats section */}
            {(responseRate || avgResponseTime) && (
              <section className="bp-card">
                <h2 style={{ marginBottom: 16 }}>Response Stats</h2>
                <div className="bp-stats">
                  {responseRate > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div className="bp-stat-value" style={{ color: '#16a34a' }}>{responseRate}%</div>
                      <div className="bp-stat-label">Response Rate</div>
                    </div>
                  )}
                  {avgResponseTime > 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div className="bp-stat-value" style={{ color: '#6366f1' }}>{avgResponseTime}</div>
                      <div className="bp-stat-label">Avg. Days to Respond</div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Social handles */}
            {(brand.instagram || brand.tiktok || brand.website) && (
              <section className="bp-card">
                <h2>Connect</h2>
                <div className="bp-social-links">
                  {brand.website && (
                    <a href={brand.website} target="_blank" rel="noopener noreferrer nofollow" className="bp-social-link">
                      🌐 Website
                    </a>
                  )}
                  {brand.instagram && (
                    <a href={`https://instagram.com/${brand.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer nofollow" className="bp-social-link">
                      📸 @{brand.instagram.replace('@', '')}
                    </a>
                  )}
                  {brand.tiktok && (
                    <a href={`https://tiktok.com/@${brand.tiktok.replace('@', '')}`} target="_blank" rel="noopener noreferrer nofollow" className="bp-social-link">
                      🎵 @{brand.tiktok.replace('@', '')}
                    </a>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="bp-sidebar">
            <div className="bp-cta-box">
              <h2>Apply to {brand.name}</h2>
              <p className="bp-cta-desc">
                Unlock the PR application link{hasEmail ? ' and contact email' : ''} to start collaborating with {brand.name}.
              </p>

              <BrandUnlockClient
                slug={brand.slug}
                hasDirectLink={hasDirectLink}
                hasEmail={hasEmail}
              />

              <div className="bp-cta-footer">
                <p>Want to track your applications and discover more brands?</p>
                <a href="/register/creator" className="bp-btn-primary">
                  Create free account
                </a>
                <a href="/login" className="bp-btn-secondary">
                  Already have an account? Log in
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related brands */}
        {relatedBrands.length > 0 && (
          <section className="bp-related">
            <h2>More {categoryLabel || ''} Brands on Newcollab</h2>
            <div className="bp-related-grid">
              {relatedBrands.map(rb => {
                const rbName = rb.name || rb.brand_name;
                const rbLogo = rb.logo || rb.logo_url;
                const rbMinFollowers = rb.minFollowers || rb.min_followers;
                return (
                <Link key={rb.slug} href={`/brand/${rb.slug}`} className="bp-related-card">
                  <div className="bp-related-header">
                    <div className="bp-related-logo">
                      {rbLogo ? (
                        <img src={rbLogo} alt={rbName} />
                      ) : (
                        <span style={{ fontWeight: 800, color: '#6366f1', fontSize: 18 }}>
                          {rbName?.slice(0, 1) || 'B'}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="bp-related-name">{rbName}</div>
                      <div className="bp-related-meta">
                        {rb.category && <span style={{ textTransform: 'capitalize' }}>{rb.category}</span>}
                        {rbMinFollowers > 0 && <span> · {rbMinFollowers >= 1000 ? `${Math.round(rbMinFollowers / 1000)}K` : rbMinFollowers}+ followers</span>}
                      </div>
                    </div>
                  </div>
                  {rb.description && (
                    <p className="bp-related-desc">{rb.description}</p>
                  )}
                </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* SEO content footer */}
        <section className="bp-seo-footer">
          <h2>How to Apply to {brand.name} PR List</h2>
          <p>
            {brand.name} accepts PR applications from content creators{minFollowers > 0 ? ` with ${minFollowers >= 1000 ? `${Math.round(minFollowers / 1000)}K` : minFollowers}+ followers` : ''}{platforms.length > 0 ? ` on ${platforms.join(', ')}` : ''}.
            {brand.applicationMethod === 'form' ? ` Apply directly through their application form.` : brand.applicationMethod === 'email' ? ` Reach out via their PR email.` : ` Unlock the application details above to get started.`}
            {' '}Create a free Newcollab account to track your application, discover more brands, and manage your PR pipeline.
          </p>
        </section>
      </div>
    </BrandPageLayout>
  );
}
