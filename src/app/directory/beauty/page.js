import { Suspense } from 'react';
import BeautyDirectoryClient from './BeautyDirectoryClient';

export const metadata = {
  title: 'Beauty Brand PR Application Forms - 100+ Beauty Brands (2026) | NewCollab',
  description: 'Direct beauty brand PR application forms for micro-influencers. Find beauty PR list requirements, application links, and brands sending PR packages to creators with 1K+ followers.',
  keywords: 'beauty pr list, beauty brand pr application form, beauty brands pr, beauty influencer pr, how to get beauty pr, beauty pr packages, beauty brands that send pr to small influencers, beauty pr requirements',
  openGraph: {
    title: 'Beauty Brand PR Application Forms - 100+ Beauty Brands',
    description: 'Access direct PR application forms for 100+ beauty brands. Response rates, follower requirements, and nano-influencer friendly options.',
    type: 'website',
    url: 'https://newcollab.co/directory/beauty',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beauty Brand PR Application Forms - 100+ Beauty Brands',
    description: 'Direct beauty PR application forms with response rates and follower requirements.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/beauty',
  },
};

export const revalidate = 3600;

const srOnly = {
  position: 'absolute', width: '1px', height: '1px', padding: 0,
  margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
};

// SEO footer styles - server-rendered for Google
const seoFooterStyle = {
  background: 'white',
  border: '1px solid #E8E8E8',
  borderRadius: '18px',
  padding: '32px',
  margin: '40px auto',
  maxWidth: '900px',
  boxShadow: '0 1px 3px rgba(15,15,15,0.05)',
};

const seoHeadingStyle = {
  fontSize: '18px',
  fontWeight: '700',
  color: '#0F0F0F',
  margin: '0 0 12px',
};

const seoSubheadingStyle = {
  fontSize: '16px',
  fontWeight: '700',
  color: '#0F0F0F',
  margin: '24px 0 12px',
};

const seoParagraphStyle = {
  color: '#4B4B4B',
  lineHeight: '1.8',
  fontSize: '14px',
  margin: '0 0 16px',
};

const seoLinkStyle = {
  color: '#E11D48',
  fontWeight: '600',
  textDecoration: 'none',
};

// FAQ Schema for rich results
function FaqSchema({ faqs }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Breadcrumb Schema
function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Directory', item: 'https://newcollab.co/directory' },
      { '@type': 'ListItem', position: 2, name: 'Beauty', item: 'https://newcollab.co/directory/beauty' },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

const BEAUTY_FAQS = [
  {
    question: 'How do I get on a beauty brand PR list?',
    answer: 'To get on a beauty brand PR list, create a media kit showcasing your engagement rate and audience demographics, then apply directly through the brand\'s PR application form. Most beauty brands accept creators with 1,000+ followers who create authentic content in the beauty niche.',
  },
  {
    question: 'What follower count do I need for beauty PR packages?',
    answer: 'Most beauty brands accept nano-influencers with 1,000-10,000 followers, though requirements vary. Engagement rate (3-5%) matters more than follower count. Brands like e.l.f., ColourPop, and NYX actively work with micro-influencers.',
  },
  {
    question: 'Do beauty brands pay for PR or just send free products?',
    answer: 'Most beauty PR programs send free products in exchange for honest content — this is called "gifted" or "seeding." Paid partnerships typically require larger followings (50K+) or are separate from PR programs. Some brands offer affiliate commissions alongside PR.',
  },
  {
    question: 'How long does it take to hear back from beauty brands?',
    answer: 'Beauty brands typically respond within 1-3 weeks if interested. If you don\'t hear back in 2 weeks, send one polite follow-up. Many creators report the follow-up email is what secured their PR partnership.',
  },
];

export default async function BeautyDirectoryPage() {
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48&category=beauty',
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      initialBrands = Array.isArray(data.brands) ? data.brands : [];
      initialTotal = data?.pagination?.total || 0;
    }
  } catch (_) {}

  // Get some brand names for SEO content
  const featuredBrands = initialBrands.slice(0, 6).map(b => b.name || b.brand_name).filter(Boolean);

  return (
    <>
      <FaqSchema faqs={BEAUTY_FAQS} />
      <BreadcrumbSchema />
      <h1 style={srOnly}>Beauty Brand PR Application Forms</h1>
      <Suspense fallback={null}>
        <BeautyDirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>

      {/* Server-rendered SEO content - Google can index this */}
      <div style={{ padding: '0 24px 60px', background: '#FAFAFA' }}>
        <section style={seoFooterStyle}>
          <h2 style={seoHeadingStyle}>How to Get on Beauty Brand PR Lists in 2026</h2>
          <p style={seoParagraphStyle}>
            Beauty brands actively send PR packages to micro-influencers and content creators who authentically
            showcase their products. Unlike paid sponsorships, PR programs focus on product seeding — brands
            send free products in exchange for honest reviews and social content.
          </p>
          <p style={seoParagraphStyle}>
            This directory includes {initialTotal || '100+'}  beauty brands with open PR applications, including
            {featuredBrands.length > 0 ? ` popular brands like ${featuredBrands.slice(0, 3).join(', ')}` : ' major skincare, makeup, and haircare brands'}.
            Each listing shows response rates, follower requirements, and direct application links.
          </p>

          <h3 style={seoSubheadingStyle}>What Beauty Brands Look for in PR Applicants</h3>
          <p style={seoParagraphStyle}>
            <strong>Engagement rate matters more than follower count.</strong> A creator with 2,000 followers
            and 8% engagement is more valuable than one with 50,000 followers and 0.5% engagement. Beauty brands
            want authentic creators whose audience trusts their recommendations.
          </p>
          <p style={seoParagraphStyle}>
            <strong>Niche alignment is critical.</strong> Skincare brands want skincare creators. Makeup brands
            want makeup enthusiasts. If your content naturally features beauty products, you're already a fit.
            Generic lifestyle accounts struggle to get beauty PR.
          </p>

          <h3 style={seoSubheadingStyle}>Beauty PR Application Tips</h3>
          <p style={seoParagraphStyle}>
            1. <strong>Create a media kit</strong> with your follower count, engagement rate, audience demographics,
            and 2-3 examples of past beauty content. Newcollab generates this automatically from your profile.
          </p>
          <p style={seoParagraphStyle}>
            2. <strong>Personalize each application.</strong> Mention specific products you've used or want to try.
            Generic "I love your brand" pitches get ignored.
          </p>
          <p style={seoParagraphStyle}>
            3. <strong>Show your content style.</strong> Include links to recent reels, TikToks, or posts that
            demonstrate how you'd feature products authentically.
          </p>
          <p style={seoParagraphStyle}>
            4. <strong>Follow up once.</strong> If you don't hear back in 10-14 days, send one polite follow-up
            referencing your original application. Many creators report this is what secured their PR deal.
          </p>

          <h3 style={seoSubheadingStyle}>Frequently Asked Questions</h3>
          {BEAUTY_FAQS.map((faq, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <p style={{ ...seoParagraphStyle, fontWeight: '600', marginBottom: '4px' }}>{faq.question}</p>
              <p style={{ ...seoParagraphStyle, marginBottom: '0' }}>{faq.answer}</p>
            </div>
          ))}

          <p style={{ ...seoParagraphStyle, marginTop: '24px' }}>
            Browse more brand categories: <a href="/directory/skincare" style={seoLinkStyle}>Skincare</a> · <a href="/directory/fashion" style={seoLinkStyle}>Fashion</a> · <a href="/directory/wellness" style={seoLinkStyle}>Wellness</a> · <a href="/directory/lifestyle" style={seoLinkStyle}>Lifestyle</a> · <a href="/directory" style={seoLinkStyle}>All Brands</a>
          </p>
        </section>
      </div>
    </>
  );
}
