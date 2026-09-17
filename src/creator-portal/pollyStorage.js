const PREFIX = 'nc_polly_thread_v1';
const ORPHAN_KEY = PREFIX;

function scopedKey(creatorId) {
  if (creatorId == null || creatorId === '') return null;
  return `${PREFIX}:${creatorId}`;
}

export function readPollyLocal(creatorId) {
  const key = scopedKey(creatorId);
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.messages)) return null;
    if (parsed.creator_id != null && String(parsed.creator_id) !== String(creatorId)) {
      return null;
    }
    return parsed;
  } catch (_) {
    return null;
  }
}

export function writePollyLocal(creatorId, messages, suggested) {
  const key = scopedKey(creatorId);
  if (!key) return;
  try {
    sessionStorage.setItem(key, JSON.stringify({
      creator_id: creatorId,
      messages: messages || [],
      suggested: suggested || [],
    }));
  } catch (_) { /* ignore */ }
}

export function readOrphanPollyLocal() {
  try {
    const raw = sessionStorage.getItem(ORPHAN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.messages) || !parsed.messages.length) return null;
    return parsed;
  } catch (_) {
    return null;
  }
}

export function clearOrphanPollyLocal() {
  try {
    sessionStorage.removeItem(ORPHAN_KEY);
  } catch (_) { /* ignore */ }
}

export function clearPollyLocalThreads() {
  try {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(PREFIX)) keys.push(key);
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch (_) { /* ignore */ }
}

export function threadsLookCopied(a, b) {
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];
  if (!left.length || left.length !== right.length) return false;
  const first = (m) => `${m?.role || ''}:${(m?.content || '').slice(0, 120)}`;
  return first(left[0]) === first(right[0]) && first(left[left.length - 1]) === first(right[right.length - 1]);
}
