import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Bell, MessageCircle, Eye, Send, Repeat2, Clapperboard, Activity, AlertTriangle } from 'lucide-react';
import api from '../../config/api';

// The creator's activity feed (Instagram / TikTok creator-tools pattern): replies, kit opens, pitches Polly sent,
// follow-ups, paid gigs, today's UGC Pulse, payment issues. Badge = new since the bell was last opened; opening it
// marks everything read. Also reports today's Pulse to the nav (onPulse) for the Pulse tab dot.

const POLL_MS = 3 * 60 * 1000;

const ICONS = {
  reply: { Icon: MessageCircle, bg: '#ECFDF3', fg: '#047857' },
  eye: { Icon: Eye, bg: '#F3EEFF', fg: '#6D28D9' },
  send: { Icon: Send, bg: '#F1EFE9', fg: '#12141a' },
  followup: { Icon: Repeat2, bg: '#F1EFE9', fg: '#12141a' },
  gig: { Icon: Clapperboard, bg: '#FFF4E5', fg: '#B45309' },
  pulse: { Icon: Activity, bg: '#F3EEFF', fg: '#6D28D9' },
  alert: { Icon: AlertTriangle, bg: '#FFF1F2', fg: '#E11D48' },
};

function ago(iso) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return '';
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  return d < 7 ? `${d}d` : `${Math.round(d / 7)}w`;
}

export default function ActivityBell({ enabled = true, onPulse, onOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/activity');
      if (!data?.success) return;
      setItems(data.items || []);
      setUnread(Number(data.unread) || 0);
      if (onPulse) onPulse(data.pulse || null);
    } catch (_) {
      /* the bell is never worth an error */
    } finally {
      setLoaded(true);
    }
  }, [onPulse]);

  useEffect(() => {
    if (!enabled) return undefined;
    load();
    const id = setInterval(() => { if (!document.hidden) load(); }, POLL_MS);
    return () => clearInterval(id);
  }, [enabled, load]);

  // Fresh data when they move around the app (a send or reply may have just happened).
  useEffect(() => {
    if (enabled && loaded) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      if (onOpen) onOpen();
      if (unread > 0) {
        setUnread(items.filter((i) => i.pinned).length);
        api.post('/api/activity/seen').catch(() => {});
      }
    } else {
      setItems((list) => list.map((i) => (i.pinned ? i : { ...i, unread: false })));
    }
  };

  const go = (item) => {
    setOpen(false);
    setItems((list) => list.map((i) => (i.pinned ? i : { ...i, unread: false })));
    if (item.href) navigate(item.href);
  };

  const fresh = items.filter((i) => i.unread);
  const earlier = items.filter((i) => !i.unread);
  const badge = unread > 9 ? '9+' : unread;

  return (
    <Wrap ref={ref}>
      <BellBtn type="button" onClick={toggle} aria-label={unread ? `Activity, ${unread} new` : 'Activity'} aria-expanded={open}>
        <Bell />
        {unread > 0 ? <Badge>{badge}</Badge> : null}
      </BellBtn>
      {open && (
        <Panel role="dialog" aria-label="Activity">
          <Head>
            <h3>Activity</h3>
            <span>{items.length ? 'Last 30 days' : ''}</span>
          </Head>
          <Scroll>
            {!items.length ? (
              <Empty>
                <div className="i"><Bell /></div>
                <b>You're all caught up</b>
                <span>Replies, kit opens and the pitches Polly sends for you show up here.</span>
              </Empty>
            ) : (
              <>
                {fresh.length ? <Group>New</Group> : null}
                {fresh.map((i) => <Item key={i.id} item={i} onClick={() => go(i)} />)}
                {earlier.length ? <Group>Earlier</Group> : null}
                {earlier.map((i) => <Item key={i.id} item={i} onClick={() => go(i)} />)}
              </>
            )}
          </Scroll>
        </Panel>
      )}
    </Wrap>
  );
}

function Item({ item, onClick }) {
  const { Icon, bg, fg } = ICONS[item.icon] || ICONS.send;
  return (
    <Row type="button" onClick={onClick} $unread={item.unread}>
      <span className="ic" style={{ background: bg, color: fg }}><Icon /></span>
      <span className="txt">
        <b>{item.text}</b>
        {item.sub ? <span className="sub">{item.sub}</span> : null}
      </span>
      <span className="meta">
        <span className="t">{item.pinned ? '' : ago(item.at)}</span>
        {item.unread ? <i aria-label="New" /> : null}
      </span>
    </Row>
  );
}

const Wrap = styled.div`
  position: relative;
`;

const BellBtn = styled.button`
  width: 36px; height: 36px; border-radius: 50%; background: #F4F4F4; border: none; cursor: pointer;
  display: grid; place-items: center; color: #4B4B4B; position: relative; transition: background .15s;
  &:hover { background: #EBEBEB; color: #0F0F0F; }
  svg { width: 17px; height: 17px; }
  @media (max-width: 1024px) { width: 32px; height: 32px; }
`;

const Badge = styled.span`
  position: absolute; top: -3px; right: -4px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 999px;
  background: #E11D48; color: #fff; font-size: 10.5px; font-weight: 800; line-height: 18px; text-align: center;
  border: 2px solid #fffdf8; box-sizing: content-box;
`;

const Panel = styled.div`
  position: absolute; top: calc(100% + 10px); right: -8px; width: 380px; max-width: calc(100vw - 24px);
  background: #fff; border-radius: 18px; box-shadow: 0 18px 50px rgba(18, 20, 26, 0.18), 0 2px 6px rgba(0,0,0,.06);
  border: 1px solid #ECE9E1; z-index: 1000; overflow: hidden; display: flex; flex-direction: column;
  max-height: min(560px, calc(100vh - 96px));

  @media (max-width: 1024px) {
    position: fixed; top: 60px; left: 8px; right: 8px; width: auto; max-width: none;
    max-height: calc(100dvh - 60px - var(--nc-tabbar, 0px) - 12px);
  }
`;

const Head = styled.div`
  display: flex; align-items: baseline; justify-content: space-between; padding: 16px 18px 10px;
  h3 { margin: 0; font-size: 17px; font-weight: 800; letter-spacing: -.01em; }
  span { font-size: 12px; color: #9CA3AF; font-weight: 600; }
`;

const Scroll = styled.div`
  overflow-y: auto; padding: 0 6px 8px; -webkit-overflow-scrolling: touch;
`;

const Group = styled.div`
  font-size: 11.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #9CA3AF;
  padding: 10px 12px 4px;
`;

const Row = styled.button`
  width: 100%; display: flex; align-items: flex-start; gap: 12px; padding: 10px 12px; border: 0; border-radius: 12px;
  background: ${(p) => (p.$unread ? '#FAF8F3' : 'transparent')}; text-align: left; cursor: pointer; font: inherit;
  & + & { margin-top: 2px; }
  &:hover { background: #F4F2EC; }
  .ic { flex: none; width: 36px; height: 36px; border-radius: 50%; display: grid; place-items: center; }
  .ic svg { width: 17px; height: 17px; }
  .txt { flex: 1; min-width: 0; display: grid; gap: 2px; }
  .txt b { font-size: 14px; font-weight: 700; color: #12141a; line-height: 1.35; }
  .sub { font-size: 12.5px; color: #6B7280; line-height: 1.4; overflow: hidden; text-overflow: ellipsis;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
  .meta { flex: none; display: grid; justify-items: end; gap: 6px; padding-top: 2px; }
  .t { font-size: 12px; color: #9CA3AF; font-weight: 600; }
  .meta i { width: 8px; height: 8px; border-radius: 50%; background: #E11D48; display: block; }
`;

const Empty = styled.div`
  display: grid; justify-items: center; gap: 6px; text-align: center; padding: 28px 20px 32px;
  .i { width: 48px; height: 48px; border-radius: 50%; background: #F4F2EC; display: grid; place-items: center; color: #6B7280; margin-bottom: 4px; }
  .i svg { width: 22px; height: 22px; }
  b { font-size: 15px; }
  span { font-size: 13.5px; color: #6B7280; line-height: 1.5; max-width: 280px; }
`;
