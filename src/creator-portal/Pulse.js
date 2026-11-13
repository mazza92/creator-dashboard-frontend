import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';
import UpgradeModal from './UpgradeModal';
import { CANONICAL_CATEGORIES, categoryEmoji, categoryLabel } from '../constants/brandCategories';

// UGC Pulse: what's working in UGC ads this week for the creator's niche. Hooks are opening lines of real ads
// (Meta Ad Library), each with the brands running them; plus a trend, an editing tip and UGC news (Hermes).
// Today · This week (Pro) · Saved (the creator's swipe file).

const VIEWS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This week' },
  { id: 'saved', label: 'Saved' },
];

function initials(name) {
  return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function hue(name) {
  let h = 0;
  for (const c of String(name || '')) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 35% 42%)`;
}

function dayLabel(iso) {
  if (!iso) return '';
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function plain(text) {
  return String(text || '').replace(/^[“"]|[”"]$/g, '');
}

function Brands({ sources = [], max = 4 }) {
  const list = sources.filter((s) => s && s.brand_name);
  if (!list.length) return null;
  const shown = list.slice(0, max);
  const more = list.length - shown.length;
  return (
    <BrandRow>
      {shown.map((s) => {
        const Tag = s.ad_url ? 'a' : 'span';
        return (
          <Tag key={s.brand_id || s.brand_name} className={s.hot ? 'b hot' : 'b'}
            {...(s.ad_url ? { href: s.ad_url, target: '_blank', rel: 'noopener noreferrer', title: `See ${s.brand_name}'s ad` } : {})}>
            {s.logo
              ? <img src={s.logo} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              : <i style={{ background: hue(s.brand_name) }}>{initials(s.brand_name)}</i>}
            {s.hot ? '🔥 ' : ''}{s.brand_name}
          </Tag>
        );
      })}
      {more > 0 ? <span className="b more">+{more} more</span> : null}
    </BrandRow>
  );
}

export default function Pulse() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const view = VIEWS.some((v) => v.id === params.get('view')) ? params.get('view') : 'today';
  const niche = params.get('niche') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [upgrade, setUpgrade] = useState(false);
  const [offset, setOffset] = useState(0);
  const [weekItems, setWeekItems] = useState([]);

  const load = useCallback(async (nextOffset = 0) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/api/pulse', { params: { view, niche: niche || undefined, offset: nextOffset || undefined } });
      setData(res.data);
      // Seen today's pulse: clears the dot on the Pulse tab.
      if (res.data?.day) {
        try { localStorage.setItem('nc_pulse_seen', res.data.day); } catch (_) { /* private mode */ }
        window.dispatchEvent(new CustomEvent('nc-pulse-seen', { detail: res.data.day }));
      }
      if (view === 'week') {
        setWeekItems((prev) => (nextOffset ? [...prev, ...(res.data.items || [])] : (res.data.items || [])));
        setOffset(nextOffset);
      }
    } catch (e) {
      setError('Pulse could not load. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  }, [view, niche]);

  useEffect(() => { load(0); }, [load]);

  useEffect(() => {
    if (!toast) return undefined;
    const id = setTimeout(() => setToast(''), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };

  const isPro = Boolean(data?.is_pro);
  const current = data?.niche || niche;
  const niches = useMemo(() => {
    const mine = data?.my_niches || [];
    const avail = data?.available_niches || [];
    const list = [...mine, ...avail.filter((n) => !mine.includes(n))];
    if (current && !list.includes(current)) list.unshift(current);
    return list.slice(0, 8);
  }, [data, current]);

  const toggleSave = async (item) => {
    const saved = !item.saved;
    const patch = (it) => (it && it.id === item.id ? { ...it, saved } : it);
    setData((d) => d && ({
      ...d,
      hero: patch(d.hero),
      hooks: (d.hooks || []).map(patch),
      trend: patch(d.trend),
      tip: patch(d.tip),
      items: (d.items || []).map(patch).filter((it) => view !== 'saved' || it.saved),
    }));
    setWeekItems((list) => list.map(patch));
    try {
      await apiClient.post('/api/pulse/save', { item_id: item.id, saved });
      setToast(saved ? 'Saved to your swipe file' : 'Removed from Saved');
    } catch (_) {
      setToast('Could not save. Try again.');
    }
  };

  const copy = async (item) => {
    try {
      await navigator.clipboard.writeText(plain(item.text));
      setToast('Hook copied');
    } catch (_) {
      setToast('Copy failed');
    }
  };

  const pitchWith = (item) => {
    const brand = (item.sources || [])[0];
    if (!brand) return;
    if (!isPro) { setUpgrade(true); return; }
    const q = new URLSearchParams({
      chip: 'pitch_brand', brand_id: String(brand.brand_id), brand_name: brand.brand_name, angle: plain(item.text).slice(0, 160),
    });
    navigate(`/creator/dashboard/for-you?${q.toString()}`);
  };

  const hero = data?.hero;
  const hooks = data?.hooks || [];
  const locked = Number(data?.locked_count) || 0;

  return (
    <Page>
      <Kicker>UGC Pulse{data?.day ? ` · ${dayLabel(data.day)}` : ''} · updated every morning</Kicker>
      <Title>What's working in <em>{categoryLabel(current) || 'your niche'}</em> UGC</Title>
      <Sub>Hooks from real ads brands are running right now, the format that keeps coming up, and one editing tip a day.</Sub>

      <Bar>
        <Chips role="tablist" aria-label="Niche">
          {niches.map((n) => (
            <button key={n} type="button" className={n === current ? 'chip on' : 'chip'} onClick={() => setParam('niche', n)}>
              <span aria-hidden="true">{categoryEmoji(n)}</span> {categoryLabel(n)}
            </button>
          ))}
          <select aria-label="Another niche" value="" onChange={(e) => e.target.value && setParam('niche', e.target.value)}>
            <option value="">+ Niche</option>
            {CANONICAL_CATEGORIES.filter((c) => c !== 'other' && !niches.includes(c)).map((c) => (
              <option key={c} value={c}>{categoryLabel(c)}</option>
            ))}
          </select>
        </Chips>
        <Tabs role="tablist" aria-label="View">
          {VIEWS.map((v) => (
            <button key={v.id} type="button" role="tab" aria-selected={view === v.id} className={view === v.id ? 'on' : ''}
              onClick={() => setParam('view', v.id === 'today' ? '' : v.id)}>
              {v.label}
            </button>
          ))}
        </Tabs>
      </Bar>

      {error ? <Empty>{error} <button type="button" onClick={() => load(0)}>Retry</button></Empty> : null}
      {loading && !data ? <Skeleton aria-busy="true"><div /><div /><div /></Skeleton> : null}

      {!error && data && view === 'today' && (
        hero ? (
          <Grid>
            <section>
              <Hero>
                <div className="label">Hook of the day <span>{hero.score > 1 ? `seen in ${hero.score} ads` : 'from a live ad'}</span></div>
                <blockquote>{hero.text}</blockquote>
                {hero.pattern && hero.pattern !== 'Other' ? <Tag>{hero.pattern}</Tag> : null}
                <div className="proof">Running now from</div>
                <Brands sources={hero.sources} />
                {hero.why ? <Why><b>Why it works:</b> {hero.why}</Why> : null}
                <Actions>
                  <button type="button" className={hero.saved ? 'btn saved' : 'btn'} onClick={() => toggleSave(hero)}>
                    {hero.saved ? '★ Saved' : '☆ Save'}
                  </button>
                  <button type="button" className="btn" onClick={() => copy(hero)}>Copy hook</button>
                  {hero.sources?.[0] ? (
                    <button type="button" className="btn dark" onClick={() => pitchWith(hero)}>
                      Pitch {hero.sources[0].brand_name} with this angle{!isPro ? <small>PRO</small> : null}
                    </button>
                  ) : null}
                </Actions>
              </Hero>

              {(hooks.length > 0 || locked > 0) && (
                <SectionHead><h2>More hooks in {categoryLabel(current).toLowerCase()}</h2><span>most-used first</span></SectionHead>
              )}
              {hooks.map((h) => (
                <HookCard key={h.id} item={h} onSave={toggleSave} onCopy={copy} />
              ))}
              {locked > 0 && (
                <Lock>
                  <div className="blur" aria-hidden="true">
                    <div className="fake" /><div className="fake" />
                  </div>
                  <div className="over">
                    <h3>{locked} more {categoryLabel(current).toLowerCase()} hook{locked === 1 ? '' : 's'} today</h3>
                    <p>Pro gets every hook, the 90-day archive, and pitches written around each brand's own ads.</p>
                    <button type="button" className="btn pink" onClick={() => setUpgrade(true)}>Unlock with Pro · $19/mo</button>
                  </div>
                </Lock>
              )}
              {isPro && Number(data.week_count) > hooks.length + 1 ? (
                <button type="button" className="btn wide" onClick={() => setParam('view', 'week')}>
                  See all {data.week_count} hooks this week →
                </button>
              ) : null}
            </section>

            <Side>
              {data.trend ? (
                <Card className="trend">
                  <div className="label">📈 Trending now</div>
                  <h3>{data.trend.text}</h3>
                  {data.trend.why ? <p>{data.trend.why}</p> : null}
                  <Brands sources={data.trend.sources} max={3} />
                </Card>
              ) : null}
              {data.tip ? (
                <Card className="tip">
                  <div className="label">✂️ Editing tip</div>
                  <p className="big">{data.tip.text}</p>
                </Card>
              ) : null}
              {data.news?.length ? (
                <Card className="news">
                  <div className="label">📰 UGC news</div>
                  <ul>
                    {data.news.map((n) => (
                      <li key={n.id}>
                        {n.sources?.[0]?.url
                          ? <a href={n.sources[0].url} target="_blank" rel="noopener noreferrer">{n.text}</a>
                          : n.text}
                        {n.why ? <small>{n.why}</small> : null}
                      </li>
                    ))}
                  </ul>
                </Card>
              ) : null}
            </Side>
          </Grid>
        ) : (
          <Empty>
            <b>Your first {categoryLabel(current).toLowerCase()} pulse lands tomorrow morning.</b>
            <span>Every day we read the ads brands in your niche are running and pull out the hooks that work.</span>
          </Empty>
        )
      )}

      {!error && data && view === 'week' && (
        isPro ? (
          weekItems.length ? (
            <List>
              {weekItems.map((it, i) => (
                <React.Fragment key={it.id}>
                  {(i === 0 || weekItems[i - 1].day !== it.day) ? <DayHead>{dayLabel(it.day)}</DayHead> : null}
                  <HookCard item={it} onSave={toggleSave} onCopy={copy} />
                </React.Fragment>
              ))}
              {data.more ? (
                <button type="button" className="btn wide" disabled={loading} onClick={() => load(offset + 7)}>
                  {loading ? 'Loading…' : 'Show the week before'}
                </button>
              ) : null}
            </List>
          ) : <Empty><b>Nothing this week yet.</b><span>Hooks show up here as each day's pulse lands.</span></Empty>
        ) : (
          <Empty>
            <b>{Number(data.locked_count) || 'Every'} hook{Number(data.locked_count) === 1 ? '' : 's'} from this week, plus a 90-day archive</b>
            <span>The full library is on Pro. Today's hook of the day stays free.</span>
            <button type="button" className="btn pink" onClick={() => setUpgrade(true)}>Unlock with Pro · $19/mo</button>
          </Empty>
        )
      )}

      {!error && data && view === 'saved' && (
        data.items?.length ? (
          <List>
            {data.items.map((it) => <HookCard key={it.id} item={it} onSave={toggleSave} onCopy={copy} showDay />)}
          </List>
        ) : (
          <Empty><b>Your swipe file is empty.</b><span>Tap ☆ on any hook, trend or tip to keep it here for your next video.</span></Empty>
        )
      )}

      <Foot>Hooks come from public Meta Ad Library ads. Saved items stay forever; the archive keeps 90 days.</Foot>

      {toast ? <Toast role="status">{toast}{toast.startsWith('Saved') ? <button type="button" onClick={() => setParam('view', 'saved')}>See Saved</button> : null}</Toast> : null}
      <UpgradeModal isOpen={upgrade} onClose={() => setUpgrade(false)} feature="pulse" />
    </Page>
  );
}

function HookCard({ item, onSave, onCopy, showDay }) {
  const kindLabel = { trend: 'Trend', tip: 'Tip', news: 'News' }[item.kind];
  return (
    <Row>
      <div className="main">
        <div className="t">
          {kindLabel ? <Tag>{kindLabel}</Tag> : item.pattern && item.pattern !== 'Other' ? <Tag>{item.pattern}</Tag> : null}
          {item.text}
        </div>
        {item.why && item.kind !== 'hook' ? <div className="why">{item.why}</div> : null}
        <div className="meta">
          {showDay ? <span>{dayLabel(item.day)}</span> : null}
          {item.kind === 'hook' && item.score > 1 ? <span>{item.score} ads</span> : null}
          <Brands sources={item.sources} max={3} />
        </div>
      </div>
      <div className="ic">
        <button type="button" className={item.saved ? 'icb on' : 'icb'} aria-label={item.saved ? 'Remove from Saved' : 'Save'} onClick={() => onSave(item)}>
          {item.saved ? '★' : '☆'}
        </button>
        {item.kind === 'hook' ? (
          <button type="button" className="icb" aria-label="Copy hook" onClick={() => onCopy(item)}>⧉</button>
        ) : null}
      </div>
    </Row>
  );
}

const violet = '#6D28D9';
const violetSoft = '#F3EEFF';

const Page = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 24px clamp(16px, 3vw, 32px) 64px;
  font-family: ${t.fontSans};
  color: ${t.ink};

  .btn {
    display: inline-flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 999px;
    font: inherit; font-size: 14px; font-weight: 700; border: 1px solid ${t.line}; background: #fff; color: ${t.ink};
    cursor: pointer;
  }
  .btn:disabled { opacity: .6; cursor: default; }
  .btn.dark { background: ${t.ink}; border-color: ${t.ink}; color: #fff; }
  .btn.saved { background: ${violetSoft}; border-color: #DCCFFB; color: ${violet}; }
  .btn.pink { background: #E8395F; border-color: #E8395F; color: #fff; box-shadow: 0 6px 18px rgba(232,57,95,.25); }
  .btn.wide { width: 100%; justify-content: center; margin-top: 4px; }
  .btn small { font-size: 10.5px; font-weight: 800; background: #FDE8EE; color: #C0264A; border-radius: 999px; padding: 2px 6px; }

  @media (max-width: 860px) { padding-top: 16px; }
`;

const Kicker = styled.div`
  font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: ${t.accent};
`;

const Title = styled.h1`
  font-family: ${t.fontDisplay}; font-weight: 400; font-size: clamp(30px, 5vw, 44px); letter-spacing: -.02em;
  line-height: 1.1; margin: 6px 0;
  em { color: ${violet}; }
`;

const Sub = styled.p`
  color: ${t.muted}; font-size: 15px; line-height: 1.5; margin: 0 0 18px; max-width: 620px;
`;

const Bar = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 20px;
  @media (max-width: 860px) { flex-direction: column; align-items: stretch; }
`;

const Chips = styled.div`
  display: flex; gap: 8px; min-width: 0; max-width: 100%; overflow-x: auto; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  .chip, select {
    flex: none; padding: 8px 14px; border-radius: 999px; background: #fff; border: 1px solid ${t.line};
    font: inherit; font-size: 14px; font-weight: 600; color: ${t.muted}; cursor: pointer; white-space: nowrap;
  }
  .chip.on { background: ${t.ink}; border-color: ${t.ink}; color: #fff; }
  select { appearance: none; -webkit-appearance: none; }
`;

const Tabs = styled.div`
  display: flex; background: #ECE9E1; border-radius: 999px; padding: 4px; align-self: flex-start;
  button {
    border: 0; background: none; padding: 7px 14px; border-radius: 999px; font: inherit; font-size: 13.5px;
    font-weight: 700; color: ${t.muted}; cursor: pointer;
  }
  button.on { background: #fff; color: ${t.ink}; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
`;

const Grid = styled.div`
  display: grid; grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); gap: 22px; align-items: start;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

const Card = styled.article`
  background: #fff; border: 1px solid ${t.line}; border-radius: 20px; padding: 20px;
  .label { font-size: 11.5px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
  &.trend .label { color: ${t.hot}; }
  &.trend h3 { font-size: 18px; margin: 8px 0 6px; line-height: 1.3; }
  &.trend p { font-size: 14px; color: ${t.muted}; line-height: 1.5; margin: 0 0 12px; }
  &.tip { background: #ECFDF3; border-color: #CDEFD9; }
  &.tip .label { color: #047857; }
  p.big { font-size: 15px; line-height: 1.5; margin: 8px 0 0; font-weight: 600; }
  &.news ul { list-style: none; margin: 10px 0 0; padding: 0; }
  &.news li { padding: 10px 0; border-top: 1px solid #F1EEE7; font-size: 14px; line-height: 1.45; }
  &.news li:first-child { border-top: 0; padding-top: 4px; }
  &.news li a { color: ${t.ink}; text-decoration: none; }
  &.news li small { display: block; color: ${t.muted}; font-size: 12px; margin-top: 2px; }
`;

const Hero = styled(Card)`
  padding: 24px;
  background: linear-gradient(160deg, #FBF9FF 0%, #FFFFFF 55%);
  border-color: #E7E0FB;
  .label { color: ${violet}; display: flex; justify-content: space-between; gap: 8px; }
  .label span { color: ${t.muted}; letter-spacing: 0; text-transform: none; font-weight: 600; }
  blockquote {
    font-family: ${t.fontDisplay}; font-size: clamp(22px, 3.2vw, 30px); line-height: 1.25; margin: 12px 0 10px;
  }
  .proof { font-size: 13px; color: ${t.muted}; margin: 12px 0 6px; }
  @media (max-width: 860px) { padding: 18px; }
`;

const Tag = styled.span`
  display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase;
  color: ${violet}; background: ${violetSoft}; border-radius: 6px; padding: 3px 7px; margin-right: 8px;
  vertical-align: 2px;
`;

const Why = styled.div`
  margin: 14px 0 0; padding: 12px 14px; background: ${t.paper}; border-radius: 12px; font-size: 14px;
  color: ${t.muted}; line-height: 1.5;
  b { color: ${t.ink}; }
`;

const Actions = styled.div`
  display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px;
`;

const BrandRow = styled.div`
  display: flex; gap: 6px; flex-wrap: wrap;
  .b {
    display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px 4px 4px; border-radius: 999px;
    background: #fff; border: 1px solid ${t.line}; font-size: 12.5px; font-weight: 700; color: ${t.ink};
    text-decoration: none; max-width: 100%;
  }
  .b.hot { border-color: #FBD3BC; background: #FFF6F0; }
  .b.more { padding-left: 10px; color: ${t.muted}; }
  .b img, .b i {
    width: 20px; height: 20px; border-radius: 50%; object-fit: cover; flex: none;
    display: inline-grid; place-items: center; font-style: normal; font-size: 9px; font-weight: 800; color: #fff;
  }
`;

const SectionHead = styled.div`
  display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin: 26px 0 12px;
  h2 { font-size: 17px; margin: 0; }
  span { font-size: 13px; color: ${t.muted}; font-weight: 600; white-space: nowrap; }
`;

const Row = styled.article`
  background: #fff; border: 1px solid ${t.line}; border-radius: 18px; padding: 16px 18px; margin-bottom: 10px;
  display: flex; gap: 14px; align-items: flex-start;
  .main { flex: 1; min-width: 0; }
  .t { font-size: 16px; font-weight: 700; line-height: 1.4; }
  .why { font-size: 13.5px; color: ${t.muted}; margin-top: 4px; line-height: 1.45; }
  .meta { margin-top: 8px; font-size: 12.5px; color: ${t.muted}; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .ic { display: flex; gap: 6px; flex: none; }
  .icb {
    width: 36px; height: 36px; border-radius: 50%; border: 1px solid ${t.line}; background: #fff; display: grid;
    place-items: center; font-size: 15px; cursor: pointer; color: ${t.ink};
  }
  .icb.on { background: ${violetSoft}; border-color: #DCCFFB; color: ${violet}; }
  @media (max-width: 860px) { padding: 14px; .t { font-size: 15px; } }
`;

const Lock = styled.div`
  position: relative; overflow: hidden; border-radius: 18px;
  .blur { filter: blur(4px); opacity: .5; }
  .fake { height: 74px; background: #fff; border: 1px solid ${t.line}; border-radius: 18px; margin-bottom: 10px; }
  .over {
    position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: 16px;
    background: linear-gradient(180deg, rgba(247,245,240,.25), rgba(247,245,240,.96) 40%);
    align-content: center;
  }
  h3 { margin: 0 0 4px; font-size: 17px; }
  p { margin: 0 0 12px; font-size: 13.5px; color: ${t.muted}; max-width: 380px; }
`;

const Side = styled.aside`
  display: grid; gap: 16px;
`;

const List = styled.div`
  max-width: 760px;
`;

const DayHead = styled.div`
  font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: ${t.muted};
  margin: 18px 0 8px;
  &:first-child { margin-top: 0; }
`;

const Empty = styled.div`
  background: #fff; border: 1px dashed ${t.line}; border-radius: 20px; padding: 28px 22px; text-align: center;
  display: grid; gap: 8px; justify-items: center; max-width: 620px; margin: 8px auto;
  b { font-size: 16px; }
  span { color: ${t.muted}; font-size: 14px; line-height: 1.5; }
  button:not(.btn) { border: 0; background: none; text-decoration: underline; cursor: pointer; font: inherit; }
`;

const Skeleton = styled.div`
  display: grid; gap: 12px;
  div { height: 110px; border-radius: 20px; background: linear-gradient(90deg, #efede7, #f7f5f0, #efede7); }
`;

const Foot = styled.div`
  font-size: 12.5px; color: ${t.muted}; text-align: center; margin-top: 24px;
`;

const Toast = styled.div`
  position: fixed; left: 50%; transform: translateX(-50%);
  bottom: calc(20px + var(--nc-tabbar, 0px));
  background: ${t.ink}; color: #fff; padding: 11px 16px; border-radius: 999px; font-size: 14px; font-weight: 600;
  box-shadow: 0 10px 30px rgba(0,0,0,.2); display: flex; gap: 10px; align-items: center; z-index: 70;
  button { border: 0; background: none; color: #C4B5FD; font: inherit; font-weight: 700; cursor: pointer; }
`;
