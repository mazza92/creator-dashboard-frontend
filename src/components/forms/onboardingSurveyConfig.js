export const SURVEY_SEGMENTS = [
  { value: 'just_starting', label: "Just starting — I've never worked with a brand", icon: '🌱' },
  { value: 'early_stage', label: "I've received 1-3 gifted PR boxes", icon: '📦' },
  { value: 'growing', label: "I've done 5+ gifted collabs, looking for paid work", icon: '💰' },
  { value: 'established', label: 'I do paid UGC regularly, want more brands', icon: '⭐' },
  { value: 'is_brand', label: "I'm not a creator, I'm a brand", icon: '🏢' },
];

export const SURVEY_INTENTS = [
  { value: 'gifted_pr', label: 'Free PR boxes and gifted product', icon: '🎁' },
  { value: 'paid_ugc', label: 'Paid UGC deals ($50-500 per video)', icon: '💵' },
  { value: 'retainer', label: 'Monthly retainers with brands', icon: '📅' },
  { value: 'simple_portfolio', label: 'Simple tool to build a nice portfolio', icon: '📁' },
  { value: 'discovery', label: 'Get discovered by bigger brands', icon: '🔎' },
  { value: 'sell_organic', label: 'Sell my existing organic posts as ads', icon: '✨' },
  { value: 'learn', label: 'Learn what brands actually want', icon: '📚' },
  { value: 'other', label: 'Other', icon: '✏️' },
];

export const SURVEY_PAINS = [
  { value: 'no_replies', label: 'Brands never reply to my pitches', icon: '🦗' },
  { value: 'writing_pitches', label: "I don't know what to say in a pitch", icon: '✍️' },
  { value: 'finding_brands', label: "I don't know which brands to reach out to", icon: '🎯' },
  { value: 'no_portfolio', label: "I don't have a portfolio yet", icon: '📸' },
  { value: 'pricing', label: "I don't know how to price my work", icon: '💲' },
  { value: 'content_ideas', label: 'I have no content ideas', icon: '💡' },
  { value: 'low_views', label: "My videos don't get many views", icon: '👀' },
  { value: 'other', label: 'Other', icon: '✏️' },
];

export const PAIN_LABEL_BY_VALUE = Object.fromEntries(
  SURVEY_PAINS.map((p) => [p.value, p.label]),
);

export const SURVEY_PROGRESS_HINT = {
  1: '1 of 3 · about 20 seconds left',
  2: '2 of 3 · almost done',
  3: 'Last one!',
};

export function topPainLabel(painValues = [], painOther = '') {
  const first = (painValues || []).find((v) => v !== 'other');
  if (first) return PAIN_LABEL_BY_VALUE[first];
  if (painOther?.trim()) return painOther.trim();
  return 'your biggest challenge';
}
