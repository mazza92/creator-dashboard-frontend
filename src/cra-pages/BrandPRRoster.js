import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import api from '../config/api';
import { creatorTokens as tokens } from '../theme/creatorTokens';

const INK = tokens.ink;
const MUTED = tokens.muted;
const LINE = tokens.line;
const BG = tokens.paper;
const CREAM = tokens.cream;
const GREEN = tokens.accent;
const GREEN_BG = tokens.accentSoft;
const GREEN_DEEP = tokens.accentDeep;
const FONT = tokens.fontSans;
const DISPLAY = tokens.fontDisplay;

function hueFromName(name) {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 42% 38%)`;
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function formatShipBlock(ship) {
  if (!ship) return 'Address pending';
  const lines = [
    ship.full_name,
    ship.address_line1,
    ship.address_line2,
    [ship.city, ship.state, ship.zip].filter(Boolean).join(' '),
    ship.country,
  ].filter(Boolean);
  return lines.join('\n');
}

function plural(n, one, many) {
  return n === 1 ? one : many;
}

export default function BrandPRRoster() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [campaign, setCampaign] = useState(null);
  const [creators, setCreators] = useState([]);
  const [billing, setBilling] = useState(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [step, setStep] = useState(1);
  const [drawerId, setDrawerId] = useState(null);
  const [toast, setToast] = useState('');

  const applyPayload = useCallback((data) => {
    if (!data?.success) throw new Error(data?.error || 'Request failed');
    setCampaign(data.campaign);
    setCreators(data.creators || []);
    setBilling(data.billing || null);
    setError('');
    const status = data.campaign?.status;
    if (status === 'shipped') setStep(3);
    else if (status === 'locked') setStep(2);
    else setStep(1);
    return data;
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/api/brand-pr/r/${token}`, { timeout: 20000 });
      applyPayload(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not load this roster');
      setCampaign(null);
      setCreators([]);
    } finally {
      setLoading(false);
    }
  }, [token, applyPayload]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billingFlag = params.get('billing');
    if (billingFlag === 'success') {
      setToast('Subscription started — you can mint the next campaign anytime.');
      params.delete('billing');
      params.delete('session_id');
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', next);
    } else if (billingFlag === 'cancel') {
      setToast('Checkout canceled — you can subscribe anytime from this page.');
      params.delete('billing');
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}`;
      window.history.replaceState({}, '', next);
    }
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedIds = useMemo(
    () => (campaign?.selected_application_ids || []).map(Number),
    [campaign]
  );
  const slotLimit = Number(campaign?.slot_limit) || 5;
  const selectedCreators = useMemo(
    () => selectedIds
      .map((id) => creators.find((c) => c.application_id === id))
      .filter(Boolean),
    [selectedIds, creators]
  );
  const remaining = Math.max(0, slotLimit - selectedIds.length);
  const locked = campaign?.status === 'locked' || campaign?.status === 'shipped';
  const shipped = campaign?.status === 'shipped';
  const drawer = creators.find((c) => c.application_id === drawerId) || null;
  const openCreators = creators.filter((c) => !c.skipped);
  const skippedCreators = creators.filter((c) => c.skipped);

  async function mutate(path, body) {
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/api/brand-pr/r/${token}/${path}`, body || {});
      applyPayload(data);
      return data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Action failed';
      setToast(msg);
      setError(msg);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  async function onApprove(id) {
    try {
      await mutate('select', { application_id: id });
      setToast('Added to your gift list');
    } catch {
      /* toast set */
    }
  }

  async function onDeselect(id) {
    try {
      await mutate('deselect', { application_id: id });
    } catch {
      /* toast set */
    }
  }

  async function onSkip(id) {
    const c = creators.find((x) => x.application_id === id);
    try {
      if (c?.skipped) await mutate('unskip', { application_id: id });
      else await mutate('skip', { application_id: id });
    } catch {
      /* toast set */
    }
  }

  async function onLock() {
    try {
      await mutate('lock');
      setStep(2);
      setToast('Addresses unlocked — export CSV for Shopify');
    } catch {
      /* toast set */
    }
  }

  async function onMarkShipped() {
    try {
      await mutate('mark-shipped');
      setStep(3);
      setToast('Shipped. We’ll collect the posts here.');
    } catch {
      /* toast set */
    }
  }

  async function onSubscribe() {
    setCheckoutBusy(true);
    try {
      const { data } = await api.post(`/api/brand-billing/r/${token}/checkout`, {}, { timeout: 30000 });
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setToast(data?.error || 'Checkout unavailable');
    } catch (err) {
      setToast(err.response?.data?.error || err.message || 'Checkout failed');
    } finally {
      setCheckoutBusy(false);
    }
  }

  async function onManageBilling() {
    setCheckoutBusy(true);
    try {
      const { data } = await api.post(`/api/brand-billing/r/${token}/portal`, {}, { timeout: 30000 });
      if (data?.portal_url) {
        window.location.href = data.portal_url;
        return;
      }
      setToast(data?.error || 'Billing portal unavailable');
    } catch (err) {
      setToast(err.response?.data?.error || err.message || 'Portal failed');
    } finally {
      setCheckoutBusy(false);
    }
  }

  function downloadCsv() {
    window.open(`/api/brand-pr/r/${token}/shipping.csv`, '_blank', 'noopener,noreferrer');
  }

  function goStep(n) {
    if (n === 2 && !locked) return;
    if (n === 3 && !shipped) return;
    setStep(n);
  }

  if (loading) {
    return (
      <Shell>
        <LoadingNote>Opening your private PR roster…</LoadingNote>
      </Shell>
    );
  }

  if (error && !campaign) {
    return (
      <Shell>
        <EmptyState>
          <h1>This roster link isn’t available</h1>
          <p>{error}</p>
        </EmptyState>
      </Shell>
    );
  }

  const brandName = campaign?.brand?.name || 'Brand';
  const brandLogo = campaign?.brand?.logo;
  const sku = campaign?.sku_note || 'One PR package · gifted';
  const canLock = !locked && selectedIds.length === slotLimit;

  const stepMeta = [
    {
      n: 1,
      label: `Pick ${slotLimit}`,
      hint: locked ? 'Done' : remaining ? `${remaining} left` : 'Ready to lock',
      done: locked,
    },
    {
      n: 2,
      label: 'Ship',
      hint: shipped ? 'Done' : locked ? 'CSV ready' : 'After lock',
      done: shipped,
    },
    {
      n: 3,
      label: 'Content',
      hint: shipped ? 'Inbox open' : 'After ship',
      done: false,
    },
  ];

  return (
    <Shell>
      {toast && <Toast role="status">{toast}</Toast>}

      <TopBar>
        <Inner $split $middle>
          <BrandLockup>
            {brandLogo ? <Logo src={brandLogo} alt="" /> : <LogoFallback>{initials(brandName)}</LogoFallback>}
            <div>
              <Eyebrow>Newcollab · Gifted PR</Eyebrow>
              <BrandName>{brandName}</BrandName>
            </div>
          </BrandLockup>
          <QuietNote>Private link · no login · no platform fee</QuietNote>
        </Inner>
      </TopBar>

      <Hero>
        <Inner>
          <h1>
            Gift {plural(slotLimit, 'one creator', `${slotLimit} creators`)}.
            <em>Reuse the UGC in ads.</em>
          </h1>
          {!locked ? (
            <>
              <HeroLead>
                Gift product. They post one organic piece and send you a UGC file
                you can reuse in ads for 6 months. No contracts desk, no DMs, no new software.
              </HeroLead>
              <Exchange>
                <ExCard>
                  <ExKicker>You send</ExKicker>
                  <strong>Product + shipping</strong>
                  <span>CSV drops into Shopify or ShipStation. That’s the cost.</span>
                </ExCard>
                <ExCard $accent>
                  <ExKicker>You get</ExKicker>
                  <strong>1 organic post + 1 UGC file</strong>
                  <span>Yours to reuse for 6 months. Custom to your product.</span>
                </ExCard>
                <ExCard>
                  <ExKicker>Your time today</ExKicker>
                  <strong>About 8 minutes</strong>
                  <span>Pick → lock addresses → export CSV. Content lands here.</span>
                </ExCard>
              </Exchange>
            </>
          ) : (
            <CompactDeal>
              <span>Product + shipping</span>
              <Dot aria-hidden>·</Dot>
              <span>1 organic + 1 UGC</span>
              <Dot aria-hidden>·</Dot>
              <span>Reuse in ads 6 months</span>
            </CompactDeal>
          )}
        </Inner>
      </Hero>

      <Steps>
        <Inner $row $steps>
          {stepMeta.map((s) => (
            <StepBtn
              key={s.n}
              type="button"
              $on={step === s.n}
              $done={s.done}
              disabled={(s.n === 2 && !locked) || (s.n === 3 && !shipped)}
              onClick={() => goStep(s.n)}
            >
              <StepNum>{s.done ? '✓' : s.n}</StepNum>
              <span>
                {s.label}
                <StepHint>{s.hint}</StepHint>
              </span>
            </StepBtn>
          ))}
        </Inner>
      </Steps>

      <Inner>
        {step === 1 && (
          <View>
            <TaskRow>
              <div>
                <TaskTitle>
                  {locked
                    ? 'Your gift list is locked'
                    : remaining
                      ? `Choose ${remaining} more ${plural(remaining, 'creator', 'creators')} to gift`
                      : `Lock ${slotLimit} ${plural(slotLimit, 'creator', 'creators')} to reveal addresses`}
                </TaskTitle>
                <TaskSub>
                  Skip anyone who isn’t a fit. Addresses stay hidden until you lock —
                  you only ship who you picked.
                </TaskSub>
              </div>
              <Need>
                {selectedIds.length}/{slotLimit} on your list
              </Need>
            </TaskRow>

            {!creators.length ? (
              <EmptyState>
                <h2>No applications yet</h2>
                <p>When creators apply for {brandName}, they show up here automatically.</p>
              </EmptyState>
            ) : (
              <Layout>
                <div>
                  <Grid>
                    {openCreators.map((c) => (
                      <CreatorCard
                        key={c.application_id}
                        c={c}
                        selected={selectedIds.includes(c.application_id)}
                        locked={locked}
                        busy={busy}
                        onApprove={onApprove}
                        onSkip={onSkip}
                        onOpen={setDrawerId}
                      />
                    ))}
                  </Grid>
                  {skippedCreators.length > 0 && !locked && (
                    <SkippedWrap>
                      <SkippedLabel>Skipped · not a fit</SkippedLabel>
                      {skippedCreators.map((c) => (
                        <SkippedRow key={c.application_id}>
                          <span>{c.name} {c.handle}</span>
                          <button type="button" onClick={() => onSkip(c.application_id)}>
                            Undo skip
                          </button>
                        </SkippedRow>
                      ))}
                    </SkippedWrap>
                  )}
                </div>

                <Tray>
                  <TrayHead>
                    <h2>Gift list</h2>
                    <Meter>
                      <MeterFill $pct={(selectedIds.length / slotLimit) * 100} />
                    </Meter>
                    <TraySub>
                      {selectedIds.length} of {slotLimit} · {sku}
                    </TraySub>
                  </TrayHead>

                  {Array.from({ length: slotLimit }).map((_, i) => {
                    const c = selectedCreators[i];
                    return c ? (
                      <Slot key={c.application_id} $full>
                        <SlotWho>
                          <MiniAv $color={hueFromName(c.name)} $src={c.avatar_url}>
                            {c.avatar_url ? <img src={c.avatar_url} alt="" /> : initials(c.name)}
                          </MiniAv>
                          <div>
                            <b>{c.name}</b>
                            <em>{c.handle}</em>
                          </div>
                        </SlotWho>
                        {!locked && (
                          <button type="button" onClick={() => onDeselect(c.application_id)}>
                            Remove
                          </button>
                        )}
                      </Slot>
                    ) : (
                      <Slot key={`empty-${i}`}>Waiting for pick {i + 1}</Slot>
                    );
                  })}

                  <Go type="button" disabled={busy || !canLock} onClick={onLock}>
                    {locked
                      ? 'List locked'
                      : canLock
                        ? 'Lock list & reveal addresses'
                        : `Add ${remaining} more to unlock shipping`}
                  </Go>
                  <TrayHelp>
                    {locked
                      ? 'Shipping list is in step 2 — export CSV for Shopify.'
                      : 'Locking is the commit. Then you get a shipping CSV. No extra tools.'}
                  </TrayHelp>
                </Tray>
              </Layout>
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <TaskRow>
              <div>
                <TaskTitle>Ship from Shopify or ShipStation</TaskTitle>
                <TaskSub>
                  Download the CSV, import it the way you already ship orders, then mark
                  this roster shipped. We tell creators a box is coming — you don’t manage DMs.
                </TaskSub>
              </div>
            </TaskRow>
            <ShipBar>
              <BtnPrimary type="button" onClick={downloadCsv}>
                Download shipping CSV
              </BtnPrimary>
              <BtnGhost
                type="button"
                disabled={busy || shipped}
                onClick={onMarkShipped}
              >
                {shipped ? 'Marked shipped' : 'I’ve shipped everyone'}
              </BtnGhost>
            </ShipBar>
            <TableWrap>
              <table>
                <thead>
                  <tr>
                    <th>Creator</th>
                    <th>Ship to</th>
                    <th>What to send</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCreators.map((c) => (
                    <tr key={c.application_id}>
                      <td>
                        <b>{c.name}</b>
                        <br />
                        <Muted>{c.handle}</Muted>
                      </td>
                      <td style={{ whiteSpace: 'pre-line' }}>{formatShipBlock(c.shipping_address)}</td>
                      <td>{sku}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </View>
        )}

        {step === 3 && (
          <View>
            <TaskRow>
              <div>
                <TaskTitle>Your content inbox</TaskTitle>
                <TaskSub>
                  When they post, the organic link and a downloadable UGC file land here.
                  Reuse in ads for 6 months. Come back to this same link — nothing else to log into.
                </TaskSub>
              </div>
            </TaskRow>
            {billing?.needs_subscribe ? (
              <Paywall>
                <div>
                  <PaywallTitle>Continue with Gifted UGC — $299/mo</PaywallTitle>
                  <PaywallSub>
                    First campaign done. Next month: 5 more creators, same 6-month ad reuse.
                    Cancel anytime.
                  </PaywallSub>
                </div>
                <BtnPrimary type="button" disabled={checkoutBusy} onClick={onSubscribe}>
                  {checkoutBusy ? 'Opening checkout…' : 'Subscribe — $299/mo'}
                </BtnPrimary>
              </Paywall>
            ) : null}
            {billing?.subscribed ? (
              <Paywall $quiet>
                <div>
                  <PaywallTitle>Gifted UGC plan active</PaywallTitle>
                  <PaywallSub>Your next roster can mint anytime. Manage billing in Stripe.</PaywallSub>
                </div>
                <BtnGhost type="button" disabled={checkoutBusy} onClick={onManageBilling}>
                  Manage billing
                </BtnGhost>
              </Paywall>
            ) : null}
            <Inbox>
              {selectedCreators.map((c) => {
                const ready = c.status === 'posted';
                const color = hueFromName(c.name);
                const cover = c.posts?.[0]?.thumbnail_url;
                return (
                  <Piece key={c.application_id}>
                    <Ph $ready={ready} $color={color} $img={cover}>
                      {ready ? 'UGC ready' : 'Waiting on their post'}
                    </Ph>
                    <Meta>
                      <b>{c.name}</b>
                      {ready
                        ? <Ok>Organic + UGC file ready to download</Ok>
                        : 'Usually 5–10 days after delivery'}
                    </Meta>
                  </Piece>
                );
              })}
            </Inbox>
          </View>
        )}
      </Inner>

      <Drawer $open={!!drawer} onClick={(e) => e.target === e.currentTarget && setDrawerId(null)}>
        {drawer && (
          <Panel>
            <More type="button" onClick={() => setDrawerId(null)}>Close</More>
            <Av
              $color={hueFromName(drawer.name)}
              $hasImg={!!drawer.avatar_url}
              style={{ width: 56, height: 56, marginTop: 12 }}
            >
              {drawer.avatar_url ? <img src={drawer.avatar_url} alt="" /> : null}
              <span>{initials(drawer.name)}</span>
            </Av>
            <h2>{drawer.name}</h2>
            <LocationLine countryCode={drawer.country_code} country={drawer.country}>
              {[drawer.handle, drawer.city].filter(Boolean).join(' · ')}
            </LocationLine>
            <SocialRow socials={drawer.socials} />
            <Bio>
              Applied for a gifted PR package. You’re reviewing the posts they chose
              as proof they can make content for {brandName}.
            </Bio>
            <Stats>
              <div>
                <b>{drawer.followers_label || '—'}</b>
                followers
              </div>
              {drawer.engagement_label ? (
                <div>
                  <b>{drawer.engagement_label}</b>
                  engagement
                </div>
              ) : null}
            </Stats>
            <BigThumbs>
              {(drawer.posts || []).map((p, i) => (
                <BigThumb
                  key={i}
                  $color={hueFromName(drawer.name)}
                  $img={p.thumbnail_url}
                  href={p.post_url || undefined}
                  target={p.post_url ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  as={p.post_url ? 'a' : 'div'}
                />
              ))}
            </BigThumbs>
            {!locked && !drawer.skipped && (
              <Actions>
                <BtnYes
                  type="button"
                  disabled={busy || selectedIds.includes(drawer.application_id)}
                  onClick={async () => {
                    await onApprove(drawer.application_id);
                    setDrawerId(null);
                  }}
                >
                  Add to gift list
                </BtnYes>
              </Actions>
            )}
          </Panel>
        )}
      </Drawer>
    </Shell>
  );
}

const SOCIAL_ICONS = {
  instagram: { src: 'https://cdn.simpleicons.org/instagram/E4405F', label: 'Instagram' },
  tiktok: { src: 'https://cdn.simpleicons.org/tiktok/000000', label: 'TikTok' },
  youtube: { src: 'https://cdn.simpleicons.org/youtube/FF0000', label: 'YouTube' },
};

function LocationLine({ countryCode, country, children }) {
  return (
    <Loc>
      {countryCode ? (
        <Flag
          src={`https://flagcdn.com/w40/${countryCode}.png`}
          srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
          alt={country || countryCode.toUpperCase()}
          title={country || countryCode.toUpperCase()}
        />
      ) : null}
      <span>{children}</span>
    </Loc>
  );
}

function SocialRow({ socials }) {
  const list = (socials || []).filter((s) => s?.url && SOCIAL_ICONS[s.platform]);
  if (!list.length) return null;
  return (
    <Socials>
      {list.map((s) => {
        const icon = SOCIAL_ICONS[s.platform];
        return (
          <SocialLink
            key={s.platform}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            title={icon.label}
            aria-label={`Open ${icon.label}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img src={icon.src} alt="" />
          </SocialLink>
        );
      })}
    </Socials>
  );
}

function CreatorCard({ c, selected, locked, busy, onApprove, onSkip, onOpen }) {
  const color = hueFromName(c.name);
  return (
    <Card $on={selected} $out={c.skipped}>
      {selected && <OnList>On your list</OnList>}
      <Who>
        <Av $color={color} $hasImg={!!c.avatar_url}>
          {c.avatar_url ? (
            <img src={c.avatar_url} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          ) : null}
          <span>{initials(c.name)}</span>
        </Av>
        <div>
          <h3>{c.name}</h3>
          <LocationLine countryCode={c.country_code} country={c.country}>
            {[c.handle, c.city].filter(Boolean).join(' · ') || 'Creator'}
          </LocationLine>
          <SocialRow socials={c.socials} />
        </div>
      </Who>
      <Stats>
        <div>
          <b>{c.followers_label || '—'}</b>
          followers
        </div>
        <div>
          <b>{c.niche || 'Creator'}</b>
          niche
        </div>
        {c.engagement_label ? (
          <div>
            <b>{c.engagement_label}</b>
            engagement
          </div>
        ) : null}
      </Stats>
      <Thumbs>
        {(c.posts || []).slice(0, 3).map((p, i) => (
          <Thumb
            key={`${c.application_id}-${i}`}
            $color={color}
            $img={p.thumbnail_url}
            href={p.post_url || undefined}
            target={p.post_url ? '_blank' : undefined}
            rel="noopener noreferrer"
            as={p.post_url ? 'a' : 'div'}
          />
        ))}
        {!(c.posts || []).length && (
          <>
            <Thumb $color={color} />
            <Thumb $color={color} />
            <Thumb $color={color} />
          </>
        )}
      </Thumbs>
      <Actions>
        <BtnYes
          type="button"
          disabled={busy || selected || locked}
          onClick={() => onApprove(c.application_id)}
        >
          {selected ? 'Added' : 'Add to gift list'}
        </BtnYes>
        <BtnNo type="button" disabled={busy || locked} onClick={() => onSkip(c.application_id)}>
          Skip
        </BtnNo>
      </Actions>
      <More type="button" onClick={() => onOpen(c.application_id)}>
        See their posts
      </More>
    </Card>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${BG};
  font-family: ${FONT};
  color: ${INK};
  overflow-x: hidden;
  padding-bottom: env(safe-area-inset-bottom, 0);
`;
const Inner = styled.div`
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 28px;
  display: ${(p) => (p.$split || p.$row ? 'flex' : 'block')};
  justify-content: ${(p) => (p.$split ? 'space-between' : 'flex-start')};
  align-items: ${(p) => (p.$middle ? 'center' : p.$split ? 'flex-start' : 'stretch')};
  gap: ${(p) => (p.$steps ? '0' : p.$split ? '24px' : '0')};
  flex-wrap: ${(p) => (p.$steps ? 'nowrap' : p.$split ? 'wrap' : 'nowrap')};
  @media (max-width: 720px) {
    padding: 0 16px;
    ${(p) =>
      p.$split
        ? `
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    `
        : ''}
    ${(p) =>
      p.$steps
        ? `
      padding: 0;
      width: 100%;
    `
        : ''}
  }
`;
const LoadingNote = styled.p`
  padding: 80px 28px;
  text-align: center;
  color: ${MUTED};
  font-weight: 600;
`;
const EmptyState = styled.div`
  padding: 64px 20px;
  text-align: center;
  h1, h2 { font-family: ${DISPLAY}; font-weight: 400; margin: 0 0 10px; }
  p { color: ${MUTED}; margin: 0 auto; max-width: 28rem; line-height: 1.5; }
`;
const TopBar = styled.div`
  background: ${CREAM};
  border-bottom: 1px solid ${LINE};
  padding: 14px 0;
  @media (max-width: 720px) { padding: 12px 0; }
`;
const BrandLockup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;
const Logo = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
  background: #fff;
  border: 1px solid ${LINE};
  border-radius: 10px;
  flex-shrink: 0;
`;
const LogoFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${INK};
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
`;
const Eyebrow = styled.div`
  font-size: 11px;
  font-weight: 650;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: ${GREEN_DEEP};
`;
const BrandName = styled.div`
  font-size: 15px;
  font-weight: 650;
  line-height: 1.25;
  word-break: break-word;
`;
const QuietNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${MUTED};
  font-weight: 500;
  @media (max-width: 720px) {
    font-size: 11px;
    line-height: 1.35;
    padding-left: 52px;
  }
`;
const Hero = styled.section`
  background: ${CREAM};
  padding: 28px 0 8px;
  h1 {
    font-family: ${DISPLAY};
    font-size: clamp(28px, 4vw, 42px);
    font-weight: 400;
    letter-spacing: -.03em;
    line-height: 1.12;
    margin: 0 0 12px;
    max-width: 22ch;
    em {
      font-style: italic;
      color: ${GREEN_DEEP};
      display: block;
    }
  }
  @media (max-width: 720px) {
    padding: 18px 0 4px;
    h1 {
      max-width: none;
      font-size: clamp(26px, 8vw, 34px);
      margin-bottom: 10px;
    }
  }
`;
const HeroLead = styled.p`
  margin: 0 0 22px;
  max-width: 40rem;
  font-size: 16px;
  line-height: 1.5;
  color: ${tokens.inkSoft};
  @media (max-width: 720px) {
    font-size: 15px;
    margin-bottom: 14px;
  }
`;
const CompactDeal = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 0;
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: 12px;
  background: ${GREEN_BG};
  border: 1px solid ${tokens.accentBorder};
  font-size: 13px;
  font-weight: 600;
  color: ${INK};
  line-height: 1.35;
`;
const Dot = styled.span`
  margin: 0 8px;
  color: ${MUTED};
  font-weight: 500;
`;
const Exchange = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding-bottom: 22px;
  @media (max-width: 800px) {
    grid-template-columns: 1fr;
    gap: 8px;
    padding-bottom: 16px;
  }
`;
const ExCard = styled.div`
  background: ${(p) => (p.$accent ? GREEN_BG : tokens.subtle)};
  border: 1px solid ${(p) => (p.$accent ? tokens.accentBorder : 'transparent')};
  border-radius: 14px;
  padding: 14px 16px;
  strong { display: block; font-size: 15px; margin: 2px 0 6px; }
  span { display: block; font-size: 13px; color: ${MUTED}; line-height: 1.4; }
  @media (max-width: 720px) {
    padding: 12px 14px;
    strong { font-size: 14px; }
  }
`;
const ExKicker = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: ${GREEN_DEEP};
`;
const Steps = styled.nav`
  background: ${CREAM};
  border-top: 1px solid ${LINE};
  border-bottom: 1px solid ${LINE};
  position: sticky;
  top: 0;
  z-index: 30;
`;
const StepBtn = styled.button`
  border: 0;
  background: none;
  padding: 14px 18px 12px 0;
  margin-right: 22px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 650;
  color: ${(p) => (p.$on ? INK : MUTED)};
  border-bottom: 2px solid ${(p) => (p.$on ? INK : 'transparent')};
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  min-height: 52px;
  &:disabled { opacity: .38; cursor: not-allowed; }
  @media (max-width: 720px) {
    flex: 1 1 0;
    margin-right: 0;
    padding: 12px 8px 10px;
    gap: 8px;
    font-size: 13px;
    justify-content: center;
    min-width: 0;
    > span { min-width: 0; }
  }
`;
const StepNum = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: ${INK};
  color: #fff;
  font-size: 11px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
`;
const StepHint = styled.span`
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: ${MUTED};
  margin-top: 1px;
  @media (max-width: 720px) {
    font-size: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`;
const View = styled.section`
  padding: 22px 0 56px;
  @media (max-width: 720px) {
    padding: 16px 0 calc(40px + env(safe-area-inset-bottom, 0px));
  }
`;
const TaskRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 18px;
  flex-wrap: wrap;
  @media (max-width: 720px) {
    gap: 10px;
    margin-bottom: 14px;
  }
`;
const TaskTitle = styled.h2`
  font-size: 18px;
  font-weight: 650;
  margin: 0 0 6px;
  letter-spacing: -.02em;
  @media (max-width: 720px) { font-size: 17px; }
`;
const TaskSub = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${MUTED};
  line-height: 1.45;
  max-width: 40rem;
`;
const Need = styled.div`
  font-size: 13px;
  font-weight: 650;
  background: ${GREEN_BG};
  color: ${GREEN_DEEP};
  border-radius: 999px;
  padding: 8px 12px;
  white-space: nowrap;
`;
const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 22px;
  align-items: start;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    > aside {
      order: -1;
      position: static;
    }
  }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;
const Card = styled.article`
  background: ${CREAM};
  border: 1px solid ${(p) => (p.$on ? GREEN : LINE)};
  box-shadow: ${(p) => (p.$on ? `0 0 0 1px ${GREEN}` : 'none')};
  border-radius: 16px;
  padding: 16px;
  position: relative;
  opacity: ${(p) => (p.$out ? 0.45 : 1)};
`;
const OnList = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 11px;
  font-weight: 700;
  color: ${GREEN_DEEP};
  background: ${GREEN_BG};
  border-radius: 999px;
  padding: 4px 8px;
`;
const Who = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding-right: 84px;
  h3 { font-size: 16px; margin: 0; }
`;
const Loc = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${MUTED};
  margin: 3px 0 0;
  min-width: 0;
  span { overflow: hidden; text-overflow: ellipsis; }
`;
const Flag = styled.img`
  width: 16px;
  height: 12px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px rgba(18,20,26,.08);
`;
const Socials = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;
const SocialLink = styled.a`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid ${LINE};
  background: #fff;
  display: grid;
  place-items: center;
  img { width: 16px; height: 16px; display: block; }
  &:hover { border-color: ${INK}; }
`;
const Av = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
  }
  span { position: relative; z-index: 0; }
`;
const Stats = styled.div`
  display: flex;
  gap: 16px;
  margin: 14px 0 12px;
  font-size: 12px;
  color: ${MUTED};
  b { color: ${INK}; display: block; font-size: 14px; }
`;
const Thumbs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px;
`;
const Thumb = styled.div`
  display: block;
  height: 88px;
  border-radius: 8px;
  background: ${(p) => (p.$img ? `center/cover url("${p.$img}")` : p.$color)};
  opacity: ${(p) => (p.$img ? 1 : 0.72)};
`;
const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;
const BtnYes = styled.button`
  flex: 1;
  border: 0;
  border-radius: 10px;
  padding: 10px;
  font-weight: 650;
  font-size: 13px;
  background: ${INK};
  color: #fff;
  font-family: inherit;
  cursor: pointer;
  min-height: 44px;
  &:disabled { background: ${GREEN}; cursor: default; }
`;
const BtnNo = styled.button`
  flex: 0 0 auto;
  min-width: 72px;
  border: 1px solid ${LINE};
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 650;
  font-size: 13px;
  background: ${CREAM};
  color: ${INK};
  font-family: inherit;
  cursor: pointer;
  min-height: 44px;
  &:disabled { opacity: 0.5; cursor: default; }
`;
const More = styled.button`
  border: 0;
  background: none;
  font-size: 12px;
  font-weight: 600;
  color: ${MUTED};
  margin-top: 10px;
  font-family: inherit;
  cursor: pointer;
  padding: 8px 0;
  min-height: 44px;
  &:hover { color: ${INK}; }
`;
const SkippedWrap = styled.div`
  margin-top: 18px;
  padding-top: 12px;
  border-top: 1px dashed ${LINE};
`;
const SkippedLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: ${MUTED};
  margin-bottom: 8px;
`;
const SkippedRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: ${MUTED};
  padding: 6px 0;
  button {
    border: 0;
    background: none;
    color: ${INK};
    font-weight: 650;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
  }
`;
const Tray = styled.aside`
  background: ${CREAM};
  border: 1px solid ${LINE};
  border-radius: 16px;
  padding: 16px;
  position: sticky;
  top: 16px;
`;
const TrayHead = styled.div`
  margin-bottom: 12px;
  h2 { font-size: 15px; margin: 0 0 10px; }
`;
const Meter = styled.div`
  height: 6px;
  background: ${tokens.subtle};
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 8px;
`;
const MeterFill = styled.div`
  height: 100%;
  width: ${(p) => Math.min(100, p.$pct || 0)}%;
  background: ${GREEN};
  transition: width .2s ease;
`;
const TraySub = styled.p`
  font-size: 12px;
  color: ${MUTED};
  margin: 0;
`;
const Slot = styled.div`
  border: 1px ${(p) => (p.$full ? 'solid' : 'dashed')} ${LINE};
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 13px;
  color: ${(p) => (p.$full ? INK : MUTED)};
  background: ${(p) => (p.$full ? GREEN_BG : 'transparent')};
  margin-bottom: 8px;
  min-height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  button {
    border: 0;
    background: none;
    color: ${MUTED};
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
  }
`;
const SlotWho = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  b { display: block; font-size: 13px; }
  em { display: block; font-style: normal; font-size: 11px; color: ${MUTED}; }
`;
const MiniAv = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${(p) => p.$color};
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  overflow: hidden;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  img { width: 100%; height: 100%; object-fit: cover; }
`;
const Go = styled.button`
  width: 100%;
  margin-top: 8px;
  border: 0;
  background: ${INK};
  color: #fff;
  border-radius: 12px;
  padding: 13px 12px;
  font-weight: 700;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  min-height: 48px;
  &:disabled { background: #ddd; color: #888; cursor: default; }
`;
const TrayHelp = styled.p`
  margin: 10px 0 0;
  font-size: 12px;
  color: ${MUTED};
  line-height: 1.4;
`;
const ShipBar = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
  @media (max-width: 720px) {
    flex-direction: column;
    > button { width: 100%; }
  }
`;
const Paywall = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  padding: 16px 18px;
  border-radius: 14px;
  border: 1px solid ${(p) => (p.$quiet ? LINE : GREEN)};
  background: ${(p) => (p.$quiet ? CREAM : GREEN_BG)};
  @media (max-width: 720px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px;
    > button {
      width: 100%;
      min-height: 48px;
    }
  }
`;
const PaywallTitle = styled.div`
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
  @media (max-width: 720px) {
    font-size: 16px;
    letter-spacing: -.01em;
  }
`;
const PaywallSub = styled.div`
  color: ${MUTED};
  font-size: 13px;
  line-height: 1.45;
  max-width: 36rem;
`;
const BtnPrimary = styled.button`
  border: 0;
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 700;
  font-size: 14px;
  background: ${INK};
  color: #fff;
  font-family: inherit;
  cursor: pointer;
  min-height: 44px;
  &:disabled { opacity: 0.5; cursor: default; }
`;
const BtnGhost = styled.button`
  border: 1px solid ${LINE};
  border-radius: 12px;
  padding: 12px 16px;
  font-weight: 650;
  font-size: 14px;
  background: ${CREAM};
  color: ${INK};
  font-family: inherit;
  cursor: pointer;
  min-height: 44px;
  &:disabled { opacity: 0.5; cursor: default; }
`;
const TableWrap = styled.div`
  background: ${CREAM};
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${LINE};
  table { width: 100%; border-collapse: collapse; }
  th, td {
    text-align: left;
    padding: 14px 16px;
    font-size: 13px;
    border-bottom: 1px solid ${LINE};
    vertical-align: top;
  }
  th {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: ${MUTED};
    background: ${tokens.subtle};
  }
  tr:last-child td { border-bottom: 0; }
  @media (max-width: 720px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    table { min-width: 520px; }
    th, td { padding: 12px; }
  }
`;
const Muted = styled.span`color: ${MUTED};`;
const Inbox = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
`;
const Piece = styled.div`
  background: ${CREAM};
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${LINE};
`;
const Ph = styled.div`
  height: 160px;
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.$ready ? '#fff' : MUTED)};
  padding: 12px;
  display: flex;
  align-items: flex-end;
  background: ${(p) => (
    p.$img
      ? `linear-gradient(180deg, transparent 40%, rgba(18,20,26,.55)), center/cover url("${p.$img}")`
      : (p.$ready ? p.$color : tokens.subtle)
  )};
`;
const Meta = styled.div`
  padding: 12px 14px 14px;
  font-size: 13px;
  color: ${MUTED};
  b { display: block; font-size: 14px; color: ${INK}; margin-bottom: 4px; }
`;
const Ok = styled.span`
  color: ${GREEN_DEEP};
  font-weight: 700;
`;
const Drawer = styled.div`
  display: ${(p) => (p.$open ? 'flex' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 40;
  justify-content: flex-end;
`;
const Panel = styled.div`
  width: 420px;
  max-width: 100%;
  background: ${CREAM};
  height: 100%;
  height: 100dvh;
  overflow: auto;
  padding: 22px;
  padding-bottom: calc(22px + env(safe-area-inset-bottom, 0px));
  h2 { font-family: ${DISPLAY}; font-weight: 400; font-size: 24px; margin: 8px 0; }
  @media (max-width: 720px) {
    width: 100%;
    padding: 16px;
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
`;
const Toast = styled.div`
  position: fixed;
  top: max(16px, env(safe-area-inset-top, 16px));
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: ${INK};
  color: #fff;
  border-radius: 999px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 650;
  max-width: calc(100vw - 32px);
  text-align: center;
  box-shadow: ${tokens.shadowHover};
`;
const Bio = styled.p`
  font-size: 14px;
  color: ${MUTED};
  line-height: 1.5;
  margin: 10px 0 16px;
`;
const BigThumbs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
`;
const BigThumb = styled.div`
  height: 120px;
  border-radius: 10px;
  background: ${(p) => (p.$img ? `center/cover url("${p.$img}")` : p.$color)};
`;
