// Feature landing pages (/features/<slug>): one page per thing creators search for, each mapped to a real part of
// the product. The footer and the header Features menu link every page on the site to these, with the keyword as
// the link text. Copy rules: describe only what the product does today; no invented numbers or testimonials.

export const SIGNUP = 'https://app.newcollab.co/register/creator';

export const FEATURES = [
  {
    slug: 'ugc-jobs',
    nav: 'UGC jobs',
    navHint: 'Paid UGC gigs, updated daily',
    keyword: 'UGC jobs',
    title: 'UGC Jobs for Creators (Updated Daily): Paid UGC Gigs in One Feed | Newcollab',
    description:
      'Paid UGC jobs for creators in the US, Canada, the UK and Europe, collected every day into one feed. Filter by niche and platform, and let Polly write your application. No follower minimum.',
    eyebrow: 'Paid UGC gigs',
    h1: 'UGC jobs, collected every day into one feed',
    answer:
      'Newcollab collects paid UGC jobs every day from several sources and puts them in one feed you can filter by niche, platform and country. Each listing shows the brand, the pay and what they want. Polly, Newcollab’s AI agent, writes your application with your portfolio link. The free plan shows the top briefs; Pro ($19 a month) unlocks every gig and unlimited applications.',
    live: 'gigs',
    plan: 'Free preview · every gig on Pro',
    cards: [
      ['One feed, not ten tabs', 'Paid briefs from job boards, brand programs and creator platforms, de-duplicated and refreshed daily.'],
      ['Pay shown up front', 'Each card shows the pay and what counts as the deliverable, so you can work out the rate per finished video before you apply.'],
      ['Applications written for you', 'Polly drafts a short application for the brief with your portfolio link. You review it and apply.'],
    ],
    steps: [
      ['Tell Polly your niche', 'Skincare, fitness, apps, pets: the feed puts briefs that fit first.'],
      ['Open a brief', 'See the brand, pay, formats, countries and what they ask for.'],
      ['Get a draft application', 'Polly writes it around the brief and attaches your free UGC portfolio.'],
      ['Track it', 'Every application lands in your Tracker with its next step.'],
    ],
    sections: [
      {
        h2: 'What counts as a UGC job',
        body: [
          'A UGC job is a brand paying you to film content it will post on its own channels or run as ads, usually short vertical videos showing a product or app in use. Unlike sponsored posts, you do not need an audience: the brand is buying the video, not your followers.',
          'Most briefs fall into three shapes: a flat fee per video, a monthly retainer for a set number of videos, or a base fee plus a bonus per 1,000 views. App brands in particular pay a base plus performance. Always work out the pay per finished video before you compare two offers.',
        ],
      },
      {
        h2: 'Where the jobs come from',
        body: [
          'We collect paid briefs every day from public job boards, brand creator programs and creator platforms, then remove duplicates and expired listings. You still apply on the brand’s side; Newcollab does not take a cut of what you are paid.',
          'Some briefs are posted by agencies hiring for several brands. When the brand is not named, the card says so, so you know before you spend time on an application.',
        ],
      },
      {
        h2: 'How to win your first UGC jobs',
        body: [
          'Brands pick from the first few applications that show the right kind of video. Apply early, lead with one clip that matches the brief, and keep the message to four or five sentences. Our guide to UGC rates helps you decide whether the pay is fair before you say yes.',
        ],
      },
    ],
    faq: [
      ['Are these UGC jobs free to apply to?', 'Yes. Applying never costs anything. The free plan shows the top briefs and 3 applications a month; Pro unlocks every gig and unlimited applications for $19 a month.'],
      ['Do I need followers to get UGC jobs?', 'No. UGC jobs pay for the video, not your audience. A portfolio with three or four sample videos matters far more than your follower count.'],
      ['Which countries are the UGC jobs for?', 'Mostly the US, Canada, the UK, Australia and Europe. Each brief lists the countries the brand accepts, and you can filter by yours.'],
      ['Does Newcollab take a commission?', 'No. Brands pay you directly. Newcollab’s only charge is the optional Pro plan.'],
      ['How often is the feed updated?', 'Every day. Expired and closed listings are removed, and new briefs are marked as new.'],
      ['What does Polly write for me?', 'A short application for that specific brief, with your portfolio link, which you can edit before you apply.'],
    ],
    related: [
      ['/blog/ugc-jobs-for-beginners-2026', 'UGC jobs for beginners: where to find them and what they pay'],
      ['/blog/ugc-rates-how-much-to-charge-2026', 'UGC rates: how much to charge in 2026'],
      ['/blog/best-ugc-platforms-for-creators-2026', 'Best UGC platforms for creators compared'],
      ['/media-kit', 'Build your free UGC portfolio'],
    ],
  },
  {
    slug: 'ugc-ad-examples',
    nav: 'UGC ad examples',
    navHint: 'Hooks brands run right now',
    keyword: 'UGC ad examples',
    title: 'UGC Ad Examples and Hooks Brands Are Running Right Now (Daily) | Newcollab',
    description:
      'Real UGC ad hooks and formats brands are running right now, by niche, updated daily from live ads. See what brands already pay for, then film it and pitch it.',
    eyebrow: 'UGC Pulse',
    h1: 'UGC ad examples: the hooks brands are running right now',
    answer:
      'UGC Pulse is Newcollab’s daily feed of the hooks and formats brands are using in their live UGC ads, grouped by niche. Each morning it pulls patterns from ads that are running now, so you can film the kind of video brands already pay for and pitch it with that angle. Today’s top hook per niche is shown below; the full feed with saved items is on Pro.',
    live: 'hooks',
    plan: 'Today’s top hooks free · full feed on Pro',
    cards: [
      ['From live ads', 'Hooks and formats come from ads brands are running now, not from a list written once and left to age.'],
      ['By niche', 'Skincare, fitness, food, pets, apps and more, so you see what works in yours.'],
      ['Ready to pitch', 'Save a hook and Polly uses it as the angle in your next pitch.'],
    ],
    steps: [
      ['Pick your niche', 'Pulse opens on the niches you film for.'],
      ['Read today’s hooks', 'Each shows the opening line or pattern and the format it was used in.'],
      ['Film your version', 'Use the pattern with your own words and product.'],
      ['Pitch with the angle', 'Polly writes the pitch around the hook you saved.'],
    ],
    sections: [
      {
        h2: 'Why hooks matter more than anything else in a UGC ad',
        body: [
          'Most people decide in the first two seconds whether to keep watching an ad. That is why brands test many hooks on the same video and keep the ones that hold attention. When you send a brand a sample that opens with a hook pattern they already run, you are showing them you understand what converts for them.',
          'Common patterns include problem-first openings (“My skin was a mess until…”), proof openings (“I tried this for 30 days”), objection openings (“I didn’t think this would work”) and point-of-view openings that drop the viewer into a routine.',
        ],
      },
      {
        h2: 'How to turn a UGC ad example into your own video',
        body: [
          'Keep the structure, not the words. Take the pattern, swap in your product and your own experience, and keep the first line under eight words. Film three versions of the hook on the same video so the brand can test them. Our guide to making UGC brands pay for walks through the formats and a 30-second script.',
        ],
      },
    ],
    faq: [
      ['Where do these UGC ad examples come from?', 'From ads brands are running right now. We look at live ad samples each day and pull out the opening hooks and formats by niche.'],
      ['How often is UGC Pulse updated?', 'Every day. The feed shows today, this week, and the hooks you saved.'],
      ['Can I copy a hook word for word?', 'Use the pattern, not the exact words. Brands want your voice and your experience; the pattern tells you what structure works.'],
      ['Is UGC Pulse free?', 'Today’s top hook per niche is shown free on this page. The full daily feed, the weekly view and saving hooks for Polly are on Pro ($19 a month).'],
      ['Which niches are covered?', 'The niches with the most UGC ads, including skincare, makeup, fitness, food, home, pets, fashion and apps. Niches with too few ads that day are skipped.'],
      ['How does this help me get brand deals?', 'A sample video that uses a hook brands already pay for, and a pitch that names that angle, gets more replies than a generic “I’d love to work with you”.'],
    ],
    related: [
      ['/blog/how-to-make-ugc-videos-brands-pay-for-2026', 'How to make UGC videos brands pay for'],
      ['/tools/ugc-hook-generator', 'Free UGC hook generator'],
      ['/tools/ugc-script-generator', 'Free UGC script generator'],
      ['/blog/50-ugc-product-ideas-for-beginners-2026', '50 UGC product ideas to film'],
    ],
  },
  {
    slug: 'brands-hiring-ugc-creators',
    nav: 'Brands hiring UGC creators',
    navHint: 'Brands running UGC ads now',
    keyword: 'brands looking for UGC creators',
    title: 'Brands Looking for UGC Creators Right Now (Running UGC Ads) | Newcollab',
    description:
      'Brands currently running ads with UGC creators, found in public ad libraries and updated daily, each with its PR contact or application form. Pitch the brands that are already buying UGC.',
    eyebrow: 'Hot brands',
    h1: 'Brands looking for UGC creators right now',
    answer:
      'Newcollab flags brands that are running ads with UGC creators right now, found by checking public ad libraries every day. A brand already paying for UGC ads is the warmest pitch you can send. Every hot brand has a 🔥 tag in the directory, its PR contact or application form, and Polly can pitch it for you.',
    live: 'hot',
    plan: 'Hot brands free in the directory · Polly pitches on Pro',
    cards: [
      ['Found in live ads', 'We check public ad libraries daily for brands using creator-style videos in their ads.'],
      ['A real contact for each', 'Every hot brand comes with its PR email or creator application form.'],
      ['🔥 across the app', 'Hot brands are tagged on every brand card and can be filtered in the directory.'],
    ],
    steps: [
      ['Filter the directory by 🔥', 'See the brands running UGC ads in your niche.'],
      ['Open a brand', 'Check what they sell, who they target and how to reach them.'],
      ['Pitch with an ad angle', 'Polly writes a short pitch that references the kind of ads they run.'],
      ['Follow up', 'Polly follows up once if they don’t reply, then moves on.'],
    ],
    sections: [
      {
        h2: 'Why brands running UGC ads are the best brands to pitch',
        body: [
          'A brand running ads with creators has budget, a process for briefing creators and a constant need for new videos, because ads wear out within weeks. Pitching them is not asking a favour; it is offering something they buy every month.',
          'Smaller direct-to-consumer brands are the sweet spot: big enough to run ads, small enough that a short personal pitch reaches the person who books creators.',
        ],
      },
      {
        h2: 'How to pitch a brand that is already running UGC ads',
        body: [
          'Mention the kind of ad you saw, offer one specific video idea in that style, and link two samples. Keep it under 120 words. If they run ads on Meta, offer raw footage and hook variations, which is what their ad team actually needs. Our pitch email templates show the exact structure.',
        ],
      },
    ],
    faq: [
      ['How do you know a brand is hiring UGC creators?', 'We check public ad libraries daily and flag brands whose live ads use creator-style videos. That shows they are actively buying UGC, even if they have no open job post.'],
      ['Is the list of hot brands free?', 'Yes. Hot brands are tagged in the free brand directory. Having Polly pitch them for you every weekday is part of Pro ($19 a month).'],
      ['Do these brands accept small creators?', 'Many do. UGC ads are about the video, not your audience, so a strong portfolio matters more than followers.'],
      ['How often is the list updated?', 'The ad library check runs every day, so new brands running UGC ads are added daily.'],
      ['Should I pitch gifted or paid to these brands?', 'Paid, usually. A brand running ads has a budget for content; lead with your rate for a video with paid usage.'],
      ['How many hot brands are there?', 'The live count is shown on this page and in the directory; it changes every day.'],
    ],
    related: [
      ['/directory', 'Brand directory: 3,000+ brands with PR contacts'],
      ['/blog/brands-that-pay-for-ugc-content-2026', 'Brands that pay for UGC content'],
      ['/blog/brand-pitch-email-templates-micro-creators-2026', 'Brand pitch email templates'],
      ['/features/ai-pitch-email-writer', 'Let Polly pitch them for you'],
    ],
  },
  {
    slug: 'ai-pitch-email-writer',
    nav: 'AI pitch email writer',
    navHint: 'Polly pitches brands for you',
    keyword: 'AI pitch email for brands',
    title: 'AI Pitch Email Writer for Creators: Polly Pitches Brands From Your Gmail | Newcollab',
    description:
      'Polly is an AI agent that finds brands that fit your niche, writes a short personal pitch with your portfolio, sends it from your own Gmail and follows up. Built for UGC creators and micro-influencers.',
    eyebrow: 'Polly',
    h1: 'The AI pitch email writer that also sends and follows up',
    answer:
      'Polly is Newcollab’s AI agent for creators. It picks brands that fit your niche, studies each brand’s ads to find your angle, writes a short personal pitch with your portfolio link, sends it from your own Gmail and follows up once. When a brand replies, Polly drafts your answer with a fair rate. Writing pitches is free; Polly pitching 3 brands every weekday is on Pro ($19 a month).',
    live: null,
    plan: 'Pitch writing free · daily pitching on Pro',
    cards: [
      ['Personal, not mail-merge', 'Each pitch names the brand’s product and an angle from their ads, in your voice, in under 120 words.'],
      ['Sent from your Gmail', 'Pitches go from your own address, so replies land in your inbox and brands see a real person.'],
      ['Follow-ups and replies', 'One polite follow-up on day 4, and a reply draft with a fair usage rate when a brand says yes.'],
    ],
    steps: [
      ['Set up in 2 minutes', 'Your niche, a few samples and your rates. Polly learns your voice from one pitch you approve.'],
      ['Polly picks brands', 'Brands that fit your niche and country, with hot brands running UGC ads first.'],
      ['Pitches go out every weekday', 'Three a day on Pro, each written for that brand, from your Gmail.'],
      ['You answer the yeses', 'Polly drafts the reply with your rate; you send it.'],
    ],
    sections: [
      {
        h2: 'Why most creator pitch emails get ignored',
        body: [
          'Brand inboxes are full of “I love your brand, I’d love to collaborate” emails with a media kit attached. They get skipped because they ask the brand to do the work of imagining the content. Pitches that get replies name one product, propose one specific video, and show one sample of that kind of video.',
          'Writing that well takes 15 to 20 minutes per brand, which is why most creators stop after a handful. Polly does the research and the first draft so you can pitch every weekday without it becoming a second job.',
        ],
      },
      {
        h2: 'What an AI-written pitch should and should not do',
        body: [
          'It should sound like you, be short, and be specific to the brand. It should not invent facts about you, promise results, or send without your approval. Polly writes from your real samples and rates, shows you the first pitch to approve, and you can pause it at any time.',
        ],
      },
    ],
    faq: [
      ['Is Polly free?', 'Polly writing your pitches is free, with 3 brand applications a month. Polly finding brands and sending 3 pitches every weekday from your Gmail, with follow-ups, is on Pro ($19 a month).'],
      ['Does Polly send emails without my approval?', 'You approve the style first, then Polly sends on your schedule. You can pause or edit at any time, and every pitch is in your Tracker.'],
      ['Why send from my own Gmail?', 'Brands reply to people, not platforms. Pitches from your own address land better and replies come straight to you.'],
      ['Who does Polly pitch?', 'Brands from the 3,000+ brand directory that fit your niche and country, with brands currently running UGC ads first.'],
      ['Can Polly help when a brand replies?', 'Yes. It drafts your answer, including a usage rate sized to your audience, so you never have to guess a price on the spot.'],
      ['Does it work for micro-influencers too?', 'Yes. Polly pitches gifted PR and paid UGC; it works with any audience size.'],
    ],
    related: [
      ['/tools/ugc-pitch-email-generator', 'Free UGC pitch email generator'],
      ['/blog/brand-pitch-email-templates-micro-creators-2026', 'Brand pitch email templates for micro creators'],
      ['/blog/pr-email-addresses-for-brands-how-to-pitch-2026', 'PR email addresses for brands and how to pitch them'],
      ['/features/brand-deal-tracker', 'Track every pitch and reply'],
    ],
  },
  {
    slug: 'brand-deal-tracker',
    nav: 'Brand deal tracker',
    navHint: 'Every pitch, reply and deal',
    keyword: 'brand deal tracker',
    title: 'Brand Deal Tracker for Creators: Pitches, Replies and Deals in One Place | Newcollab',
    description:
      'A free brand deal tracker for UGC creators and influencers: every pitch, reply, gifted box and paid deal in one board, with the next step for each and a monthly goal. Replaces the spreadsheet.',
    eyebrow: 'Tracker',
    h1: 'A brand deal tracker that tells you the next step',
    answer:
      'Newcollab’s Tracker is a free brand deal tracker for creators. Every brand you pitch, every reply and every deal lands on one board with its next step: follow up, answer, ship, film or invoice. Log gifted offers at their product value and paid offers at their fee, set a monthly goal, and let Polly draft your replies. It replaces the spreadsheet most creators give up on.',
    live: null,
    plan: 'Free on every plan',
    cards: [
      ['Next step on every card', 'Pitched, replied, negotiating, closed: each deal shows what to do next.'],
      ['Gifted and paid, counted', 'Gifted boxes count at their store value, paid offers at their fee, toward a monthly goal.'],
      ['Replies drafted for you', 'When a brand writes back, Polly drafts your answer. Replying is free on every plan.'],
    ],
    steps: [
      ['Pitch or apply', 'Pitches and applications from Newcollab are added automatically.'],
      ['Log what they said', 'Gifted offer, paid offer, question or pass: one tap.'],
      ['Follow the next step', 'Ship dates, draft due dates and follow-ups are on the card.'],
      ['Watch your month', 'See progress toward your goal and which brands opened your kit.'],
    ],
    sections: [
      {
        h2: 'Why creators lose brand deals they already had',
        body: [
          'Most lost deals are not rejections. They are a reply that went unanswered for a week, a follow-up that never went out, or a draft deadline that slipped. A spreadsheet records what happened; it does not tell you what to do today.',
          'The Tracker is built around the next step. Every card says whether you are waiting on the brand or the brand is waiting on you, and what that step is.',
        ],
      },
      {
        h2: 'What to track for every brand deal',
        body: [
          'At minimum: the brand, the contact, the date you pitched, their answer, the offer (gifted value or paid fee), usage rights, deliverables and due dates. For paid deals, add the invoice date. The Tracker keeps these on the card so a deal never depends on remembering an email thread.',
        ],
      },
    ],
    faq: [
      ['Is the brand deal tracker free?', 'Yes. The Tracker and replying to brands are free on every plan.'],
      ['Do I have to add deals by hand?', 'Pitches and applications sent through Newcollab are added automatically.'],
      ['Can I track gifted PR packages, not just paid deals?', 'Yes. Gifted offers count at the product’s store value, so your monthly goal reflects both.'],
      ['Does it show who opened my portfolio?', 'Yes. Brands that opened your UGC portfolio link are listed, which tells you who to follow up with.'],
      ['Can I set a monthly income goal?', 'Yes. Set a goal and the Tracker shows your progress from gifted and paid deals.'],
      ['Is it better than a spreadsheet?', 'It does what a spreadsheet does and adds the next step, reminders and drafted replies, without you maintaining formulas.'],
    ],
    related: [
      ['/blog/ugc-contract-usage-rights-2026', 'UGC contracts and usage rights'],
      ['/blog/negotiate-brand-deals-like-pro-2025', 'How to negotiate brand deals'],
      ['/features/ai-pitch-email-writer', 'Polly, the AI pitch email writer'],
      ['/media-kit', 'Free UGC portfolio'],
    ],
  },
];

export function getFeature(slug) {
  return FEATURES.find((f) => f.slug === slug) || null;
}

/** Sitewide footer and Features menu: every item is a plain link in the HTML, with the keyword as its text. */
export const FOOTER_COLUMNS = [
  {
    title: 'For creators',
    links: [
      ...FEATURES.map((f) => [`/features/${f.slug}`, f.nav]),
      ['/media-kit', 'Free UGC portfolio'],
      ['/pricing', 'Pricing'],
    ],
  },
  {
    title: 'Free UGC tools',
    links: [
      ['/tools/ugc-rate-calculator', 'UGC rate calculator'],
      ['/tools/ugc-hook-generator', 'UGC hook generator'],
      ['/tools/ugc-script-generator', 'UGC script generator'],
      ['/tools/ugc-pitch-email-generator', 'Pitch email generator'],
      ['/ugc-starter-guide', 'Free UGC starter guide'],
      ['/ugc-portfolio-examples', 'UGC portfolio examples'],
    ],
  },
  {
    title: 'Brand lists',
    links: [
      ['/directory', 'Brand directory'],
      ['/pr-list', 'PR list 2026'],
      ['/directory/skincare', 'Skincare brands that send PR'],
      ['/directory/k-beauty', 'K-beauty PR list'],
      ['/directory/fashion', 'Fashion brands that send PR'],
      ['/directory/us', 'US brands that send PR'],
    ],
  },
  {
    title: 'Guides',
    links: [
      ['/blog/ugc-rates-how-much-to-charge-2026', 'UGC rates'],
      ['/blog/how-to-become-a-ugc-creator-2026', 'How to become a UGC creator'],
      ['/blog/best-ugc-platforms-for-creators-2026', 'Best UGC platforms'],
      ['/blog/collabstr-alternatives-for-ugc-creators-2026', 'Collabstr alternatives'],
      ['/blog/is-collabstr-free-for-creators-2026', 'Is Collabstr free?'],
      ['/blog', 'All guides'],
    ],
  },
  {
    title: 'Newcollab',
    links: [
      ['/brands/pr-packages', 'For brands'],
      ['/integrations', 'ChatGPT, Claude & Gemini apps'],
      ['/about', 'About us'],
      ['/contact', 'Contact'],
      ['/privacy-policy', 'Privacy'],
      ['/terms-of-service', 'Terms'],
    ],
  },
];
