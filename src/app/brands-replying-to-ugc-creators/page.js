import Link from 'next/link';
import UgcDataPage from '../_ugcdata/UgcDataPage';
import { fetchData, faqSchema, listSchema, monthLabel } from '../_ugcdata/data';

export const revalidate = 3600;

const URL = 'https://newcollab.co/brands-replying-to-ugc-creators';

// A reply rate means little on a handful of pitches: show it from 10 creators pitched.
const RATE_MIN_PITCHED = 10;

function chipsFor(b) {
  const out = [];
  if (b.selected >= 2) out.push(['good', `Picked ${b.selected} creators`]);
  else if (b.selected === 1) out.push(['good', 'Picked a creator']);
  if (b.replied >= 2) out.push(['good', `Answered ${b.replied} creators`]);
  if (b.replyRate && b.pitched >= RATE_MIN_PITCHED) out.push(['rate', `${b.replyRate}% reply rate`]);
  return out;
}

function faqFor(total) {
  return [
    ['Which brands actually reply to UGC creators?',
      `${total || 'These'} brands answered creators who pitched them through Newcollab, or picked creators from a gifting roster. The list comes from replies creators logged, not from what brands say about themselves.`],
    ['Why do most brands never reply?',
      'Big brands get hundreds of pitches a week and many PR inboxes are unattended. Starting with brands that have a track record of answering saves your time and your pitches.'],
    ['How is the reply rate worked out?',
      'Creators who heard back divided by creators who pitched the brand on Newcollab. We only show a rate once 10 or more creators have pitched, and we never show who pitched or replied.'],
    ['How do I get a reply from these brands?',
      'Keep the email under 120 words, name one product, propose one video and link two samples from your UGC portfolio. Follow up once after 4 days and once after 10 if you hear nothing.'],
  ];
}

export async function generateMetadata() {
  const data = await fetchData('/api/public/brands-replying');
  const total = data?.total || 0;
  const title = `Brands That Reply to UGC Creators (${monthLabel()})`;
  const description = `${total ? `${total} ` : ''}brands that answered creators who pitched them on Newcollab, with how many replied. Skip the brands that never answer. Updated daily.`;
  return {
    title,
    description,
    alternates: { canonical: URL },
    openGraph: { title, description, url: URL, type: 'website', siteName: 'Newcollab' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BrandsReplyingPage() {
  const data = await fetchData('/api/public/brands-replying');
  const total = data?.total || 0;
  const brands = (data?.brands || []).map((b) => ({ ...b, chips: chipsFor(b) }));
  const month = monthLabel();
  const faq = faqFor(total);
  const jsonLd = { '@context': 'https://schema.org', '@graph': [listSchema(URL, 'Brands that reply to UGC creators', brands), faqSchema(faq)] };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <UgcDataPage
        url={URL}
        slug="brands-replying-to-ugc-creators"
        eyebrow={`Updated ${month}${total ? ` · ${total} brands` : ''}`}
        title="Brands that actually reply to UGC creators"
        answer={total
          ? `${total} brands answered creators who pitched them through Newcollab, or picked creators for gifting. Most brands never reply, so start with these. Built from replies creators logged, updated daily.`
          : "We're refreshing this list. Browse brands looking for UGC creators meanwhile."}
        brands={brands}
        total={total}
        faq={faq}
        sections={[
          { h: 'How we know they reply', body: (
            <ul key="b1">
              <li><b>Answered creators:</b> the number of creators who logged a reply from the brand after pitching it on Newcollab. We list brands from 2 replies up.</li>
              <li><b>Picked creators:</b> the brand chose creators from a gifting roster on Newcollab.</li>
              <li><b>Reply rate:</b> creators who heard back out of creators who pitched, shown once 10 or more have pitched.</li>
              <li>We never show who pitched or who got a reply.</li>
            </ul>
          ) },
          { h: 'How to pitch them', body: (
            <p key="b2">Keep it short: one product, one video idea, two sample videos, under 120 words. Follow up on day 4 and day 10. Want it done for you? <Link href="/features/ai-pitch-email-writer">Polly pitches up to 20 brands a day</Link>, brands that reply first.</p>
          ) },
        ]}
        related={[['/brands-running-ugc-ads', 'Brands running UGC ads right now'], ['/blog/brands-that-pay-for-ugc-content-2026', 'Brands that pay for UGC'], ['/tools/ugc-pitch-email-generator', 'UGC pitch email generator']]}
      />
    </>
  );
}
