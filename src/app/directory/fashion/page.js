import { Suspense } from 'react';
import FashionDirectoryClient from './FashionDirectoryClient';

export const metadata = {
  title: 'Fashion Brand PR Application Forms - Apply to Fashion Brand PR Lists (2026) | NewCollab',
  description: 'Direct fashion brand PR application forms for influencers. Find fashion brand PR list requirements, response rates, and follower minimums. Many fashion brands accept creators from 1K followers.',
  keywords: 'fashion brand pr list, fashion pr application form, fashion brands pr, fashion influencer pr, how to get fashion pr, fashion pr packages, fashion brands that send pr, fashion pr requirements',
  openGraph: {
    title: 'Fashion Brand PR Application Forms - Apply to Fashion Brand PR Lists',
    description: 'Access direct PR application forms for fashion brands. See response rates, follower requirements, and micro-influencer friendly options.',
    type: 'website',
    url: 'https://newcollab.co/directory/fashion',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fashion Brand PR Application Forms - Apply to Fashion Brand PR Lists',
    description: 'Direct fashion PR application forms with response rates and follower requirements.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/fashion',
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
      { '@type': 'ListItem', position: 2, name: 'Fashion', item: 'https://newcollab.co/directory/fashion' },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

const FASHION_FAQS = [
  {
    question: 'How do I get fashion brand PR packages?',
    answer: 'Apply directly through brand PR forms with a media kit showing your style aesthetic, engagement rate, and audience demographics. Fashion brands look for creators whose personal style aligns with their brand identity and whose audience matches their target customer.',
  },
  {
    question: 'What follower count do fashion brands require for PR?',
    answer: 'Many fashion brands work with nano-influencers (1K-10K followers) and micro-influencers (10K-50K). Brands like Princess Polly, ShowPo, and ASOS have accessible PR programs. Engagement rate and content quality matter more than follower count.',
  },
  {
    question: 'Do fashion brands send free clothes or pay for posts?',
    answer: 'Fashion PR typically involves gifted products (free clothes/accessories) in exchange for content. Paid partnerships are separate and usually require larger followings. Some brands offer affiliate commissions or discount codes alongside PR gifts.',
  },
  {
    question: 'What content do fashion brands want from PR partners?',
    answer: 'Fashion brands typically want try-on hauls, outfit styling content, unboxing videos, and "get ready with me" posts. Authentic content showing how pieces fit into your real wardrobe performs better than overly polished editorial shots.',
  },
];

export default async function FashionDirectoryPage() {
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48&category=fashion',
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
      <FaqSchema faqs={FASHION_FAQS} />
      <BreadcrumbSchema />
      <h1 style={srOnly}>Fashion Brand PR Application Forms</h1>
      <Suspense fallback={null}>
        <FashionDirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>

      <div style={{ padding: '0 24px 60px', background: '#FAFAFA' }}>
        <section style={seoFooterStyle}>
          <h2 style={seoHeadingStyle}>How to Get Fashion Brand PR Packages in 2026</h2>
          <p style={seoParagraphStyle}>
            Fashion brands partner with creators to showcase their collections through authentic, styled content.
            Unlike beauty PR which focuses on product reviews, fashion PR emphasizes personal style and how pieces
            fit into real wardrobes.
          </p>
          <p style={seoParagraphStyle}>
            This directory features {initialTotal || '50+'}  fashion brands with active PR programs
            {featuredBrands.length > 0 ? `, including ${featuredBrands.slice(0, 3).join(', ')}` : ''}.
            Each listing includes application links, response rates, and creator requirements.
          </p>

          <h3 style={seoSubheadingStyle}>What Fashion Brands Look for in PR Partners</h3>
          <p style={seoParagraphStyle}>
            <strong>Aesthetic alignment is everything.</strong> Fashion brands want creators whose personal style
            matches their brand identity. A minimalist brand won't partner with a maximalist creator, regardless of
            follower count.
          </p>
          <p style={seoParagraphStyle}>
            <strong>Quality photography matters.</strong> Fashion content requires good lighting, clean backgrounds,
            and styled looks. Brands review your feed carefully before approving PR applications.
          </p>

          <h3 style={seoSubheadingStyle}>Fashion PR Application Tips</h3>
          <p style={seoParagraphStyle}>
            1. <strong>Curate your feed</strong> before applying. Remove off-brand posts. Your last 9-12 posts
            should represent the style you want brands to see.
          </p>
          <p style={seoParagraphStyle}>
            2. <strong>Show how you'd style their pieces.</strong> Reference specific items from their current
            collection and explain how they'd fit your content style.
          </p>
          <p style={seoParagraphStyle}>
            3. <strong>Include body/sizing info.</strong> Fashion brands need to know your size to send appropriate
            items. Make this easy by including it in your media kit.
          </p>

          <h3 style={seoSubheadingStyle}>Frequently Asked Questions</h3>
          {FASHION_FAQS.map((faq, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <p style={{ ...seoParagraphStyle, fontWeight: '600', marginBottom: '4px' }}>{faq.question}</p>
              <p style={{ ...seoParagraphStyle, marginBottom: '0' }}>{faq.answer}</p>
            </div>
          ))}

          <p style={{ ...seoParagraphStyle, marginTop: '24px' }}>
            Browse more categories: <a href="/directory/beauty" style={seoLinkStyle}>Beauty</a> · <a href="/directory/skincare" style={seoLinkStyle}>Skincare</a> · <a href="/directory/wellness" style={seoLinkStyle}>Wellness</a> · <a href="/directory/lifestyle" style={seoLinkStyle}>Lifestyle</a> · <a href="/directory" style={seoLinkStyle}>All Brands</a>
          </p>
        </section>
      </div>
    </>
  );
}
