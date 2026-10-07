import { notFound } from 'next/navigation';
import Link from 'next/link';
import BrandPageLayout from '../../../brand/[slug]/BrandPageLayout';
import { BRAND_LETTERS, brandLetter, fetchBrandIndex, letterLabel } from '../../../../lib/brandIndex';

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return BRAND_LETTERS.map(letter => ({ letter }));
}

function categoryName(category) {
  if (!category) return null;
  return category.charAt(0).toUpperCase() + category.slice(1);
}

async function brandsForLetter(letter) {
  const all = await fetchBrandIndex();
  if (!all) return null;
  return all
    .filter(b => brandLetter(b.name) === letter)
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

export async function generateMetadata({ params }) {
  const { letter } = await params;
  if (!BRAND_LETTERS.includes(letter)) return {};
  const brands = await brandsForLetter(letter);
  const label = letterLabel(letter);
  const sample = (brands || []).slice(0, 3).map(b => b.name).join(', ');
  const url = `https://newcollab.co/directory/brands/${letter}`;
  return {
    title: `Brands Starting With ${label}: PR Lists & Creator Programs | Newcollab`,
    description: `${brands?.length || 'All'} brands starting with ${label} that work with creators${sample ? `, including ${sample}` : ''}. See PR requirements, package value and how to apply.`,
    alternates: { canonical: url },
    ...(brands && brands.length === 0 && { robots: { index: false, follow: true } }),
    openGraph: { type: 'website', url, siteName: 'Newcollab', title: `Brands starting with ${label} | Newcollab` },
  };
}

const css = `
  .az-wrap { background: #F5F5F7; min-height: 100vh; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
  .az-page { max-width: 1160px; margin: 0 auto; padding: 164px 24px 80px; }
  @media (max-width: 768px) { .az-page { padding: 116px 16px 80px; } }
  .az-card { background: #fff; border: 1px solid #E8E8E8; border-radius: 20px; padding: 28px; box-shadow: 0 1px 3px rgba(15,15,15,0.05); }
  .az-card + .az-card { margin-top: 16px; }
  .az-title { margin: 0 0 8px; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #0F0F0F; }
  .az-intro { margin: 0; color: #4B4B4B; font-size: 14px; line-height: 1.7; }
  .az-letters { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 18px; }
  .az-letters a, .az-letters span { min-width: 34px; padding: 7px 10px; border-radius: 10px; text-align: center; font-size: 13px; font-weight: 700; text-decoration: none; }
  .az-letters a { background: #F4F4F4; color: #0F0F0F; }
  .az-letters a:hover { background: #FFF1F3; color: #E11D48; }
  .az-letters span { background: #0F0F0F; color: #fff; }
  .az-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px 20px; }
  @media (max-width: 860px) { .az-list { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 520px) { .az-list { grid-template-columns: 1fr; } }
  .az-list li { padding: 8px 0; border-bottom: 1px solid #F0F0F0; font-size: 14px; }
  .az-list a { color: #0F0F0F; font-weight: 600; text-decoration: none; }
  .az-list a:hover { color: #E11D48; }
  .az-cat { color: #8C8C8C; font-size: 12px; margin-left: 6px; }
  .az-more { margin: 0; font-size: 14px; color: #4B4B4B; line-height: 1.8; }
  .az-more a { color: #E11D48; font-weight: 600; text-decoration: none; }
`;

export default async function BrandLetterPage({ params }) {
  const { letter } = await params;
  if (!BRAND_LETTERS.includes(letter)) notFound();
  const brands = (await brandsForLetter(letter)) || [];
  const label = letterLabel(letter);

  return (
    <BrandPageLayout canonicalUrl={`https://newcollab.co/directory/brands/${letter}`}>
      <style>{css}</style>
      <div className="az-wrap">
        <div className="az-page">
          <section className="az-card">
            <h1 className="az-title">Brands starting with {label}</h1>
            <p className="az-intro">
              {brands.length > 0
                ? `${brands.length} brands starting with ${label} that send PR packages or run creator programmes. Open any brand to see who they work with, what they send and how to apply.`
                : `No brands starting with ${label} are listed right now. Browse another letter below.`}
            </p>
            <nav className="az-letters" aria-label="Brands A to Z">
              {BRAND_LETTERS.map(l => (l === letter
                ? <span key={l} aria-current="page">{letterLabel(l)}</span>
                : <Link key={l} href={`/directory/brands/${l}`}>{letterLabel(l)}</Link>))}
            </nav>
          </section>

          {brands.length > 0 && (
            <section className="az-card">
              <ul className="az-list">
                {brands.map(b => (
                  <li key={b.slug}>
                    <Link href={`/brand/${b.slug}`}>{b.name}</Link>
                    {b.category && <span className="az-cat">{categoryName(b.category)}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="az-card">
            <p className="az-more">
              Browse by category: <a href="/directory/beauty">Beauty</a> · <a href="/directory/skincare">Skincare</a> · <a href="/directory/k-beauty">K-Beauty</a> · <a href="/directory/fashion">Fashion</a> · <a href="/directory/wellness">Wellness</a> · <a href="/directory/lifestyle">Lifestyle</a> · <a href="/directory">All brands</a>
            </p>
          </section>
        </div>
      </div>
    </BrandPageLayout>
  );
}
