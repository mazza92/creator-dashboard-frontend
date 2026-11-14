// Free UGC tools on newcollab.co/tools (2026-11-14). Every page = a working tool + original,
// variant-specific examples and guidance. Combinations without their own examples are not published.

export const SITE = 'https://newcollab.co';
export const API = 'https://api.newcollab.co/api/public/ugc-tools';

export const NICHES = {
  skincare: {
    label: 'Skincare', product: 'vitamin C serum', audience: 'people with dull or uneven skin',
    benefit: 'gives my skin a brighter look in the morning',
    hooks: [
      'I did not expect a serum this cheap to replace my highlighter.',
      'POV: your skin finally looks awake before coffee.',
      'Stop scrolling if your makeup sits on top of your skin.',
      'Three serums later, this is the one I actually finished.',
      'Texture check first, because that is all you really want to know.',
      'Dermatologists did not tell me this. My bathroom mirror did.',
    ],
    script: ['“My skin looked grey by noon all winter.”', 'Close-up of dull skin in window light.', 'Dropper, two drops, pressing it in. “It sinks in fast and does not pill under sunscreen.”', '“Two weeks in, [what you honestly noticed].” Same light, same angle.', '“It is linked here if your skin gets like this too.”'],
    pitchIdea: 'a 20-second morning routine where the serum goes on before SPF, with a texture close-up',
    tips: ['Film texture in daylight at the window: brands reuse close-ups in ads.', 'Show it layered with sunscreen or makeup; that is the question buyers have.', 'Skip medical words like “cures” or “treats”: brands cannot run them.'],
  },
  makeup: {
    label: 'Makeup', product: 'cream blush stick', audience: 'people who want a quick, natural makeup look',
    benefit: 'blends in seconds with my fingers',
    hooks: [
      'One product, three looks, under a minute.',
      'This is the blush I grab when I am already late.',
      'Watch it blend before you judge the colour in the tube.',
      'Rating this blush on no-makeup skin first.',
      'If you hate brushes, this is your sign.',
      'The swatch lies. Watch it on my face.',
    ],
    script: ['“I never have time for a full face on weekdays.”', 'Bare cheeks, quick shot of a messy makeup bag.', 'Swipe, tap with fingers, blend. “No brush, and it does not move my foundation.”', '“It is still there at [time], which surprised me.” Same light.', '“Shade is linked here.”'],
    pitchIdea: 'a 15-second “three looks with one product” video that opens on the blended result',
    tips: ['Open on the finished look, then rewind: makeup viewers want the result first.', 'Swatch on skin, not paper, and keep the colour true (no beauty filter).', 'Show wear time honestly with a quick check-in shot later in the day.'],
  },
  fitness: {
    label: 'Fitness', product: 'resistance band set', audience: 'people who work out at home',
    benefit: 'lets me do a full lower-body workout in my living room',
    hooks: [
      'My entire home gym fits in this pouch.',
      'Stop paying for a gym you do not go to. Try this first.',
      'Three moves, one band, no excuses.',
      'I tested this against my gym machines for a week.',
      'POV: you finally work out on rainy days.',
      'If you have 10 minutes and a doorframe, you can do this.',
    ],
    script: ['“I kept skipping the gym because of the drive.”', 'Car keys, gym bag left by the door.', 'Band around the legs, three moves in quick cuts. “Different resistance for each move.”', '“A week in, [what changed in your routine].”', '“The set I use is linked here.”'],
    pitchIdea: 'a 20-second “full workout in my living room” video with three quick moves',
    tips: ['Film moves side-on so form is visible on a phone screen.', 'Show the product packed small: portability is the selling point.', 'Avoid weight-loss or body-change claims; brands cannot use them.'],
  },
  food: {
    label: 'Food & drink', product: 'sparkling protein drink', audience: 'people looking for an easy afternoon snack',
    benefit: 'replaces my 3pm vending machine run',
    hooks: [
      'The 3pm slump snack that is actually in my bag now.',
      'First sip reaction, no edits.',
      'I ranked every flavour so you do not have to.',
      'This tastes nothing like I expected. Watch.',
      'What I grab instead of another coffee.',
      'Packing my lunch bag, and this goes in first.',
    ],
    script: ['“By 3pm I am raiding the vending machine.”', 'Office desk, empty snack wrappers.', 'Can opening, pour over ice, first sip. “Lightly fizzy, not sweet.”', '“My honest favourite flavour is [flavour].”', '“They do a variety pack, linked here.”'],
    pitchIdea: 'a 15-second first-sip reaction filmed at your desk, ending with a flavour ranking',
    tips: ['The first bite or sip is the hook: film the reaction in one take.', 'Use natural light and a clean surface; avoid other brands in shot.', 'Stick to taste and routine; do not make health claims the brand has not approved.'],
  },
  home: {
    label: 'Home & cleaning', product: 'stain remover spray', audience: 'people with kids or pets',
    benefit: 'lifts everyday stains without scrubbing',
    hooks: [
      'This stain has been on my couch for a month. Watch.',
      'Things in my cleaning cupboard that earn their spot.',
      'Before you throw that shirt away, try this.',
      'Satisfying, and it took 30 seconds.',
      'My kids versus this spray. Round one.',
      'I stopped buying three different cleaners for this one.',
    ],
    script: ['“Coffee, juice, a toddler. My couch has seen things.”', 'Close-up of the stain.', 'Spray, wait, wipe once. “No scrubbing, I just let it sit.”', 'Same angle after: “[What it looked like after].”', '“It is linked here if your house looks like mine.”'],
    pitchIdea: 'a before-and-after on a real stain, filmed from the same angle, in under 20 seconds',
    tips: ['Lock the camera position so before and after match exactly.', 'Real stains beat staged ones; viewers can tell.', 'Read the label instructions on camera if timing matters.'],
  },
  pets: {
    label: 'Pets', product: 'slow feeder dog bowl', audience: 'dog owners whose dog eats too fast',
    benefit: 'slows my dog down at mealtime',
    hooks: [
      'My dog used to finish dinner in nine seconds.',
      'Dog owners, watch this before your next pet store run.',
      'His face when he realised dinner is now a puzzle.',
      'Rating my dog’s new bowl, from his point of view.',
      'The pet product I wish I bought on day one.',
      'Mealtime used to look like this. Now it looks like this.',
    ],
    script: ['“My dog inhales his food.”', 'Old bowl, empty in seconds.', 'New bowl down, dog working around the ridges. “Same food, much slower.”', '“After [X days], [what you noticed at mealtimes].”', '“The size we use is linked here.”'],
    pitchIdea: 'a 20-second mealtime before-and-after starring your pet, filmed at their eye level',
    tips: ['Film at the pet’s eye level; it makes the reaction readable.', 'Let the animal be the star and keep your voice-over short.', 'Do not make vet or health claims unless the brand gives approved wording.'],
  },
  fashion: {
    label: 'Fashion', product: 'wide-leg trousers', audience: 'people who want comfortable workwear',
    benefit: 'look tailored but feel like pyjamas',
    hooks: [
      'Office-ready, but I could nap in them.',
      'Three ways to style one pair, from desk to dinner.',
      'Try-on for anyone between sizes.',
      'The trousers I keep repeating, and nobody has noticed.',
      'Stop scrolling if you hate how jeans feel at your desk.',
      'Watch them move, because photos never show this.',
    ],
    script: ['“I am done with stiff work trousers.”', 'Struggling with a tight waistband.', 'Try-on, sit-down test, walk past camera. “Stretchy waist, structured leg.”', '“I am [height] wearing [size].” Mirror shot.', '“Linked here, they come in [colours].”'],
    pitchIdea: 'a three-outfit styling video for one piece, with a sit-down comfort test',
    tips: ['Always say your height and size; it is the first thing buyers ask.', 'Film movement (walking, sitting), not just a static mirror shot.', 'Show fabric close-up in daylight for texture.'],
  },
  tech: {
    label: 'Tech & gadgets', product: 'magnetic phone stand', audience: 'people who film or video call on their phone',
    benefit: 'holds my phone at any angle on my desk',
    hooks: [
      'Desk setup upgrade under the price of lunch.',
      'I film all my content with this, and here is why.',
      'It holds at this angle. Watch.',
      'Things on my desk that just make sense.',
      'Video calls without the double chin.',
      'Unboxing to set up in 20 seconds.',
    ],
    script: ['“My phone kept sliding off my laptop.”', 'Phone propped badly against a mug.', 'Snap on, rotate, fold flat. “Magnet holds it, any angle.”', '“I have used it for [time] for [what].”', '“It is linked here.”'],
    pitchIdea: 'a 20-second desk setup video showing the stand at three angles, ending with it folded flat',
    tips: ['Keep the product large in frame; small gadgets disappear on phone screens.', 'Show setup speed in real time; it builds trust.', 'Compare against the old way, not against a named competitor.'],
  },
};

export const PLATFORMS = {
  tiktok: {
    label: 'TikTok', value: 'tiktok',
    intro: 'TikTok UGC lives or dies on the first second: speak straight to camera, start mid-action and keep cuts fast.',
    hooks: ['Wait for the end, it surprised me too.', 'Things TikTok made me buy that I actually use.', 'Replying to the comment asking if this works.', 'I tested the viral one so you do not have to.', 'Do not buy this until you see the texture.', 'POV: you finally found the one that works.'],
    tips: ['Leave the bottom fifth of the frame clear of text and product; captions and buttons sit there.', 'Trending audio is usually not licensed for ads. Use the trend’s format, not its sound.', 'Brands may ask for a Spark Ads code to run your post as an ad: price that separately.'],
  },
  'instagram-reels': {
    label: 'Instagram Reels', value: 'instagram-reels',
    intro: 'Reels reward a slightly more polished, aesthetic look than TikTok, with a strong first frame that works as a cover.',
    hooks: ['Save this for your next shopping trip.', 'The routine that gets the most questions in my DMs.', 'Three ways I use this every week.', 'Before and after, same light, no filter.', 'Swipe-worthy? You decide.', 'What I would buy again tomorrow.'],
    tips: ['Pick a clean first frame: it becomes the Reel cover on your grid.', 'Keep text in the centre safe zone; the profile and caption cover the edges.', 'Brands may ask for partnership ads from your handle: that is paid usage, priced on top.'],
  },
  'youtube-shorts': {
    label: 'YouTube Shorts', value: 'youtube-shorts',
    intro: 'Shorts viewers expect a clear payoff: a quick test, a result or an answer, delivered under a minute.',
    hooks: ['I tested this for seven days. Here is the result.', 'Does it actually work? Let us find out.', 'The one question everyone asks about this.', 'Here is what nobody tells you before buying.', 'Honest review, 30 seconds.', 'Watch until the end for the verdict.'],
    tips: ['State the question in the first line and answer it by the end.', 'Shorts can run up to a minute, but most ad cuts are 15 to 30 seconds: film both.', 'Add a clear verbal call to action; on-screen links are limited.'],
  },
  amazon: {
    label: 'Amazon product videos', value: 'amazon',
    intro: 'Amazon listing videos are watched by people already on the product page: show the product clearly, answer buying questions and skip trends.',
    hooks: ['Here is what you get in the box.', 'Sizing and fit, answered in 20 seconds.', 'How it works, start to finish.', 'Three things I checked before buying this.', 'What it looks like in a real home.', 'The one feature that sold me.'],
    tips: ['Show what is in the box, scale against your hand, and the product in use.', 'No calls to action like “link in bio” and no off-Amazon prices.', 'Keep claims to what the listing says; Amazon reviews videos before they go live.'],
  },
};

// rate = approximate USD conversion (Nov 2026), shown with a 'check today's rate' note.
export const REGIONS = {
  us: { label: 'United States', short: 'US', currency: 'USD', symbol: '$', rate: 1, note: 'Label posts on your own account as ads under the FTC’s endorsement guides. US brands usually pay in USD via PayPal, Stripe or bank transfer.' },
  canada: { label: 'Canada', short: 'Canada', currency: 'CAD', symbol: 'CA$', rate: 1.38, note: 'Quote Canadian brands in CAD and US brands in USD. Track revenue for GST/HST registration with the Canada Revenue Agency.' },
  uk: { label: 'United Kingdom', short: 'UK', currency: 'GBP', symbol: '£', rate: 0.78, note: 'Label ads clearly up front (#ad) under ASA and CMA guidance. Watch the VAT registration threshold set by HMRC.' },
  europe: { label: 'Europe (EU)', short: 'Europe', currency: 'EUR', symbol: '€', rate: 0.92, note: 'Ad disclosure rules and VAT thresholds vary by country. Usage rights often name specific countries; wider territories are worth more.' },
};

export const TOOLS = {
  'ugc-hook-generator': {
    kind: 'hooks', name: 'UGC Hook Generator', short: 'Hook generator',
    tagline: 'Get 10 scroll-stopping hooks for any product in seconds.',
    variantsBy: ['niche', 'platform'],
    what: 'A hook is the first one to three seconds of a UGC video: the line and shot that make someone stop scrolling. Brands test several hooks on the same video, so creators who bring three or more win more briefs.',
    howTo: ['Enter the product (for example “vitamin C serum”).', 'Add your niche and who it is for.', 'Generate, then film the best three on the same video body.'],
    guide: '/blog/how-to-make-ugc-videos-brands-pay-for-2026',
  },
  'ugc-script-generator': {
    kind: 'script', name: 'UGC Script Generator', short: 'Script generator',
    tagline: 'A ready-to-film 30-second UGC script with shots, in five beats.',
    variantsBy: ['niche'],
    what: 'Most UGC ads follow five beats: hook, problem, product and demo, proof, call to action. This generator writes each line and the shot to film with it, plus three alternative hooks.',
    howTo: ['Enter the product and what it does for you.', 'Pick the platform.', 'Generate, then replace the bracketed proof with what you actually noticed.'],
    guide: '/blog/how-to-make-ugc-videos-brands-pay-for-2026',
  },
  'ugc-pitch-email-generator': {
    kind: 'pitch', name: 'UGC Pitch Email Generator', short: 'Pitch email generator',
    tagline: 'A short cold pitch to a brand, with one concrete video idea.',
    variantsBy: ['niche'],
    what: 'Pitches that get replies are short, about the brand’s product, and end with one link to your portfolio. This generator writes that email around one specific video idea.',
    howTo: ['Enter the brand and the product you want to film.', 'Add your niche.', 'Generate, fill in the brackets, and send with your portfolio link.'],
    guide: '/ugc-starter-guide#pitch',
  },
  'ugc-rate-calculator': {
    kind: 'rates', name: 'UGC Rate Calculator', short: 'Rate calculator',
    tagline: 'Work out what to charge for a UGC video, with usage, hooks and raw footage.',
    variantsBy: ['region'],
    what: 'UGC rates start from a base price per video and add fees for how the brand uses it (paid ads, whitelisting), extra hooks, raw footage and rush delivery. The calculator uses the starting floors from the Newcollab portfolio builder and common add-on ranges.',
    howTo: ['Enter your followers and pick the deliverable.', 'Choose usage, hooks, raw footage and turnaround.', 'Copy the package price into your reply or portfolio.'],
    guide: '/blog/ugc-rates-how-much-to-charge-2026',
  },
};

export function variantsFor(toolSlug) {
  const t = TOOLS[toolSlug];
  if (!t) return [];
  const out = [];
  if (t.variantsBy.includes('niche')) Object.keys(NICHES).forEach((k) => out.push({ slug: k, type: 'niche', label: NICHES[k].label }));
  if (t.variantsBy.includes('platform')) Object.keys(PLATFORMS).forEach((k) => out.push({ slug: k, type: 'platform', label: PLATFORMS[k].label }));
  if (t.variantsBy.includes('region')) Object.keys(REGIONS).forEach((k) => out.push({ slug: k, type: 'region', label: REGIONS[k].label }));
  return out;
}

export function resolveVariant(toolSlug, variant) {
  const v = variantsFor(toolSlug).find((x) => x.slug === variant);
  if (!v) return null;
  const data = v.type === 'niche' ? NICHES[variant] : v.type === 'platform' ? PLATFORMS[variant] : REGIONS[variant];
  return { ...v, data };
}

export function pageTitle(tool, v) {
  if (!v) return `Free ${tool.name} (2026) | Newcollab`;
  if (v.type === 'region') return `UGC Rate Calculator for ${v.data.short} Creators (${v.data.currency}) | Newcollab`;
  if (v.type === 'platform') return `Free ${tool.name.replace('UGC ', `${v.label} UGC `)} | Newcollab`;
  return `Free ${v.label} ${tool.name} (2026) | Newcollab`;
}
