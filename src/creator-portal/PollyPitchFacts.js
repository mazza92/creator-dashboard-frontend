import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

// Everything a pitch may say about the creator, confirmed by them once (GET/POST /api/polly/pitch-facts).
// Shown in Polly until confirmed, and in Account Settings to edit any time.

const NICHE_LABEL = (id) => String(id || '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function usePitchFacts() {
  const [facts, setFacts] = useState(null);
  const reload = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/polly/pitch-facts');
      if (data?.success) setFacts(data.facts);
    } catch (_) { /* card just stays hidden */ }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  return { facts, setFacts, reload };
}

export function PitchFactsCard({ facts, onSaved, onDismiss, compact = false }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  useEffect(() => {
    if (!facts) return;
    setForm({
      followers: facts.followers || '',
      show_engagement: facts.show_engagement !== false,
      niches: facts.niches || [],
      niche_label: facts.niche_label || '',
      offer_type: facts.offer_type || 'gifted_post',
      usage_rights_months: facts.usage_rights_months ?? 0,
      city: facts.city || '',
      country: facts.country || '',
    });
  }, [facts]);

  if (!facts || !form) return null;
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleNiche = (id) => set('niches', form.niches.includes(id)
    ? form.niches.filter((n) => n !== id) : [...form.niches, id].slice(0, 3));
  const ugc = form.offer_type === 'gifted_ugc' || form.offer_type === 'gifted_ugc_photos';

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const body = {
        ...form,
        followers: form.followers === '' ? undefined : Number(String(form.followers).replace(/[^\d]/g, '')),
        usage_rights_months: ugc ? Number(form.usage_rights_months) || 0 : 0,
        confirm: true,
      };
      const { data } = await apiClient.post('/api/polly/pitch-facts', body);
      if (!data?.success) throw new Error(data?.error || 'Could not save');
      setDone(data.facts.rewritten ? `Saved. I'm rewriting ${data.facts.rewritten} waiting pitch${data.facts.rewritten === 1 ? '' : 'es'} with these facts.` : 'Saved. Every pitch uses these facts.');
      if (onSaved) onSaved(data.facts);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card $compact={compact}>
      {!compact && (
        <Head>
          <b>Your pitch facts</b>
          <span>Every pitch uses only these. Check them once and I&apos;ll stick to them.</span>
        </Head>
      )}

      <Row>
        <label htmlFor="pf-followers">Followers</label>
        <div>
          <input id="pf-followers" inputMode="numeric" value={form.followers}
            onChange={(e) => set('followers', e.target.value)} placeholder="e.g. 4300" />
          <small>{facts.followers_source === 'you' ? 'The number you gave me' : 'From your last sync'}. A higher synced count replaces it.</small>
        </div>
      </Row>

      <Row>
        <label htmlFor="pf-eng">Engagement</label>
        <div>
          <Toggle>
            <input id="pf-eng" type="checkbox" checked={form.show_engagement}
              onChange={(e) => set('show_engagement', e.target.checked)} />
            <span>{form.show_engagement ? `Show it${facts.engagement_rate ? ` (${facts.engagement_rate}%)` : ''}` : 'Leave it out of pitches'}</span>
          </Toggle>
        </div>
      </Row>

      <Row>
        <label htmlFor="pf-label">Your content</label>
        <div>
          <input id="pf-label" value={form.niche_label} maxLength={60}
            onChange={(e) => set('niche_label', e.target.value)} placeholder="e.g. motherhood and lifestyle" />
          <small>Your words, used in the pitch.</small>
          {(facts.niche_options || []).length > 0 && (
            <Chips>
              {facts.niche_options.map((id) => (
                <button key={id} type="button" aria-pressed={form.niches.includes(id)} onClick={() => toggleNiche(id)}>
                  {NICHE_LABEL(id)}
                </button>
              ))}
            </Chips>
          )}
          <small>Up to 3. Polly matches brands on these.</small>
        </div>
      </Row>

      <Row>
        <label htmlFor="pf-offer">What you offer</label>
        <div>
          <select id="pf-offer" value={form.offer_type} onChange={(e) => set('offer_type', e.target.value)}>
            {(facts.offer_options || []).map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
          {ugc && (
            <select aria-label="Ad usage rights" value={form.usage_rights_months}
              onChange={(e) => set('usage_rights_months', e.target.value)} style={{ marginTop: 8 }}>
              <option value={0}>No ad usage rights</option>
              <option value={3}>3 months of ad usage</option>
              <option value={6}>6 months of ad usage</option>
              <option value={12}>12 months of ad usage</option>
            </select>
          )}
        </div>
      </Row>

      <Row>
        <label htmlFor="pf-city">Ship to</label>
        <div className="pair">
          <input id="pf-city" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" />
          <input aria-label="Country" value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Country" />
        </div>
      </Row>

      {error && <Err>{error}</Err>}
      {done && <Ok>{done}</Ok>}
      <Actions>
        <button type="button" className="primary" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : facts.confirmed_at ? 'Save' : 'These are right'}
        </button>
        {onDismiss && !facts.confirmed_at && (
          <button type="button" className="ghost" onClick={onDismiss}>Later</button>
        )}
      </Actions>
    </Card>
  );
}

const Card = styled.div`
  width: 100%;
  max-width: ${(p) => (p.$compact ? 'none' : '560px')};
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 16px;
  padding: ${(p) => (p.$compact ? '4px 0' : '16px 18px')};
  display: grid;
  gap: 12px;
  box-sizing: border-box;
  border-width: ${(p) => (p.$compact ? 0 : '1px')};

  input, select {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid ${t.line};
    border-radius: 10px;
    padding: 9px 11px;
    font: inherit;
    font-size: 14px;
    background: ${t.white};
    color: ${t.ink};
  }

  small { display: block; color: ${t.muted}; font-size: 12px; margin-top: 4px; }
`;

const Head = styled.div`
  b { display: block; font-size: 15px; color: ${t.ink}; }
  span { font-size: 13px; color: ${t.muted}; }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 110px minmax(0, 1fr);
  gap: 10px;
  align-items: start;

  > label { font-size: 13px; font-weight: 600; color: ${t.inkSoft}; padding-top: 9px; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    gap: 4px;
    > label { padding-top: 0; }
  }
`;

const Toggle = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  font-size: 14px;
  color: ${t.ink};
  cursor: pointer;

  input { width: auto; }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;

  button {
    border: 1px solid ${t.line};
    background: ${t.white};
    border-radius: 999px;
    padding: 5px 10px;
    font: inherit;
    font-size: 12px;
    color: ${t.inkSoft};
    cursor: pointer;
  }

  button[aria-pressed='true'] { background: ${t.accentSoft}; border-color: ${t.accent}; color: ${t.accentDeep}; }
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;

  button { border-radius: 10px; padding: 9px 14px; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; }
  .primary { background: ${t.action}; color: ${t.white}; border: 0; }
  .primary:disabled { opacity: 0.6; }
  .ghost { background: none; border: 0; color: ${t.muted}; }
`;

const Err = styled.div` color: #b42318; font-size: 13px; `;
const Ok = styled.div` color: ${t.accentDeep}; font-size: 13px; `;
