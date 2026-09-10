export const SITE = 'https://newcollab.co';

export function brandSignupUrl(campaign) {
  const q = new URLSearchParams({
    utm_source: 'seo',
    utm_medium: 'organic',
    utm_campaign: campaign || 'brands',
  });
  return `/register/brand?${q.toString()}`;
}

export function trackBrandCtaClick(campaign, location) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'brand_cta_click', {
    event_category: 'brand_acquisition',
    event_label: campaign,
    campaign,
    cta_location: location,
  });
}

export const OFFER = {
  price: '299',
  priceLabel: '$299/month',
  firstCampaign: 'First campaign free (product + shipping only)',
  videos: '5–10 UGC videos / month',
  creators: '5 vetted creators',
  usage: '6-month commercial usage',
  noAutoBill: 'No auto-billing — you opt in to month 2',
};

export const DEFAULT_HOW = [
  {
    name: 'Open your branded roster',
    text: 'Private page under your brand name. Vetted UGC creators fill in automatically as they qualify. No searching profiles, no new software.',
  },
  {
    name: 'Select who to gift',
    text: 'Skip anyone who is not a fit. On a paid plan, we refill the roster when someone is wrong for you. Creator terms are already agreed when they apply.',
  },
  {
    name: 'Lock and ship',
    text: 'Lock the list and shipping details unlock as a CSV. Gift product. Organic posts and UGC files land in the same inbox, ready to run as ads for 6 months.',
  },
];

export const DEFAULT_VALUE = [
  {
    icon: '🎯',
    title: 'Vetted UGC creators, auto-filled',
    desc: 'We source for your niche and place them on your roster. You skip Instagram hunting and cold DMs.',
  },
  {
    icon: '📦',
    title: 'Select, lock, shipping CSV',
    desc: 'Lock picks and export shipping details for Shopify or ShipStation. Gift the way you already ship orders.',
  },
  {
    icon: '📜',
    title: '6-month commercial usage',
    desc: 'Run delivered videos as paid ads or on your channels. Creators keep ownership. Terms agreed when they apply.',
  },
  {
    icon: '🎁',
    title: 'First campaign free',
    desc: 'Your only trial cost is PR package + shipping. Then $299/month if you opt in. No auto-billing.',
  },
];

const SHARED_FAQS = [
  {
    question: 'How does the free first campaign work?',
    answer:
      'You get 5 vetted creators + 5–10 UGC videos with no platform fee. Your only cost is your PR package and shipping. If the content lands, you opt in to $299/mo from month 2. No auto-billing. You keep 6-month commercial reuse on what was delivered.',
  },
  {
    question: 'Can I reuse the content in ads?',
    answer:
      'Yes. You get 6-month commercial usage from delivery. Run the videos as paid ads on Meta or TikTok, and on your own channels. Creators keep ownership. No exclusivity, no royalties during the term.',
  },
  {
    question: 'How do I cancel?',
    answer:
      'Reply to any Newcollab email or email team@newcollab.co with "cancel." Your subscription stops immediately, no last month charge. Commercial reuse already granted continues for its 6-month term.',
  },
];

export const CLUSTER_PAGES = {
  'ugc-creators': {
    slug: 'ugc-creators',
    navTitle: 'Find UGC creators',
    title: 'Find UGC creators for your brand | Gifted roster | Newcollab',
    description:
      'Find vetted UGC creators for your DTC brand without a marketplace fee. Gift product, lock shipping, get 5–10 ad-ready videos. First campaign free, then $299/mo if you opt in.',
    keywords: 'find ugc creators, ugc creators for brands, ugc creator platform, hire ugc creators, vetted ugc creators',
    h1: ['Find UGC creators for', 'your brand.'],
    sub: 'A private roster fills with vetted creators in your niche. You pick who to gift. No creator payouts, no 8–15% marketplace fee — product and shipping only.',
    uniqueTitle: 'Not a UGC marketplace.',
    uniqueSpan: 'A gifted roster.',
    uniqueBody:
      'Most “find UGC creators” tools are job boards: you brief, you pay per video, you still chase usage rights. Newcollab is product seeding. Creators apply for gifted PR, accept 6-month UGC usage up front, and land on your branded roster. You select, lock, and ship.',
    related: ['pr-packages', 'ugc-for-ads', 'product-seeding', 'beauty-ugc'],
    faqs: [
      {
        question: 'How do brands find UGC creators on Newcollab?',
        answer:
          'You do not search a marketplace. We fill a private roster under your brand name with vetted UGC creators for your niche. You skip anyone who is not a fit, lock the list, and export shipping details.',
      },
      {
        question: 'Do I pay the creators?',
        answer:
          'No. This is a gifted swap: you ship product, they deliver UGC with 6-month commercial usage. No creator invoices and no platform cut on creator fees. Your platform cost is $0 for the first campaign, then $299/month if you opt in.',
      },
      ...SHARED_FAQS,
    ],
  },

  'product-seeding': {
    slug: 'product-seeding',
    navTitle: 'Product seeding',
    title: 'Product seeding platform for DTC brands | Gifted UGC | Newcollab',
    description:
      'Product seeding with usage rights included. Vetted creators, shipping CSV for Shopify, 5–10 UGC videos, 6-month commercial use. First campaign free, then $299/mo.',
    keywords: 'product seeding, product seeding platform, influencer seeding, gifted pr for brands, pr seeding',
    h1: ['Product seeding that', 'comes back as UGC.'],
    sub: 'Seed product to vetted creators, unlock shipping as a CSV, and collect ad-ready files with 6-month commercial usage. First campaign free.',
    uniqueTitle: 'Seeding with a shipping workflow.',
    uniqueSpan: 'Not a spreadsheet.',
    uniqueBody:
      'Classic seeding is a CRM plus a hunt for addresses and contracts. Newcollab locks creator picks and unlocks a CSV you can run through Shopify or ShipStation — the same way you already fulfil orders. Terms and 6-month UGC usage are agreed when creators apply.',
    related: ['pr-packages', 'ugc-creators', 'vs-ugc-agency', 'ugc-for-ads'],
    faqs: [
      {
        question: 'Is Newcollab a product seeding platform?',
        answer:
          'Yes. Brands gift product (a PR package) to vetted UGC creators. You select who to seed, lock the list, export shipping details, and get organic-style UGC files back with 6-month commercial usage.',
      },
      {
        question: 'How do I ship seeded product?',
        answer:
          'Lock your roster picks and shipping details unlock as a CSV built for Shopify or ShipStation. Gift product the way you already ship customer orders. No separate influencer-gifting tool.',
      },
      ...SHARED_FAQS,
    ],
  },

  'ugc-for-ads': {
    slug: 'ugc-for-ads',
    navTitle: 'UGC for ads',
    title: 'UGC for Meta and TikTok ads | 6-month usage | Newcollab',
    description:
      'Gifted UGC you can run as Meta or TikTok ads. 5–10 videos/month, 6-month commercial usage, first campaign free. $299/mo only if you opt in. No creator fees.',
    keywords: 'ugc for ads, ugc for meta ads, ugc for tiktok ads, ad ready ugc, gifted ugc ads',
    h1: ['UGC you can', 'run as ads.'],
    sub: 'Gifted creator videos with 6-month commercial usage from delivery. Run on Meta or TikTok. First campaign free — product and shipping only.',
    uniqueTitle: 'Built for paid social libraries.',
    uniqueSpan: 'Not just organic posts.',
    uniqueBody:
      'Organic creator posts are a bonus, not a guarantee at this tier. The deliverable is ad-ready UGC files you can run for 6 months. Creators keep ownership; you get commercial reuse with no royalties during the term. If you need guaranteed posting on their accounts, that is a $75/creator add-on.',
    related: ['pr-packages', 'ugc-creators', 'vs-billo', 'vs-ugc-agency'],
    faqs: [
      {
        question: 'Can I run Newcollab UGC as paid ads?',
        answer:
          'Yes. Commercial usage starts at delivery and lasts 6 months. Use the videos on Meta, TikTok, and your own channels. No exclusivity and no royalties during the term.',
      },
      {
        question: 'Do I own the content forever?',
        answer:
          'No. Creators keep ownership. You get 6-month commercial usage — not perpetual copyright. We do not sell “you own it forever” because that is not the agreement creators accept.',
      },
      ...SHARED_FAQS,
    ],
  },

  'vs-ugc-agency': {
    slug: 'vs-ugc-agency',
    navTitle: 'vs UGC agency',
    title: 'Newcollab vs UGC agency | $299 gifted roster vs $2,500 retainers',
    description:
      'UGC agencies typically start around $2,500/month plus creator fees. Newcollab is gifted UGC: first campaign free, then $299/mo if you opt in. 5–10 videos, 6-month ads usage.',
    keywords: 'ugc agency alternative, ugc agency cost, cheaper than ugc agency, gifted ugc vs agency',
    h1: ['UGC agency output.', 'Without the retainer.'],
    sub: 'Typical UGC retainers start around $2,500/month, often with creator fees on top. Newcollab gifts product, fills a roster, and returns 5–10 videos with 6-month usage. First campaign free.',
    uniqueTitle: '$299/month or $2,500/month.',
    uniqueSpan: 'Same job, different model.',
    uniqueBody:
      'Agencies project-manage paid talent. That is the right buy if you need scripts, revisions, and a producer. If you need authentic gifted UGC for ads, you should not be paying agency markup on creator invoices. Newcollab’s cost to you is product + shipping, then $299/month only if you opt in.',
    compare: {
      columns: ['Typical UGC agency', 'Newcollab'],
      rows: [
        { label: 'Monthly platform / retainer', them: 'Often $2,500+', us: 'First campaign free, then $299 if you opt in' },
        { label: 'Creator cost', them: 'Fees + agency markup', us: 'Gifted product + shipping only' },
        { label: 'Usage', them: 'Varies; often annual or limited', us: '6-month commercial usage included' },
        { label: 'Contracts', them: 'Common 3–6 month minimums', us: 'Cancel anytime, no auto-billing' },
        { label: 'Volume', them: 'Often 5–8 assets / month', us: '5–10 UGC videos / month' },
      ],
    },
    related: ['pr-packages', 'vs-joinbrands', 'vs-billo', 'ugc-for-ads'],
    faqs: [
      {
        question: 'Is Newcollab a UGC agency?',
        answer:
          'No. We do not mark up creator fees or run a production studio. We fill a gifted roster, you ship product, and you get UGC files with 6-month commercial usage.',
      },
      {
        question: 'When should I still hire an agency?',
        answer:
          'If you need concepting, heavy revision rounds, or guaranteed on-camera talent under a paid contract, an agency is the better fit. Newcollab is for DTC brands that want authentic gifted UGC for ads without a $2,500+ retainer.',
      },
      ...SHARED_FAQS,
    ],
  },

  'vs-joinbrands': {
    slug: 'vs-joinbrands',
    navTitle: 'vs JoinBrands',
    title: 'Newcollab vs JoinBrands | Gifted UGC vs paid marketplace',
    description:
      'JoinBrands charges a subscription plus 8–15% on creator payouts. Newcollab is gifted: no creator fees, first campaign free, then $299/mo if you opt in, 6-month ads usage.',
    keywords: 'joinbrands alternative, joinbrands vs, joinbrands pricing, gifted ugc vs joinbrands',
    h1: ['JoinBrands pays creators.', 'Newcollab gifts product.'],
    sub: 'JoinBrands is a paid UGC marketplace: plans from free to $499/mo, 8–15% platform fee, plus you pay each creator (videos from $25). Newcollab is product + shipping only.',
    uniqueTitle: 'Same $299 headline.',
    uniqueSpan: 'Different bill.',
    uniqueBody:
      'JoinBrands Pro is $299/month with a 10% fee on every creator payment (public JoinBrands pricing, September 2026). Newcollab is also $299/month after a free first campaign — but you do not pay creators and there is no percent on payouts. If you want paid talent at volume, use a marketplace. If you want gifted UGC you can run as ads, use Newcollab.',
    compare: {
      columns: ['JoinBrands', 'Newcollab'],
      rows: [
        { label: 'Model', them: 'Paid UGC marketplace', us: 'Gifted PR + UGC roster' },
        { label: 'Subscription', them: 'Free, $99, $299, or $499/mo', us: 'First campaign free, then $299 if you opt in' },
        { label: 'Platform fee on creators', them: '8–15% on every payout', us: 'None — no creator payouts' },
        { label: 'Creator cost', them: 'You set it (videos from $25+)', us: 'Product + shipping only' },
        { label: 'Ads usage', them: 'Per job / plan terms', us: '6-month commercial usage included' },
      ],
      source: 'JoinBrands public pricing, retrieved September 2026.',
    },
    related: ['pr-packages', 'vs-billo', 'vs-ugc-agency', 'ugc-creators'],
    faqs: [
      {
        question: 'Is Newcollab cheaper than JoinBrands?',
        answer:
          'On paper both can show $299/month. JoinBrands Pro still adds a 10% fee plus whatever you pay creators. Newcollab does not pay creators — you gift product. For brands that will seed anyway, Newcollab is usually the lower total cost.',
      },
      {
        question: 'Can I use both?',
        answer:
          'Yes. Some brands pay for high-volume UGC tests on a marketplace and run gifted seeding on Newcollab for authentic unboxings they can still use in ads for 6 months.',
      },
      ...SHARED_FAQS,
    ],
  },

  'vs-billo': {
    slug: 'vs-billo',
    navTitle: 'vs Billo',
    title: 'Newcollab vs Billo | Gifted UGC vs paid per-video',
    description:
      'Billo is paid UGC, typically advertised around $99+ per video. Newcollab is gifted: first campaign free, then $299/mo, 5–10 videos, 6-month Meta/TikTok usage. No creator fees.',
    keywords: 'billo alternative, billo vs, billo pricing, ugc per video vs gifted',
    h1: ['Billo sells videos.', 'Newcollab gifts product.'],
    sub: 'Paid UGC tools like Billo are built for briefs and per-video credits. Newcollab is a gifted roster: ship PR, get 5–10 files with 6-month commercial usage. First campaign free.',
    uniqueTitle: 'Pay per video, or seed once.',
    uniqueSpan: 'Pick the model.',
    uniqueBody:
      'Billo and similar marketplaces are the right buy when you need scripted, paid talent on a deadline and you expect to pay ~$99+ per video. Newcollab is the right buy when the product is the brief: authentic gifted UGC, shipping CSV, and ads usage without creator invoices.',
    compare: {
      columns: ['Paid UGC (e.g. Billo)', 'Newcollab'],
      rows: [
        { label: 'Model', them: 'Pay per video / credit packs', us: 'Gifted roster, select → lock → ship' },
        { label: 'Typical cost', them: 'Often advertised from ~$99 / video', us: 'Product + shipping; $299/mo if you opt in' },
        { label: 'Creator payment', them: 'Included in the video price', us: 'None — gifted product' },
        { label: 'Volume', them: 'You buy videos one by one', us: '5–10 videos / month on plan' },
        { label: 'Usage', them: 'Plan / license dependent', us: '6-month commercial usage included' },
      ],
      source: 'Billo does not publish a simple public price list. “~$99+ per video” reflects commonly advertised marketplace rates, not a Newcollab quote of Billo’s live checkout.',
    },
    related: ['pr-packages', 'ugc-for-ads', 'vs-joinbrands', 'vs-ugc-agency'],
    faqs: [
      {
        question: 'Is Newcollab a Billo alternative?',
        answer:
          'Only if you are comparing outcomes (UGC for ads). The commercial model is different: Billo-style tools pay creators per video. Newcollab gifts product and includes 6-month usage. Do not expect the same revision workflow as a paid marketplace.',
      },
      {
        question: 'Will I get videos as fast as a paid UGC tool?',
        answer:
          'You ship product first. Timeline depends on shipping plus creator turnaround. Niches outside beauty/skincare can add 3–5 days of sourcing. Paid per-video tools are usually faster if you only need a brief, not a gift.',
      },
      ...SHARED_FAQS,
    ],
  },

  'beauty-ugc': {
    slug: 'beauty-ugc',
    navTitle: 'Beauty UGC',
    title: 'Beauty UGC creators for DTC brands | Gifted skincare & makeup | Newcollab',
    description:
      'Gifted beauty and skincare UGC for DTC ads. Our core creator pool is beauty/skincare. First campaign free, then $299/mo. 5–10 videos, 6-month commercial usage.',
    keywords: 'beauty ugc, skincare ugc creators, beauty ugc for ads, gifted beauty pr, makeup ugc',
    h1: ['Beauty UGC for', 'DTC brands.'],
    sub: 'Our core pool is beauty and skincare. Gift product to vetted creators, get ad-ready videos with 6-month commercial usage. First campaign free.',
    uniqueTitle: 'Beauty and skincare first.',
    uniqueSpan: 'That’s the pool.',
    uniqueBody:
      'Most of our brand partners are beauty, skincare, and wellness DTC running Meta or TikTok ads. Creators are hand-vetted for niche fit and brand safety before they hit your roster. Fitness, men’s grooming, food, and home are available — we hand-source those, which adds 3–5 days.',
    related: ['pr-packages', 'ugc-creators', 'ugc-for-ads', 'product-seeding'],
    faqs: [
      {
        question: 'Do you have beauty and skincare UGC creators?',
        answer:
          'Yes. The core pool skews beauty and skincare. Brands in that lane are the fastest fill. We still run gifted campaigns in adjacent lifestyle categories with 3–5 extra days of sourcing.',
      },
      {
        question: 'Can I run beauty UGC as ads?',
        answer:
          'Yes. 6-month commercial usage from delivery. That is the point for DTC brands filling a Meta or TikTok creative library with authentic gifted content.',
      },
      ...SHARED_FAQS,
    ],
  },
};

export function getClusterPage(slug) {
  return CLUSTER_PAGES[slug] || null;
}

export function clusterSlugs() {
  return Object.keys(CLUSTER_PAGES);
}

export function relatedLinks(slug) {
  if (slug === 'pr-packages') {
    return [
      { href: '/brands/ugc-creators', label: 'Find UGC creators' },
      { href: '/brands/product-seeding', label: 'Product seeding' },
      { href: '/brands/ugc-for-ads', label: 'UGC for ads' },
      { href: '/brands/vs-ugc-agency', label: 'vs UGC agency' },
      { href: '/brands/vs-joinbrands', label: 'vs JoinBrands' },
      { href: '/brands/vs-billo', label: 'vs Billo' },
      { href: '/brands/beauty-ugc', label: 'Beauty UGC' },
    ];
  }
  const page = CLUSTER_PAGES[slug];
  const targets = page?.related || [];
  return targets
    .map((key) => {
      if (key === 'pr-packages') {
        return { href: '/brands/pr-packages', label: 'Gifted UGC / PR packages' };
      }
      const rel = CLUSTER_PAGES[key];
      if (!rel) return null;
      return { href: `/brands/${rel.slug}`, label: rel.navTitle };
    })
    .filter(Boolean);
}

export function buildClusterFaqSchema(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (page.faqs || []).map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function buildClusterServiceSchema(page) {
  const url = `${SITE}/brands/${page.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.navTitle,
    serviceType: 'Gifted UGC and product seeding',
    url,
    description: page.description,
    provider: {
      '@type': 'Organization',
      name: 'Newcollab',
      url: SITE,
      logo: `${SITE}/logo.png`,
    },
    areaServed: ['US', 'CA', 'GB', 'AU'],
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'DTC brands looking for UGC creators',
    },
    offers: {
      '@type': 'Offer',
      url,
      price: OFFER.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: `${OFFER.firstCampaign}. Then ${OFFER.priceLabel} if you opt in. ${OFFER.videos}, ${OFFER.usage}.`,
    },
  };
}

export function buildClusterHowToSchema(page) {
  const url = `${SITE}/brands/${page.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to ${page.navTitle.toLowerCase()} with Newcollab`,
    description: page.sub,
    url,
    step: DEFAULT_HOW.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${url}#how`,
    })),
  };
}

export function buildClusterBreadcrumbSchema(page) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Gifted UGC for brands', item: `${SITE}/brands/pr-packages` },
      { '@type': 'ListItem', position: 3, name: page.navTitle, item: `${SITE}/brands/${page.slug}` },
    ],
  };
}
