// Promote Newcollab admin: approve applicants, review flagged videos, pay out ready ones.
// API: /api/admin/promote (services/ugc_program on the backend).
import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Button, Input, message, Popconfirm, Space, Tag } from 'antd';
import axios from 'axios';
import { adminHeaders } from './adminAuth';

const API_BASE = (process.env.REACT_APP_API_BASE ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co')).replace(/\/+$/, '');
const cfg = () => ({ headers: adminHeaders(), withCredentials: true });
const money = (c) => `$${((Number(c) || 0) / 100).toFixed(2).replace(/\.00$/, '')}`;
const day = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '');
const STATUS_COLOR = { applied: 'gold', approved: 'green', rejected: 'red', paused: 'default',
  counting: 'blue', flagged: 'orange', ready: 'green', paid: 'purple' };

export default function AdminPromote() {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [refs, setRefs] = useState({});

  const load = useCallback(async () => {
    try {
      const { data: d } = await axios.get(`${API_BASE}/api/admin/promote`, cfg());
      setData(d);
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not load Promote Newcollab');
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (path, body, ok) => {
    setBusy(true);
    try {
      const { data: d } = await axios.post(`${API_BASE}/api/admin/promote/${path}`, body, cfg());
      if (!d.success) throw new Error(d.error);
      setData(d);
      if (ok) message.success(ok);
    } catch (err) {
      message.error(err.response?.data?.error || err.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <p>Loading…</p>;
  const s = data.summary || {};
  const applied = (data.members || []).filter((m) => m.status === 'applied');
  const others = (data.members || []).filter((m) => m.status !== 'applied');

  return (
    <Wrap>
      <Summary>
        <div><span>Budget used</span><b>{money(s.used_cents)} / {money(s.budget_cents)}</b></div>
        <div><span>Ready to pay</span><b>{money(s.owed_cents)}</b></div>
        <div><span>Paid</span><b>{money(s.paid_cents)}</b></div>
        <div><span>Submissions</span><b>{s.open ? 'Open' : 'Paused (budget)'}</b></div>
        <Button loading={busy} onClick={() => act('refresh', {}, 'Views refreshed')}>Refresh views now</Button>
      </Summary>

      <h2>Applications ({applied.length})</h2>
      {applied.length === 0 && <Muted>No one waiting.</Muted>}
      {applied.map((m) => (
        <Item key={m.id}>
          <div>
            <b>{m.first_name || m.username}</b> <Muted as="span">{m.email}</Muted>
            <div>
              {m.tiktok_handle && <a href={`https://www.tiktok.com/@${m.tiktok_handle}`} target="_blank" rel="noreferrer">TikTok @{m.tiktok_handle}</a>}
              {m.instagram_handle && <> · <a href={`https://www.instagram.com/${m.instagram_handle}`} target="_blank" rel="noreferrer">IG @{m.instagram_handle}</a></>}
            </div>
            {m.why && <Muted>"{m.why}"</Muted>}
            <Muted>Applied {day(m.applied_at)} · pays to {m.payout_method} {m.payout_handle}</Muted>
          </div>
          <Space wrap>
            <Button type="primary" disabled={busy} onClick={() => act(`members/${m.id}`, { action: 'approve' }, 'Approved and emailed')}>Approve</Button>
            <Button danger disabled={busy} onClick={() => act(`members/${m.id}`, { action: 'reject' }, 'Rejected')}>Reject</Button>
          </Space>
        </Item>
      ))}

      <h2>Videos</h2>
      {(data.videos || []).length === 0 && <Muted>No videos yet.</Muted>}
      {(data.videos || []).map((v) => (
        <Item key={v.id}>
          <div>
            <Tag color={STATUS_COLOR[v.status]}>{v.status}</Tag>
            <a href={v.url} target="_blank" rel="noreferrer">{v.platform} · @{v.author || v.username}</a>
            <div><b>{Number(v.views || 0).toLocaleString()}</b> views · {Number(v.likes || 0).toLocaleString()} likes · earns <b>{money(v.earned_cents)}</b>{v.capped_by ? ` (capped: ${v.capped_by})` : ''}</div>
            <Muted>Posted {day(v.posted_at)} · views {v.views_at ? day(v.views_at) : 'pending'} · pay to {v.payout_method} {v.payout_handle}{v.note ? ` · ${v.note}` : ''}</Muted>
          </div>
          <Space wrap>
            {v.status === 'flagged' && <Button disabled={busy} onClick={() => act(`videos/${v.id}`, { action: 'clear' }, 'Cleared')}>Looks fine</Button>}
            {v.status === 'ready' && (
              <>
                <Input size="small" placeholder="PayPal/Wise ref" style={{ width: 150 }} value={refs[v.id] || ''}
                  onChange={(e) => setRefs((r) => ({ ...r, [v.id]: e.target.value }))} />
                <Popconfirm title={`Mark ${money(v.earned_cents)} as paid?`} onConfirm={() => act(`videos/${v.id}`, { action: 'paid', payout_ref: refs[v.id] || '' }, 'Marked paid')}>
                  <Button type="primary" disabled={busy}>Mark paid</Button>
                </Popconfirm>
              </>
            )}
            {!['rejected', 'paid'].includes(v.status) && (
              <Popconfirm title="Reject this video? It stops earning." onConfirm={() => act(`videos/${v.id}`, { action: 'reject' }, 'Rejected')}>
                <Button danger disabled={busy}>Reject</Button>
              </Popconfirm>
            )}
          </Space>
        </Item>
      ))}

      <h2>Creators</h2>
      {others.map((m) => (
        <Item key={m.id}>
          <div>
            <Tag color={STATUS_COLOR[m.status]}>{m.status}</Tag>
            <b>{m.first_name || m.username}</b> <Muted as="span">{m.email}</Muted>
            <Muted>{m.videos} videos · earned {money(m.earned_cents)} · {m.signups} signups · code {m.ref_code || '-'}</Muted>
          </div>
          <Space wrap>
            {m.status === 'approved' && <Button disabled={busy} onClick={() => act(`members/${m.id}`, { action: 'pause' }, 'Paused')}>Pause</Button>}
            {m.status !== 'approved' && <Button disabled={busy} onClick={() => act(`members/${m.id}`, { action: 'approve', email: m.status !== 'paused' }, 'Approved')}>Approve</Button>}
          </Space>
        </Item>
      ))}

      {(data.bonuses || []).length > 0 && <h2>Pro bonuses</h2>}
      {(data.bonuses || []).map((b) => (
        <Item key={b.id}>
          <div>{money(b.earned_cents)} · referred user {b.referred_user_id} · {day(b.created_at)} · pay to {b.payout_method} {b.payout_handle}</div>
        </Item>
      ))}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: grid; gap: 10px;
  h2 { margin: 18px 0 4px; font-size: 18px; }
`;
const Summary = styled.div`
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
  > div { background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 10px 14px; }
  span { display: block; font-size: 12px; color: #888; }
  b { font-size: 18px; }
`;
const Item = styled.div`
  display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center;
  background: #fff; border: 1px solid #eee; border-radius: 10px; padding: 12px 14px;
  > div:first-child { min-width: 0; flex: 1; display: grid; gap: 4px; }
`;
const Muted = styled.div`color: #777; font-size: 13px;`;
