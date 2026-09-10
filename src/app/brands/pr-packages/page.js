import PRPackagesClient from './PRPackagesClient';
import {
  PAGE_URL,
  buildBreadcrumbSchema,
  buildFaqPageSchema,
  buildHowToSchema,
  buildServiceSchema,
} from './content';

export const metadata = {
  title: 'Gifted UGC creators for DTC brands | $299, first campaign free',
  description:
    'Find vetted UGC creators for your DTC brand. Gift product, lock shipping, get 5–10 ad-ready videos with 6-month commercial use. First campaign free, then $299/mo if you opt in.',
  keywords:
    'find ugc creators, ugc creators for brands, gifted ugc, gifted ugc platform, pr packages for brands, product seeding, ugc for ads, ugc for meta ads, dtc ugc creators, brand ugc content',
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: 'Find UGC creators for your brand | Gifted PR packages',
    description:
      'Vetted UGC creators on a branded roster. Select, lock, ship. 5–10 videos with 6-month commercial reuse. First campaign free, then $299/month.',
    type: 'website',
    url: PAGE_URL,
    siteName: 'Newcollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find UGC creators for your brand | Gifted PR packages',
    description:
      'Vetted UGC creators on a branded roster. Select, lock, ship. 5–10 videos with 6-month commercial reuse. First campaign free, then $299/month.',
    creator: '@newcollab',
  },
};

function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function PRPackagesPage() {
  return (
    <>
      <JsonLd data={buildFaqPageSchema()} />
      <JsonLd data={buildServiceSchema()} />
      <JsonLd data={buildHowToSchema()} />
      <JsonLd data={buildBreadcrumbSchema()} />
      <PRPackagesClient />
    </>
  );
}
