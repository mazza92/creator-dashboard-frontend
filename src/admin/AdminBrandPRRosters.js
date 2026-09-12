import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  AutoComplete, Button, Checkbox, Drawer, Input, InputNumber, Modal, Popconfirm,
  Space, Tag, message,
} from 'antd';
import {
  CopyOutlined, EyeOutlined, MailOutlined, PlusOutlined, ReloadOutlined,
  PushpinOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { tokens } from '../theme/tokens';

const ADMIN_TOKEN = 'pr-hunter-admin-2026';

const getApiBase = () => {
  const base = process.env.REACT_APP_API_BASE ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://api.newcollab.co');
  return base.replace(/\/+$/, '');
};
const API_BASE = getApiBase();
const headers = { 'X-Admin-Token': ADMIN_TOKEN };

const STATUS_COLOR = {
  active: 'green',
  locked: 'blue',
  shipped: 'purple',
  closed: 'default',
};

function rosterPortalUrl(camp) {
  if (!camp?.token) return camp?.portal_url || '';
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const origin = (host === 'newcollab.co' || host === 'www.newcollab.co')
    ? 'https://app.newcollab.co'
    : (typeof window !== 'undefined' ? window.location.origin : '');
  return origin ? `${origin}/r/${camp.token}` : (camp.portal_url || '');
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    message.success('Private link copied');
  } catch {
    message.info(text);
  }
}

export default function AdminBrandPRRosters() {
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [queue, setQueue] = useState([]);
  const [status, setStatus] = useState('all');
  const [view, setView] = useState('all');
  const [search, setSearch] = useState('');
  const [mintOpen, setMintOpen] = useState(false);
  const [mintBrand, setMintBrand] = useState(null);
  const [mintSlots, setMintSlots] = useState(5);
  const [mintTitle, setMintTitle] = useState('');
  const [mintSku, setMintSku] = useState('');
  const [brandOpts, setBrandOpts] = useState([]);
  const [minting, setMinting] = useState(false);
  const [drawer, setDrawer] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [checkedIds, setCheckedIds] = useState(() => new Set());
  const [spotlightBusy, setSpotlightBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (status && status !== 'all') qs.set('status', status);
      if (search.trim()) qs.set('q', search.trim());
      const [listRes, queueRes] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/brand-pr/campaigns?${qs.toString()}`, {
          headers, withCredentials: true,
        }),
        axios.get(`${API_BASE}/api/admin/brand-pr/queue`, {
          headers, withCredentials: true,
        }),
      ]);
      setCampaigns(listRes.data.campaigns || []);
      setQueue(queueRes.data.queue || []);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to load rosters');
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const all = campaigns;
    return {
      queue: queue.length,
      filling: all.filter((c) => c.in_focus).length,
      warming: all.filter((c) => c.status === 'active' && (c.fill_count || 0) > 0 && !c.in_focus && !c.fill_ready).length,
      ready: all.filter((c) => c.fill_ready).length,
      spotlighted: all.filter((c) => c.spotlighted && c.status === 'active').length,
      active: all.filter((c) => c.status === 'active').length,
      locked: all.filter((c) => c.status === 'locked').length,
      shipped: all.filter((c) => c.status === 'shipped').length,
    };
  }, [campaigns, queue]);

  const visibleCampaigns = useMemo(() => {
    const rows = [...campaigns];
    rows.sort((a, b) => {
      const rank = (c) => (c.spotlighted ? 0 : c.fill_ready ? 1 : c.in_focus ? 2 : (c.fill_count || 0) > 0 ? 3 : 4);
      const d = rank(a) - rank(b);
      if (d) return d;
      return (b.fill_count || 0) - (a.fill_count || 0);
    });
    if (view === 'foryou') return rows.filter((c) => c.in_focus || c.spotlighted);
    if (view === 'spotlight') return rows.filter((c) => c.spotlighted);
    if (view === 'ready') return rows.filter((c) => c.fill_ready);
    if (view === 'warming') return rows.filter((c) => c.status === 'active' && (c.fill_count || 0) > 0 && !c.in_focus && !c.fill_ready);
    return rows;
  }, [campaigns, view]);

  async function searchBrands(q) {
    if (!q || q.length < 2) {
      setBrandOpts([]);
      return;
    }
    try {
      const { data } = await axios.get(
        `${API_BASE}/api/admin/brand-pr/brands/search?q=${encodeURIComponent(q)}`,
        { headers, withCredentials: true }
      );
      setBrandOpts((data.brands || []).map((b) => ({
        value: String(b.id),
        label: b.brand_name,
        brand: b,
      })));
    } catch {
      setBrandOpts([]);
    }
  }

  async function mintCampaign({ brandId, brandName, slots, title, sku }) {
    setMinting(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/admin/brand-pr/campaigns`,
        {
          brand_id: brandId,
          slot_limit: slots || 5,
          title: title || `${brandName} · PR roster`,
          sku_note: sku || '',
        },
        { headers, withCredentials: true }
      );
      const camp = data.campaign || {};
      const url = rosterPortalUrl(camp);
      if (url) await copyText(url);
      else message.success('Roster created');
      setMintOpen(false);
      setMintBrand(null);
      setMintTitle('');
      setMintSku('');
      await load();
      if (camp.id) openDrawerById(camp.id);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to mint roster');
    } finally {
      setMinting(false);
    }
  }

  async function mintFromQueue(item) {
    await mintCampaign({
      brandId: item.brand_id,
      brandName: item.brand_name,
      slots: 5,
      title: `${item.brand_name} · PR roster`,
    });
  }

  async function openDrawerById(id) {
    setDrawer({ id });
    setDetailLoading(true);
    setDetail(null);
    try {
      const { data } = await axios.get(`${API_BASE}/api/admin/brand-pr/campaigns/${id}`, {
        headers, withCredentials: true,
      });
      setDetail(data);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to load roster');
    } finally {
      setDetailLoading(false);
    }
  }

  function openDrawer(row) {
    openDrawerById(row.id);
  }

  async function mutateCreator(path, applicationId) {
    const token = detail?.campaign?.token;
    if (!token) return;
    setBusyId(applicationId);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/brand-pr/r/${token}/${path}`,
        { application_id: applicationId },
        { headers, withCredentials: true }
      );
      setDetail(data);
      load();
    } catch (err) {
      message.error(err.response?.data?.error || 'Action failed');
    } finally {
      setBusyId(null);
    }
  }

  async function revoke(id) {
    try {
      await axios.post(`${API_BASE}/api/admin/brand-pr/campaigns/${id}/revoke`, {}, {
        headers, withCredentials: true,
      });
      message.success('Roster closed');
      setDrawer(null);
      load();
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to close roster');
    }
  }

  const activeVisible = visibleCampaigns.filter((row) => row.status === 'active');
  const allVisibleChecked = activeVisible.length > 0
    && activeVisible.every((row) => checkedIds.has(row.id));
  const checkedRows = campaigns.filter((row) => checkedIds.has(row.id));

  function toggleChecked(id, on) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAllVisible(on) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      activeVisible.forEach((row) => {
        if (on) next.add(row.id);
        else next.delete(row.id);
      });
      return next;
    });
  }

  async function pushSpotlight(on) {
    const ids = checkedRows.filter((row) => row.status === 'active').map((row) => row.id);
    if (!ids.length) {
      message.warning('Select at least one active roster');
      return;
    }
    setSpotlightBusy(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/admin/brand-pr/campaigns/spotlight`,
        { campaign_ids: ids, spotlight: on },
        { headers, withCredentials: true }
      );
      message.success(
        on
          ? `Pushed ${data.updated || ids.length} roster${(data.updated || ids.length) === 1 ? '' : 's'} to Live now`
          : `Removed ${data.updated || ids.length} from Live now`
      );
      setCheckedIds(new Set());
      await load();
    } catch (err) {
      message.error(err.response?.data?.error || 'Could not update For You');
    } finally {
      setSpotlightBusy(false);
    }
  }

  function composeFillEmail() {
    const rows = checkedRows.length
      ? checkedRows
      : campaigns.filter((row) => row.spotlighted && row.status === 'active');
    if (!rows.length) {
      message.warning('Select rosters, or push some to For You first');
      return;
    }
    const brands = rows.map((row) => ({
      brandId: row.brand_id,
      brandName: row.brand_name,
      slug: row.brand_slug,
      logo: row.logo_url,
      product: row.sku_note || row.hero_product || '',
      category: row.category || '',
      applyUrl: row.brand_slug
        ? `https://app.newcollab.co/creator/dashboard/for-you?brand=${encodeURIComponent(row.brand_slug)}`
        : 'https://app.newcollab.co/creator/dashboard/for-you',
    })).filter((b) => b.brandName);
    try {
      sessionStorage.setItem('nc_new_campaign_email_brands', JSON.stringify(brands));
    } catch {
      /* ignore quota */
    }
    window.location.href = '/admin/email?compose=new_campaigns';
  }

  const campaign = detail?.campaign;
  const creators = detail?.creators || [];
  const selectedIds = (campaign?.selected_application_ids || []).map(Number);
  const locked = campaign?.status === 'locked' || campaign?.status === 'shipped';

  return (
    <Wrap>
      <Top>
        <div>
          <h2>Brand PR rosters</h2>
          <p>Select the rosters you cold-emailed, push them onto Live now, then email creators to apply.</p>
        </div>
        <Space>
          <Button icon={<MailOutlined />} onClick={composeFillEmail}>
            Email pushed campaigns
          </Button>
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setMintOpen(true)}>
            New roster
          </Button>
        </Space>
      </Top>

      <Stats>
        <Stat type="button" $on={view === 'foryou'} onClick={() => setView(view === 'foryou' ? 'all' : 'foryou')}>
          <b>{stats.filling}</b>
          On For You
        </Stat>
        <Stat type="button" $on={view === 'spotlight'} onClick={() => setView(view === 'spotlight' ? 'all' : 'spotlight')}>
          <b>{stats.spotlighted}</b>
          Pushed to For You
        </Stat>
        <Stat type="button" $on={view === 'ready'} onClick={() => setView(view === 'ready' ? 'all' : 'ready')}>
          <b>{stats.ready}</b>
          Ready to send
        </Stat>
        <Stat type="button" $on={view === 'warming'} onClick={() => setView(view === 'warming' ? 'all' : 'warming')}>
          <b>{stats.warming}</b>
          Warming
        </Stat>
        <Stat type="button" as="div">
          <b>{stats.queue}</b>
          Need a roster
        </Stat>
        <Stat type="button" as="div">
          <b>{stats.active}</b>
          Active
        </Stat>
        <Stat type="button" as="div">
          <b>{stats.shipped}</b>
          Shipped
        </Stat>
      </Stats>

      {queue.length > 0 && (
        <Queue>
          <QueueHead>Waiting to mint — we create the link at 8 applicants, or mint now if you want to send earlier</QueueHead>
          {queue.map((item) => (
            <QueueRow key={item.brand_id}>
              <div>
                <strong>{item.brand_name}</strong>
                <span>{item.review_count} in review</span>
              </div>
              <Button
                size="small"
                type="primary"
                loading={minting}
                onClick={() => mintFromQueue(item)}
              >
                Mint & copy link
              </Button>
            </QueueRow>
          ))}
        </Queue>
      )}

      <Toolbar>
        <Input.Search
          allowClear
          placeholder="Search brand or title"
          style={{ maxWidth: 280 }}
          onSearch={(v) => setSearch(v)}
          onChange={(e) => {
            if (!e.target.value) setSearch('');
          }}
        />
        <Filters>
          {['all', 'active', 'locked', 'shipped', 'closed'].map((s) => (
            <Filter key={s} $on={status === s} onClick={() => setStatus(s)}>
              {s === 'all' ? 'All' : s}
            </Filter>
          ))}
        </Filters>
      </Toolbar>

      {checkedIds.size > 0 && (
        <ActionBar>
          <strong>{checkedIds.size} selected</strong>
          <Space wrap>
            <Button
              type="primary"
              icon={<PushpinOutlined />}
              loading={spotlightBusy}
              onClick={() => pushSpotlight(true)}
            >
              Push to Live now
            </Button>
            <Button loading={spotlightBusy} onClick={() => pushSpotlight(false)}>
              Remove from Live now
            </Button>
            <Button icon={<MailOutlined />} onClick={composeFillEmail}>
              Email: apply now
            </Button>
            <Button onClick={() => setCheckedIds(new Set())}>Clear</Button>
          </Space>
        </ActionBar>
      )}

      <Table>
        <thead>
          <tr>
            <th style={{ width: 42 }}>
              <Checkbox
                checked={allVisibleChecked}
                indeterminate={checkedIds.size > 0 && !allVisibleChecked}
                onChange={(e) => toggleAllVisible(e.target.checked)}
              />
            </th>
            <th>Brand</th>
            <th>Fill</th>
            <th>Picked</th>
            <th>Status</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {visibleCampaigns.map((row) => (
            <tr key={row.id} className={row.spotlighted ? 'spot' : row.in_focus ? 'hot' : row.fill_ready ? 'ready' : ''}>
              <td>
                <Checkbox
                  disabled={row.status !== 'active'}
                  checked={checkedIds.has(row.id)}
                  onChange={(e) => toggleChecked(row.id, e.target.checked)}
                />
              </td>
              <td>
                <BrandCell>
                  {row.logo_url ? <img src={row.logo_url} alt="" /> : <Fallback>{(row.brand_name || '?').slice(0, 2)}</Fallback>}
                  <div>
                    <b>{row.brand_name}</b>
                    <em>{row.title}</em>
                  </div>
                </BrandCell>
              </td>
              <td>
                <div>{row.fill_count ?? row.review_count}/{row.fill_target || '—'}</div>
                <em style={{ color: '#6b7280', fontSize: 12, fontStyle: 'normal' }}>
                  {row.status === 'active'
                    ? (row.spotlighted
                      ? 'Pushed to Live now — filling from cold email'
                      : row.fill_ready
                      ? 'Ready to send'
                      : row.in_focus
                        ? `${row.hunger} more · live on For You`
                        : (row.fill_count || 0) < 3
                          ? `Waiting for ${3 - (row.fill_count || 0)} more before For You`
                          : 'Queued — finishing fuller lists first')
                    : `${row.review_count} review`}
                </em>
              </td>
              <td>{row.selected_count}/{row.slot_limit}</td>
              <td>
                <Space size={4} wrap>
                  <Tag color={STATUS_COLOR[row.status] || 'default'}>{row.status}</Tag>
                  {row.spotlighted && <Tag color="magenta">Pushed</Tag>}
                  {row.in_focus && <Tag color="orange">On For You</Tag>}
                  {row.fill_ready && <Tag color="gold">Send now</Tag>}
                </Space>
              </td>
              <td>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td>
              <td>
                <Space wrap>
                  <Button size="small" icon={<CopyOutlined />} onClick={() => copyText(rosterPortalUrl(row))}>
                    Copy link
                  </Button>
                  <Button size="small" icon={<EyeOutlined />} onClick={() => openDrawer(row)}>
                    Creators
                  </Button>
                  <Button size="small" href={rosterPortalUrl(row)} target="_blank" rel="noreferrer">
                    Open
                  </Button>
                </Space>
              </td>
            </tr>
          ))}
          {!visibleCampaigns.length && !loading && (
            <tr>
              <td colSpan={7}>
                <Empty>
                  {view === 'spotlight'
                    ? 'No rosters pushed to For You yet. Select active lists and Push to Live now.'
                    : view === 'foryou'
                    ? 'No lists are on For You right now. Lists need 3 applicants to go live.'
                    : view === 'ready'
                      ? 'Nothing ready to send yet.'
                      : view === 'warming'
                        ? 'No warming lists (1–2 applicants).'
                        : 'No rosters yet. Mint from the queue or New roster.'}
                </Empty>
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <Modal
        title="New Brand PR roster"
        open={mintOpen}
        onCancel={() => setMintOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Field>
          <label>Brand</label>
          <AutoComplete
            style={{ width: '100%' }}
            options={brandOpts}
            onSearch={searchBrands}
            onSelect={(_, opt) => {
              setMintBrand(opt.brand);
              setMintTitle(`${opt.brand.brand_name} · PR roster`);
            }}
            placeholder="Type a brand name…"
          />
          {mintBrand ? <Hint>Selected: {mintBrand.brand_name}</Hint> : null}
        </Field>
        <Field>
          <label>Title</label>
          <Input value={mintTitle} onChange={(e) => setMintTitle(e.target.value)} />
        </Field>
        <Field>
          <label>Creators the brand must pick</label>
          <InputNumber min={1} max={50} value={mintSlots} onChange={(v) => setMintSlots(v || 5)} style={{ width: '100%' }} />
        </Field>
        <Field>
          <label>SKU note (optional)</label>
          <Input value={mintSku} onChange={(e) => setMintSku(e.target.value)} placeholder="One serum · leave in mailbox OK" />
        </Field>
        <Button
          type="primary"
          block
          loading={minting}
          disabled={!mintBrand}
          onClick={() => mintCampaign({
            brandId: mintBrand.id,
            brandName: mintBrand.brand_name,
            slots: mintSlots,
            title: mintTitle,
            sku: mintSku,
          })}
        >
          Mint & copy private link
        </Button>
      </Modal>

      <Drawer
        title={campaign?.brand?.name || 'Roster'}
        open={!!drawer}
        onClose={() => { setDrawer(null); setDetail(null); }}
        width={520}
      >
        {detailLoading && <p>Loading creators…</p>}
        {campaign && (
          <>
            <DrawerBar>
              <div>
                <Tag color={STATUS_COLOR[campaign.status]}>{campaign.status}</Tag>
                {selectedIds.length}/{campaign.slot_limit} on gift list
              </div>
              <Space>
                <Button size="small" icon={<CopyOutlined />} onClick={() => copyText(rosterPortalUrl(campaign))}>
                  Copy link
                </Button>
                <Button size="small" href={rosterPortalUrl(campaign)} target="_blank" rel="noreferrer">
                  Open as brand
                </Button>
              </Space>
            </DrawerBar>
            <Hint style={{ marginBottom: 12 }}>
              Approve puts them on the brand’s gift list. Skip hides them from the pick. Send the link when the list looks right.
            </Hint>
            {creators.map((c) => {
              const on = selectedIds.includes(c.application_id);
              return (
                <CreatorRow key={c.application_id} $skip={c.skipped} $on={on}>
                  <div>
                    <b>{c.name}</b>
                    <em>{[c.handle, c.city, c.followers_label && `${c.followers_label} foll.`, c.engagement_label].filter(Boolean).join(' · ')}</em>
                  </div>
                  <Space size={4}>
                    {c.skipped ? (
                      <Button size="small" disabled={locked || busyId === c.application_id} onClick={() => mutateCreator('unskip', c.application_id)}>
                        Unskip
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="small"
                          type={on ? 'primary' : 'default'}
                          disabled={locked || busyId === c.application_id}
                          onClick={() => mutateCreator(on ? 'deselect' : 'select', c.application_id)}
                        >
                          {on ? 'Approved' : 'Approve'}
                        </Button>
                        {!on && (
                          <Button size="small" disabled={locked || busyId === c.application_id} onClick={() => mutateCreator('skip', c.application_id)}>
                            Skip
                          </Button>
                        )}
                      </>
                    )}
                  </Space>
                </CreatorRow>
              );
            })}
            {!creators.length && <Empty>No applications for this brand yet.</Empty>}
            {campaign.status === 'active' && (
              <Popconfirm title="Close this roster link?" onConfirm={() => revoke(campaign.id)}>
                <Button danger size="small" style={{ marginTop: 16 }}>Close roster</Button>
              </Popconfirm>
            )}
          </>
        )}
      </Drawer>
    </Wrap>
  );
}

const Wrap = styled.div``;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
  h2 { margin: 0 0 4px; font-size: 20px; }
  p { margin: 0; color: ${tokens.textMuted}; font-size: 13px; max-width: 42rem; }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 16px;
  @media (max-width: 1100px) { grid-template-columns: 1fr 1fr 1fr; }
`;

const Stat = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: ${(p) => (p.$on ? '#fff7ed' : '#fff')};
  border: 1px solid ${(p) => (p.$on ? '#fdba74' : tokens.border)};
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 12px;
  color: ${tokens.textMuted};
  cursor: pointer;
  b { display: block; font-size: 22px; color: ${tokens.textPrimary}; }
`;

const Queue = styled.div`
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
`;

const QueueHead = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #92400e;
  margin-bottom: 8px;
`;

const QueueRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-top: 1px solid #fde68a;
  strong { display: block; }
  span { font-size: 12px; color: ${tokens.textMuted}; }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
`;

const Filters = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Filter = styled.button`
  border: 1px solid ${tokens.border};
  background: ${(p) => (p.$on ? '#111' : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : tokens.textPrimary)};
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-transform: capitalize;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid ${tokens.border};
  border-radius: 12px;
  overflow: hidden;
  th, td {
    text-align: left;
    padding: 12px 14px;
    border-bottom: 1px solid ${tokens.border};
    font-size: 13px;
    vertical-align: middle;
  }
  th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: ${tokens.textMuted};
    background: #fafafa;
  }
  tr:last-child td { border-bottom: 0; }
  tr.hot td { background: #fff7ed; }
  tr.ready td { background: #fffbeb; }
  tr.spot td { background: #fdf2f8; }
`;

const BrandCell = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  img, span {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
  }
  b { display: block; }
  em { display: block; font-style: normal; font-size: 12px; color: ${tokens.textMuted}; }
`;

const Fallback = styled.span`
  display: grid;
  place-items: center;
  background: #111;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
`;

const Empty = styled.div`
  text-align: center;
  color: ${tokens.textMuted};
  padding: 24px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: #111;
  color: #fff;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 12px;
  strong { font-size: 13px; }
`;

const Field = styled.div`
  margin-bottom: 12px;
  label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; }
`;

const Hint = styled.p`
  margin: 6px 0 0;
  font-size: 12px;
  color: ${tokens.textMuted};
  line-height: 1.4;
`;

const DrawerBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 12px;
`;

const CreatorRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid ${tokens.border};
  opacity: ${(p) => (p.$skip ? 0.5 : 1)};
  background: ${(p) => (p.$on ? '#ecfdf5' : 'transparent')};
  margin: 0 -12px;
  padding-left: 12px;
  padding-right: 12px;
  b { display: block; font-size: 13px; }
  em { display: block; font-style: normal; font-size: 12px; color: ${tokens.textMuted}; }
`;
