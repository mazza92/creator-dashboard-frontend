import React from 'react';
import styled from 'styled-components';
import { creatorTokens as t } from '../theme/creatorTokens';

// Polly's weekly Brand Hotlist (backend services/weekly_hotlist.py): fresh brands in the creator's niche that are
// advertising now. Contact on each card writes that pitch (one free pitch on the free plan); the footer offers Pro
// (free) or writes the top 3 (Pro).

const MONO = ['#1f2937', '#b4436c', '#2563eb', '#7c3aed', '#0f766e', '#9a5b00'];

function initials(name) {
  const w = String(name || '').replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  return (w.length > 1 ? w[0][0] + w[1][0] : (w[0] || '?').slice(0, 2)).toUpperCase();
}

// The pills already say "N ads live" / "Gifted N creators your size": the line under them adds only the date.
export function whenLine(b) {
  const r = String(b.reason || '');
  const since = r.match(/since ([A-Z][a-z]{2} \d{1,2}(?:, \d{4})?)/);
  if (since) return `Live since ${since[1]}`;
  const spotted = r.match(/spotted ([A-Z][a-z]{2} \d{1,2}(?:, \d{4})?)/);
  if (spotted) return `Spotted ${spotted[1]}`;
  return b.ads || b.gifted_your_size ? '' : r;
}

export default function PollyHotlistCard({ hotlist, chips = [], onChip, onContact, disabled }) {
  const brands = hotlist?.brands || [];
  if (!brands.length) return null;
  const cta = chips[0];
  const contact = (b) => onContact && onContact({ id: b.brand_id, name: b.brand_name });
  return (
    <Card aria-label="Brand hotlist">
      <Head>
        <span className="k"><span aria-hidden="true">🔥</span> Brand hotlist</span>
        <span className="w">Week of {hotlist.week}</span>
      </Head>
      {hotlist.pro_line ? <ProLine>{hotlist.pro_line}</ProLine> : null}
      <Grid>
        {brands.map((b, i) => (
          <Brand key={b.brand_id}>
            <div className="top">
              {b.logo ? <img className="logo" src={b.logo} alt="" /> : (
                <span className="logo mono" style={{ background: MONO[i % MONO.length] }}>{initials(b.brand_name)}</span>
              )}
              <div className="nm">
                <b>{b.brand_name}</b>
                {b.category ? <span>{b.category}</span> : null}
              </div>
              {b.fresh ? <span className="new">New</span> : null}
            </div>
            <div className="sig">
              {b.ads ? <span className="pill hot">{b.ads} ads live</span>
                : /ads/i.test(b.reason || '') ? <span className="pill hot">Running ads</span> : null}
              {b.creator_style ? <span className="pill">Creator-style ads</span> : null}
              {b.gifted_your_size ? <span className="pill">Gifted {b.gifted_your_size} creator{b.gifted_your_size === 1 ? '' : 's'} your size</span> : null}
            </div>
            {whenLine(b) ? <p className="why">{whenLine(b)}</p> : null}
            <button type="button" disabled={disabled} onClick={() => contact(b)}>Contact</button>
          </Brand>
        ))}
      </Grid>
      {cta ? (
        <Foot>
          {hotlist.is_pro ? null : <span>Pro pitches every hot brand for you, every week, from your Gmail.</span>}
          <button type="button" className={hotlist.is_pro ? 'ghost' : 'primary'} disabled={disabled}
            onClick={() => onChip && onChip(cta)}>
            {cta.label}
          </button>
        </Foot>
      ) : null}
    </Card>
  );
}

const Card = styled.div`
  margin-top: 10px;
  width: 100%;
  max-width: 600px;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid ${t.line};
  border-radius: 18px;
  background: ${t.white};
  padding: 14px;
  display: grid;
  gap: 12px;
  font-family: ${t.fontSans};
  color: ${t.ink};
`;

const Head = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
  .k { font-size: 12px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: ${t.hot}; }
  .w { font-size: 12.5px; color: ${t.muted}; font-weight: 600; }
`;

const ProLine = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${t.inkSoft};
  background: ${t.subtle};
  border-radius: 10px;
  padding: 8px 10px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  /* Phones: a swipeable row instead of six stacked cards. */
  @media (max-width: 520px) {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    margin: 0 -14px;
    padding: 0 14px 4px;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    > * { flex: 0 0 78%; scroll-snap-align: start; }
  }
`;

const Brand = styled.div`
  display: grid;
  gap: 8px;
  align-content: start;
  padding: 11px;
  border-radius: 14px;
  border: 1px solid ${t.line};
  background: ${t.paper};
  min-width: 0;

  .top { display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; gap: 10px; align-items: center; }
  .logo { width: 38px; height: 38px; border-radius: 10px; object-fit: contain; background: ${t.white}; border: 1px solid ${t.line}; }
  .mono { display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 13px; border: 0; }
  .nm { display: grid; min-width: 0; }
  .nm b { font-size: 14.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .nm span { font-size: 12px; color: ${t.muted}; text-transform: capitalize; }
  .new { font-size: 10.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; color: ${t.white}; background: ${t.hot}; border-radius: 999px; padding: 2px 7px; }
  .sig { display: flex; flex-wrap: wrap; gap: 5px; }
  .pill { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 999px; background: ${t.white}; border: 1px solid ${t.line}; color: ${t.inkSoft}; }
  .pill.hot { background: #fff1e6; border-color: #f6d3bd; color: ${t.hot}; }
  .why { margin: 0; font-size: 12.5px; color: ${t.muted}; line-height: 1.4; }
  button {
    justify-self: start;
    border: 0;
    border-radius: 999px;
    padding: 8px 16px;
    background: ${t.ink};
    color: ${t.white};
    font: inherit;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }
  button:disabled { opacity: .6; cursor: default; }
`;

const Foot = styled.div`
  display: grid;
  gap: 8px;
  border-top: 1px solid ${t.line};
  padding-top: 12px;
  span { font-size: 13.5px; color: ${t.inkSoft}; }
  button {
    border-radius: 999px;
    padding: 12px 16px;
    font: inherit;
    font-size: 14.5px;
    font-weight: 700;
    cursor: pointer;
  }
  button:disabled { opacity: .6; cursor: default; }
  .primary { background: #e8395f; color: #fff; border: 0; }
  .ghost { background: ${t.white}; color: ${t.ink}; border: 1px solid ${t.line}; }
`;
