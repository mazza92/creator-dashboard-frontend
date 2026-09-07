import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  Avatar,
  Button,
  Empty,
  Input,
  Modal,
  Radio,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  LinkOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import api, { getProxiedMediaUrl } from '../config/api';
import { categoryLabel, normalizeCategory } from '../constants/brandCategories';

const { Text } = Typography;

export const REJECT_REASONS = [
  { id: 'incomplete', label: 'Incomplete profile', detail: 'Missing bio, niche, or a real social handle we can verify.' },
  { id: 'inactive', label: 'Inactive or likely fake', detail: 'No recent posts, empty grid, or the account does not look real.' },
  { id: 'audience', label: 'Audience is not a fit', detail: 'Wrong region, age, or category for brand PR on Newcollab.' },
  { id: 'brand', label: 'Looks like a brand, not a creator', detail: 'This reads as a shop or company account rather than a creator.' },
  { id: 'quality', label: 'Does not meet quality bar', detail: 'Content quality is too low for brands to send product to.' },
  { id: 'other', label: 'Other', detail: 'Write a short reason the creator will see.' },
];

const FLAG_COPY = {
  incomplete_profile: { tone: 'warn', label: 'Incomplete' },
  missing_bio: { tone: 'muted', label: 'No bio' },
  missing_niche: { tone: 'warn', label: 'No niche' },
  missing_handle: { tone: 'warn', label: 'No handle' },
  missing_platform: { tone: 'muted', label: 'No platform' },
  low_followers: { tone: 'muted', label: 'Under 500 followers' },
  pro_pending: { tone: 'pro', label: 'Pro — should skip waitlist' },
};

function formatNumber(val) {
  if (val == null || val === '') return '—';
  const n = Number(val);
  if (Number.isNaN(n)) return '—';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return n.toLocaleString();
}

function formatWait(iso) {
  if (!iso) return 'Just joined';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Just joined';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m waiting`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h waiting`;
  const days = Math.round(hours / 24);
  return `${days}d waiting`;
}

function socialUrl(platform, handle) {
  if (!handle) return null;
  const h = String(handle).replace(/^@/, '');
  const p = (platform || '').toLowerCase();
  if (p === 'tiktok') return `https://www.tiktok.com/@${h}`;
  if (p === 'instagram') return `https://instagram.com/${h}`;
  if (p === 'youtube') return `https://youtube.com/@${h}`;
  return `https://tiktok.com/@${h}`;
}

function nichesOf(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (t.startsWith('[')) {
      try {
        const parsed = JSON.parse(t);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [t];
      } catch {
        return t ? [t] : [];
      }
    }
    return t.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [String(raw)];
}

export default function CreatorApprovalQueue({ getApiConfig, onSnapshot }) {
  const [loading, setLoading] = useState(false);
  const [creators, setCreators] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');
  const [readyOnly, setReadyOnly] = useState(true);
  const [narrow, setNarrow] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 900 : false
  );
  const [mobileDetail, setMobileDetail] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReasonId, setRejectReasonId] = useState('quality');
  const [rejectOther, setRejectOther] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const selected = useMemo(
    () => creators.find((c) => c.creator_id === selectedId) || creators[0] || null,
    [creators, selectedId]
  );

  const fetchQueue = useCallback(async ({ keepId } = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '80');
      if (readyOnly) params.set('ready_only', '1');
      if (qDebounced.trim()) params.set('q', qDebounced.trim());
      const { data } = await api.get(
        `/api/admin/creators/approval-queue?${params.toString()}`,
        getApiConfig()
      );
      const rows = data.creators || [];
      setCreators(rows);
      setTotal(data.total || 0);
      if (onSnapshot && data.approval) onSnapshot(data.approval);
      setSelectedId((prev) => {
        const preferred = keepId || prev;
        if (preferred && rows.some((r) => r.creator_id === preferred)) return preferred;
        return rows[0]?.creator_id || null;
      });
    } catch (e) {
      message.error(e.response?.data?.error || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  }, [getApiConfig, onSnapshot, qDebounced, readyOnly]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const move = useCallback((dir) => {
    if (!creators.length) return;
    const idx = Math.max(0, creators.findIndex((c) => c.creator_id === selected?.creator_id));
    const next = creators[idx + dir] || creators[idx];
    if (next) {
      setSelectedId(next.creator_id);
      const el = listRef.current?.querySelector(`[data-id="${next.creator_id}"]`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [creators, selected]);

  const undo = useCallback(async (creatorId) => {
    try {
      const { data } = await api.post(
        `/api/admin/creators/${creatorId}/undo-decision`,
        {},
        getApiConfig()
      );
      if (onSnapshot && data.approval) onSnapshot(data.approval);
      await fetchQueue({ keepId: creatorId });
      message.success('Back in the queue');
    } catch (e) {
      message.error(e.response?.data?.error || 'Could not undo');
    }
  }, [fetchQueue, getApiConfig, onSnapshot]);

  const approve = useCallback(async (creator) => {
    if (!creator || busy) return;
    setBusy(true);
    try {
      const { data } = await api.post(
        `/api/admin/creators/${creator.creator_id}/approve`,
        { send_email: true, as_pro: (creator.flags || []).includes('pro_pending') },
        getApiConfig()
      );
      if (onSnapshot && data.approval) onSnapshot(data.approval);
      const handle = creator.display_handle || creator.username || 'creator';
      message.success({
        content: (
          <span>
            Approved @{handle}{' '}
            <Button type="link" size="small" onClick={() => undo(creator.creator_id)}>Undo</Button>
          </span>
        ),
        duration: 8,
      });
      const idx = creators.findIndex((c) => c.creator_id === creator.creator_id);
      const next = creators[idx + 1] || creators[idx - 1] || null;
      await fetchQueue({ keepId: next?.creator_id });
    } catch (e) {
      message.error(e.response?.data?.error || 'Approve failed');
    } finally {
      setBusy(false);
    }
  }, [busy, creators, fetchQueue, getApiConfig, onSnapshot, undo]);

  const openReject = useCallback((creator) => {
    if (!creator) return;
    setRejectId(creator.creator_id);
    setRejectReasonId('quality');
    setRejectOther('');
    setRejectOpen(true);
  }, []);

  const confirmReject = useCallback(async () => {
    const creator = creators.find((c) => c.creator_id === rejectId);
    if (!creator) return;
    const canned = REJECT_REASONS.find((r) => r.id === rejectReasonId);
    const reason = rejectReasonId === 'other'
      ? rejectOther.trim()
      : (canned?.detail || canned?.label || '');
    if (reason.length < 8) {
      message.warning('Add a short reason the creator will see');
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post(
        `/api/admin/creators/${creator.creator_id}/reject`,
        { reason, send_email: true },
        getApiConfig()
      );
      setRejectOpen(false);
      if (onSnapshot && data.approval) onSnapshot(data.approval);
      const handle = creator.display_handle || creator.username || 'creator';
      message.success({
        content: (
          <span>
            Rejected @{handle}{' '}
            <Button type="link" size="small" onClick={() => undo(creator.creator_id)}>Undo</Button>
          </span>
        ),
        duration: 8,
      });
      const idx = creators.findIndex((c) => c.creator_id === creator.creator_id);
      const next = creators[idx + 1] || creators[idx - 1] || null;
      await fetchQueue({ keepId: next?.creator_id });
    } catch (e) {
      message.error(e.response?.data?.error || 'Reject failed');
    } finally {
      setBusy(false);
    }
  }, [creators, fetchQueue, getApiConfig, onSnapshot, rejectId, rejectOther, rejectReasonId, undo]);

  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable) return;
      if (rejectOpen) {
        if (e.key === 'Escape') setRejectOpen(false);
        return;
      }
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        approve(selected);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        openReject(selected);
      } else if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        move(1);
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        move(-1);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        move(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [approve, move, openReject, rejectOpen, selected]);

  const profileUrl = selected
    ? socialUrl(selected.display_platform, selected.display_handle)
    : null;

  const actionBar = selected ? (
    <ActionBar>
      {narrow && mobileDetail && (
        <Button onClick={() => setMobileDetail(false)}>← Queue</Button>
      )}
      <Hint>A approve · R reject · J/K next</Hint>
      <Space wrap>
        {profileUrl && (
          <a href={profileUrl} target="_blank" rel="noopener noreferrer">
            <Button icon={<LinkOutlined />}>Profile</Button>
          </a>
        )}
        <Button
          danger
          icon={<CloseOutlined />}
          disabled={busy}
          onClick={() => openReject(selected)}
        >
          Reject
        </Button>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          disabled={busy}
          loading={busy}
          onClick={() => approve(selected)}
        >
          {(selected.flags || []).includes('pro_pending') ? 'Approve Pro' : 'Approve'}
        </Button>
      </Space>
    </ActionBar>
  ) : null;

  const showList = !narrow || !mobileDetail;
  const showDetail = !narrow || mobileDetail;

  return (
    <Queue>
      {showList && (
      <QueueList>
        <ListHead>
          <div>
            <ListTitle>{total} waiting</ListTitle>
            <Text type="secondary">Oldest first</Text>
          </div>
          <Space size={4}>
            <Tooltip title={readyOnly ? 'Showing complete profiles only' : 'Including incomplete signups'}>
              <Button size="small" type={readyOnly ? 'default' : 'primary'} onClick={() => setReadyOnly((v) => !v)}>
                {readyOnly ? 'Ready' : 'All'}
              </Button>
            </Tooltip>
            <Button size="small" icon={<ReloadOutlined />} onClick={() => fetchQueue()} />
          </Space>
        </ListHead>
        <Input
          allowClear
          placeholder="Search handle or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ marginBottom: 10 }}
        />
        <ListBody ref={listRef}>
          {loading && !creators.length ? (
            <div style={{ padding: 32, textAlign: 'center' }}><Spin /></div>
          ) : !creators.length ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Queue is clear" />
          ) : (
            creators.map((c, i) => {
              const active = c.creator_id === selected?.creator_id;
              return (
                <QueueRow
                  key={c.creator_id}
                  data-id={c.creator_id}
                  $active={active}
                  onClick={() => {
                    setSelectedId(c.creator_id);
                    if (narrow) setMobileDetail(true);
                  }}
                >
                  <Avatar
                    size={32}
                    src={getProxiedMediaUrl(c.image_profile) || undefined}
                    icon={<UserOutlined />}
                  />
                  <RowMeta>
                    <RowTop>
                      <RowHandle>@{c.display_handle || c.username || 'unknown'}</RowHandle>
                      <RowWait>{formatWait(c.waitlist_joined_at || c.signup_date)}</RowWait>
                    </RowTop>
                    <RowSub>
                      {formatNumber(c.review_followers)} · {c.display_platform || '—'}
                    </RowSub>
                  </RowMeta>
                  <RowIndex>{i + 1}</RowIndex>
                </QueueRow>
              );
            })
          )}
        </ListBody>
      </QueueList>
      )}

      {showDetail && (
      <ReviewPane>
        {!selected ? (
          <EmptyWrap>
            <Empty description="No one left to review." />
          </EmptyWrap>
        ) : (
          <>
            {actionBar}
            <ReviewScroll>
              <Hero>
                <Avatar
                  size={56}
                  src={getProxiedMediaUrl(selected.image_profile) || undefined}
                  icon={<UserOutlined />}
                />
                <HeroText>
                  <HeroHandle>@{selected.display_handle || selected.username || 'unknown'}</HeroHandle>
                  {selected.first_name ? <div className="name">{selected.first_name}</div> : null}
                  <HeroLine>
                    <span>{selected.display_platform || 'unknown'}</span>
                    <span>{formatNumber(selected.review_followers)} followers</span>
                    {selected.total_likes ? <span>{formatNumber(selected.total_likes)} likes</span> : null}
                    <span>{selected.tier || 'free'}</span>
                  </HeroLine>
                </HeroText>
              </Hero>

              {(selected.flags || []).length > 0 && (
                <FlagRow>
                  {(selected.flags || []).map((f) => {
                    const copy = FLAG_COPY[f];
                    if (!copy) return null;
                    const color = copy.tone === 'warn' ? 'orange' : copy.tone === 'pro' ? 'purple' : 'default';
                    return <Tag key={f} color={color}>{copy.label}</Tag>;
                  })}
                </FlagRow>
              )}

              {selected.bio ? (
                <Bio>{selected.bio}</Bio>
              ) : (
                <Muted>No bio yet.</Muted>
              )}

              <MetaGrid>
                <Meta>
                  <MetaLabel>Email</MetaLabel>
                  <MetaValue>{selected.email || '—'}</MetaValue>
                </Meta>
                <Meta>
                  <MetaLabel>Waiting</MetaLabel>
                  <MetaValue>{formatWait(selected.waitlist_joined_at || selected.signup_date)}</MetaValue>
                </Meta>
                <Meta>
                  <MetaLabel>Age</MetaLabel>
                  <MetaValue>{selected.primary_age_range || '—'}</MetaValue>
                </Meta>
                <Meta>
                  <MetaLabel>Regions</MetaLabel>
                  <MetaValue>
                    {Array.isArray(selected.regions) && selected.regions.length
                      ? selected.regions.join(', ')
                      : '—'}
                  </MetaValue>
                </Meta>
                <Meta $full>
                  <MetaLabel>Niches</MetaLabel>
                  <NicheWrap>
                    {nichesOf(selected.niche).length
                      ? nichesOf(selected.niche).map((n) => (
                          <Tag key={n}>{categoryLabel(normalizeCategory(n) || n)}</Tag>
                        ))
                      : <Text type="secondary">—</Text>}
                  </NicheWrap>
                </Meta>
              </MetaGrid>

              {selected.recent_posts?.length ? (
                <>
                  <SectionLabel>Recent posts</SectionLabel>
                  <Thumbs>
                    {selected.recent_posts.slice(0, 6).map((p) => {
                      const src = getProxiedMediaUrl(p.thumbnail_url);
                      const thumb = (
                        <Thumb>
                          {src ? <img src={src} alt="" /> : <ThumbEmpty />}
                          {(p.likes != null || p.views != null) && (
                            <ThumbMeta>
                              {p.likes != null ? `${formatNumber(p.likes)} likes` : ''}
                              {p.likes != null && p.views != null ? ' · ' : ''}
                              {p.views != null ? `${formatNumber(p.views)} views` : ''}
                            </ThumbMeta>
                          )}
                        </Thumb>
                      );
                      const key = p.id || p.url || p.thumbnail_url;
                      return p.url ? (
                        <a key={key} href={p.url} target="_blank" rel="noopener noreferrer">{thumb}</a>
                      ) : (
                        <div key={key}>{thumb}</div>
                      );
                    })}
                  </Thumbs>
                </>
              ) : (
                <Muted style={{ marginTop: 12 }}>No recent posts on file — open the live profile.</Muted>
              )}
            </ReviewScroll>
          </>
        )}
      </ReviewPane>
      )}

      <Modal
        title="Reject this creator?"
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onOk={confirmReject}
        okText="Reject"
        okButtonProps={{ danger: true, loading: busy }}
        destroyOnClose
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          They stay on the waitlist page and see this reason. You can undo for a few seconds after.
        </Text>
        <Radio.Group
          value={rejectReasonId}
          onChange={(e) => setRejectReasonId(e.target.value)}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          {REJECT_REASONS.map((r) => (
            <Radio key={r.id} value={r.id}>{r.label}</Radio>
          ))}
        </Radio.Group>
        {rejectReasonId === 'other' && (
          <Input.TextArea
            autoFocus
            rows={3}
            value={rejectOther}
            onChange={(e) => setRejectOther(e.target.value)}
            placeholder="Short reason the creator will see"
            style={{ marginTop: 12 }}
            maxLength={280}
          />
        )}
      </Modal>
    </Queue>
  );
}

const Queue = styled.div`
  display: grid;
  grid-template-columns: minmax(240px, 280px) 1fr;
  height: calc(100dvh - 148px);
  min-height: 420px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    height: calc(100dvh - 132px);
  }
`;

const QueueList = styled.div`
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 12px;
  background: #fafafa;
`;

const ListHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const ListTitle = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
`;

const ListBody = styled.div`
  overflow: auto;
  flex: 1;
  margin: 0 -8px;
  padding: 0 8px;
`;

const QueueRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  border: 1px solid ${(p) => (p.$active ? '#c7d2fe' : 'transparent')};
  background: ${(p) => (p.$active ? '#eef2ff' : '#fff')};
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 8px;
  cursor: pointer;

  &:hover {
    border-color: #c7d2fe;
  }
`;

const RowMeta = styled.div`
  min-width: 0;
  flex: 1;
`;

const RowTop = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
`;

const RowHandle = styled.div`
  font-weight: 700;
  font-size: 13px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowWait = styled.div`
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
`;

const RowSub = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-transform: capitalize;
`;

const RowIndex = styled.div`
  font-size: 11px;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
`;

const ReviewPane = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const ReviewScroll = styled.div`
  padding: 16px 20px 24px;
  flex: 1;
  overflow: auto;
`;

const EmptyWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const Hero = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const HeroText = styled.div`
  min-width: 0;

  .name {
    font-size: 13px;
    color: #6b7280;
    margin-top: 2px;
  }
`;

const HeroHandle = styled.div`
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
`;

const HeroLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  font-size: 13px;
  color: #4b5563;
  text-transform: capitalize;
`;

const FlagRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
`;

const Bio = styled.p`
  margin: 12px 0 0;
  font-size: 15px;
  line-height: 1.5;
  color: #1f2937;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  margin-top: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Meta = styled.div`
  grid-column: ${(p) => (p.$full ? '1 / -1' : 'auto')};
`;

const MetaLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 2px;
`;

const MetaValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  word-break: break-word;
`;

const NicheWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #9ca3af;
  margin: 20px 0 10px;
`;

const Thumbs = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  max-width: 420px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    max-width: none;
  }
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  overflow: hidden;
  background: #f3f4f6;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ThumbEmpty = styled.div`
  width: 100%;
  height: 100%;
  background: #e5e7eb;
`;

const ThumbMeta = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 6px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(transparent, rgba(0,0,0,.65));
`;

const Muted = styled.div`
  font-size: 13px;
  color: #9ca3af;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 2;
`;

const Hint = styled.div`
  font-size: 12px;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;

  @media (max-width: 700px) {
    display: none;
  }
`;
