import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Empty, Input, Segmented, Tag, message } from 'antd';
import { ReloadOutlined, SendOutlined, ThunderboltOutlined } from '@ant-design/icons';
import axios from 'axios';
import { adminHeaders } from './adminAuth';

const API_BASE = (process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co')).replace(/\/+$/, '');
const STATUS_COLOR = { ready: 'green', scanning: 'blue', no_evidence: 'orange', error: 'red', new: 'default' };
const STEPS = [{ label: 'Email 1', value: 0 }, { label: 'Day 3', value: 1 }, { label: 'Day 7', value: 2 }, { label: 'Day 14', value: 3 }];

const get = (path, params) => axios.get(`${API_BASE}${path}`, { params, headers: adminHeaders() }).then((r) => r.data);
const post = (path, body) => axios.post(`${API_BASE}${path}`, body, { headers: adminHeaders() }).then((r) => r.data);

/** Scan-led outreach QA: prepare prospects, check the competitor and every number, send tests to the team inbox. */
export default function AdminOutreachV3() {
  const [report, setReport] = useState(null);
  const [ids, setIds] = useState('');
  const [rows, setRows] = useState({});
  const [busy, setBusy] = useState('');

  const loadReport = useCallback(() => get('/api/admin/outreach-v3/report').then(setReport).catch(() => {}), []);
  useEffect(() => { loadReport(); }, [loadReport]);

  const prepare = async (brandIds, force = false) => {
    setBusy('prepare');
    try {
      const out = await post('/api/admin/outreach-v3/prepare', { brand_ids: brandIds, force });
      setRows((r) => {
        const next = { ...r };
        (out.results || []).forEach((s) => { next[s.brand_id] = { ...(next[s.brand_id] || {}), state: s }; });
        return next;
      });
      const waiting = (out.results || []).filter((s) => s.status === 'scanning').map((s) => s.brand_id);
      if (waiting.length) message.info(`${waiting.length} still scanning TikTok. Hit Prepare again in a minute.`);
    } catch (err) {
      message.error(err?.response?.data?.error || 'Prepare failed');
    } finally {
      setBusy('');
      loadReport();
    }
  };

  const loadQueue = async () => {
    setBusy('queue');
    try {
      const data = await get('/api/admin/brand-pipeline/queue/new', { limit: 10 });
      const list = (data.brands || []).map((b) => b.brand_id);
      setIds(list.join(', '));
      if (list.length) await prepare(list);
    } catch (err) {
      message.error(err?.response?.data?.error || 'Could not load the queue');
    } finally {
      setBusy('');
    }
  };

  const preview = async (id, step) => {
    try {
      const data = await get(`/api/admin/outreach-v3/preview/${id}`, { step });
      setRows((r) => ({ ...r, [id]: { ...(r[id] || {}), step, email: data.email, state: data.state || r[id]?.state } }));
    } catch (err) {
      setRows((r) => ({ ...r, [id]: { ...(r[id] || {}), step, email: err?.response?.data?.email || { ok: false, error: 'Preview failed' } } }));
    }
  };

  const sendTest = async (id, step) => {
    setBusy(`send-${id}`);
    try {
      const out = await post('/api/admin/outreach-v3/send', { brand_id: id, step, test: true });
      message.success(`Test sent to ${out.to}${out.would_send_to ? ` (would go to ${out.would_send_to})` : ''}`);
      prepare([id]);
    } catch (err) {
      message.error(err?.response?.data?.error || 'Send failed');
    } finally {
      setBusy('');
    }
  };

  const list = Object.values(rows).filter((r) => r.state);
  const f = report?.funnel || {};
  return (
    <Wrap>
      <Head>
        <div>
          <b>Scan-led outreach (v3)</b>
          <span>
            {report ? (
              <>
                {report.live ? <Tag color="red">LIVE</Tag> : <Tag color="green">TEST MODE: everything goes to {report.test_email}</Tag>}
                {report.require_test && <Tag>test required before each live send</Tag>}
              </>
            ) : 'Loading…'}
          </span>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadReport}>Refresh</Button>
      </Head>
      {report && (
        <Funnel>
          {[['Ready', report.prepare?.ready], ['No evidence', report.prepare?.no_evidence], ['Tests sent', report.tests_sent],
            ['Contacted', f.contacted], ['Replied', f.replied], ['Opened scan', f.scan_open], ['Signed up', f.signed_up],
            ['Campaign', f.campaign], ['Paid', f.paid]].map(([k, v]) => <div key={k}><b>{v || 0}</b>{k}</div>)}
        </Funnel>
      )}

      <Bar>
        <Input placeholder="pr_brands ids, e.g. 120, 455" value={ids} onChange={(e) => setIds(e.target.value)} style={{ maxWidth: 320 }} />
        <Button type="primary" icon={<ThunderboltOutlined />} loading={busy === 'prepare'}
          onClick={() => prepare(ids.split(/[\s,]+/).map(Number).filter(Boolean))}>Prepare</Button>
        <Button loading={busy === 'queue'} onClick={loadQueue}>Next 10 from queue</Button>
      </Bar>

      {list.length === 0 ? <Empty description="Prepare prospects to check their competitor and email" /> : list.map((r) => {
        const s = r.state;
        const pick = s.pick;
        return (
          <Row key={s.brand_id}>
            <div className="top">
              <div>
                <b>{s.brand_name || `Brand ${s.brand_id}`}</b> <small>#{s.brand_id} {s.website}</small>{' '}
                <Tag color={STATUS_COLOR[s.status]}>{s.status}</Tag>
                {s.test_sent_at && <Tag color="purple">test sent</Tag>}
              </div>
              <div className="act">
                <Button size="small" onClick={() => prepare([s.brand_id])}>Prepare</Button>
                <Button size="small" onClick={() => prepare([s.brand_id], true)}>Redo</Button>
              </div>
            </div>
            {s.product && <p className="muted">Sells: {s.product}</p>}
            {s.reason && <p className="warn">{s.reason}</p>}
            {pick && (
              <div className="pick">
                Competitor: <b>{pick.name}</b> · {pick.creators} creators · {pick.videos} videos · {pick.views_label} views ·
                {' '}{Math.round((pick.strong_share || 0) * 100)}% tagged · check {pick.verdict?.confidence}
                <div className="muted">{pick.why} {pick.verdict?.reason ? `(${pick.verdict.reason})` : ''}</div>
              </div>
            )}
            {(s.tried || []).length > 0 && (
              <details>
                <summary>Candidates checked ({s.tried.length})</summary>
                <ul>
                  {s.tried.map((t) => (
                    <li key={t.name}>
                      <Tag color={t.verdict?.ok ? 'green' : 'default'}>{t.verdict?.ok ? 'passed' : 'rejected'}</Tag>
                      <b>{t.name}</b>: {t.measured?.creators ?? 0} creators, {t.measured?.videos ?? 0} videos. {t.verdict?.reason}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {s.status === 'ready' && (
              <>
                <Segmented size="small" options={STEPS} value={r.step ?? null} onChange={(v) => preview(s.brand_id, v)} />
                {r.email && (r.email.ok ? (
                  <Mail>
                    <div className="subj">{r.email.subject || '(reply in the same thread)'}</div>
                    <pre>{r.email.text}</pre>
                    <div className="facts">
                      {(r.email.facts || []).map((x) => (
                        <div key={x.claim}>{x.claim}: <b>{String(x.value)}</b>{' '}
                          {String(x.source).startsWith('http') ? <a href={x.source} target="_blank" rel="noopener noreferrer">check</a> : <small>{x.source}</small>}
                        </div>
                      ))}
                    </div>
                    <Button type="primary" icon={<SendOutlined />} loading={busy === `send-${s.brand_id}`}
                      onClick={() => sendTest(s.brand_id, r.step || 0)}>Send test to {report?.test_email || 'team inbox'}</Button>
                  </Mail>
                ) : <p className="warn">{r.email.error}</p>)}
              </>
            )}
          </Row>
        );
      })}
    </Wrap>
  );
}

const Wrap = styled.div` display: grid; gap: 12px; `;
const Head = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  b { display: block; font-size: 16px; margin-bottom: 4px; }
`;
const Funnel = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px;
  div { background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; font-size: 12px; color: #6b6f78; }
  b { display: block; font-size: 20px; color: #111; }
`;
const Bar = styled.div` display: flex; gap: 8px; flex-wrap: wrap; `;
const Row = styled.div`
  background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px 16px; display: grid; gap: 8px;
  .top { display: flex; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .act { display: flex; gap: 6px; }
  .muted { color: #6b6f78; font-size: 13px; margin: 0; }
  .warn { color: #b45309; font-size: 13px; margin: 0; }
  .pick { font-size: 14px; }
  ul { margin: 6px 0 0; padding-left: 18px; font-size: 13px; }
`;
const Mail = styled.div`
  border: 1px solid #f0f1f3; border-radius: 10px; padding: 12px; background: #fafafa;
  .subj { font-weight: 600; margin-bottom: 8px; }
  pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; margin: 0 0 10px; }
  .facts { font-size: 12px; color: #3f424a; display: grid; gap: 2px; margin-bottom: 10px; }
`;
