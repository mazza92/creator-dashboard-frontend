import { Suspense } from 'react';
import WellnessDirectoryClient from './WellnessDirectoryClient';

export const metadata = {
  title: 'Wellness Brand PR Application Forms - Health & Fitness Brands (2026) | NewCollab',
  description: 'Direct wellness and fitness brand PR application forms for influencers. Find health brand PR list requirements, response rates, and follower minimums. Fabletics, Silk & Snow, and more.',
  keywords: 'wellness brand pr list, fitness brand pr application form, health brands pr, wellness influencer pr, how to get wellness pr, fitness brands that send pr, wellness pr requirements, fabletics pr list',
  openGraph: {
    title: 'Wellness Brand PR Application Forms - Health & Fitness Brands',
    description: 'Access direct PR application forms for wellness and fitness brands. See response rates, follower requirements, and micro-influencer options.',
    type: 'website',
    url: 'https://newcollab.co/directory/wellness',
    siteName: 'NewCollab',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wellness Brand PR Application Forms - Health & Fitness Brands',
    description: 'Direct wellness PR application forms with response rates and follower requirements.',
    creator: '@newcollab',
  },
  alternates: {
    canonical: 'https://newcollab.co/directory/wellness',
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
      { '@type': 'ListItem', position: 2, name: 'Wellness', item: 'https://newcollab.co/directory/wellness' },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

const WELLNESS_FAQS = [
  {
    question: 'How do I get wellness and fitness brand PR packages?',
    answer: 'Apply through brand PR forms with a media kit showcasing your fitness content, engagement rate, and audience demographics. Wellness brands look for creators who authentically incorporate health products into their lifestyle content.',
  },
  {
    question: 'What follower count do wellness brands require?',
    answer: 'Many wellness brands accept creators with 1K-10K followers who have strong engagement in the fitness/health niche. Brands like Athletic Greens, Alo Yoga, and Fabletics have accessible PR programs for micro-influencers.',
  },
  {
    question: 'What types of wellness products do brands send for PR?',
    answer: 'Wellness PR includes supplements, protein powders, fitness apparel, yoga mats, recovery tools, healthy snacks, and wellness apps. Brands typically match products to your specific fitness niche (yoga, lifting, running, etc.).',
  },
  {
    question: 'Do I need to be a certified fitness professional?',
    answer: 'No certification required for most PR programs. Brands want authentic creators who genuinely use wellness products, not necessarily certified trainers. However, having expertise or credentials can help your application stand out.',
  },
];

export default async function WellnessDirectoryPage() {
  let initialBrands = [];
  let initialTotal = 0;
  try {
    const res = await fetch(
      'https://api.newcollab.co/api/public/brands?page=1&limit=48&category=wellness',
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
      <FaqSchema faqs={WELLNESS_FAQS} />
      <BreadcrumbSchema />
      <h1 style={srOnly}>Wellness Brand PR Application Forms</h1>
      <Suspense fallback={null}>
        <WellnessDirectoryClient initialBrands={initialBrands} initialTotal={initialTotal} />
      </Suspense>

      <div style={{ padding: '0 24px 60px', background: '#FAFAFA' }}>
        <section style={seoFooterStyle}>
          <h2 style={seoHeadingStyle}>How to Get Wellness & Fitness Brand PR in 2026</h2>
          <p style={seoParagraphStyle}>
            Wellness brands partner with fitness creators, health enthusiasts, and lifestyle influencers to
            showcase supplements, activewear, and health products. The wellness PR space is growing rapidly as
            brands recognize the power of authentic creator recommendations.
          </p>
          <p style={seoParagraphStyle}>
            This directory includes {initialTotal || '40+'}  wellness and fitness brands with open PR applications
            {featuredBrands.length > 0 ? `, including ${featuredBrands.slice(0, 3).join(', ')}` : ''}.
            Each listing shows response rates, follower requirements, and direct application links.
          </p>

          <h3 style={seoSubheadingStyle}>What Wellness Brands Look for in PR Partners</h3>
          <p style={seoParagraphStyle}>
            <strong>Authentic wellness lifestyle.</strong> Brands want creators who genuinely incorporate health
            and fitness into their daily content — not one-off sponsored posts. Your feed should reflect an
            authentic interest in wellness.
          </p>
          <p style={seoParagraphStyle}>
            <strong>Niche expertise matters.</strong> Yoga brands want yoga creators. Running brands want runners.
            Supplement brands want creators who discuss nutrition. Specificity in your niche increases approval rates.
          </p>

          <h3 style={seoSubheadingStyle}>Wellness PR Application Tips</h3>
          <p style={seoParagraphStyle}>
            1. <strong>Show your fitness journey.</strong> Before/after content, workout routines, and health
            transformations perform well. Brands want to see your commitment to wellness.
          </p>
          <p style={seoParagraphStyle}>
            2. <strong>Highlight relevant content.</strong> Include links to workout videos, supplement reviews,
            or wellness routines in your application.
          </p>
          <p style={seoParagraphStyle}>
            3. <strong>Be specific about your niche.</strong> "Fitness" is too broad. "Morning yoga routines for
            busy moms" or "home gym strength training" shows focus.
          </p>

          <h3 style={seoSubheadingStyle}>Frequently Asked Questions</h3>
          {WELLNESS_FAQS.map((faq, i) => (
            <div key={i} style={{ marginBottom: '16px' }}>
              <p style={{ ...seoParagraphStyle, fontWeight: '600', marginBottom: '4px' }}>{faq.question}</p>
              <p style={{ ...seoParagraphStyle, marginBottom: '0' }}>{faq.answer}</p>
            </div>
          ))}

          <p style={{ ...seoParagraphStyle, marginTop: '24px' }}>
            Browse more categories: <a href="/directory/beauty" style={seoLinkStyle}>Beauty</a> · <a href="/directory/fashion" style={seoLinkStyle}>Fashion</a> · <a href="/directory/skincare" style={seoLinkStyle}>Skincare</a> · <a href="/directory/lifestyle" style={seoLinkStyle}>Lifestyle</a> · <a href="/directory" style={seoLinkStyle}>All Brands</a>
          </p>
        </section>
      </div>
    </>
  );
}
