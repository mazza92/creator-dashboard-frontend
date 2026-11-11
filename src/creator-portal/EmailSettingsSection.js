import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { message } from 'antd';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

// Account Settings > Emails: Polly's brief, daily / weekly (Monday only) / off.
// GET/POST /api/brief/preferences {daily_brief}. The brief email links here with ?section=emails.

const FALLBACK = [
  { id: 'daily', label: 'Daily', detail: 'Each weekday around 7am. Monday is your weekly report.' },
  { id: 'weekly', label: 'Weekly', detail: "Monday's weekly report only." },
  { id: 'off', label: 'Off', detail: 'No brief and no weekly report. Brand news still reaches you.' },
];

export default function EmailSettingsSection({ focus = false }) {
  const [prefs, setPrefs] = useState(null);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    let live = true;
    apiClient.get('/api/brief/preferences')
      .then(({ data }) => {
        if (!live) return;
        if (data?.daily_brief) setPrefs(data);
        else setFailed(true);
      })
      .catch(() => { if (live) setFailed(true); });
    return () => { live = false; };
  }, []);

  useEffect(() => {
    if (!focus || !prefs || !ref.current) return;
    ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focus, prefs]);

  if (failed || !prefs) return null;
  const options = Array.isArray(prefs.options) && prefs.options.length ? prefs.options : FALLBACK;

  const choose = async (id) => {
    if (id === prefs.daily_brief || saving) return;
    const prev = prefs;
    setPrefs({ ...prefs, daily_brief: id });
    setSaving(id);
    try {
      const { data } = await apiClient.post('/api/brief/preferences', { daily_brief: id });
      if (data?.success === false) throw new Error(data.error);
      if (data?.daily_brief) setPrefs(data);
      message.success(id === 'off' ? "Polly's brief is off" : id === 'weekly' ? 'Weekly report only, on Mondays' : 'Daily brief on');
    } catch (_) {
      setPrefs(prev);
      message.error("That didn't save. Try again.");
    } finally {
      setSaving(null);
    }
  };

  return (
    <Section id="emails" ref={ref} $focus={focus}>
      <h2>Emails</h2>
      <p className="sub">What Polly sends you. Billing and Gmail problems always reach you.</p>
      <Card>
        <fieldset>
          <legend>Polly&apos;s brief</legend>
          <div className="opts">
            {options.map((o) => (
              <Opt key={o.id} $on={prefs.daily_brief === o.id}>
                <input
                  type="radio"
                  name="daily_brief"
                  value={o.id}
                  checked={prefs.daily_brief === o.id}
                  disabled={Boolean(saving)}
                  onChange={() => choose(o.id)}
                />
                <span>
                  <b>{o.id === 'weekly' ? 'Weekly (Monday only)' : o.label}</b>
                  {o.detail ? <small>{o.detail}</small> : null}
                </span>
              </Opt>
            ))}
          </div>
          {prefs.timezone ? <p className="tz">Sent around 7am in {String(prefs.timezone).replace(/_/g, ' ')}.</p> : null}
        </fieldset>
      </Card>
    </Section>
  );
}

const Section = styled.section`
  margin-bottom: 32px;
  scroll-margin-top: 120px;

  h2 { font-size: 18px; font-weight: 700; color: #111827; margin: 0; }
  .sub { font-size: 14px; color: #6B7280; margin: 4px 0 16px; }

  ${(p) => (p.$focus ? `> div { box-shadow: 0 0 0 2px ${t.accentBorder}, 0 1px 3px rgba(0,0,0,.1); }` : '')}
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;

  @media (max-width: 480px) { padding: 16px; }

  fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
  legend { font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 10px; padding: 0; }
  .opts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .tz { margin: 12px 0 0; font-size: 12.5px; color: #6B7280; }

  @media (max-width: 560px) { .opts { grid-template-columns: minmax(0, 1fr); } }
`;

const Opt = styled.label`
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$on ? t.accent : '#E5E7EB')};
  box-shadow: ${(p) => (p.$on ? `inset 0 0 0 1px ${t.accent}` : 'none')};
  background: ${(p) => (p.$on ? t.accentSoft : '#fff')};
  cursor: pointer;
  min-width: 0;

  input { margin-top: 3px; accent-color: ${t.accent}; flex-shrink: 0; }
  span { display: grid; gap: 2px; min-width: 0; }
  b { font-size: 14px; color: #111827; }
  small { font-size: 12.5px; color: #6B7280; line-height: 1.4; }
`;
