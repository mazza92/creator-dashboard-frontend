import PortfolioHubView from './PortfolioHubView';
import { SITE, fetchHub, itemListSchema } from './_hub';
import { jsonLd } from '@/src/lib/jsonLd';

export const revalidate = 3600;

const URL_ = `${SITE}/ugc-portfolio-examples`;
const TITLE = 'UGC Portfolio Examples (2026): Real Creator Portfolios by Niche | Newcollab';
const DESCRIPTION =
  'Real UGC portfolio examples from creators approved on Newcollab this month, by niche: beauty, fashion, fitness, food, home, family and pets. See what to include and build yours free.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL_ },
  openGraph: { title: TITLE, description: DESCRIPTION, type: 'website', url: URL_, siteName: 'Newcollab' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
};

export default async function UgcPortfolioExamplesPage() {
  const data = await fetchHub(null);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema('UGC portfolio examples', URL_, data.creators || [])) }} />
      <PortfolioHubView
        title="UGC Portfolio Examples From Real Creators"
        intro="Looking for UGC portfolio examples? These are live portfolios from UGC creators in the US, Canada, Europe and beyond, grouped by niche. Open any of them to see how they show samples, niches and rates on one page."
        hubs={data.hubs || []}
        activeHub={null}
        creators={data.creators || []}
        total={data.total || 0}
        canonicalUrl={URL_}
      />
    </>
  );
}
