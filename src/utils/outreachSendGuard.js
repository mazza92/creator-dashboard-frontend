export function getDuplicateOutreachMessage(payload = {}) {
  if (payload.error) return payload.error;
  if (payload.can_followup) {
    return 'You already emailed this brand. Follow up from your pipeline after a week if they have not replied.';
  }
  return 'You already emailed this brand recently. Sending again can look like spam.';
}

const inFlight = new Set();

export async function beginBrandOutreach(api, { brandId, slug, isFollowup = false } = {}) {
  const key = String(brandId || slug || '');
  if (!key) {
    return { allowed: false, error: 'Missing brand' };
  }

  if (inFlight.has(key)) {
    return {
      allowed: false,
      code: 'duplicate_outreach',
      error: getDuplicateOutreachMessage({ can_followup: !isFollowup }),
      can_followup: !isFollowup,
    };
  }

  inFlight.add(key);
  try {
    const response = await api.post('/api/pr-crm/pipeline/begin-send', {
      brand_id: brandId,
      slug,
      is_followup: Boolean(isFollowup),
    });
    return { allowed: true, ...(response.data || {}) };
  } catch (err) {
    if (err.response?.status === 409) {
      return {
        allowed: false,
        ...(err.response.data || {}),
        error: getDuplicateOutreachMessage(err.response.data || {}),
      };
    }
    throw err;
  } finally {
    inFlight.delete(key);
  }
}
