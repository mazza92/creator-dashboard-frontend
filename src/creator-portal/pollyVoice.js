const PET = 'love|darling|hun|honey|babe|babes|superstar|sweetie|sweetheart|angel|gorgeous|queen';

const GREET = new RegExp(`\\b(hey|hi|alright|all right|ok|okay|right|morning)\\s*,?\\s*(?:${PET})\\b`, 'gi');
const ASIDE = new RegExp(`,\\s*(?:${PET})\\b`, 'gi');
const LEAD = new RegExp(`^(?:${PET})\\s*,\\s*`, 'i');
const TAIL = new RegExp(`\\s+(?:${PET})(?=[!?.,]|$)`, 'gi');

// UTF-8 punctuation read as Latin-1: em dash shows up as "â" plus two boxes.
const MOJIBAKE = /(?:[\u00c2-\u00df][\u0080-\u00bf]|[\u00e0-\u00ef][\u0080-\u00bf]{2}|[\u00f0-\u00f4][\u0080-\u00bf]{3})/g;

export function repairMojibake(text) {
  const raw = String(text || '');
  if (!MOJIBAKE.test(raw)) return raw;
  MOJIBAKE.lastIndex = 0;
  return raw.replace(MOJIBAKE, (chunk) => {
    const bytes = Uint8Array.from(chunk, (ch) => ch.charCodeAt(0));
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch (_) {
      return chunk;
    }
  });
}

export function scrubPollyVoice(text) {
  if (!text) return text || '';
  let s = repairMojibake(text);
  s = s.replace(GREET, '$1');
  s = s.replace(ASIDE, '');
  s = s.replace(LEAD, '');
  s = s.replace(TAIL, '');
  s = s.replace(/ {2,}/g, ' ');
  s = s.replace(/\s+([!?.,])/g, '$1');
  return s.trim();
}
