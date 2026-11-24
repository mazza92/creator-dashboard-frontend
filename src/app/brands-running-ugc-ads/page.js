import Link from 'next/link';
import UgcDataPage from '../_ugcdata/UgcDataPage';
import { fetchData, faqSchema, listSchema, monthLabel } from '../_ugcdata/data';

export const revalidate = 3600;

const URL = 'https://newcollab.co/brands-running-ugc-ads';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const day = (iso) => { const d = new Date(iso); return iso && !Number.isNaN(d.getTime()) ? `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}` : ''; };

function chipsFor(b) {
  const out = [];
  if (b.brief) out.push(['good', 'Paid UGC brief open']);
  if (b.creatorAds) out.push(['good', 'Creator-style ads']);
  if (b.hot && b.seenOn) out.push(['hot', `Ads seen ${day(b.seenOn)}`]);
  return out;
}

function faqFor(total) {
  return [
    ['Which brands are running UGC ads right now?',
      `${total || 'Hundreds of'} brands on Newcollab were seen running ads in a public ad library in the last 30 days or run creator-style ads. The list is ordered by the strongest signal: an open paid UGC brief, then creator-style ads, then the most recent ads.`],
    ['Why pitch brands that are running ads?',
      'Brands that advertise burn through videos fast and need fresh creative every few weeks. That makes them the most likely to pay for UGC, and the most likely to answer a pitch that offers ad-ready videos.'],
    ['What should I offer a brand that runs ads?',
      'One ad-ready video built around their best seller, plus raw footage and three hook variations their ad team can test. Keep the email under 120 words and link two sample videos.'],
    ['How much do brands pay for UGC ads?',
      'Beginner UGC creators usually charge $50 to $150 per video for organic use, plus a separate usage fee when the brand runs the video as a paid ad, often 30 to 50% of the video fee per month of usage.'],
  ];
}

export async function generateMetadata() {
  const data = await fetchData('/api/public/brands-running-ugc-ads');
  const total = data?.total || 0;
  const title = `Brands Running UGC Ads Right Now (${monthLabel()})`;
  const description = `${total ? `${total} ` : ''}brands seen running ads in the last 30 days or running creator-style ads: the brands most likely to pay UGC creators. Updated daily, with how to pitch them.`;
  return {
    title,
    description,
    alternates: { canonical: URL },
    openGraph: { title, description, url: URL, type: 'website', siteName: 'Newcollab' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BrandsRunningUgcAdsPage() {
  const data = await fetchData('/api/public/brands-running-ugc-ads');
  const total = data?.total || 0;
  const brands = (data?.brands || []).map((b) => ({ ...b, chips: chipsFor(b) }));
  const month = monthLabel();
  const faq = faqFor(total);
  const jsonLd = { '@context': 'https://schema.org', '@graph': [listSchema(URL, 'Brands running UGC ads right now', brands), faqSchema(faq)] };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UgcDataPage
        url={URL}
        slug="brands-running-ugc-ads"
        eyebrow={`Updated ${month}${total ? ` · ${total} brands` : ''}`}
        title="Brands running UGC ads right now"
        answer={total
          ? `${total} brands were seen running ads in the last 30 days or run creator-style ads, the kind of videos UGC creators make. Brands that advertise need fresh videos all the time, so they are the best brands to pitch for paid UGC. Strongest signals first, updated daily.`
          : "We're refreshing this list. Browse brands looking for UGC creators meanwhile."}
        brands={brands}
        total={total}
        faq={faq}
        sections={[
          { h: 'Where this list comes from', body: (
            <ul key="b1">
              <li><b>Ads seen:</b> we found the brand running ads in a public ad library in the last 30 days.</li>
              <li><b>Creator-style ads:</b> their ads use first-person, creator-made videos, the kind UGC creators make.</li>
              <li><b>Paid UGC brief open:</b> the brand has a paid UGC job live on Newcollab right now.</li>
            </ul>
          ) },
          { h: 'How to pitch a brand that runs ads', body: (
            <p key="b2">Offer ad-ready content: one video built around their best seller, plus raw footage and three hook variations their ad team can test. Keep the email under 120 words and link two samples. Need the words? Try the free <Link href="/tools/ugc-pitch-email-generator">UGC pitch email generator</Link>, or let <Link href="/features/ai-pitch-email-writer">Polly pitch up to 20 brands a day</Link> for you.</p>
          ) },
        ]}
        related={[['/brands-replying-to-ugc-creators', 'Brands that reply to UGC creators'], ['/blog/ugc-rates-how-much-to-charge-2026', 'UGC rates 2026'], ['/features/ugc-jobs', 'Paid UGC jobs']]}
      />
    </>
  );
}
