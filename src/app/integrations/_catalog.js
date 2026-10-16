import { CITATION_DEFINITION } from '../../lib/citationFacts';

export const SITE = 'https://newcollab.co';
export const API = 'https://api.newcollab.co/api/v1/integrations';
export const LAST_UPDATED = '16 October 2026';
export const LAST_UPDATED_ISO = '2026-10-16';
export const RATE_LIMIT = 30;

export function trackedUrl(path, campaign) {
  const q = new URLSearchParams({ utm_source: 'seo', utm_medium: 'organic', utm_campaign: campaign });
  return `${path}${path.includes('?') ? '&' : '?'}${q.toString()}`;
}

export function trackIntegrationClick(campaign, location) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', 'integration_cta_click', {
    event_category: 'integrations',
    event_label: campaign,
    campaign,
    cta_location: location,
  });
}

export const TOOL_PARAMS = [
  { name: 'niche', required: true, type: 'string', desc: 'Vertical or category, e.g. skincare, fitness, supplements, pet products.' },
  { name: 'platform', required: false, type: 'tiktok | instagram | all', desc: 'Social channel. Defaults to tiktok.' },
  { name: 'country', required: false, type: 'string', desc: 'Two-letter creator country code, e.g. US, GB, AU, CA.' },
  { name: 'limit', required: false, type: 'integer 1–8', desc: 'Number of creators returned. Defaults to 5.' },
];

export const RESULT_FIELDS = [
  { field: 'Platform', desc: 'TikTok or Instagram, the channel the creator is active on.' },
  { field: 'Niches', desc: 'Up to three content niches, best match first.' },
  { field: 'Follower band', desc: 'A range such as 10K–50K, never an exact count.' },
  { field: 'Engagement', desc: 'Engagement rate label from recent posts.' },
  { field: 'Country', desc: 'Creator country, when known.' },
  { field: 'Open to gifting', desc: 'Whether the creator accepts product-for-content collabs.' },
  { field: 'Average views and past brands', desc: 'Shown when the creator has posted work on Newcollab.' },
  { field: 'Handle and portfolio link', desc: 'Only for creators who published a public UGC portfolio.' },
  { field: 'Roster link', desc: 'A link to open a free gifted roster on Newcollab with the same filters.' },
];

export const SHARED_VALUE = [
  { icon: '🎯', title: 'Vetted UGC creators, not scraped lists', desc: 'Every creator signed up on Newcollab and opted into brand collabs. No cold scraped profiles.' },
  { icon: '🎁', title: 'Built for gifted collabs', desc: 'See who accepts product-for-content before you reach out, so you stop DMing creators who only take paid deals.' },
  { icon: '🔒', title: 'Privacy first', desc: 'Handles appear only for creators with a public portfolio. Everyone else shows as anonymous stats.' },
  { icon: '⚡', title: 'Zero setup', desc: 'No API key, no account, no install. Paste one link and ask in plain English.' },
];

const ASSISTANTS = {
  chatgpt: {
    slug: 'chatgpt',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    appTerm: 'app',
    navTitle: 'Newcollab in ChatGPT',
    title: 'Find UGC Creators in ChatGPT (Newcollab App + MCP) | Newcollab',
    description:
      'Search vetted UGC creators and micro-influencers by niche, platform and country right inside ChatGPT. Add the free Newcollab app in one minute, no API key needed.',
    keywords: [
      'find UGC creators ChatGPT',
      'ChatGPT influencer search',
      'ChatGPT app for influencer marketing',
      'UGC creator search ChatGPT',
      'find micro influencers with ChatGPT',
      'ChatGPT MCP UGC creators',
      'Newcollab ChatGPT app',
    ],
    h1: ['Find UGC creators', 'from ChatGPT'],
    heroBullets: [
      'Search vetted UGC creators by niche, platform and country',
      'See follower band, engagement and who accepts gifted collabs',
      'Works in ChatGPT on web and desktop, free, no API key',
    ],
    mcpUrl: `${API}/mcp`,
    listed: false,
    directoryUrl: null,
    intro:
      'Newcollab is a gifted UGC platform for DTC brands. The Newcollab app for ChatGPT lets you ask for UGC creators in plain English and get a short, vetted list back in the chat, with each creator\u2019s platform, niches, follower band, engagement and gifting preference. When you like what you see, one link opens a free gifted roster on Newcollab with the same filters.',
    steps: [
      {
        name: 'Connect',
        time: 'under a minute',
        text: 'In ChatGPT, open Settings, then Apps, then Advanced settings, and turn on Developer mode. Choose Create app, paste the Newcollab link below and set authentication to "No authentication".',
      },
      {
        name: 'Ask',
        time: 'seconds',
        text: 'In a new chat, pick Newcollab from the tools menu or just mention it, then ask for creators the way you would ask a teammate: niche, platform, country.',
      },
      {
        name: 'Gift',
        time: 'free first campaign',
        text: 'Open the roster link ChatGPT returns. Select who to gift on a private roster, lock the list and export a shipping CSV for Shopify or ShipStation.',
      },
    ],
    setupNote:
      'Developer mode is available on ChatGPT Plus, Pro, Business, Enterprise and Edu. Menu names can shift slightly between ChatGPT releases.',
    demo: {
      prompt: 'Find 5 TikTok skincare UGC creators in the US who accept gifted products.',
      reply:
        'Here are 5 skincare creators on TikTok in the US who are open to gifting. Three have a public portfolio you can open, and two are shown as anonymous stats. Want me to open a free gifted roster with these filters?',
    },
    prompts: [
      { label: 'Product seeding', text: 'Find 5 TikTok skincare UGC creators in the US who accept gifted products.' },
      { label: 'Paid social', text: 'I need Instagram creators for supplement ads in the UK. Who has the best engagement?' },
      { label: 'New niche', text: 'Show me pet product micro-influencers on TikTok I could send PR boxes to.' },
      { label: 'Shortlist', text: 'Compare three fitness creators in Australia and tell me who has worked with brands before.' },
    ],
    compare: {
      columns: ['ChatGPT app directory', 'Developer mode link'],
      rows: [
        { label: 'Status', a: 'In review with OpenAI', b: 'Live today' },
        { label: 'Setup', a: 'One click once listed', b: 'Paste the link in Settings' },
        { label: 'Sign-in', a: 'None', b: 'None' },
        { label: 'Creator search', a: 'Yes', b: 'Yes' },
        { label: 'Cost', a: 'Free', b: 'Free' },
      ],
    },
    devExtras: [
      {
        title: 'Custom GPT (Actions)',
        text: 'Building your own GPT? Import the OpenAPI schema under Configure, then Actions, then Import from URL. No authentication.',
        code: `${API}/openapi.json`,
      },
      {
        title: 'REST',
        text: 'Plain JSON over GET, same filters as the tool.',
        code: `${API}/search-creators?niche=skincare&platform=tiktok&country=US`,
      },
    ],
    faqs: [
      {
        question: 'How do I add Newcollab to ChatGPT?',
        answer:
          'Open ChatGPT Settings, go to Apps, then Advanced settings, and turn on Developer mode. Choose Create app, name it Newcollab, paste https://api.newcollab.co/api/v1/integrations/mcp as the MCP server URL and pick No authentication. Once the Newcollab app is approved in the ChatGPT app directory you will also be able to add it in one click.',
      },
      {
        question: 'Can ChatGPT find UGC creators on its own?',
        answer:
          'ChatGPT can suggest well-known influencers from its training data, but it has no live view of which creators make UGC, what their engagement is, or who accepts gifted collabs. The Newcollab app gives it a live, vetted creator directory to search, so the answers come from real opted-in creators instead of guesses.',
      },
      {
        question: 'Is the Newcollab ChatGPT app free?',
        answer:
          'Yes. The app is free and needs no Newcollab account or API key. If you decide to gift product, your first campaign on Newcollab has no platform fee, you only pay for product and shipping. After that it is $299 a month if you opt in, with no auto-billing.',
      },
      {
        question: 'Does the app see my ChatGPT conversation?',
        answer:
          'No. ChatGPT sends Newcollab only the search filters it chose (niche, platform, country and number of results). We never receive your chat history, your name or your OpenAI account details.',
      },
      {
        question: 'Which ChatGPT plans support it?',
        answer:
          'Custom apps through Developer mode are available on ChatGPT Plus, Pro, Business, Enterprise and Edu. Once listed in the ChatGPT app directory, the app follows the plans OpenAI enables for directory apps.',
      },
      {
        question: 'Can I use it inside a custom GPT?',
        answer:
          'Yes. In the GPT builder, open Configure, then Actions, and import https://api.newcollab.co/api/v1/integrations/openapi.json. No authentication is needed.',
      },
      {
        question: 'Why do some creators show without a handle?',
        answer:
          'Handles appear only for creators who published a public UGC portfolio on Newcollab. Everyone else is shown as anonymous stats (niche, follower band, country) to protect their privacy. Brands see full profiles on their private Newcollab roster.',
      },
    ],
  },
  claude: {
    slug: 'claude',
    name: 'Claude',
    vendor: 'Anthropic',
    appTerm: 'connector',
    navTitle: 'Newcollab in Claude',
    title: 'Find UGC Creators in Claude (Newcollab Connector + MCP) | Newcollab',
    description:
      'Search vetted UGC creators and micro-influencers by niche, platform and country from Claude. Add the free Newcollab connector in under a minute, no API key needed.',
    keywords: [
      'find UGC creators Claude',
      'Claude connector influencer marketing',
      'Claude MCP influencer search',
      'UGC creator search Claude',
      'Claude custom connector UGC',
      'find micro influencers with Claude',
      'Newcollab Claude connector',
    ],
    h1: ['Find UGC creators', 'from Claude'],
    heroBullets: [
      'Search vetted UGC creators by niche, platform and country',
      'See follower band, engagement and who accepts gifted collabs',
      'Works in Claude on web, desktop and mobile, plus Claude Code',
    ],
    mcpUrl: `${API}/claude/mcp`,
    listed: false,
    directoryUrl: null,
    intro:
      'Newcollab is a gifted UGC platform for DTC brands. The Newcollab connector gives Claude a live, read-only view of our vetted UGC creator directory, so you can shortlist creators for product seeding or paid social without leaving the conversation. Each result shows platform, niches, follower band, engagement and gifting preference, plus a link to open a free gifted roster on Newcollab.',
    steps: [
      {
        name: 'Connect',
        time: 'under a minute',
        text: 'In Claude, open Settings, then Connectors, and choose Add custom connector. Name it Newcollab and paste the link below. There is nothing to sign in to.',
      },
      {
        name: 'Ask',
        time: 'seconds',
        text: 'Turn on Newcollab from the tools menu in a chat, then describe the creators you need: niche, platform, country, or the product you want to seed.',
      },
      {
        name: 'Gift',
        time: 'free first campaign',
        text: 'Open the roster link from the results. Pick creators on a private roster, lock the list and export a shipping CSV for Shopify or ShipStation.',
      },
    ],
    setupNote:
      'Custom connectors are available on Claude Free, Pro, Max, Team and Enterprise. On Team and Enterprise, an owner may need to add the connector for the organization first.',
    demo: {
      prompt: 'Who are some Instagram fitness micro-influencers in the UK I could send PR packages to?',
      reply:
        'I found 5 fitness creators on Instagram in the UK who accept gifted collabs, most in the 10K–50K range. Two have worked with brands on Newcollab before. I can open a free gifted roster with these filters if you want to shortlist them.',
    },
    prompts: [
      { label: 'Product seeding', text: 'Who are some Instagram fitness micro-influencers in the UK I could send PR packages to?' },
      { label: 'Launch plan', text: 'Plan a 10-creator seeding launch for our new SPF and find the creators to start with.' },
      { label: 'Niche research', text: 'Find TikTok creators in the US who make home and kitchen UGC and accept gifting.' },
      { label: 'Ad creative', text: 'I need UGC for Meta ads for a supplement brand. Find creators with strong engagement.' },
    ],
    compare: {
      columns: ['Claude directory', 'Custom connector link'],
      rows: [
        { label: 'Status', a: 'In review with Anthropic', b: 'Live today' },
        { label: 'Setup', a: 'One click once listed', b: 'Paste the link in Settings' },
        { label: 'Sign-in', a: 'None', b: 'None' },
        { label: 'Creator search', a: 'Yes', b: 'Yes' },
        { label: 'Claude Code', a: 'Yes, same account', b: 'Yes, via claude mcp add' },
        { label: 'Cost', a: 'Free', b: 'Free' },
      ],
    },
    devExtras: [
      {
        title: 'Claude Code',
        text: 'Add the server from your terminal, then ask Claude Code for creators in any session.',
        code: `claude mcp add --transport http newcollab ${API}/claude/mcp`,
      },
      {
        title: 'Claude API (MCP connector)',
        text: 'Pass the URL as an mcp_servers entry with type "url". No authorization token is needed.',
        code: `${API}/claude/mcp`,
      },
    ],
    faqs: [
      {
        question: 'How do I add Newcollab to Claude?',
        answer:
          'Open Claude Settings, go to Connectors and choose Add custom connector. Name it Newcollab and paste https://api.newcollab.co/api/v1/integrations/claude/mcp. There is no sign-in step. Once the connector is approved in the Claude directory you will also be able to add it in one click.',
      },
      {
        question: 'Can Claude find UGC creators without a connector?',
        answer:
          'Claude can name well-known influencers from its training data, but it cannot tell you which creators make UGC today, their engagement, or who accepts gifted collabs. The Newcollab connector gives Claude a live, vetted creator directory to search, so answers come from real opted-in creators.',
      },
      {
        question: 'Is the Newcollab connector free?',
        answer:
          'Yes. The connector is free and needs no Newcollab account or API key. If you go on to gift product, your first campaign on Newcollab has no platform fee, you only pay for product and shipping. After that it is $299 a month if you opt in, with no auto-billing.',
      },
      {
        question: 'What data does the connector receive?',
        answer:
          'Only the search filters Claude sends (niche, platform, country and number of results) and the calling server\u2019s IP address for rate limiting, kept for about a minute. We never receive your conversation, your name or your Anthropic account details. Full details are in the Newcollab privacy policy.',
      },
      {
        question: 'Does it work in Claude Code?',
        answer:
          'Yes. Run claude mcp add --transport http newcollab https://api.newcollab.co/api/v1/integrations/claude/mcp, or use the connector from your Claude account once it is listed in the directory.',
      },
      {
        question: 'Can the connector change anything in my account?',
        answer:
          'No. It has one read-only tool, search_ugc_creators. It cannot send messages, create campaigns, spend money or write data anywhere.',
      },
      {
        question: 'Why do some creators show without a handle?',
        answer:
          'Handles appear only for creators who published a public UGC portfolio on Newcollab. Everyone else is shown as anonymous stats (niche, follower band, country) to protect their privacy. Brands see full profiles on their private Newcollab roster.',
      },
    ],
  },
  gemini: {
    slug: 'gemini',
    name: 'Gemini',
    vendor: 'Google',
    appTerm: 'custom app',
    navTitle: 'Newcollab in Gemini',
    title: 'Find UGC Creators in Gemini (Newcollab Custom App + MCP) | Newcollab',
    description:
      'Search vetted UGC creators and micro-influencers by niche, platform and country from Google Gemini. Add Newcollab as a free custom app in under a minute, no API key needed.',
    keywords: [
      'find UGC creators Gemini',
      'Gemini influencer search',
      'Gemini connected apps influencer marketing',
      'Gemini custom app MCP',
      'UGC creator search Google Gemini',
      'find micro influencers with Gemini',
      'Newcollab Gemini app',
    ],
    h1: ['Find UGC creators', 'from Gemini'],
    heroBullets: [
      'Search vetted UGC creators by niche, platform and country',
      'See follower band, engagement and who accepts gifted collabs',
      'Add once on the web, then use it in Gemini on web and mobile',
    ],
    mcpUrl: `${API}/gemini/mcp`,
    listed: false,
    directoryUrl: null,
    status: 'Google curates the Connected Apps catalog, so Newcollab is added as a custom app. The link works today.',
    hubStatus: 'Custom app link live',
    intro:
      'Newcollab is a gifted UGC platform for DTC brands. Added to Gemini as a custom connected app, Newcollab lets you ask for UGC creators in plain English and get a vetted shortlist back in the chat, with each creator\u2019s platform, niches, follower band, engagement and gifting preference. One link then opens a free gifted roster on Newcollab with the same filters.',
    steps: [
      {
        name: 'Connect',
        time: 'under a minute',
        text: 'On gemini.google.com, open Settings, then Connected Apps. Under Custom apps, choose Add a custom app, paste the Newcollab link below and click Next. There is nothing to sign in to.',
      },
      {
        name: 'Ask',
        time: 'seconds',
        text: 'In a chat, type @Newcollab Creator Search followed by your request: niche, platform, country, or the product you want to seed. It works in any language you write in.',
      },
      {
        name: 'Gift',
        time: 'free first campaign',
        text: 'Open the roster link in the results. Pick creators on a private roster, lock the list and export a shipping CSV for Shopify or ShipStation.',
      },
    ],
    setupNote:
      'Custom apps are added on the Gemini web app and then also work in the Gemini mobile app. Google requires a personal Google account and Keep Activity turned on; check Google\u2019s help page for current country availability.',
    demo: {
      prompt: '@Newcollab Creator Search find me 5 fitness creators who accept gifted products.',
      reply:
        'Here are 5 fitness UGC creators. Most are in the 1K–50K follower range and all are open to gifting, product in exchange for content. Each handle links to their public portfolio. Want me to open a free gifted roster with these filters?',
    },
    prompts: [
      { label: 'Product seeding', text: '@Newcollab Creator Search find me 5 fitness creators who accept gifted products.' },
      { label: 'Local market', text: '@Newcollab Creator Search show beauty creators in France on Instagram.' },
      { label: 'Paid social', text: '@Newcollab Creator Search I need TikTok creators for supplement ads in the US with strong engagement.' },
      { label: 'New niche', text: '@Newcollab Creator Search find pet product micro-influencers I could send PR boxes to.' },
    ],
    compare: {
      columns: ['Gemini Connected Apps catalog', 'Custom app link'],
      rows: [
        { label: 'Status', a: 'Curated by Google partners', b: 'Live today' },
        { label: 'Setup', a: 'One click if featured', b: 'Paste the link in Connected Apps' },
        { label: 'Sign-in', a: 'None', b: 'None' },
        { label: 'Creator search', a: 'Yes', b: 'Yes' },
        { label: 'Gemini mobile', a: 'Yes', b: 'Yes, after adding on the web' },
        { label: 'Cost', a: 'Free', b: 'Free' },
      ],
    },
    devExtras: [
      {
        title: 'Gemini CLI',
        text: 'Add the server to the Gemini CLI, then ask for creators in any session.',
        code: `gemini mcp add --transport http newcollab ${API}/gemini/mcp`,
      },
      {
        title: 'Gemini Enterprise',
        text: 'Workspace admins can add it under Manage team, then Connected apps, then Add MCP Server, with No authentication.',
        code: `${API}/gemini/mcp`,
      },
    ],
    faqs: [
      {
        question: 'How do I add Newcollab to Gemini?',
        answer:
          'On gemini.google.com, open Settings, then Connected Apps. Under Custom apps, choose Add a custom app, paste https://api.newcollab.co/api/v1/integrations/gemini/mcp and click Next. No sign-in is needed. Then type @Newcollab Creator Search in any chat.',
      },
      {
        question: 'Can Gemini find UGC creators on its own?',
        answer:
          'Gemini can search the web and name well-known influencers, but it cannot tell which creators make UGC, accept gifted collabs, or what their engagement is. The Newcollab custom app gives Gemini a live, vetted directory of opted-in creators to search.',
      },
      {
        question: 'Is Newcollab in Gemini free?',
        answer:
          'Yes. The custom app is free and needs no Newcollab account or API key. If you go on to gift product, your first campaign on Newcollab has no platform fee, you only pay for product and shipping. After that it is $299 a month if you opt in, with no auto-billing.',
      },
      {
        question: 'Why is Newcollab not in the Gemini Connected Apps list?',
        answer:
          'Google curates the apps featured in Connected Apps through its own partnerships and has no public submission process yet. Any MCP server can still be added as a custom app, which is how Newcollab works in Gemini today.',
      },
      {
        question: 'Does it work in the Gemini mobile app?',
        answer:
          'Yes. Custom apps can only be added on the Gemini web app, but once added they are also available in the Gemini mobile app on the same Google account.',
      },
      {
        question: 'What data does Newcollab receive from Gemini?',
        answer:
          'Only the search filters Gemini sends (niche, platform, country and number of results) and the calling server\u2019s IP address for rate limiting, kept for about a minute. We never receive your conversation or Google account details.',
      },
      {
        question: 'Why do some creators show without a handle?',
        answer:
          'Handles appear only for creators who published a public UGC portfolio on Newcollab. Everyone else is shown as anonymous stats (niche, follower band, country) to protect their privacy. Brands see full profiles on their private Newcollab roster.',
      },
    ],
  },
};

export function assistantSlugs() {
  return Object.keys(ASSISTANTS);
}

export function getAssistant(slug) {
  return ASSISTANTS[slug] || null;
}

export function allAssistants() {
  return Object.values(ASSISTANTS);
}

export function otherAssistants(slug) {
  return allAssistants().filter((a) => a.slug !== slug);
}

function pageUrl(a) {
  return `${SITE}/integrations/${a.slug}`;
}

export function buildSchemas(a) {
  const url = pageUrl(a);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: a.title,
      url,
      dateModified: LAST_UPDATED_ISO,
      description: `${a.description} ${CITATION_DEFINITION}`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `Newcollab for ${a.name}`,
      applicationCategory: 'BusinessApplication',
      operatingSystem: `${a.name} (web, desktop${a.slug === 'chatgpt' ? '' : ', mobile'})`,
      url,
      description: a.description,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@type': 'Organization', name: 'Newcollab', url: SITE, logo: `${SITE}/logo.png` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: `How to find UGC creators in ${a.name} with Newcollab`,
      totalTime: 'PT1M',
      tool: [{ '@type': 'HowToTool', name: a.name }],
      step: a.steps.map((step, i) => ({
        '@type': 'HowToStep',
        position: i + 1,
        name: step.name,
        text: step.text,
        url: `${url}#setup`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: a.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer },
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'AI integrations', item: `${SITE}/integrations` },
        { '@type': 'ListItem', position: 3, name: a.navTitle, item: url },
      ],
    },
  ];
}
