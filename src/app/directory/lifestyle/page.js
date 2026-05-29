import { Suspense } from 'react';
import LifestyleDirectoryClient from './LifestyleDirectoryClient';

export const metadata = {
  title: 'Lifestyle Brand PR Application Forms - Home & Travel Brands (2026) | NewCollab',
  description: 'Direct lifestyle brand PR application forms for influencers. Find home, travel, and lifestyle brand PR list requirements, response rates, and follower minimums. Many accept creators from 1K followers.',
  keywords: 'lifestyle brand pr list, lifestyle pr application form, lifestyle brands pr, lifestyle influencer pr, home brand pr list, travel brand pr, lifestyle brands that send pr to influencers, lifestyle pr requirements',
  openGraph: {
    title: 'Lifestyle Brand PR Application Forms - Home & Travel Brands',
    description: 'Access direct PR application forms for lifestyle brands. See response rates, follower requirements, and micro-influencer friendly options.',
    type: 'website',
    url: 'https://newcollab.co/directory/lifestyle',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lifestyle Brand PR Application Forms - Home & Travel Brands',
    description: 'Direct lifestyle PR application forms with response rates and follower requirements.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/lifestyle',
  },
};

export const revalidate = 3600;

const srOnly = {
  position: 'absolute', width: '1px', height: '1px', padding: 0,
  margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
};

// SEO footer styles
const seoFooterStyle = {
  background: 'white',
  border: '1px solid #E8E8E8',
  borderRadius: '18px',
  padding: '32px',
  margin: '40px auto',
  maxWidth: '900px',
  boxShadow: '0 1px 3px rgba(15,15,15,0.05)',
};

const seoHeadingStyle = { fontSize: '18px', fontWeight: '700', color: '#0F0F0F', margin: '0 0 12px' };
const seoSubheadingStyle = { fontSize: '16px', fontWeight: '700', color: '#0F0F0F', margin: '24px 0 12px' };
const seoParagraphStyle = { color: '#4B4B4B', lineHeight: '1.8', fontSize: '14px', margin: '0 0 16px' };
const seoLinkStyle = { color: '#E11D48', fontWeight: '600', textDecoration: 'none' };

function FaqSchema({ faqs }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Directory', item: 'https://newcollab.co/directory' },
      { '@type': 'ListItem', position: 2, name: 'Lifestyle', item: 'https://newcollab.co/directory/lifestyle' },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

const LIFESTYLE_FAQS = [
  {
    question: 'What types of brands are in the lifestyle category?',
    answer: 'Lifestyle brands include home decor, furniture, travel gear, pet products, tech accessories, candles, stationery, and general consumer products. If a brand fits into your everyday life but isn\'t specifically beauty, fashion, or fitness, it\'s probably lifestyle.',
  },
  {
    question: 'How do I get lifestyle brand PR packages?',
    answer: 'Apply through brand PR forms with a media kit showing your content style, engagement rate, and audience demographics. Lifestyle brands look for creators with aesthetically curated feeds who naturally incorporate products into their daily content.',
  },
  {
    question: 'What follower count do lifestyle brands require?',
    answer: 'Many lifestyle brands work with nano-influencers (1K-10K followers). Home decor brands especially value engaged micro-influencers over larger accounts. Brands like Article, West Elm, and Homesick accept smaller creators.',
  },
  {
    question: 'What content performs best for lifestyle PR?',
    answer: 'Lifestyle PR content includes home tours, desk setups, "day in my life" vlogs, apartment makeovers, travel content, and aesthetic flat-lays. Content that shows products in real use contexts performs better than staged product shots.',
  },
];

export default async function LifestyleDirectoryPage() {
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48&category=lifestyle',
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      initialBrands = Array.isArray(data.brands) ? data.brands : [];
      initialTotal = data?.pagination?.total || 0;
    }
  } catch (_) {}

  const featuredBrands = initialBrands.slice(0, 6).map(b => b.name || b.brand_name).filter(Boolean);

  return (
    <>
      <FaqSchema faqs={LIFESTYLE_FAQS} />
      <BreadcrumbSchema />
      <h1 style={srOnly}>Lifestyle Brand PR Application Forms</h1>
      <Suspense fallback={null}>
        <LifestyleDirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>

      <div style={{ padding: '0 24px 60px', background: '#FAFAFA' }}>
        <section style={seoFooterStyle}>
          <h2 style={seoHeadingStyle}>How to Get Lifestyle Brand PR Packages in 2026</h2>
          <p style={seoParagraphStyle}>
            Lifestyle brands encompass everything from home decor to tech accessories, travel gear to pet products.
            These brands partner with creators who naturally integrate products into aesthetic, everyday content
            rather than creating obvious promotional posts.
          </p>
          <p style={seoParagraphStyle}>
            This directory features {initialTotal || '30+'}  lifestyle brands with active PR programs
            {featuredBrands.length > 0 ? `, including ${featuredBrands.slice(0, 3).join(', ')}` : ''}.
            Each listing includes application links, response rates, and creator requirements.
          </p>

          <h3 style={seoSubheadingStyle}>What Lifestyle Brands Look for in PR Partners</h3>
          <p style={seoParagraphStyle}>
            <strong>Aesthetic cohesion is key.</strong> Lifestyle brands review your entire feed before approving
            applications. A cohesive aesthetic — whether minimalist, maximalist, or somewhere between — shows you
            can present their products beautifully.
          </p>
          <p style={seoParagraphStyle}>
            <strong>Authentic integration matters.</strong> Brands want products to appear naturally in your content,
            not as obvious ads. Showing products in your real home, workspace, or daily routine performs better
            than studio-style product shots.
          </p>

          <h3 style={seoSubheadingStyle}>Lifestyle PR Application Tips</h3>
          <p style={seoParagraphStyle}>
            1. <strong>Showcase your space.</strong> Home decor and lifestyle brands want to see where products
            would be featured. Include room tours, desk setups, or home content in your media kit.
          </p>
          <p style={seoParagraphStyle}>
            2. <strong>Be specific about content ideas.</strong> Don't just say "I love your products." Pitch
            specific content formats: "I'd feature your candles in a cozy evening routine reel" or "Your desk
            accessories would be perfect for my weekly productivity content."
          </p>
          <p style={seoParagraphStyle}>
            3. <strong>Highlight past brand content.</strong> Include examples of how you've featured lifestyle
            products before, even if they weren't sponsored.
          </p>

          <h3 style={seoSubheadingStyle}>Frequently Asked Questions</h3>
          {LIFESTYLE_FAQS.map((faq, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <p style={{ ...seoParagraphStyle, fontWeight: '600', marginBottom: '4px' }}>{faq.question}</p>
              <p style={{ ...seoParagraphStyle, marginBottom: '0' }}>{faq.answer}</p>
            </div>
          ))}

          <p style={{ ...seoParagraphStyle, marginTop: '24px' }}>
            Browse more categories: <a href="/directory/beauty" style={seoLinkStyle}>Beauty</a> · <a href="/directory/fashion" style={seoLinkStyle}>Fashion</a> · <a href="/directory/wellness" style={seoLinkStyle}>Wellness</a> · <a href="/directory/skincare" style={seoLinkStyle}>Skincare</a> · <a href="/directory" style={seoLinkStyle}>All Brands</a>
          </p>
        </section>
      </div>
    </>
  );
}
