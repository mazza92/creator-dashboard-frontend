import { brandSignupUrl } from '../_cluster/catalog';

export const PAGE_URL = 'https://newcollab.co/brands/pr-packages';
export const SIGNUP_URL = brandSignupUrl('pr-packages');

export const FAQ_ITEMS = [
  {
    question: 'Is this an affiliate or referral program?',
    answer:
      'No. Newcollab runs on gifted UGC content swaps only. No commission tracking, no revshare, no attribution. Brand ships gifted product to creator, creator delivers organic + UGC with 6-month commercial usage. That\'s it.',
  },
  {
    question: 'Can I reuse the content in ads?',
    answer:
      'Yes. You get 6-month commercial usage from delivery. Run the videos as paid ads on Meta or TikTok, and on your own channels. Creators keep ownership. No exclusivity, no royalties during the term.',
  },
  {
    question: 'What is the branded roster?',
    answer:
      'A private page under your brand name. Vetted UGC creators fill it automatically. You select who to gift, lock the list, export a shipping CSV, and collect content in the same link. No login for your team. No hunting profiles yourself.',
  },
  {
    question: 'What if the creators aren\'t the right fit?',
    answer:
      'Skip anyone before you lock. After you subscribe, we refill the roster when someone is not a fit so you are not stuck searching Instagram or negotiating replacements by email.',
  },
  {
    question: 'Are terms already agreed?',
    answer:
      'Yes. Creators accept gifted PR terms and 6-month UGC usage when they apply. You are not chasing contracts or usage paperwork after you pick them.',
  },
  {
    question: 'How does the free first campaign work?',
    answer:
      'You get 5 vetted creators + 5-10 UGC videos delivered with no platform fee. Your only cost is your PR package and shipping. If the content lands, you opt in to $299/mo from month 2. No auto-billing. If it doesn\'t work, no obligation. You still keep 6-month commercial reuse on what was delivered.',
  },
  {
    question: 'What kind of brands work with Newcollab?',
    answer:
      'DTC brands running paid social. Most of our brand partners are in beauty, skincare, wellness, fashion, fitness, and lifestyle. Sweet spot: brands with $500K-$10M revenue running Meta or TikTok ads and looking to fill their creative library with authentic UGC.',
  },
  {
    question: 'Can creators post on their own accounts too?',
    answer:
      'Some do when it fits their content plan. Organic posts are a bonus, not a guarantee at this tier. If you specifically need guaranteed distribution on creator accounts, we offer that as a paid supplement ($75/creator).',
  },
  {
    question: 'Do you have creators in [specific niche]?',
    answer:
      'Our core pool skews beauty and skincare. For niches outside that (fitness, men\'s grooming, food, home), we hand-source creators from TikTok and Instagram to match your brief. Sourcing adds 3-5 days to campaign timeline.',
  },
  {
    question: 'How do I cancel?',
    answer:
      'Reply to any Newcollab email or email team@newcollab.co with "cancel." Your subscription stops immediately, no last month charge, no questions. Commercial reuse already granted on delivered content continues for its 6-month term.',
  },
];

export const HOW_STEPS = [
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

export function buildFaqPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function buildServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Gifted UGC for DTC brands',
    serviceType: 'Gifted UGC and product seeding',
    url: PAGE_URL,
    description:
      'Newcollab gives DTC brands a private roster of vetted UGC creators. Select, lock, ship a PR package, and get 5-10 ad-ready videos with 6-month commercial usage. First campaign free, then $299/month if you opt in. No auto-billing.',
    provider: {
      '@type': 'Organization',
      name: 'Newcollab',
      url: 'https://newcollab.co',
      logo: 'https://newcollab.co/logo.png',
    },
    areaServed: ['US', 'CA', 'GB', 'AU'],
    audience: {
      '@type': 'BusinessAudience',
      audienceType: 'DTC brands looking for UGC creators',
    },
    offers: {
      '@type': 'Offer',
      url: PAGE_URL,
      price: '299',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description:
        'First campaign free (product + shipping only). $299/month if you opt in from month 2. No auto-billing. 5 vetted creators and 5-10 UGC videos per month with 6-month commercial usage.',
    },
  };
}

export function buildHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to run a gifted UGC campaign with Newcollab',
    description:
      'Open your branded roster, select who to gift, lock shipping details, and get ad-ready UGC with 6-month commercial usage.',
    url: PAGE_URL,
    step: HOW_STEPS.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${PAGE_URL}#how`,
    })),
  };
}

export function buildBreadcrumbSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://newcollab.co/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Gifted UGC for brands',
        item: PAGE_URL,
      },
    ],
  };
}
