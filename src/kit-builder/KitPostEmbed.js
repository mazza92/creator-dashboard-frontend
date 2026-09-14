import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaInstagram, FaPlay, FaTiktok, FaYoutube } from 'react-icons/fa';
import { getProxiedMediaUrl, getRuntimeApiUrl } from '../config/api';
import { sanitizeExampleUrl } from './themes';

function tiktokPlayerSrc(id, autoplay) {
  const chrome = [
    'music_info=0',
    'description=0',
    'native_context_menu=0',
    'closed_caption=0',
    'progress_bar=0',
    'play_button=0',
    'volume_control=0',
    'fullscreen_button=0',
    'timestamp=0',
    'rel=0',
    'loop=0',
  ].join('&');
  return `https://www.tiktok.com/player/v1/${id}?${chrome}&autoplay=${autoplay ? 1 : 0}`;
}

function instagramEmbedSrc(path, shortcode) {
  const kind = /\/reels?\//i.test(path) ? 'reel' : /\/tv\//i.test(path) ? 'tv' : 'p';
  return `https://www.instagram.com/${kind}/${shortcode}/embed/`;
}

export function parseSocialUrl(raw) {
  const href = sanitizeExampleUrl(raw);
  if (!href) return null;
  let parsed;
  try {
    parsed = new URL(href);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./i, '').toLowerCase();
  const path = parsed.pathname;

  if (host === 'youtu.be') {
    const id = path.replace(/^\//, '').split('/')[0];
    return id ? youtubeMeta(href, id) : { platform: 'youtube', href };
  }
  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    const id = parsed.searchParams.get('v')
      || (path.match(/\/(?:embed|shorts|live)\/([^/?]+)/) || [])[1];
    return id ? youtubeMeta(href, id) : { platform: 'youtube', href };
  }
  if (host.endsWith('instagram.com') || host === 'instagr.am') {
    const shortcode = (path.match(/\/(?:p|reel|reels|tv)\/([^/?]+)/i) || [])[1];
    const embed = shortcode ? instagramEmbedSrc(path, shortcode) : null;
    return {
      platform: 'instagram',
      href,
      poster: null,
      posterPlayer: embed,
      playerSrc: embed,
    };
  }
  if (host.endsWith('tiktok.com')) {
    const id = (path.match(/\/video\/(\d+)/) || [])[1];
    return {
      platform: 'tiktok',
      href,
      id: id || null,
      poster: null,
      posterPlayer: id ? tiktokPlayerSrc(id, false) : null,
      playerSrc: id ? tiktokPlayerSrc(id, true) : null,
    };
  }
  return null;
}

function youtubeMeta(href, id) {
  return {
    platform: 'youtube',
    href,
    poster: `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    playerSrc: `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`,
  };
}

function previewStillSrc(parsed) {
  if (!parsed?.href) return '';
  if (parsed.platform === 'youtube' && parsed.poster) return parsed.poster;
  const base = getRuntimeApiUrl() || '';
  return `${base}/api/portfolio/media-preview?url=${encodeURIComponent(parsed.href)}&as=img`;
}

function PlatformMark({ platform }) {
  if (platform === 'tiktok') return <FaTiktok size={12} />;
  if (platform === 'youtube') return <FaYoutube size={12} />;
  return <FaInstagram size={12} />;
}

export default function KitPostEmbed({ url, poster: posterProp }) {
  const parsed = parseSocialUrl(url);
  const [playing, setPlaying] = useState(false);
  const useSavedStill = !!(posterProp && !parsed?.posterPlayer);
  const savedPoster = useSavedStill ? getProxiedMediaUrl(posterProp) : '';
  const [poster, setPoster] = useState(savedPoster || parsed?.poster || '');
  const [stillFailed, setStillFailed] = useState(false);
  const [stillReady, setStillReady] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setStillFailed(false);
    setStillReady(false);
    if (posterProp && !parsed?.posterPlayer) {
      setPoster(getProxiedMediaUrl(posterProp));
      return undefined;
    }
    if (parsed?.poster) {
      setPoster(parsed.poster);
      return undefined;
    }
    if (parsed?.posterPlayer) {
      if (parsed.platform === 'tiktok' && parsed.href) {
        setPoster(previewStillSrc(parsed));
        return undefined;
      }
      setPoster('');
      return undefined;
    }
    if (!parsed?.href) return undefined;
    setPoster(previewStillSrc(parsed));
    return undefined;
  }, [parsed?.href, parsed?.poster, parsed?.platform, posterProp]);

  if (!parsed) return null;

  const isInstagram = parsed.platform === 'instagram';
  const nativePlay = isInstagram && !!parsed.posterPlayer;
  const canPlayInline = !!parsed.playerSrc;
  const showPosterFrame = !!parsed.posterPlayer && !stillReady && (
    parsed.platform !== 'tiktok' || stillFailed
  );
  const showStill = poster && !stillFailed;

  const open = () => {
    if (canPlayInline) {
      setPlaying(true);
      return;
    }
    window.open(parsed.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      {playing && parsed.playerSrc ? (
        parsed.posterPlayer ? (
            <IdleFrame
              $ig={isInstagram}
              $tt={parsed.platform === 'tiktok'}
              $live
              src={parsed.playerSrc}
              title="Creator video"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
            />
        ) : (
          <iframe
            src={parsed.playerSrc}
            title="Creator video"
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )
      ) : (
        <>
          {showPosterFrame ? (
            <IdleFrame
              $ig={isInstagram}
              $tt={parsed.platform === 'tiktok'}
              $live={nativePlay}
              src={parsed.posterPlayer}
              title={nativePlay ? 'Creator video' : ''}
              tabIndex={nativePlay ? 0 : -1}
              aria-hidden={nativePlay ? undefined : 'true'}
              allow={nativePlay ? 'autoplay; fullscreen; encrypted-media; picture-in-picture' : 'encrypted-media'}
            />
          ) : null}
          {showStill ? (
            <Still
              $on={stillReady}
              src={poster}
              alt=""
              onLoad={() => { setStillFailed(false); setStillReady(true); }}
              onError={(e) => {
                if (parsed.platform === 'youtube' && !e.currentTarget.dataset.fallback) {
                  e.currentTarget.dataset.fallback = '1';
                  e.currentTarget.src = poster.replace('maxresdefault', 'hqdefault');
                  return;
                }
                setStillFailed(true);
                setPoster('');
              }}
            />
          ) : null}
          {!showStill && !showPosterFrame ? (
            <Empty><PlatformMark platform={parsed.platform} /></Empty>
          ) : null}
          {nativePlay ? (
            <Badge><PlatformMark platform={parsed.platform} /></Badge>
          ) : (
            <Hit type="button" onClick={open} aria-label="Play video">
              {parsed.platform === 'tiktok' ? null : <Shade />}
              {parsed.platform === 'tiktok' ? null : <Play><FaPlay size={14} /></Play>}
              <Badge><PlatformMark platform={parsed.platform} /></Badge>
            </Hit>
          )}
        </>
      )}
    </Card>
  );
}

const Card = styled.div`
  position: relative;
  width: 100%;
  max-width: 220px;
  aspect-ratio: 9 / 16;
  overflow: hidden;
  background: #111;
  border-radius: 10px;
  container-type: size;
  iframe, img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    object-fit: cover;
    background: #111;
  }
`;

const IdleFrame = styled.iframe`
  pointer-events: ${p => p.$live ? 'auto' : 'none'};
  ${p => p.$ig ? `
    inset: auto !important;
    width: 326px !important;
    height: 640px !important;
    left: 50% !important;
    top: -54px !important;
    transform: translateX(-50%) scale(max(100cqw / 326px, 100cqh / 326px));
    transform-origin: top center;
  ` : p.$tt ? `
    width: 100% !important;
    height: 100% !important;
    top: 0 !important;
    left: 0 !important;
  ` : `
    width: 124% !important;
    height: 124% !important;
    top: -12% !important;
    left: -12% !important;
  `}
`;

const Still = styled.img`
  z-index: 1;
  opacity: ${p => p.$on ? 1 : 0};
`;

const Empty = styled.div`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  opacity: .55;
`;

const Hit = styled.button`
  position: absolute;
  inset: 0;
  z-index: 2;
  padding: 0;
  border: 0;
  cursor: pointer;
  background: transparent;
`;

const Shade = styled.span`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 48%, rgba(0,0,0,.45) 100%);
  pointer-events: none;
`;

const Play = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 3;
  width: 46px;
  height: 46px;
  margin: -23px 0 0 -23px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(255,255,255,.94);
  color: #111;
  box-shadow: 0 8px 24px rgba(0,0,0,.28);
  pointer-events: none;
  svg { margin-left: 2px; }
`;

const Badge = styled.span`
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 2;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,.55);
  color: #fff;
  pointer-events: none;
`;
