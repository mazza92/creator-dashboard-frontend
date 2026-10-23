import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { apiClient } from '../config/api';
import { creatorTokens as t } from '../theme/creatorTokens';

const POLL_MS = 4000;
const MAX_POLLS = 75;

const Card = styled.div`
  margin-top: 12px;
  background: ${t.white};
  border: 1px solid ${t.line};
  border-radius: 18px;
  padding: 14px 16px;
  font-family: ${t.fontSans};
  color: ${t.ink};
  min-width: 0;
  .kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${t.accent}; }
  .title { font-size: 16px; font-weight: 700; margin-top: 4px; }
  .intro { font-size: 13.5px; color: ${t.inkSoft}; line-height: 1.5; margin-top: 6px; }
  .caveat { font-size: 12px; color: ${t.muted}; line-height: 1.45; margin-top: 6px; font-style: italic; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.45; }
  50% { opacity: 1; }
`;

const Working = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  font-size: 13.5px;
  color: ${t.inkSoft};
  .dot { width: 8px; height: 8px; border-radius: 50%; background: ${t.accent}; animation: ${pulse} 1.2s ease-in-out infinite; }
`;

const Brand = styled.section`
  border-top: 1px solid ${t.line};
  margin-top: 12px;
  padding-top: 12px;
  .head { display: flex; gap: 10px; align-items: flex-start; }
  .logo {
    width: 40px; height: 40px; border-radius: 10px; flex: 0 0 40px; background: ${t.line};
    display: flex; align-items: center; justify-content: center; overflow: hidden; font-weight: 700;
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  .name { font-size: 14.5px; font-weight: 700; }
  .name small { font-weight: 500; color: ${t.muted}; font-size: 12.5px; }
  .meta { font-size: 12.5px; color: ${t.muted}; margin-top: 2px; }
  .badges { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .badge { font-size: 11.5px; font-weight: 600; border: 1px solid ${t.line}; border-radius: 999px; padding: 2px 8px; }
  .evidence { font-size: 12.5px; color: ${t.inkSoft}; margin-top: 6px; }
`;

const Videos = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 10px;
  a {
    display: block; text-decoration: none; color: ${t.ink}; border: 1px solid ${t.line};
    border-radius: 12px; overflow: hidden; min-width: 0; background: ${t.white};
  }
  .thumb { aspect-ratio: 9 / 14; background: ${t.line}; }
  .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .cap { padding: 6px 8px; font-size: 11.5px; line-height: 1.35; }
  .cap b { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .cap span { color: ${t.muted}; }
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const Btn = styled.button`
  border: 1px solid ${(p) => (p.$primary ? t.ink : t.line)};
  background: ${(p) => (p.$primary ? t.ink : t.white)};
  color: ${(p) => (p.$primary ? t.white : t.ink)};
  border-radius: 999px;
  padding: 7px 14px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: default; }
`;

const Foot = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid ${t.line};
  margin-top: 12px;
  padding-top: 12px;
`;

function VideoTile({ video }) {
  const [broken, setBroken] = useState(false);
  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer">
      <div className="thumb">
        {video.thumb && !broken ? (
          <img src={video.thumb} alt="" loading="lazy" onError={() => setBroken(true)} />
        ) : null}
      </div>
      <div className="cap">
        <b>@{video.handle}</b>
        <span>{video.followers} followers</span>
        <br />
        <span>{video.views} views{video.age ? ` · ${video.age}` : ''}</span>
      </div>
    </a>
  );
}

/** Gifting Radar result: polls while the TikTok search runs, then brand sections with example videos. */
export default function GiftingRadar({ radar: initial, busy, onChip }) {
  const [radar, setRadar] = useState(initial);
  const [asked, setAsked] = useState({});
  const polls = useRef(0);

  useEffect(() => { setRadar(initial); }, [initial]);

  const runId = radar?.run_id;
  const searching = radar?.status === 'searching';

  useEffect(() => {
    if (!runId || (!searching && initial?.status !== 'searching')) return undefined;
    let cancelled = false;
    let timer = null;
    const tick = () => {
      polls.current += 1;
      apiClient.get(`/api/polly/radar/${runId}`)
        .then((res) => {
          if (cancelled || !res.data?.radar) return;
          setRadar(res.data.radar);
          if (res.data.radar.status === 'searching' && polls.current < MAX_POLLS) timer = setTimeout(tick, POLL_MS);
        })
        .catch(() => { if (!cancelled && polls.current < MAX_POLLS) timer = setTimeout(tick, POLL_MS * 2); });
    };
    timer = setTimeout(tick, searching ? POLL_MS : 0);
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId]);

  if (!radar) return null;

  const findContact = (brand) => {
    setAsked((a) => ({ ...a, [brand.discovered_brand_id]: true }));
    apiClient.post('/api/polly/radar/contact', { discovered_brand_id: brand.discovered_brand_id }).catch(() => {});
  };

  const pitch = (brand) => onChip({
    id: 'radar_pitch',
    label: `Pitch ${brand.name}`,
    action: 'generate_pitch',
    skip_discovery: true,
    brand_id: brand.brand_id,
    brand_name: brand.name,
    radar: { niche: radar.niche, evidence: brand.evidence_data },
  });

  return (
    <Card>
      <div className="kicker">Gifting Radar · beta</div>
      <div className="title">{radar.title}</div>
      {searching ? (
        <Working><span className="dot" />{radar.line}</Working>
      ) : (
        <>
          {radar.intro ? <div className="intro">{radar.intro}</div> : null}
          {radar.caveat ? <div className="caveat">{radar.caveat}</div> : null}
        </>
      )}
      {!searching && (radar.brands || []).map((brand, i) => (
        <Brand key={brand.id}>
          <div className="head">
            <div className="logo">
              {brand.logo ? <img src={brand.logo} alt="" /> : (brand.name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="name">
                {(radar.offset || 0) + i + 1}. {brand.name} <small>· {brand.headline}</small>
              </div>
              <div className="meta">{[brand.category, brand.ships].filter(Boolean).join(' · ')}</div>
              <div className="badges">
                {(brand.badges || []).map((b) => <span className="badge" key={b}>{b}</span>)}
              </div>
              <div className="evidence">{brand.evidence}</div>
            </div>
          </div>
          {brand.videos?.length ? (
            <Videos>
              {brand.videos.map((v) => <VideoTile key={v.url} video={v} />)}
            </Videos>
          ) : null}
          <Actions>
            {brand.contact === 'pitch' && brand.brand_id ? (
              <Btn type="button" $primary disabled={busy} onClick={() => pitch(brand)}>Pitch {brand.name}</Btn>
            ) : null}
            {brand.contact === 'apply' && brand.application_form_url ? (
              <Btn type="button" $primary as="a" href={brand.application_form_url} target="_blank" rel="noopener noreferrer">
                Apply to {brand.name}
              </Btn>
            ) : null}
            {brand.contact === 'find_contact' ? (
              <Btn type="button" disabled={asked[brand.discovered_brand_id]} onClick={() => findContact(brand)}>
                {asked[brand.discovered_brand_id] ? "On it, I'll add their contact" : 'Ask Polly to find their contact'}
              </Btn>
            ) : null}
          </Actions>
        </Brand>
      ))}
      {!searching && (
        <Foot>
          {radar.has_more ? (
            <Btn type="button" disabled={busy} onClick={() => onChip({ id: 'radar_more', label: 'Show more brands', action: 'gifting_radar', skip_discovery: true })}>
              Show more brands
            </Btn>
          ) : null}
          <Btn
            type="button"
            disabled={busy}
            onClick={() => onChip({ id: 'radar_paid', label: 'Find paid partnerships instead', action: 'gifting_radar', signal_type: 'paid', skip_discovery: true })}
          >
            Find paid partnerships instead
          </Btn>
        </Foot>
      )}
    </Card>
  );
}
