import { FEATURES } from './_data';
import SimplePage from './SimplePage';

const TITLE = 'Newcollab Features: UGC Jobs, UGC Ad Examples, AI Pitching & Deal Tracker';
const DESCRIPTION =
  'Everything Newcollab does for UGC creators: paid UGC jobs updated daily, live UGC ad hooks, brands hiring UGC creators, an AI pitch email writer that sends from your Gmail, and a free brand deal tracker.';

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://newcollab.co/features' },
  openGraph: { title: TITLE, description: DESCRIPTION, url: 'https://newcollab.co/features', type: 'website', siteName: 'Newcollab' },
};

export default function FeaturesIndex() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Newcollab features',
    itemListElement: FEATURES.map((f, i) => ({ '@type': 'ListItem', position: i + 1, name: f.nav, url: `https://newcollab.co/features/${f.slug}` })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SimplePage
        canonical="https://newcollab.co/features"
        crumbs={[['/', 'Home'], [null, 'Features']]}
        eyebrow="Features"
        title="Everything you need to land brand deals as a UGC creator"
        intro="Newcollab finds the brands and the paid UGC jobs, shows you what brands are running in their ads, writes and sends your pitches, and tracks every deal. Start free; Pro is $19 a month."
        items={FEATURES.map((f) => ({ href: `/features/${f.slug}`, title: f.nav, text: f.description }))}
      />
    </>
  );
}
