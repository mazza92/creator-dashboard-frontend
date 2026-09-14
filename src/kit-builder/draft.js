export const KIT_DRAFT_KEY = 'newcollab_kit_draft_v1';

export function readKitDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(KIT_DRAFT_KEY) || 'null') || null;
  } catch {
    return null;
  }
}

export function writeKitDraft(next) {
  try {
    sessionStorage.setItem(KIT_DRAFT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function clearKitDraft() {
  try {
    sessionStorage.removeItem(KIT_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}
