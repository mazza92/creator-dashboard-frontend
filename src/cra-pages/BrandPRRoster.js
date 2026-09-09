import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import api from '../config/api';
import { creatorTokens as tokens } from '../theme/creatorTokens';

const INK = tokens.ink;
const MUTE = tokens.muted;
const LINE = tokens.line;
const PAPER = tokens.paper;
const CREAM = tokens.cream;
const WHITE = tokens.white;
const SUBTLE = tokens.subtle;
const FONT = tokens.fontSans;
const GREEN = tokens.accent;
const GREEN_BG = tokens.accentSoft;
const GREEN_DEEP = tokens.accentDeep;
const RADIUS = tokens.radiusCard;
const RADIUS_BTN = tokens.radiusBtn;

function hueFromName(name) {
  let h = 0;
  for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 32% 40%)`;
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

function websiteHref(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return href.replace(/^http:\/\//i, 'https://');
}

function websiteLabel(raw) {
  const href = websiteHref(raw);
  if (!href) return '';
  try {
    return new URL(href).hostname.replace(/^www\./i, '');
  } catch {
    return String(raw)
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .split('/')[0];
  }
}

function socialHandle(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  let text = value.replace(/^@/, '');
  const ig = text.match(/instagram\.com\/([^/?#]+)/i);
  const tt = text.match(/tiktok\.com\/@?([^/?#]+)/i);
  if (ig) text = ig[1];
  if (tt) text = tt[1];
  return text.replace(/^@/, '').split('/')[0];
}

function mediaUrl(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  return value.replace(/^http:\/\//i, 'https://');
}

function formatRegions(regions) {
  if (Array.isArray(regions)) return regions.filter(Boolean).join(' / ');
  if (typeof regions === 'string' && regions.trim()) {
    try {
      const parsed = JSON.parse(regions);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).join(' / ');
    } catch {
      /* plain string */
    }
    return regions.trim();
  }
  return '';
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
  const [logoBroken, setLogoBroken] = useState(false);

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

  const brand = campaign?.brand || {};
  const brandName = brand.name || 'Brand';

  useEffect(() => {
    if (!campaign) return undefined;
    const prev = document.title;
    document.title = `${brandName} · Gifted PR`;
    return () => { document.title = prev; };
  }, [campaign, brandName]);

  useEffect(() => {
    setLogoBroken(false);
  }, [brand.logo]);

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
        <Inner>
          <EmptyState>
            <h1>This roster link isn’t available</h1>
            <p>{error}</p>
          </EmptyState>
        </Inner>
      </Shell>
    );
  }

  const sku = campaign?.sku_note || '';
  const heroProduct = brand.hero_product || sku || 'Gifted PR package';
  const coverImage = mediaUrl(brand.cover_image || '');
  const logoUrl = mediaUrl(brand.logo || '');
  const productStill = coverImage && coverImage !== logoUrl ? coverImage : '';
  const canLock = !locked && selectedIds.length === slotLimit;
  const regionLabel = formatRegions(brand.regions);
  const siteHref = websiteHref(brand.website);
  const siteLabel = websiteLabel(brand.website);
  const ig = socialHandle(brand.instagram);
  const tt = socialHandle(brand.tiktok);
  const showLogo = brand.logo && !logoBroken;
  const dealLine = [
    `Gift ${plural(slotLimit, '1 creator', `${slotLimit} creators`)}`,
    'product + shipping',
    '1 organic',
    '1 UGC · 6 months',
    regionLabel,
  ].filter(Boolean).join(' · ');

  const stepMeta = [
    {
      n: 1,
      label: `Pick ${slotLimit}`,
      hint: locked ? 'Done' : remaining ? `${remaining} left` : 'Ready',
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
      hint: shipped ? 'Inbox' : 'After ship',
      done: false,
    },
  ];

  return (
    <Shell>
      {toast && <Toast role="status">{toast}</Toast>}

      <Chrome>
        <Inner>
          <ChromeTop>
            <Brand>
              {showLogo ? (
                <Logo src={brand.logo} alt="" onError={() => setLogoBroken(true)} />
              ) : (
                <LogoFallback>{initials(brandName)}</LogoFallback>
              )}
              <div>
                <BrandName>{brandName}</BrandName>
                <BrandMeta>Gifted PR · product only</BrandMeta>
              </div>
            </Brand>
            <LinkRow>
              {siteHref && (
                <LinkChip href={siteHref} target="_blank" rel="noopener noreferrer">
                  <span className="wide">{siteLabel}</span>
                  <span className="short">Site</span>
                </LinkChip>
              )}
              {ig && (
                <LinkChip href={`https://www.instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">
                  <span className="wide">Instagram @{ig}</span>
                  <span className="short">IG</span>
                </LinkChip>
              )}
              {tt && (
                <LinkChip href={`https://www.tiktok.com/@${tt}`} target="_blank" rel="noopener noreferrer">
                  <span className="wide">TikTok @{tt}</span>
                  <span className="short">TikTok</span>
                </LinkChip>
              )}
            </LinkRow>
            <StepRow>
              {stepMeta.map((s) => (
                <StepBtn
                  key={s.n}
                  type="button"
                  $on={step === s.n}
                  disabled={(s.n === 2 && !locked) || (s.n === 3 && !shipped)}
                  onClick={() => goStep(s.n)}
                >
                  <StepNum $on={step === s.n}>{s.done ? '✓' : s.n}</StepNum>
                  {s.label}
                  <em className="hint">{s.hint}</em>
                </StepBtn>
              ))}
            </StepRow>
            <Pill>{locked ? (shipped ? 'Shipped' : 'Locked') : 'Open'}</Pill>
          </ChromeTop>
          <ChromeBot>
            <DealMini>
              {productStill ? <Still src={productStill} alt="" /> : null}
              <DealCopy>
                <strong>{heroProduct}</strong>
                <span>{dealLine}</span>
              </DealCopy>
            </DealMini>
          </ChromeBot>
        </Inner>
      </Chrome>

      <Main>
        <Inner>
          {step === 1 && (
            <Layout>
              <div>
                <Head>
                  <h1>
                    {locked
                      ? 'Gift list locked'
                      : remaining
                        ? `Choose ${remaining} more`
                        : `Lock ${slotLimit} to reveal addresses`}
                  </h1>
                  <p>Skip anyone who isn’t a fit. Addresses stay hidden until you lock.</p>
                </Head>

                {!creators.length ? (
                  <EmptyState>
                    <h2>No applications yet</h2>
                    <p>When creators apply for {brandName}, they show up here.</p>
                  </EmptyState>
                ) : (
                  <>
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
                        <SkippedLabel>Skipped</SkippedLabel>
                        {skippedCreators.map((c) => (
                          <SkippedRow key={c.application_id}>
                            <span>{c.name} {c.handle}</span>
                            <button type="button" onClick={() => onSkip(c.application_id)}>Undo</button>
                          </SkippedRow>
                        ))}
                      </SkippedWrap>
                    )}
                  </>
                )}
              </div>

              <Tray>
                <TrayTop>
                  <span>Gift list</span>
                  <b>{selectedIds.length}<i>/{slotLimit}</i></b>
                </TrayTop>
                <Meter>
                  <MeterFill $pct={(selectedIds.length / slotLimit) * 100} />
                </Meter>
                <TraySub>{sku || heroProduct}</TraySub>
                <TraySeats>
                {Array.from({ length: slotLimit }).map((_, i) => {
                  const c = selectedCreators[i];
                  return c ? (
                    <Slot key={c.application_id} $full>
                      <MiniAv $color={hueFromName(c.name)} $img={mediaUrl(c.avatar_url)}>
                        {initials(c.name)}
                      </MiniAv>
                      <SlotCopy>
                        <b>{c.name}</b>
                        <em>Seat {i + 1}</em>
                      </SlotCopy>
                      {!locked && (
                        <button type="button" onClick={() => onDeselect(c.application_id)}>Remove</button>
                      )}
                    </Slot>
                  ) : (
                    <Slot key={`empty-${i}`} $empty>Seat {i + 1} empty</Slot>
                  );
                })}
                </TraySeats>
                <Go type="button" disabled={busy || !canLock} onClick={onLock}>
                  {locked
                    ? 'List locked'
                    : canLock
                      ? 'Lock list & export'
                      : `Add ${remaining} more`}
                </Go>
              </Tray>
            </Layout>
          )}

          {step === 2 && (
            <>
              <Head>
                <h1>Ship from Shopify or ShipStation</h1>
                <p>Download the CSV, import it the way you already ship, then mark this roster shipped.</p>
              </Head>
              <ShipBar>
                <BtnPrimary type="button" onClick={downloadCsv}>Download shipping CSV</BtnPrimary>
                <BtnGhost type="button" disabled={busy || shipped} onClick={onMarkShipped}>
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
                        <td>{sku || heroProduct}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </>
          )}

          {step === 3 && (
            <>
              <Head>
                <h1>Content inbox</h1>
                <p>Organic links and UGC files land here. Reuse in ads for 6 months.</p>
              </Head>
              {billing?.needs_subscribe ? (
                <Paywall>
                  <div>
                    <PaywallTitle>Continue with Gifted UGC — $299/mo</PaywallTitle>
                    <PaywallSub>Next month: {slotLimit} more creators, same 6-month ad reuse.</PaywallSub>
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
                    <PaywallSub>Next roster can mint anytime.</PaywallSub>
                  </div>
                  <BtnGhost type="button" disabled={checkoutBusy} onClick={onManageBilling}>Manage billing</BtnGhost>
                </Paywall>
              ) : null}
              <Inbox>
                {selectedCreators.map((c) => {
                  const ready = c.status === 'posted';
                  const cover = mediaUrl(c.posts?.[0]?.thumbnail_url);
                  return (
                    <Piece key={c.application_id}>
                      <Ph $ready={ready} $color={hueFromName(c.name)} $img={cover}>
                        {ready ? 'UGC ready' : 'Waiting on their post'}
                      </Ph>
                      <Meta>
                        <b>{c.name}</b>
                        {ready ? <Ok>Organic + UGC file ready</Ok> : 'Usually 5–10 days after delivery'}
                      </Meta>
                    </Piece>
                  );
                })}
              </Inbox>
            </>
          )}
        </Inner>
      </Main>

      <Foot>
        <Inner $bar>
          <span>Newcollab · hosted roster · no login</span>
          <span>Creators apply at app.newcollab.co/register/creator</span>
        </Inner>
      </Foot>

      <Drawer $open={!!drawer} onClick={(e) => e.target === e.currentTarget && setDrawerId(null)}>
        {drawer && (
          <Panel>
            <More type="button" onClick={() => setDrawerId(null)}>Close</More>
            <Av $color={hueFromName(drawer.name)} $img={mediaUrl(drawer.avatar_url)} style={{ width: 56, height: 56, marginTop: 8 }}>
              <span>{initials(drawer.name)}</span>
            </Av>
            <h2>{drawer.name}</h2>
            <LocationLine countryCode={drawer.country_code} country={drawer.country}>
              {[drawer.handle, drawer.city].filter(Boolean).join(' · ')}
            </LocationLine>
            <SocialRow socials={drawer.socials} />
            <Bio>Applied for a gifted PR package from {brandName}.</Bio>
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
                  $img={mediaUrl(p.thumbnail_url)}
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
  instagram: { src: 'https://cdn.simpleicons.org/instagram/12141a', label: 'Instagram' },
  tiktok: { src: 'https://cdn.simpleicons.org/tiktok/12141a', label: 'TikTok' },
  youtube: { src: 'https://cdn.simpleicons.org/youtube/12141a', label: 'YouTube' },
};

function LocationLine({ countryCode, country, children }) {
  return (
    <Loc>
      {countryCode ? (
        <Flag
          src={`https://flagcdn.com/w40/${countryCode}.png`}
          srcSet={`https://flagcdn.com/w80/${countryCode}.png 2x`}
          alt={country || countryCode.toUpperCase()}
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

function Cover({ src, color }) {
  const [broken, setBroken] = useState(false);
  const url = mediaUrl(src);
  if (url && !broken) {
    return <img src={url} alt="" onError={() => setBroken(true)} />;
  }
  return <i style={{ background: color }} />;
}

function CreatorCard({ c, selected, locked, busy, onApprove, onSkip, onOpen }) {
  const color = hueFromName(c.name);
  const thumbs = (c.posts || []).map((p) => p.thumbnail_url).filter(Boolean);
  if (c.avatar_url && !thumbs.includes(c.avatar_url) && thumbs.length < 3) {
    thumbs.push(c.avatar_url);
  }
  const collage = thumbs.length >= 2;
  const where = [c.handle, c.city].filter(Boolean).join(' · ') || 'Creator';
  return (
    <Card $on={selected}>
      <LookThumbs type="button" onClick={() => onOpen(c.application_id)} aria-label={`See posts from ${c.name}`} $solo={!collage}>
        <LookBig><Cover src={thumbs[0]} color={color} /></LookBig>
        {collage && (
          <LookStack $one={!thumbs[2]}>
            <LookSmall><Cover src={thumbs[1]} color={color} /></LookSmall>
            {thumbs[2] ? <LookSmall><Cover src={thumbs[2]} color={color} /></LookSmall> : null}
          </LookStack>
        )}
        {selected ? <Picked>Added</Picked> : null}
      </LookThumbs>
      <CardBody>
        <Who>
          <Av $color={color} $sm $img={mediaUrl(c.avatar_url)}>
            <span>{initials(c.name)}</span>
          </Av>
          <div>
            <NameLine>
              <h3>{c.name}</h3>
              {c.followers_label ? <Followers>{c.followers_label}</Followers> : null}
            </NameLine>
            <LocationLine countryCode={c.country_code} country={c.country}>{where}</LocationLine>
          </div>
        </Who>
        {(c.niche || c.country_code) && (
          <Chips>
            {c.niche ? <i>{c.niche}</i> : null}
            {c.country_code ? <i>{c.country_code.toUpperCase()}</i> : null}
          </Chips>
        )}
        {!locked && (
          <Actions>
            <BtnYes type="button" disabled={busy || selected} onClick={() => onApprove(c.application_id)}>
              {selected ? 'Added' : 'Add'}
            </BtnYes>
            <BtnNo type="button" disabled={busy} onClick={() => onSkip(c.application_id)}>Skip</BtnNo>
          </Actions>
        )}
        {locked && selected && <StatusLine>On your gift list</StatusLine>}
      </CardBody>
    </Card>
  );
}

const Shell = styled.div`
  min-height: 100vh;
  min-height: 100dvh;
  background: ${PAPER};
  font-family: ${FONT};
  color: ${INK};
  overflow-x: clip;
  *, *::before, *::after { box-sizing: border-box; }
`;
const Inner = styled.div`
  width: 100%;
  max-width: 1360px;
  margin: 0 auto;
  padding: 0 28px;
  box-sizing: border-box;
  ${(p) => p.$bar ? `
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  ` : ''}
  @media (max-width: 720px) {
    padding: 0 16px;
    ${(p) => p.$bar ? 'align-items: flex-start; flex-wrap: wrap;' : ''}
  }
`;
const LoadingNote = styled.p`
  padding: 80px 24px;
  text-align: center;
  color: ${MUTE};
  font-weight: 600;
`;
const EmptyState = styled.div`
  padding: 48px 16px;
  text-align: center;
  background: ${CREAM};
  border: 1px solid ${LINE};
  border-radius: ${RADIUS};
  h1, h2 { font-size: 20px; margin: 0 0 8px; }
  p { color: ${MUTE}; margin: 0 auto; max-width: 28rem; line-height: 1.5; }
`;
const Chrome = styled.header`
  position: sticky;
  top: 0;
  z-index: 20;
  background: ${CREAM};
  border-bottom: 1px solid ${LINE};
  padding: 12px 0 10px;
  padding-top: max(12px, env(safe-area-inset-top));
  overflow-x: hidden;
  @media (max-width: 720px) {
    padding: 10px 0 8px;
    padding-top: max(10px, env(safe-area-inset-top));
  }
`;
const ChromeTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px 12px;
  min-width: 0;
  @media (max-width: 900px) { flex-wrap: wrap; }
  @media (max-width: 720px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
  }
`;
const ChromeBot = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid ${LINE};
`;
const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex-shrink: 0;
  @media (max-width: 720px) { min-width: 0; }
`;
const Logo = styled.img`
  width: 36px;
  height: 36px;
  object-fit: contain;
  background: ${WHITE};
  border: 1px solid ${LINE};
  border-radius: 9px;
  flex-shrink: 0;
`;
const LogoFallback = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: ${INK};
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
`;
const BrandName = styled.div`
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -.02em;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
const BrandMeta = styled.div`
  margin-top: 1px;
  font-size: 12px;
  color: ${MUTE};
`;
const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
  flex: 1;
  @media (max-width: 720px) {
    grid-column: 1 / -1;
    flex: none;
  }
`;
const LinkChip = styled.a`
  font-size: 12px;
  font-weight: 600;
  color: ${INK};
  text-decoration: none;
  background: ${WHITE};
  border: 1px solid ${LINE};
  border-radius: 999px;
  padding: 4px 9px;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  .short { display: none; }
  &:hover { background: ${SUBTLE}; }
  @media (max-width: 720px) {
    max-width: 100%;
    .wide { display: none; }
    .short { display: inline; }
  }
`;
const Pill = styled.div`
  flex-shrink: 0;
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .04em;
  text-transform: uppercase;
  color: ${GREEN_DEEP};
  background: ${GREEN_BG};
  border: 1px solid ${tokens.accentBorder};
  border-radius: 999px;
  padding: 6px 10px;
  @media (max-width: 720px) {
    margin-left: 0;
    grid-column: 2;
    grid-row: 1;
  }
`;
const DealMini = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;
const Still = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid ${LINE};
  flex-shrink: 0;
  background: ${SUBTLE};
`;
const DealCopy = styled.div`
  min-width: 0;
  strong {
    display: block;
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  span {
    display: block;
    margin-top: 2px;
    font-size: 12px;
    color: ${MUTE};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 720px) {
    span {
      white-space: normal;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
`;
const StepRow = styled.nav`
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: auto;
  @media (max-width: 900px) {
    width: 100%;
    margin-left: 0;
    order: 3;
  }
  @media (max-width: 720px) {
    grid-column: 1 / -1;
    order: 0;
  }
`;
const StepBtn = styled.button`
  border: 0;
  background: ${(p) => (p.$on ? INK : SUBTLE)};
  color: ${(p) => (p.$on ? '#fff' : MUTE)};
  border-radius: 999px;
  padding: 6px 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 650;
  font-family: inherit;
  cursor: pointer;
  min-height: 34px;
  white-space: nowrap;
  em { font-style: normal; font-weight: 500; opacity: .75; }
  &:disabled { opacity: .45; cursor: not-allowed; }
  @media (max-width: 1200px) {
    em.hint { display: none; }
  }
  @media (max-width: 900px) { flex: 1; justify-content: center; }
`;
const StepNum = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${(p) => (p.$on ? 'rgba(255,255,255,.18)' : LINE)};
  color: inherit;
  font-size: 10px;
  display: grid;
  place-items: center;
`;
const Main = styled.main`
  padding: 18px 0 48px;
  @media (max-width: 720px) {
    padding: 14px 0 132px;
  }
`;
const Head = styled.div`
  margin-bottom: 14px;
  h1 { font-size: 18px; font-weight: 700; letter-spacing: -.02em; margin: 0 0 3px; }
  p { margin: 0; font-size: 13px; color: ${MUTE}; }
`;
const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 16px;
  align-items: start;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;
const Card = styled.article`
  background: ${WHITE};
  border: 1px solid ${(p) => (p.$on ? GREEN : LINE)};
  box-shadow: ${(p) => (p.$on ? `0 0 0 1px ${GREEN}` : 'none')};
  border-radius: ${RADIUS};
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;
const LookThumbs = styled.button`
  display: grid;
  grid-template-columns: ${(p) => (p.$solo ? '1fr' : '1.45fr 1fr')};
  gap: 2px;
  aspect-ratio: 4 / 3;
  background: ${SUBTLE};
  border: 0;
  padding: 0;
  cursor: pointer;
  width: 100%;
  overflow: hidden;
  position: relative;
  img, i {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  i { font-style: normal; }
`;
const LookBig = styled.div` min-width: 0; min-height: 0; overflow: hidden; `;
const LookStack = styled.div`
  display: grid;
  grid-template-rows: ${(p) => (p.$one ? '1fr' : '1fr 1fr')};
  gap: 2px;
  min-width: 0;
  min-height: 0;
`;
const LookSmall = styled.div` min-width: 0; min-height: 0; overflow: hidden; `;
const Picked = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  background: ${GREEN};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  border-radius: 999px;
  padding: 3px 8px;
`;
const CardBody = styled.div`
  padding: 10px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;
const Who = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  h3 {
    font-size: 14px;
    font-weight: 700;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  > div { min-width: 0; flex: 1; }
`;
const NameLine = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`;
const Followers = styled.b`
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  color: ${INK};
`;
const Loc = styled.p`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${MUTE};
  margin: 2px 0 0;
  min-width: 0;
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;
const Flag = styled.img`
  width: 16px;
  height: 12px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
`;
const Chips = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  i {
    font-style: normal;
    font-size: 11px;
    font-weight: 600;
    color: ${MUTE};
    background: ${SUBTLE};
    border-radius: 999px;
    padding: 3px 8px;
  }
`;
const StatusLine = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: ${GREEN_DEEP};
`;
const Socials = styled.div` display: flex; gap: 8px; margin-top: 8px; `;
const SocialLink = styled.a`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid ${LINE};
  background: ${WHITE};
  display: grid;
  place-items: center;
  img { width: 14px; height: 14px; }
`;
const Av = styled.div`
  flex: 0 0 ${(p) => (p.$sm ? '32px' : '48px')};
  width: ${(p) => (p.$sm ? '32px' : '48px')};
  height: ${(p) => (p.$sm ? '32px' : '48px')};
  min-width: ${(p) => (p.$sm ? '32px' : '48px')};
  min-height: ${(p) => (p.$sm ? '32px' : '48px')};
  max-width: ${(p) => (p.$sm ? '32px' : '48px')};
  max-height: ${(p) => (p.$sm ? '32px' : '48px')};
  align-self: center;
  border-radius: 50%;
  background-color: ${(p) => p.$color};
  background-image: ${(p) => (p.$img ? `url("${p.$img}")` : 'none')};
  background-size: cover;
  background-position: center;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: ${(p) => (p.$sm ? '10px' : '14px')};
  overflow: hidden;
  span { display: ${(p) => (p.$img ? 'none' : 'grid')}; }
`;
const Stats = styled.div`
  display: flex;
  gap: 16px;
  margin: 12px 0;
  font-size: 12px;
  color: ${MUTE};
  b { color: ${INK}; display: block; font-size: 14px; }
`;
const Actions = styled.div` display: flex; gap: 8px; margin-top: auto; `;
const BtnYes = styled.button`
  flex: 1;
  border: 0;
  border-radius: ${RADIUS_BTN};
  padding: 10px;
  font-weight: 650;
  font-size: 13px;
  background: ${INK};
  color: #fff;
  font-family: inherit;
  cursor: pointer;
  min-height: 40px;
  &:disabled { background: ${GREEN}; cursor: default; }
`;
const BtnNo = styled.button`
  flex: 0 0 88px;
  @media (max-width: 720px) { flex: 0 0 96px; }
  border: 1px solid ${LINE};
  border-radius: ${RADIUS_BTN};
  padding: 10px;
  font-weight: 650;
  font-size: 13px;
  background: ${CREAM};
  color: ${INK};
  font-family: inherit;
  cursor: pointer;
  min-height: 40px;
  &:disabled { opacity: .5; }
`;
const More = styled.button`
  border: 0;
  background: none;
  font-size: 13px;
  font-weight: 600;
  color: ${MUTE};
  font-family: inherit;
  cursor: pointer;
  padding: 8px 0;
  &:hover { color: ${INK}; }
`;
const SkippedWrap = styled.div`
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid ${LINE};
`;
const SkippedLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: ${MUTE};
  margin-bottom: 6px;
`;
const SkippedRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: ${MUTE};
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
  background: ${WHITE};
  border: 1px solid ${LINE};
  border-radius: ${RADIUS};
  padding: 14px;
  position: sticky;
  top: 118px;
  min-width: 0;
  @media (max-width: 720px) {
    position: fixed;
    top: auto;
    left: 12px;
    right: 12px;
    bottom: max(10px, env(safe-area-inset-bottom));
    z-index: 25;
    padding: 10px 12px;
    box-shadow: 0 10px 28px rgba(18, 20, 26, 0.14);
  }
`;
const TrayTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: ${MUTE}; }
  b {
    font-size: 18px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    line-height: 1;
    flex-shrink: 0;
    i { font-style: normal; color: ${MUTE}; font-weight: 650; }
  }
`;
const Meter = styled.div`
  height: 6px;
  background: ${SUBTLE};
  border-radius: 99px;
  overflow: hidden;
  margin: 10px 0 8px;
  @media (max-width: 720px) { margin: 8px 0 0; }
`;
const MeterFill = styled.div`
  height: 100%;
  width: ${(p) => Math.min(100, p.$pct || 0)}%;
  background: ${GREEN};
`;
const TraySub = styled.p`
  font-size: 12px;
  color: ${MUTE};
  margin: 0 0 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media (max-width: 720px) { display: none; }
`;
const TraySeats = styled.div`
  @media (max-width: 720px) {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    margin-top: 8px;
    padding-bottom: 2px;
    > * { flex: 0 0 160px; margin-bottom: 0; }
  }
`;
const Slot = styled.div`
  border: 1px ${(p) => (p.$full ? 'solid' : 'dashed')} ${LINE};
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 13px;
  color: ${(p) => (p.$full ? INK : MUTE)};
  background: ${(p) => (p.$full ? GREEN_BG : 'transparent')};
  margin-bottom: 6px;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 8px;
  ${(p) => p.$empty ? `
    @media (max-width: 720px) { display: none; }
  ` : ''}
  button {
    border: 0;
    background: none;
    color: ${MUTE};
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    flex-shrink: 0;
  }
`;
const SlotCopy = styled.div`
  min-width: 0;
  flex: 1;
  b { display: block; font-size: 13px; }
  em { display: block; font-style: normal; font-size: 11px; color: ${MUTE}; }
`;
const MiniAv = styled.div`
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${(p) => p.$color};
  background-image: ${(p) => (p.$img ? `url("${p.$img}")` : 'none')};
  background-size: cover;
  background-position: center;
  font-size: 10px;
  font-weight: 700;
  overflow: hidden;
  display: grid;
  place-items: center;
  color: ${(p) => (p.$img ? 'transparent' : '#fff')};
`;
const Go = styled.button`
  width: 100%;
  margin-top: 8px;
  @media (max-width: 720px) { min-height: 42px; padding: 10px; }
  border: 0;
  background: ${INK};
  color: #fff;
  border-radius: ${RADIUS_BTN};
  padding: 12px;
  font-weight: 700;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  min-height: 44px;
  &:disabled { background: #d8d4cc; color: #8a8478; cursor: default; }
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
  margin-bottom: 16px;
  padding: 16px;
  border-radius: ${RADIUS};
  border: 1px solid ${(p) => (p.$quiet ? LINE : GREEN)};
  background: ${(p) => (p.$quiet ? CREAM : GREEN_BG)};
`;
const PaywallTitle = styled.div` font-weight: 700; font-size: 15px; margin-bottom: 4px; `;
const PaywallSub = styled.div` color: ${MUTE}; font-size: 13px; `;
const BtnPrimary = styled.button`
  border: 0;
  border-radius: ${RADIUS_BTN};
  padding: 12px 16px;
  font-weight: 700;
  font-size: 14px;
  background: ${INK};
  color: #fff;
  font-family: inherit;
  cursor: pointer;
  min-height: 44px;
  &:disabled { opacity: .5; }
`;
const BtnGhost = styled.button`
  border: 1px solid ${LINE};
  border-radius: ${RADIUS_BTN};
  padding: 12px 16px;
  font-weight: 650;
  font-size: 14px;
  background: ${CREAM};
  color: ${INK};
  font-family: inherit;
  cursor: pointer;
  min-height: 44px;
  &:disabled { opacity: .5; }
`;
const TableWrap = styled.div`
  background: ${CREAM};
  border-radius: ${RADIUS};
  overflow: auto;
  border: 1px solid ${LINE};
  table { width: 100%; border-collapse: collapse; min-width: 520px; }
  th, td { text-align: left; padding: 12px 14px; font-size: 13px; border-bottom: 1px solid ${LINE}; vertical-align: top; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: ${MUTE}; background: ${SUBTLE}; }
  tr:last-child td { border-bottom: 0; }
`;
const Muted = styled.span` color: ${MUTE}; `;
const Inbox = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
`;
const Piece = styled.div`
  background: ${CREAM};
  border-radius: ${RADIUS};
  overflow: hidden;
  border: 1px solid ${LINE};
`;
const Ph = styled.div`
  height: 150px;
  font-size: 12px;
  font-weight: 700;
  color: ${(p) => (p.$ready ? '#fff' : MUTE)};
  padding: 12px;
  display: flex;
  align-items: flex-end;
  background: ${(p) => (
    p.$img
      ? `linear-gradient(180deg, transparent 40%, rgba(18,20,26,.55)), center/cover url("${p.$img}")`
      : (p.$ready ? p.$color : SUBTLE)
  )};
`;
const Meta = styled.div`
  padding: 12px;
  font-size: 13px;
  color: ${MUTE};
  b { display: block; font-size: 14px; color: ${INK}; margin-bottom: 4px; }
`;
const Ok = styled.span` color: ${GREEN_DEEP}; font-weight: 700; `;
const Drawer = styled.div`
  display: ${(p) => (p.$open ? 'flex' : 'none')};
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 40;
  justify-content: flex-end;
`;
const Panel = styled.div`
  width: 400px;
  max-width: 100%;
  background: ${CREAM};
  height: 100%;
  height: 100dvh;
  overflow: auto;
  padding: 20px;
  h2 { font-size: 22px; margin: 8px 0; }
  @media (max-width: 720px) {
    width: 100%;
    padding: 16px;
    padding-bottom: max(16px, env(safe-area-inset-bottom));
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
`;
const Bio = styled.p`
  font-size: 14px;
  color: ${MUTE};
  line-height: 1.5;
  margin: 10px 0 0;
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
const Foot = styled.footer`
  border-top: 1px solid ${LINE};
  padding: 16px 0 24px;
  font-size: 12px;
  color: ${MUTE};
  @media (max-width: 720px) {
    padding-bottom: 24px;
    ${Inner} {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }
`;
