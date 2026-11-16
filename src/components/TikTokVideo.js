import React, { useEffect, useRef, useState } from 'react';
import { useTikTokMedia } from '../lib/tiktokMedia';

/**
 * A TikTok video from our own storage, filling its (positioned) parent. Plays muted and looping while on screen
 * when `autoPlay`; with `controls` it is a normal player. Until our copy exists it shows the stored cover, and
 * before that nothing: the parent keeps its own placeholder. Never TikTok's embedded player.
 */
export default function TikTokVideo({ id, handle, autoPlay = true, controls = false, className, style, onState }) {
  const media = useTikTokMedia(id, handle);
  const wrap = useRef(null);
  const video = useRef(null);
  const [visible, setVisible] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return undefined; }
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '160px', threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hasVideo = !!(media && media.video && !broken);
  const cover = (media && media.cover) || null;

  useEffect(() => {
    const v = video.current;
    if (!v || !autoPlay || controls) return;
    if (visible) { const p = v.play(); if (p && p.catch) p.catch(() => {}); } else v.pause();
  }, [visible, autoPlay, controls, hasVideo]);

  useEffect(() => { if (onState) onState(hasVideo ? 'video' : cover ? 'cover' : 'none'); }, [hasVideo, cover, onState]);

  const fill = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' };
  return (
    <span ref={wrap} className={className} style={{ ...fill, ...style }}>
      {hasVideo ? (
        <video
          ref={video}
          style={fill}
          src={visible || controls ? media.video : undefined}
          poster={cover || undefined}
          muted={!controls}
          loop={!controls}
          playsInline
          autoPlay={autoPlay && !controls && visible}
          controls={controls}
          preload={controls ? 'metadata' : 'none'}
          onError={() => setBroken(true)}
          aria-label={handle ? `Video by @${handle}` : 'Video'}
        />
      ) : cover ? (
        <img style={fill} src={cover} alt="" loading="lazy" />
      ) : null}
    </span>
  );
}
