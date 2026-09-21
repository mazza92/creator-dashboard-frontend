const NICHE_MARKS = [
  { test: /financ|fintech|bank|invest|crypto|money|trading|credit/, emoji: '💳', bg: '#E8F0FE' },
  { test: /travel|cruise|flight|hotel|trip|vacation|tourism/, emoji: '✈️', bg: '#E3F2FD' },
  { test: /dat(e|ing)|romance|relationship|flirt/, emoji: '💜', bg: '#F3E8FD' },
  { test: /beauty|skincare|makeup|hair|cosmetic/, emoji: '✨', bg: '#FCE4EC' },
  { test: /food|cook|recipe|restaurant|drink|coffee|snack/, emoji: '🍜', bg: '#FFF3E0' },
  { test: /fitness|gym|workout|sport|wellness|yoga/, emoji: '💪', bg: '#E8F5E9' },
  { test: /parent|family|kid|baby|mom|dad/, emoji: '🧸', bg: '#FFF8E1' },
  { test: /fashion|apparel|clothing|style|shoe/, emoji: '👗', bg: '#FCE8E6' },
  { test: /tech|software|app|saas|ai |gadget|startup/, emoji: '⚡', bg: '#EEF2FF' },
  { test: /home|clean|interior|decor|house/, emoji: '🏠', bg: '#E0F2F1' },
  { test: /game|gaming|esport/, emoji: '🎮', bg: '#EDE7F6' },
  { test: /music|audio|podcast/, emoji: '🎵', bg: '#F3E5F5' },
  { test: /edu|student|learn|school|academic/, emoji: '📚', bg: '#FFF8E1' },
  { test: /health|medical|doctor|care/, emoji: '🩺', bg: '#E0F7FA' },
  { test: /pet|dog|cat|animal/, emoji: '🐾', bg: '#EFEBE9' },
];

const FALLBACK = [
  { emoji: '🎬', bg: '#F3E8FD' },
  { emoji: '📱', bg: '#E8F0FE' },
  { emoji: '✨', bg: '#FCE4EC' },
  { emoji: '🎯', bg: '#FFF3E0' },
  { emoji: '🌟', bg: '#FEF7E0' },
  { emoji: '💼', bg: '#E8EEF7' },
  { emoji: '🎥', bg: '#EDE7F6' },
  { emoji: '📸', bg: '#E0F2F1' },
];

function hashKey(value) {
  const s = String(value || '');
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function brandMarkEmoji({ name, category, niche } = {}) {
  const hay = `${category || ''} ${niche || ''} ${name || ''}`.toLowerCase();
  const match = NICHE_MARKS.find((row) => row.test.test(hay));
  if (match) return { emoji: match.emoji, bg: match.bg };
  return FALLBACK[hashKey(name || hay || 'brand') % FALLBACK.length];
}
