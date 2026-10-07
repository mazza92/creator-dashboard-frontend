import Link from 'next/link';
import { BRAND_LETTERS, letterLabel } from '../../lib/brandIndex';

const API = `${process.env.NEXT_PUBLIC_API_URL || 'https://api.newcollab.co'}/api/public/brands`;

async function fetchBrands({ category, region, limit }) {
  const qs = new URLSearchParams({ page: '1', limit: String(limit) });
  if (category) qs.set('category', category);
  if (region) qs.set('region', region);
  try {
    const res = await fetch(`${API}?${qs}`, {
      headers: { Accept: 'application/json', Origin: 'https://newcollab.co' },
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data.brands) ? data.brands : [];
  } catch {
    return [];
  }
}

const sectionStyle = {
  background: 'white',
  border: '1px solid #E8E8E8',
  borderRadius: '18px',
  padding: '28px 32px',
  margin: '40px auto 0',
  maxWidth: '900px',
  boxShadow: '0 1px 3px rgba(15,15,15,0.05)',
};
const headingStyle = { fontSize: '18px', fontWeight: 700, color: '#0F0F0F', margin: '0 0 6px' };
const subStyle = { fontSize: '14px', color: '#4B4B4B', lineHeight: 1.7, margin: '0 0 16px' };
const listStyle = {
  listStyle: 'none', margin: 0, padding: 0,
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2px 16px',
};
const itemStyle = { padding: '6px 0', borderBottom: '1px solid #F0F0F0', fontSize: '14px' };
const linkStyle = { color: '#0F0F0F', fontWeight: 600, textDecoration: 'none' };
const lettersStyle = { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '18px' };
const letterStyle = {
  minWidth: '30px', padding: '5px 8px', borderRadius: '8px', background: '#F4F4F4',
  textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#0F0F0F', textDecoration: 'none',
};

/**
 * Plain, server-rendered links to brand pages. The interactive directory is
 * client-only, so without this the HTML Google crawls has no brand links.
 */
export default async function DirectoryBrandLinks({ label, category, region, limit = 100, wrapperStyle }) {
  const brands = await fetchBrands({ category, region, limit });
  const named = brands.filter(b => b.slug && (b.name || b.brand_name));

  return (
    <div style={wrapperStyle || { padding: '0 24px', background: '#FAFAFA' }}>
      <section style={sectionStyle}>
        <h2 style={headingStyle}>{label ? `${label} brands on Newcollab` : 'Brands on Newcollab'}</h2>
        <p style={subStyle}>
          Open a brand to see what they send creators, who they want to reach and how to apply.
        </p>
        {named.length > 0 && (
          <ul style={listStyle}>
            {named.map(b => (
              <li key={b.slug} style={itemStyle}>
                <Link href={`/brand/${b.slug}`} style={linkStyle}>{b.name || b.brand_name}</Link>
              </li>
            ))}
          </ul>
        )}
        <nav style={lettersStyle} aria-label="All brands A to Z">
          {BRAND_LETTERS.map(l => (
            <Link key={l} href={`/directory/brands/${l}`} style={letterStyle}>{letterLabel(l)}</Link>
          ))}
        </nav>
      </section>
    </div>
  );
}
