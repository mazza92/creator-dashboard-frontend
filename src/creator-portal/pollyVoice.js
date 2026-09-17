const PET = 'love|darling|hun|honey|babe|babes|superstar|sweetie|sweetheart|angel|gorgeous|queen';

const GREET = new RegExp(`\\b(hey|hi|alright|all right|ok|okay|right|morning)\\s*,?\\s*(?:${PET})\\b`, 'gi');
const ASIDE = new RegExp(`,\\s*(?:${PET})\\b`, 'gi');
const LEAD = new RegExp(`^(?:${PET})\\s*,\\s*`, 'i');
const TAIL = new RegExp(`\\s+(?:${PET})(?=[!?.,]|$)`, 'gi');

export function scrubPollyVoice(text) {
  if (!text) return text || '';
  let s = String(text);
  s = s.replace(GREET, '$1');
  s = s.replace(ASIDE, '');
  s = s.replace(LEAD, '');
  s = s.replace(TAIL, '');
  s = s.replace(/ {2,}/g, ' ');
  s = s.replace(/\s+([!?.,])/g, '$1');
  return s.trim();
}
