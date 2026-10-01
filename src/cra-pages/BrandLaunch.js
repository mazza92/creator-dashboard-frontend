import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import api from '../config/api';

const INK = '#12141a';
const MUTE = '#6e6e73';
const LINE = '#e6e6ea';
const CREAM = '#fbfaf7';
const GREEN = '#1f8a5b';
const GREEN_BG = '#eef8f2';

const NICHES = ['skincare', 'beauty', 'haircare', 'supplements', 'fitness', 'fashion', 'food', 'home', 'pet', 'baby'];

function titleCase(s) {
  return String(s || '').replace(/\b\w/g, (c) => c.toUpperCase());
}

function cardKey(c, i) {
  return c.handle || `anon-${i}`;
}

export default function BrandLaunch() {
  const [params, setParams] = useSearchParams();
  const niche = (params.get('niche') || 'skincare').trim().toLowerCase();
  const platform = params.get('platform') || 'all';
  const country = params.get('country') || '';
  const utm = useMemo(() => ({
    source: params.get('utm_source') || 'direct',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
  }), [params]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState([]);
  const [form, setForm] = useState({ brand_name: '', brand_email: '', brand_website: '', product_name: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    setPicked([]);
    api.get('/api/v1/integrations/search-creators', {
      params: { niche, platform, country: country || undefined, limit: 8 },
      timeout: 15000,
    })
      .then(({ data: payload }) => { if (!cancelled) setData(payload); })
      .catch((err) => { if (!cancelled) setError(err.response?.data?.error || 'Could not load creators'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [niche, platform, country]);

  useEffect(() => {
    const prev = document.title;
    document.title = `Vetted ${titleCase(niche)} UGC creators · Newcollab`;
    return () => { document.title = prev; };
  }, [niche]);

  const creators = data?.creators || [];
  const total = data?.total_creators_found || 0;
  const label = titleCase(niche);

  function switchNiche(next) {
    const p = new URLSearchParams(params);
    p.set('niche', next);
    setParams(p, { replace: true });
  }

  function togglePick(key) {
    setPicked((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : [...cur, key].slice(0, 5)));
  }

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    if (!form.brand_name.trim() || !form.brand_email.includes('@') || !form.brand_website.trim() || !form.product_name.trim()) {
      setFormError('Add your brand, work email, website and the product you want to gift.');
      return;
    }
    const chosen = creators.filter((c, i) => picked.includes(cardKey(c, i)));
    const requested = chosen.map((c) => c.handle || `${(c.niches || [])[0] || label} creator (${c.followers})`);
    const notes = [
      `Source: /brands/launch (utm_source=${utm.source}${utm.medium ? `, utm_medium=${utm.medium}` : ''}${utm.campaign ? `, utm_campaign=${utm.campaign}` : ''})`,
      `Niche: ${niche}${country ? `, country: ${country}` : ''}${platform !== 'all' ? `, platform: ${platform}` : ''}`,
      requested.length ? `Requested creators: ${requested.join(', ')}` : 'No creators pre-selected',
    ].join('\n');
    setSending(true);
    try {
      await api.post('/api/opportunities/public/submit', {
        brand_name: form.brand_name.trim(),
        brand_email: form.brand_email.trim(),
        brand_website: form.brand_website.trim(),
        brand_category: niche,
        product_name: form.product_name.trim(),
        campaign_description: `Gifted seeding of ${form.product_name.trim()} with ${label} UGC creators: 1 organic post + 1 UGC asset with 6-month ad usage, product + shipping only.`,
        creator_count_range: '3-5',
        spots_total: 5,
        creator_niches: [niche],
        shipping_regions: country ? [country] : [],
        content_types: ['UGC', 'Organic post'],
        additional_notes: notes,
      });
      setSent(true);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Could not submit. Try again or email team@newcollab.co.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Page>
      <Top>
        <Inner>
          <Logo href="https://newcollab.co">Newcollab</Logo>
          <TopNote>Gifted UGC · no agency fee</TopNote>
        </Inner>
      </Top>

      <Inner>
        <Banner>
          Welcome! You’re viewing vetted creators for <b>{label}</b>. Create your gifted seeding roster below.
        </Banner>

        <Hero>
          <h1>{total ? `${total} vetted ${label} creators` : `Vetted ${label} creators`} ready for gifted UGC</h1>
          <p>
            Creators apply to your product, you pick up to 5 on a private roster, then export a shipping CSV for
            Shopify or ShipStation. Each creator posts organically and delivers UGC you can run as ads for 6 months.
            You pay product + shipping only.
          </p>
        </Hero>

        <Chips>
          {NICHES.map((n) => (
            <Chip key={n} type="button" $on={n === niche} onClick={() => switchNiche(n)}>{titleCase(n)}</Chip>
          ))}
        </Chips>

        <Layout>
          <div>
            {loading ? (
              <Muted>Loading {label} creators…</Muted>
            ) : error ? (
              <Muted>{error}</Muted>
            ) : !creators.length ? (
              <Empty>
                <b>No {label} creators listed yet.</b>
                <span>Start a roster anyway. We open it to creators in your niche and you only pick the ones you like.</span>
              </Empty>
            ) : (
              <Grid>
                {creators.map((c, i) => {
                  const key = cardKey(c, i);
                  const on = picked.includes(key);
                  return (
                    <Card key={key} $on={on}>
                      <CardHead>
                        <div>
                          <Handle>{c.handle || `${titleCase((c.niches || [])[0] || label)} creator`}</Handle>
                          <Sub>{[c.platform, c.country].filter(Boolean).join(' · ') || 'Creator'}</Sub>
                        </div>
                        <Pick type="button" $on={on} onClick={() => togglePick(key)}>{on ? 'Added' : 'Add'}</Pick>
                      </CardHead>
                      <Stats>
                        <span><b>{c.followers}</b> followers</span>
                        {c.engagement_rate ? <span><b>{c.engagement_rate}</b> engagement</span> : null}
                        {c.avg_views ? <span><b>{c.avg_views}</b> avg views</span> : null}
                        {c.gifted_collabs ? <span><b>{c.gifted_collabs}</b> gifted collabs</span> : null}
                      </Stats>
                      <Tags>{(c.niches || []).map((n) => <Tag key={n}>{n}</Tag>)}</Tags>
                      {c.preview_url ? (
                        <KitLink href={c.preview_url} target="_blank" rel="noopener noreferrer">View media kit</KitLink>
                      ) : (
                        <Private>Full profile visible on your private roster</Private>
                      )}
                    </Card>
                  );
                })}
              </Grid>
            )}
          </div>

          <Side>
            {sent ? (
              <Done>
                <h2>You’re in.</h2>
                <p>
                  We’ll open your private {label} roster and email the link to {form.brand_email} within 24 hours.
                  Pick up to 5 creators there, then export shipping in one click.
                </p>
              </Done>
            ) : (
              <form onSubmit={submit}>
                <h2>Select roster &amp; export shipping CSV</h2>
                <SideSub>
                  {picked.length
                    ? `${picked.length} creator${picked.length === 1 ? '' : 's'} added. We’ll invite them first.`
                    : 'Add creators you like, or skip and we’ll match you.'}
                </SideSub>
                <Field placeholder="Brand name" value={form.brand_name} onChange={(e) => setField('brand_name', e.target.value)} />
                <Field type="email" placeholder="Work email" value={form.brand_email} onChange={(e) => setField('brand_email', e.target.value)} />
                <Field placeholder="Website" value={form.brand_website} onChange={(e) => setField('brand_website', e.target.value)} />
                <Field placeholder="Product to gift (e.g. Vitamin C serum)" value={form.product_name} onChange={(e) => setField('product_name', e.target.value)} />
                {formError ? <Err>{formError}</Err> : null}
                <Go type="submit" disabled={sending}>{sending ? 'Starting…' : 'Start my free gifted roster'}</Go>
                <Fine>No platform fee on your first campaign. No login, you get a private link.</Fine>
              </form>
            )}
          </Side>
        </Layout>
      </Inner>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  background: ${CREAM};
  color: ${INK};
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding-bottom: 48px;
`;
const Inner = styled.div`
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 20px;
`;
const Top = styled.header`
  border-bottom: 1px solid ${LINE};
  background: #fff;
  ${Inner} { display: flex; align-items: center; justify-content: space-between; height: 56px; }
`;
const Logo = styled.a`
  font-weight: 800;
  letter-spacing: -.02em;
  color: ${INK};
  text-decoration: none;
`;
const TopNote = styled.span` font-size: 13px; color: ${MUTE}; `;
const Banner = styled.div`
  margin: 20px 0 0;
  padding: 10px 14px;
  border-radius: 10px;
  background: ${GREEN_BG};
  border: 1px solid #cfe9da;
  font-size: 14px;
`;
const Hero = styled.div`
  margin: 22px 0 14px;
  h1 { font-size: 28px; letter-spacing: -.03em; margin: 0 0 8px; line-height: 1.15; }
  p { margin: 0; color: ${MUTE}; font-size: 15px; line-height: 1.55; max-width: 720px; }
`;
const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
`;
const Chip = styled.button`
  border: 1px solid ${(p) => (p.$on ? INK : LINE)};
  background: ${(p) => (p.$on ? INK : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : INK)};
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
`;
const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
`;
const Card = styled.article`
  background: #fff;
  border: 1px solid ${(p) => (p.$on ? GREEN : LINE)};
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
`;
const Handle = styled.div` font-weight: 700; font-size: 15px; word-break: break-all; `;
const Sub = styled.div` font-size: 12px; color: ${MUTE}; margin-top: 2px; `;
const Pick = styled.button`
  border: 1px solid ${(p) => (p.$on ? GREEN : LINE)};
  background: ${(p) => (p.$on ? GREEN_BG : '#fff')};
  color: ${(p) => (p.$on ? GREEN : INK)};
  border-radius: 8px;
  padding: 6px 10px;
  font-weight: 650;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
`;
const Stats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: ${MUTE};
  b { color: ${INK}; }
`;
const Tags = styled.div` display: flex; flex-wrap: wrap; gap: 6px; `;
const Tag = styled.span`
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #f2f1ec;
`;
const KitLink = styled.a`
  font-size: 13px;
  font-weight: 650;
  color: ${INK};
  text-decoration: underline;
  text-underline-offset: 3px;
`;
const Private = styled.span` font-size: 12px; color: ${MUTE}; `;
const Side = styled.aside`
  position: sticky;
  top: 16px;
  background: #fff;
  border: 1px solid ${LINE};
  border-radius: 14px;
  padding: 16px;
  h2 { font-size: 17px; margin: 0 0 4px; letter-spacing: -.02em; }
  form { display: flex; flex-direction: column; gap: 8px; }
`;
const SideSub = styled.p` margin: 0 0 6px; font-size: 13px; color: ${MUTE}; `;
const Field = styled.input`
  border: 1px solid ${LINE};
  border-radius: 10px;
  padding: 11px 12px;
  font-size: 14px;
  font-family: inherit;
  &:focus { outline: 2px solid ${INK}; outline-offset: -1px; }
`;
const Go = styled.button`
  margin-top: 4px;
  border: 0;
  border-radius: 10px;
  background: ${INK};
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  min-height: 44px;
  cursor: pointer;
  font-family: inherit;
  &:disabled { opacity: .6; }
`;
const Fine = styled.p` margin: 4px 0 0; font-size: 12px; color: ${MUTE}; `;
const Err = styled.p` margin: 0; font-size: 13px; color: #b42318; `;
const Done = styled.div`
  p { margin: 6px 0 0; font-size: 14px; line-height: 1.55; color: ${MUTE}; }
`;
const Muted = styled.p` color: ${MUTE}; font-size: 14px; `;
const Empty = styled.div`
  background: #fff;
  border: 1px dashed ${LINE};
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 14px;
  span { color: ${MUTE}; }
`;
