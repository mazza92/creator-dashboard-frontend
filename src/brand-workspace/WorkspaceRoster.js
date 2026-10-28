// A campaign's roster inside the brand workspace: pick creators, lock, ship, then collect content.
// Same /api/brand-pr/r/<token> endpoints as the hosted /r/<token> page, drawn in the workspace's own look.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  ArrowLeft, Check, CheckCircle2, CreditCard, Download, ExternalLink, Inbox, Lock, PenLine, Sparkles, Truck, Undo2, X,
} from 'lucide-react';
import api from '../config/api';
import { Thumb } from '../app/brands/scan/ScanReport';
import { scan as t } from '../app/brands/scan/theme';
import { ListSkeleton } from './WorkspaceSkeleton';
import { Banner, Empty, PlainLink, Primary } from './ui';
import { startCheckout } from './workspaceApi';
import RosterChat, { MessageButton } from '../components/chat/RosterChat';

const BRIEF_FIELDS = [
  { key: 'message', label: 'The one thing to get across', placeholder: 'e.g. Our serum fades dark spots in 2 weeks.', max: 280, rows: 2 },
  { key: 'must_include', label: 'Must show or say', placeholder: 'e.g. Show the texture on skin. Mention it’s fragrance free.', max: 500, rows: 3 },
  { key: 'avoid', label: 'Please avoid', placeholder: 'e.g. Medical claims, other brands in frame.', max: 300, rows: 2 },
  { key: 'tags', label: 'Tags and hashtags', placeholder: '@yourbrand #gifted', max: 160 },
  { key: 'variant_question', label: 'Size, shade or variant to ask (optional)', placeholder: 'e.g. Which bedsheet size do you need? Twin, Full, Queen or King', max: 160 },
  { key: 'reference_url', label: 'Reference video (optional)', placeholder: 'https://www.tiktok.com/@…', max: 600 },
];

const hasBrief = (b) => Boolean(b && BRIEF_FIELDS.some((f) => b[f.key]));
const plural = (n, one, many) => (n === 1 ? one : many);
const shortDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts.length === 1 ? parts[0].slice(0, 2) : parts[0][0] + parts[1][0]).toUpperCase();
}

function hue(name) {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 30% 88%)`;
}

function address(ship) {
  if (!ship) return 'Address pending';
  return [ship.full_name, ship.address_line1, ship.address_line2,
    [ship.city, ship.state, ship.zip].filter(Boolean).join(' '), ship.country].filter(Boolean).join('\n');
}

const isOut = (c) => Boolean(c.shipped_at) || c.status === 'posted';

export default function WorkspaceRoster({ token, onBack }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [data, setData] = useState(null);
  const [step, setStep] = useState('pick');
  const [tab, setTab] = useState('open');
  const [paywall, setPaywall] = useState('');
  const [briefOpen, setBriefOpen] = useState(false);
  const [quickDismissed, setQuickDismissed] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [readIds, setReadIds] = useState(() => new Set());
  const viewed = useRef(new Set());

  const apply = useCallback((payload, keepStep) => {
    if (!payload || !payload.success) throw new Error((payload && payload.error) || 'Request failed');
    setData(payload);
    if (payload.billing && payload.billing.subscribed) setPaywall('');
    if (!keepStep) {
      const status = payload.campaign && payload.campaign.status;
      setStep(status === 'shipped' ? 'content' : status === 'locked' ? 'ship' : 'pick');
    }
    return payload;
  }, []);

  useEffect(() => {
    let live = true;
    setLoading(true);
    api.get(`/api/brand-pr/r/${token}`, { timeout: 20000 })
      .then(({ data: d }) => { if (live) apply(d); })
      .catch((err) => { if (live) setError((err.response && err.response.data && err.response.data.error) || 'We couldn’t load this roster.'); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [token, apply]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const mutate = async (path, body, { keepStep = true } = {}) => {
    setBusy(true);
    setError('');
    try {
      const { data: d } = await api.post(`/api/brand-pr/r/${token}/${path}`, body || {});
      return apply(d, keepStep);
    } catch (err) {
      const res = err.response || {};
      const msg = (res.data && res.data.error) || err.message || 'That didn’t work. Try again.';
      if (res.status === 402 && res.data && res.data.paywall) setPaywall(msg);
      else setToast(msg);
      return null;
    } finally {
      setBusy(false);
    }
  };

  const onUpgrade = async () => {
    setUpgrading(true);
    try {
      const url = await startCheckout();
      if (url) window.location.href = url;
    } catch (err) {
      setToast(err.message || 'Couldn’t open checkout. Try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const markViewed = (id) => {
    if (viewed.current.has(id)) return;
    viewed.current.add(id);
    api.post(`/api/brand-pr/r/${token}/view`, { application_id: id }).catch(() => viewed.current.delete(id));
  };

  const campaign = (data && data.campaign) || {};
  // Marking shipped emails creators that their box is on its way, so ask first.
  const confirmShip = (list) => {
    const variantQ = campaign.brief && campaign.brief.variant_question;
    const waiting = variantQ ? list.filter((c) => !c.variant_answer).map((c) => c.name) : [];
    const who = list.length === 1 ? list[0].name : `${list.length} creators`;
    const warn = waiting.length ? `${waiting.join(', ')} ${waiting.length === 1 ? 'hasn’t' : 'haven’t'} answered “${variantQ}” yet.\n\n` : '';
    return window.confirm(`${warn}Mark ${who} as shipped? We’ll email ${list.length === 1 ? 'them' : 'each one'} that the box is on its way. You can undo this for 24 hours.`);
  };
  const creators = useMemo(() => (data && data.creators) || [], [data]);
  const billing = (data && data.billing) || {};
  const subscribed = Boolean(billing.subscribed);
  const slotLimit = Number(campaign.slot_limit) || 5;
  const selectedIds = useMemo(() => (campaign.selected_application_ids || []).map(Number), [campaign.selected_application_ids]);
  const selected = selectedIds.map((id) => creators.find((c) => c.application_id === id)).filter(Boolean);
  const locked = campaign.status === 'locked' || campaign.status === 'shipped';
  const shipped = campaign.status === 'shipped';
  // Seats still free after the lock (locked 1 of 5 leaves 4): the brand can keep adding up to its limit.
  const seatsLeft = locked ? Math.max(0, Number(campaign.picks_left) || 0) : 0;
  const seatsLabel = plural(seatsLeft, '1 gift seat', `${seatsLeft} gift seats`);
  const shippedCount = selected.filter(isOut).length;
  const contentOpen = shipped || shippedCount > 0;
  const open = creators.filter((c) => !c.skipped);
  const skipped = creators.filter((c) => c.skipped);
  const ordered = [...open.filter((c) => c.top_pick), ...open.filter((c) => !c.top_pick)];
  const lockedCount = subscribed ? 0 : Number(data && data.locked && data.locked.count) || 0;
  const teasers = (data && data.locked && data.locked.teasers) || [];
  const quick = locked || quickDismissed || selectedIds.length ? [] : (campaign.top_pick_ids || []).map(Number)
    .map((id) => creators.find((c) => c.application_id === id && c.status === 'review' && !c.skipped))
    .filter(Boolean).slice(0, slotLimit);
  const product = campaign.sku_note || (campaign.brand && campaign.brand.hero_product) || 'Gifted PR package';

  if (loading) {
    return <Wrap><Back onBack={onBack} /><ListSkeleton rows={4} /></Wrap>;
  }
  if (!data) {
    return (
      <Wrap>
        <Back onBack={onBack} />
        <Empty><b>We couldn&apos;t open this roster</b>{error}</Empty>
      </Wrap>
    );
  }

  const steps = [
    { key: 'pick', label: 'Pick', hint: locked ? (seatsLeft ? `${seatsLeft} left` : 'Done') : `${selectedIds.length}/${slotLimit}`, done: locked, enabled: true },
    { key: 'ship', label: 'Ship', hint: shipped ? 'Done' : locked ? `${shippedCount}/${selected.length} sent` : 'After lock', done: shipped, enabled: locked },
    { key: 'content', label: 'Content', hint: contentOpen ? `${selected.filter((c) => c.delivered).length} in` : 'After ship', done: false, enabled: contentOpen },
  ];

  const addPick = async (c) => {
    markViewed(c.application_id);
    if (!window.confirm(`Add ${c.name} to your gift list? Their shipping address unlocks and we email them that you picked them.`)) return;
    if (await mutate('add-pick', { application_id: c.application_id })) setToast(`${c.name} added. Their address is in the Ship step.`);
  };
  const seatsBox = (
    <Quick>
      <div>
        <b>You have {seatsLabel} left</b>
        <span>Your plan gifts up to {slotLimit} creators and you picked {selected.length}. Add more from the creators who applied.</span>
      </div>
      {step !== 'pick' && (
        <div className="act">
          <Primary as="button" type="button" style={{ marginTop: 0 }} onClick={() => setStep('pick')}>Add creators</Primary>
        </div>
      )}
    </Quick>
  );

  const upgradeBox = (title, text) => (
    <Upsell>
      <Sparkles size={18} />
      <div>
        <b>{title}</b>
        <span>{text}</span>
      </div>
      <Primary as="button" type="button" aria-disabled={upgrading} onClick={onUpgrade}>
        <CreditCard size={15} /> Upgrade · $299/mo
      </Primary>
    </Upsell>
  );

  const markRead = useCallback(() => {
    if (chatId) setReadIds((prev) => (prev.has(chatId) ? prev : new Set(prev).add(chatId)));
  }, [chatId]);
  const chatWith = chatId ? creators.find((c) => c.application_id === chatId) : null;
  const unreadFor = (c) => (readIds.has(c.application_id) ? 0 : Number(c.unread_messages) || 0);
  const openChat = (c) => {
    setReadIds((prev) => { const next = new Set(prev); next.delete(c.application_id); return next; });
    setChatId(c.application_id);
  };
  const chat = (
    <RosterChat
      open={Boolean(chatWith)}
      onClose={() => setChatId(null)}
      title={chatWith ? chatWith.name : ''}
      subtitle={product}
      avatarUrl={chatWith ? chatWith.avatar_url : ''}
      loadUrl={chatWith ? `/api/brand-pr/r/${token}/messages?application_id=${chatWith.application_id}` : ''}
      sendUrl={`/api/brand-pr/r/${token}/messages`}
      extraBody={chatWith ? { application_id: chatWith.application_id } : null}
      onRead={markRead}
      quickReplies={['Which size do you need?', 'Is your shipping address still correct?', 'Your box ships this week!', 'When do you plan to post?']}
      emptyHint={`Ask about sizes, shipping or timing. ${(chatWith ? chatWith.name : 'They').split(' ')[0]} gets an email when you write, and replies land here.`}
    />
  );

  const briefPanel = (
    <BriefCard>
      <div className="row">
        <b><PenLine size={15} /> Creator brief</b>
        <PlainLink type="button" onClick={() => setBriefOpen(true)}>{hasBrief(campaign.brief) ? 'Edit' : 'Add'}</PlainLink>
      </div>
      {hasBrief(campaign.brief) ? (
        <p>{campaign.brief.message || campaign.brief.must_include}</p>
      ) : (
        <p>Tell creators what to show and say. It takes a minute and lifts the content.</p>
      )}
    </BriefCard>
  );

  return (
    <Wrap>
      {toast && <Toast role="status">{toast}</Toast>}
      {chat}
      {briefOpen && (
        <BriefEditor brief={campaign.brief} onClose={() => setBriefOpen(false)}
          onSave={async (draft) => {
            const { data: d } = await api.post(`/api/brand-pr/r/${token}/brief`, { brief: draft });
            apply(d, true);
            setBriefOpen(false);
            setToast(hasBrief(d.campaign && d.campaign.brief) ? 'Brief saved. Your creators can see it.' : 'Brief cleared.');
          }} />
      )}

      <Back onBack={onBack} />
      <Header>
        <div>
          <h1>{product}</h1>
          <p>
            Gift up to {slotLimit} creators · 1 organic post + 1 UGC video each · 6-month ad rights
          </p>
        </div>
        <Status $tone={shipped ? 'ok' : locked ? 'warn' : 'live'}>{shipped ? 'Shipped' : locked ? 'Locked' : 'Open for picks'}</Status>
      </Header>

      <Steps role="tablist">
        {steps.map((s, i) => (
          <StepTab key={s.key} type="button" role="tab" aria-selected={step === s.key} disabled={!s.enabled}
            $on={step === s.key} onClick={() => setStep(s.key)}>
            <span className="n">{s.done ? <Check size={13} /> : i + 1}</span>
            <span className="l">{s.label}<em>{s.hint}</em></span>
          </StepTab>
        ))}
      </Steps>

      {paywall && !subscribed && upgradeBox('Gift more creators with Pro', `${paywall} Pro lets you gift up to 10 per campaign.`)}

      {step === 'pick' && (
        <Layout>
          <div>
            {quick.length > 0 && (
              <Quick>
                <div>
                  <b>Polly picked your best {plural(quick.length, 'fit', quick.length)}</b>
                  <span>{quick.map((c) => c.handle || c.name).join(', ')}. Approve and get their addresses now.</span>
                </div>
                <div className="act">
                  <Primary as="button" type="button" aria-disabled={busy} style={{ marginTop: 0 }} onClick={async () => {
                    const out = await mutate('quick-pick', { application_ids: quick.map((c) => c.application_id) }, { keepStep: false });
                    if (out) { setQuickDismissed(true); setToast('Locked. Addresses are ready.'); }
                  }}>
                    <Check size={15} /> Approve {quick.length}
                  </Primary>
                  <PlainLink type="button" onClick={() => setQuickDismissed(true)}>I&apos;ll choose</PlainLink>
                </div>
              </Quick>
            )}

            {seatsLeft > 0 && seatsBox}
            {!locked && creators.length > 0 && (
              <Tabs>
                <button type="button" aria-pressed={tab === 'open'} onClick={() => setTab('open')}>Applicants <i>{open.length}</i></button>
                <button type="button" aria-pressed={tab === 'skipped'} onClick={() => setTab('skipped')} disabled={!skipped.length}>
                  Skipped <i>{skipped.length}</i>
                </button>
              </Tabs>
            )}

            {!creators.length ? (
              <Empty>
                <Inbox size={28} />
                <b>Your roster is live</b>
                Creators in your niche are applying now. Most rosters get their first applicants within 24 hours, and we email you when they&apos;re in.
              </Empty>
            ) : (
              <Grid>
                {(locked
                  ? [...selected, ...(seatsLeft ? ordered.filter((c) => c.status === 'review' && !selectedIds.includes(c.application_id)) : [])]
                  : tab === 'skipped' ? skipped : ordered).map((c) => (
                  <CreatorCard key={c.application_id} c={c} picked={selectedIds.includes(c.application_id)}
                    locked={locked} canAdd={seatsLeft > 0} busy={busy} full={selectedIds.length >= slotLimit}
                    onView={() => markViewed(c.application_id)}
                    onAdd={locked ? () => addPick(c) : async () => { markViewed(c.application_id); if (await mutate('select', { application_id: c.application_id })) setToast('Added to your gift list'); }}
                    onRemove={() => mutate('deselect', { application_id: c.application_id })}
                    onSkip={() => mutate(c.skipped ? 'unskip' : 'skip', { application_id: c.application_id })} />
                ))}
              </Grid>
            )}

            {lockedCount > 0 && !locked && tab === 'open' && (
              <Teasers>
                <div className="ghosts">
                  {teasers.slice(0, 4).map((x, i) => (
                    <div key={i} className="ghost"><Lock size={14} />{[x.niche, x.followers_label, x.country_code].filter(Boolean).join(' · ') || 'Creator'}</div>
                  ))}
                </div>
                {upgradeBox(`${lockedCount} more ${plural(lockedCount, 'creator', 'creators')} applied`,
                  'Your free campaign shows Polly’s shortlist. Pro shows everyone who applied.')}
              </Teasers>
            )}
          </div>

          {!locked && (
            <MobileBar>
              <span className="count">{selectedIds.length}<i>/{slotLimit}</i> picked</span>
              <Primary as="button" type="button" aria-disabled={busy || !selectedIds.length}
                onClick={async () => { if (await mutate('lock', null, { keepStep: false })) setToast('Locked. Addresses are ready.'); }}>
                <Lock size={15} /> {selectedIds.length ? `Lock ${selectedIds.length} & get addresses` : 'Pick at least 1'}
              </Primary>
            </MobileBar>
          )}
          <Side>
            <GiftList>
              <div className="top">
                <b>Gift list</b>
                <span>{selectedIds.length}<i>/{slotLimit}</i></span>
              </div>
              <Meter><span style={{ width: `${Math.min(100, (selectedIds.length / slotLimit) * 100)}%` }} /></Meter>
              <Slots>
                {Array.from({ length: slotLimit }).map((_, i) => {
                  const c = selected[i];
                  return c ? (
                    <li key={c.application_id}>
                      <Avatar $bg={hue(c.name)} $sm>{c.avatar_url ? <img src={c.avatar_url} alt="" /> : initials(c.name)}</Avatar>
                      <span className="who"><b>{c.name}</b>{c.handle}</span>
                      {!locked && (
                        <button type="button" aria-label={`Remove ${c.name}`} disabled={busy} onClick={() => mutate('deselect', { application_id: c.application_id })}>
                          <X size={14} />
                        </button>
                      )}
                    </li>
                  ) : <li key={`e${i}`} className="empty">Seat {i + 1}</li>;
                })}
              </Slots>
              {locked ? (
                <Primary as="button" type="button" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStep(shipped ? 'content' : 'ship')}>
                  {shipped ? <><Inbox size={15} /> See content</> : <><Truck size={15} /> Ship your gifts</>}
                </Primary>
              ) : (
                <Primary as="button" type="button" style={{ width: '100%', justifyContent: 'center' }}
                  aria-disabled={busy || !selectedIds.length}
                  onClick={async () => { if (await mutate('lock', null, { keepStep: false })) setToast('Locked. Addresses are ready.'); }}>
                  <Lock size={15} /> {selectedIds.length ? `Lock ${selectedIds.length} & get addresses` : 'Pick at least 1'}
                </Primary>
              )}
              {!locked && <small>Addresses stay hidden until you lock.</small>}
            </GiftList>
            {briefPanel}
          </Side>
        </Layout>
      )}

      {step === 'ship' && (
        <>
          {seatsLeft > 0 && seatsBox}
          <ShipBar>
            <div>
              <b>Ship the way you already do</b>
              <span>Download the CSV for Shopify or ShipStation, then mark each box as it goes out.</span>
            </div>
            <div className="act">
              <Primary as="a" style={{ marginTop: 0 }} href={`${api.defaults.baseURL || ''}/api/brand-pr/r/${token}/shipping.csv`}
                target="_blank" rel="noopener noreferrer">
                <Download size={15} /> Shipping CSV
              </Primary>
              <Ghost type="button" disabled={busy || shipped} onClick={async () => {
                if (!confirmShip(selected.filter((c) => !isOut(c)))) return;
                if (await mutate('mark-shipped', null, { keepStep: false })) setToast('Shipped. Content lands here.');
              }}>
                {shipped ? 'All shipped' : shippedCount ? `Mark the other ${selected.length - shippedCount} shipped` : 'Mark all shipped'}
              </Ghost>
            </div>
          </ShipBar>
          {briefPanel}
          <Rows>
            {selected.map((c) => (
              <li key={c.application_id}>
                <Avatar $bg={hue(c.name)}>{c.avatar_url ? <img src={c.avatar_url} alt="" /> : initials(c.name)}</Avatar>
                <div className="who">
                  <b>{c.name}</b><span>{c.handle}</span>
                  <MessageButton unread={unreadFor(c)} onClick={() => openChat(c)} className="msg" />
                </div>
                <pre className="addr">{address(c.shipping_address)}
                  {campaign.brief && campaign.brief.variant_question
                    ? `\n${c.variant_answer ? `Needs: ${c.variant_answer}` : 'Waiting for their size / variant answer'}` : ''}</pre>
                <div className="st">
                  {isOut(c) ? (
                    <Done>
                      <CheckCircle2 size={14} /> {c.status === 'posted' ? 'Content in' : 'Shipped'}{c.shipped_at ? ` · ${shortDate(c.shipped_at)}` : ''}
                      {c.can_unship && (
                        <UndoBtn type="button" disabled={busy} onClick={async () => {
                          if (await mutate('unship', { application_id: c.application_id })) setToast(`Undone. We told ${c.name} it hasn’t shipped yet.`);
                        }}>Undo</UndoBtn>
                      )}
                    </Done>
                  ) : (
                    <Ghost type="button" disabled={busy} onClick={async () => {
                      if (!confirmShip([c])) return;
                      if (await mutate('mark-shipped', { application_id: c.application_id })) setToast(`${c.name} marked shipped. We told them it’s on the way.`);
                    }}>
                      <Truck size={14} /> Mark shipped
                    </Ghost>
                  )}
                </div>
              </li>
            ))}
          </Rows>
        </>
      )}

      {step === 'content' && (
        <>
          {!subscribed && billing.needs_subscribe && billing.delivered_count > 0
            && upgradeBox('Keep the UGC coming', `${billing.next_applicants ? `${billing.next_applicants} more creators already applied. ` : ''}Run a new campaign every month with Pro.`)}
          <ContentGrid>
            {selected.map((c) => {
              const got = c.delivered;
              const post = (c.posts || [])[0] || {};
              return (
                <li key={c.application_id}>
                  <div className="cover" style={{ background: hue(c.name) }}>
                    <Thumb src={post.thumbnail_url} post={post.post_url} />
                    <span className={`tag ${got || c.status === 'posted' ? 'ok' : ''}`}>{got || c.status === 'posted' ? 'Content in' : 'Waiting'}</span>
                  </div>
                  <div className="meta">
                    <b>{c.name}</b>
                    <MessageButton unread={unreadFor(c)} onClick={() => openChat(c)} className="msg" />
                    {got ? (
                      <div className="links">
                        {got.organic_url && <a href={got.organic_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /> Organic post</a>}
                        {got.ugc_url && <a href={got.ugc_url} target="_blank" rel="noopener noreferrer"><Download size={13} /> UGC file</a>}
                        {got.note && <em>“{got.note}”</em>}
                      </div>
                    ) : (
                      <span>
                        {c.content_due_at
                          ? (c.content_overdue ? `Overdue since ${shortDate(c.content_due_at)}. We’re chasing them.` : `Due ${shortDate(c.content_due_at)}`)
                          : isOut(c) ? 'Usually 5 to 10 days after delivery' : 'Not shipped yet'}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ContentGrid>
        </>
      )}
    </Wrap>
  );
}

function Back({ onBack }) {
  if (!onBack) return null;
  return <PlainLink type="button" onClick={onBack} style={{ marginBottom: 18 }}><ArrowLeft size={14} /> All campaigns</PlainLink>;
}

function CreatorCard({ c, picked, locked, canAdd, busy, full, onAdd, onRemove, onSkip, onView }) {
  const posts = (c.posts || []).slice(0, 3);
  const meta = [c.followers_label && `${c.followers_label} followers`, c.engagement_label && `${c.engagement_label} eng.`].filter(Boolean);
  return (
    <Card $on={picked}>
      <CoverBox>
      <Covers $n={posts.length || 1}>
        {posts.length ? posts.map((p, i) => (
          <a key={i} href={p.post_url || undefined} target="_blank" rel="noopener noreferrer" onClick={onView}
            style={{ background: hue(c.name) }} aria-label={`Post ${i + 1} from ${c.name}`}>
            <Thumb src={p.thumbnail_url} post={p.post_url} />
          </a>
        )) : <span style={{ background: hue(c.name) }} />}
      </Covers>
        {c.top_pick && !picked && <Badge><Sparkles size={12} /> Top pick</Badge>}
        {picked && <Badge $ok><Check size={12} /> On your list</Badge>}
      </CoverBox>
      <div className="body">
        <div className="who">
          <Avatar $bg={hue(c.name)}>{c.avatar_url ? <img src={c.avatar_url} alt="" /> : initials(c.name)}</Avatar>
          <div>
            <b>{c.name}</b>
            <span>
              {c.country_code && <img className="flag" src={`https://flagcdn.com/w20/${c.country_code}.png`} alt="" />}
              {[c.handle, c.city].filter(Boolean).join(' · ')}
            </span>
          </div>
        </div>
        {meta.length > 0 && <div className="stats">{meta.join(' · ')}</div>}
        {(c.fit_reasons || []).length ? (
          <div className="chips">{c.fit_reasons.slice(0, 3).map((r) => <i key={r}><Check size={11} /> {r}</i>)}</div>
        ) : c.niche ? <div className="chips"><i>{c.niche}</i></div> : null}
        {c.kit_url && <a className="kit" href={c.kit_url} target="_blank" rel="noopener noreferrer" onClick={onView}>Media kit <ExternalLink size={12} /></a>}
        {locked && canAdd && !picked && (
          <div className="act">
            <AddBtn type="button" disabled={busy} onClick={onAdd}><Check size={14} /> Add to gift list</AddBtn>
          </div>
        )}
        {!locked && (
          <div className="act">
            {c.skipped ? (
              <Ghost type="button" disabled={busy} onClick={onSkip}><Undo2 size={14} /> Undo skip</Ghost>
            ) : picked ? (
              <Ghost type="button" disabled={busy} onClick={onRemove}><X size={14} /> Remove</Ghost>
            ) : (
              <>
                <AddBtn type="button" disabled={busy || full} title={full ? 'Your gift list is full' : undefined} onClick={onAdd}>
                  <Check size={14} /> Add
                </AddBtn>
                <Ghost type="button" disabled={busy} onClick={onSkip}>Skip</Ghost>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function BriefEditor({ brief, onClose, onSave }) {
  const [draft, setDraft] = useState(() => BRIEF_FIELDS.reduce((a, f) => ({ ...a, [f.key]: (brief && brief[f.key]) || '' }), {}));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  const tooLong = BRIEF_FIELDS.find((f) => draft[f.key].length > f.max);
  const submit = async (e) => {
    e.preventDefault();
    if (tooLong) return;
    setSaving(true);
    setError('');
    try {
      await onSave(draft);
    } catch (err) {
      setError((err.response && err.response.data && err.response.data.error) || 'Couldn’t save the brief.');
      setSaving(false);
    }
  };
  return (
    <Modal onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form role="dialog" aria-modal="true" aria-label="Creator brief" onSubmit={submit}>
        <div className="head">
          <div>
            <h2>Creator brief</h2>
            <p>Your creators read this before they film. Short and specific works best.</p>
          </div>
          <button type="button" aria-label="Close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="agreed">Already agreed: 1 organic post tagging you, 1 raw UGC video, 6-month ad rights.</div>
        {BRIEF_FIELDS.map((f) => (
          <label key={f.key}>
            <span>{f.label}</span>
            {f.rows ? (
              <textarea rows={f.rows} value={draft[f.key]} placeholder={f.placeholder}
                onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
            ) : (
              <input value={draft[f.key]} placeholder={f.placeholder} onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })} />
            )}
            {draft[f.key].length > f.max && <em>{draft[f.key].length}/{f.max}</em>}
          </label>
        ))}
        {error && <Banner>{error}</Banner>}
        <div className="foot">
          <PlainLink type="button" onClick={onClose}>Cancel</PlainLink>
          <Primary as="button" type="submit" style={{ marginTop: 0 }} aria-disabled={saving || Boolean(tooLong)}>
            {saving ? 'Saving…' : 'Save brief'}
          </Primary>
        </div>
      </form>
    </Modal>
  );
}

// ----- styles ----------------------------------------------------------------------------------

const Wrap = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 140px;

  @media (max-width: 900px) {
    padding: 18px 16px 140px;
  }
`;

const Toast = styled.div`
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 60;
  background: ${t.ink};
  color: #fff;
  font-size: 14px;
  padding: 10px 16px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
  max-width: calc(100vw - 32px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 18px;

  h1 {
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin: 0 0 4px;
  }

  p { margin: 0; color: ${t.muted}; font-size: 14px; line-height: 1.5; }
`;

const Status = styled.span`
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: 999px;
  background: ${(p) => ({ ok: t.greenSoft, warn: '#fff8eb' }[p.$tone] || t.accentSoft)};
  color: ${(p) => ({ ok: t.green, warn: '#b45309' }[p.$tone] || t.accent)};
`;

const Steps = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 22px;
`;

const StepTab = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${(p) => (p.$on ? t.ink : t.line)};
  background: ${(p) => (p.$on ? t.bgSoft : '#fff')};
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: ${t.ink};

  &:disabled { cursor: default; opacity: 0.5; }

  .n {
    width: 24px;
    height: 24px;
    flex: 0 0 24px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    background: ${(p) => (p.$on ? t.ink : t.lineSoft)};
    color: ${(p) => (p.$on ? '#fff' : t.inkSoft)};
  }

  .l { font-size: 14px; font-weight: 600; display: flex; flex-direction: column; min-width: 0; }
  em { font-style: normal; font-weight: 500; font-size: 12px; color: ${t.muted}; }

  @media (max-width: 560px) {
    padding: 8px;
    gap: 6px;
    .n { width: 20px; height: 20px; flex-basis: 20px; }
    .l { font-size: 13px; }
  }
`;

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const Side = styled.aside`
  position: sticky;
  top: 20px;
  display: grid;
  gap: 12px;

  @media (max-width: 980px) {
    position: static;
  }
`;

const MobileBar = styled.div`
  display: none;

  @media (max-width: 980px) {
    display: flex;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    gap: 12px;
    align-items: center;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
    background: rgba(255, 255, 255, 0.96);
    border-top: 1px solid ${t.line};
    backdrop-filter: blur(8px);

    .count { font-size: 14px; font-weight: 700; white-space: nowrap; }
    .count i { font-style: normal; color: ${t.muted2}; }
    a, button { flex: 1; justify-content: center; margin-top: 0 !important; }
  }
`;

const GiftList = styled.div`
  border: 1px solid ${t.line};
  border-radius: 18px;
  padding: 16px;
  background: #fff;

  .top { display: flex; justify-content: space-between; align-items: baseline; }
  .top b { font-size: 15px; }
  .top span { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
  .top i { font-style: normal; font-size: 14px; color: ${t.muted2}; font-weight: 600; }
  small { display: block; text-align: center; color: ${t.muted2}; font-size: 12px; margin-top: 8px; }
`;

const Meter = styled.div`
  height: 6px;
  border-radius: 99px;
  background: ${t.lineSoft};
  margin: 10px 0 12px;
  overflow: hidden;

  span { display: block; height: 100%; background: ${t.accent}; border-radius: 99px; transition: width 0.2s; }
`;

const Slots = styled.ul`
  list-style: none;
  margin: 0 0 4px;
  padding: 0;
  display: grid;
  gap: 6px;

  li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 10px;
    background: ${t.bgSoft};
    font-size: 13px;
    min-height: 40px;
  }

  li.empty { background: none; border: 1px dashed ${t.line}; color: ${t.muted2}; justify-content: center; }
  .who { flex: 1; min-width: 0; color: ${t.muted}; display: flex; flex-direction: column; font-size: 12px; }
  .who b { color: ${t.ink}; font-size: 13px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  button {
    border: 0;
    background: none;
    color: ${t.muted};
    cursor: pointer;
    padding: 4px;
    border-radius: 6px;
    display: grid;
  }

  button:hover { background: #fff; color: ${t.ink}; }
`;

const BriefCard = styled.div`
  border: 1px solid ${t.line};
  border-radius: 18px;
  padding: 14px 16px;
  margin-bottom: 16px;

  .row { display: flex; justify-content: space-between; align-items: center; }
  .row b { display: inline-flex; gap: 6px; align-items: center; font-size: 14px; }
  p { margin: 6px 0 0; color: ${t.muted}; font-size: 13px; line-height: 1.5; }
`;

const Quick = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${t.accentRing};
  background: ${t.accentSoft};
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;

  b { display: block; font-size: 15px; }
  span { color: ${t.inkSoft}; font-size: 13px; line-height: 1.5; }
  .act { display: flex; align-items: center; gap: 14px; flex: 0 0 auto; }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 14px;

  button {
    border: 1px solid ${t.line};
    background: #fff;
    border-radius: 999px;
    padding: 6px 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    color: ${t.inkSoft};
    cursor: pointer;
  }

  button[aria-pressed='true'] { background: ${t.ink}; border-color: ${t.ink}; color: #fff; }
  button:disabled { opacity: 0.5; cursor: default; }
  i { font-style: normal; opacity: 0.7; margin-left: 4px; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
`;

const Card = styled.div`
  border: 1px solid ${(p) => (p.$on ? t.accent : t.line)};
  box-shadow: ${(p) => (p.$on ? `0 0 0 3px ${t.accentRing}` : 'none')};
  border-radius: 18px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;

  .body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .who { display: flex; gap: 10px; align-items: center; min-width: 0; }
  .who > div { min-width: 0; }
  .who b { display: block; font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .who span { display: flex; align-items: center; gap: 5px; color: ${t.muted}; font-size: 13px; white-space: nowrap; overflow: hidden; }
  .flag { width: 16px; height: 11px; border-radius: 2px; object-fit: cover; }
  .stats { font-size: 13px; color: ${t.inkSoft}; font-weight: 600; }
  .chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .chips i { font-style: normal; font-size: 12px; color: ${t.inkSoft}; background: ${t.bgSoft}; border-radius: 999px; padding: 3px 8px; display: inline-flex; align-items: center; gap: 3px; }
  .kit { font-size: 13px; color: ${t.ink}; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
  .act { display: flex; gap: 8px; margin-top: auto; padding-top: 4px; }
`;

const Covers = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: ${(p) => (p.$n >= 3 ? '2fr 1fr' : `repeat(${p.$n}, 1fr)`)};
  grid-template-rows: ${(p) => (p.$n >= 3 ? '1fr 1fr' : '1fr')};
  gap: 2px;
  aspect-ratio: 16 / 10;
  background: ${t.lineSoft};

  > a, > span { position: relative; overflow: hidden; display: block; }
  > a:first-child { grid-row: ${(p) => (p.$n >= 3 ? 'span 2' : 'auto')}; }
  img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
`;

const CoverBox = styled.div`
  position: relative;
`;

const Badge = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 999px;
  background: ${(p) => (p.$ok ? t.accent : 'rgba(255, 255, 255, 0.94)')};
  color: ${(p) => (p.$ok ? '#fff' : t.ink)};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
`;

const Avatar = styled.span`
  width: ${(p) => (p.$sm ? 28 : 36)}px;
  height: ${(p) => (p.$sm ? 28 : 36)}px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: ${(p) => p.$bg};
  color: ${t.inkSoft};
  font-size: ${(p) => (p.$sm ? 11 : 13)}px;
  font-weight: 700;
  display: grid;
  place-items: center;
  overflow: hidden;

  img { width: 100%; height: 100%; object-fit: cover; }
`;

const AddBtn = styled.button`
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 0;
  border-radius: 10px;
  padding: 9px 12px;
  background: ${t.ink};
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover { background: ${t.ink2}; }
  &:disabled { opacity: 0.45; cursor: default; }
`;

const Ghost = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid ${t.line};
  border-radius: 10px;
  padding: 8px 12px;
  background: #fff;
  color: ${t.ink};
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover { background: ${t.bgSoft}; }
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Upsell = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid ${t.accentRing};
  background: ${t.accentSoft};
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 16px;

  > svg { color: ${t.accent}; flex: 0 0 auto; }
  > div { flex: 1; min-width: 0; }
  b { display: block; font-size: 15px; }
  span { color: ${t.inkSoft}; font-size: 13px; line-height: 1.5; }
  a, button { margin-top: 0 !important; flex: 0 0 auto; }

  @media (max-width: 640px) {
    flex-wrap: wrap;
    a, button { width: 100%; justify-content: center; }
  }
`;

const Teasers = styled.div`
  margin-top: 16px;

  .ghosts { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 8px; margin-bottom: 12px; }
  .ghost {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: ${t.muted};
    border: 1px dashed ${t.line};
    border-radius: 12px;
    padding: 12px;
    filter: blur(0.3px);
  }
`;

const ShipBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border: 1px solid ${t.line};
  border-radius: 18px;
  padding: 16px;
  margin-bottom: 12px;

  b { display: block; font-size: 15px; }
  span { color: ${t.muted}; font-size: 13px; }
  .act { display: flex; gap: 8px; flex-wrap: wrap; }

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Rows = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid ${t.line};
  border-radius: 18px;
  overflow: hidden;

  li {
    display: grid;
    grid-template-columns: 36px minmax(120px, 1fr) minmax(160px, 1.4fr) auto;
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
    border-top: 1px solid ${t.lineSoft};
  }

  li:first-child { border-top: 0; }
  .who b { display: block; font-size: 14px; }
  .who span { color: ${t.muted}; font-size: 13px; }
  .addr { margin: 0; font: inherit; font-size: 13px; color: ${t.inkSoft}; white-space: pre-line; line-height: 1.45; }

  @media (max-width: 720px) {
    li { grid-template-columns: 36px 1fr; }
    .addr, .st { grid-column: 2; }
  }
`;

const Done = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: ${t.green};
  font-size: 13px;
  font-weight: 600;
`;

const UndoBtn = styled.button`
  border: 0;
  background: none;
  padding: 0 0 0 6px;
  font: inherit;
  color: ${t.muted};
  text-decoration: underline;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const ContentGrid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;

  li { border: 1px solid ${t.line}; border-radius: 18px; overflow: hidden; }
  .cover { position: relative; aspect-ratio: 9 / 12; }
  .cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .tag { position: absolute; top: 8px; left: 8px; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 999px; background: rgba(255, 255, 255, 0.94); color: ${t.inkSoft}; }
  .tag.ok { background: ${t.green}; color: #fff; }
  .meta { padding: 12px 14px; font-size: 13px; color: ${t.muted}; }
  .meta b { display: block; color: ${t.ink}; font-size: 14px; margin-bottom: 4px; }
  .links { display: grid; gap: 4px; }
  .links a { color: ${t.ink}; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; }
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(17, 18, 20, 0.4);
  display: grid;
  place-items: center;
  padding: 16px;

  form {
    width: 100%;
    max-width: 560px;
    max-height: calc(100dvh - 32px);
    overflow: auto;
    background: #fff;
    border-radius: 20px;
    padding: 22px;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
  }

  .head { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
  .head h2 { font-size: 19px; margin: 0 0 4px; }
  .head p { margin: 0; color: ${t.muted}; font-size: 14px; }
  .head button { border: 0; background: none; cursor: pointer; color: ${t.muted}; align-self: flex-start; }
  .agreed { font-size: 13px; color: ${t.inkSoft}; background: ${t.bgSoft}; border-radius: 12px; padding: 10px 12px; margin-bottom: 14px; }

  label { display: block; margin-bottom: 12px; position: relative; }
  label span { display: block; font-size: 13px; font-weight: 600; margin-bottom: 5px; }
  label em { position: absolute; right: 8px; bottom: 8px; font-style: normal; font-size: 11px; color: ${t.accent}; }

  input, textarea {
    width: 100%;
    border: 1px solid ${t.line};
    border-radius: 12px;
    padding: 10px 12px;
    font: inherit;
    font-size: 14px;
    resize: vertical;
    box-sizing: border-box;
  }

  input:focus, textarea:focus { outline: none; border-color: ${t.ink}; box-shadow: 0 0 0 3px ${t.lineSoft}; }
  .foot { display: flex; justify-content: flex-end; align-items: center; gap: 16px; margin-top: 6px; }
`;
