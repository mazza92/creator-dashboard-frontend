const PREFIX = 'nc_polly_thread_v1';
const ORPHAN_KEY = PREFIX;

function scopedKey(creatorId) {
  if (creatorId == null || creatorId === '') return null;
  return `${PREFIX}:${creatorId}`;
}

function parseThread(raw, creatorId) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.messages)) return null;
    if (
      creatorId != null
      && parsed.creator_id != null
      && String(parsed.creator_id) !== String(creatorId)
    ) {
      return null;
    }
    return parsed;
  } catch (_) {
    return null;
  }
}

function storeGet(store, key) {
  try {
    return store.getItem(key);
  } catch (_) {
    return null;
  }
}

function storeSet(store, key, value) {
  try {
    store.setItem(key, value);
  } catch (_) { /* ignore */ }
}

function storeRemove(store, key) {
  try {
    store.removeItem(key);
  } catch (_) { /* ignore */ }
}

function storeKeys(store, prefix) {
  const keys = [];
  try {
    for (let i = 0; i < store.length; i += 1) {
      const key = store.key(i);
      if (key && key.startsWith(prefix)) keys.push(key);
    }
  } catch (_) { /* ignore */ }
  return keys;
}

export function readPollyLocal(creatorId) {
  const key = scopedKey(creatorId);
  if (!key) return null;
  const local = parseThread(storeGet(localStorage, key), creatorId);
  if (local) return local;
  const session = parseThread(storeGet(sessionStorage, key), creatorId);
  if (session) {
    storeSet(localStorage, key, JSON.stringify(session));
    return session;
  }
  return null;
}

export function writePollyLocal(creatorId, messages, suggested) {
  const key = scopedKey(creatorId);
  if (!key) return;
  const payload = JSON.stringify({
    creator_id: creatorId,
    messages: messages || [],
    suggested: suggested || [],
  });
  storeSet(localStorage, key, payload);
  storeSet(sessionStorage, key, payload);
}

export function readOrphanPollyLocal() {
  return (
    parseThread(storeGet(localStorage, ORPHAN_KEY))
    || parseThread(storeGet(sessionStorage, ORPHAN_KEY))
  );
}

export function clearOrphanPollyLocal() {
  storeRemove(localStorage, ORPHAN_KEY);
  storeRemove(sessionStorage, ORPHAN_KEY);
}

export function clearPollyLocalThreads() {
  storeKeys(localStorage, PREFIX).forEach((key) => storeRemove(localStorage, key));
  storeKeys(sessionStorage, PREFIX).forEach((key) => storeRemove(sessionStorage, key));
}

export function threadsLookCopied(a, b) {
  const left = Array.isArray(a) ? a : [];
  const right = Array.isArray(b) ? b : [];
  if (!left.length || left.length !== right.length) return false;
  const first = (m) => `${m?.role || ''}:${(m?.content || '').slice(0, 120)}`;
  return first(left[0]) === first(right[0]) && first(left[left.length - 1]) === first(right[right.length - 1]);
}
