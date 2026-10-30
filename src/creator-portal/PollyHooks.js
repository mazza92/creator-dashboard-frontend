import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Mail } from 'lucide-react';
import { apiClient } from '../config/api';
import { DeepAnswer, Thinking } from '../app/brands/scan/ScanReport';
import { POLL_MS, POLL_TIMEOUT_MS } from '../app/brands/scan/scanApi';

// "Hooks that work in my niche": the brand workspace's deep answer (opening lines, formats, brands), read from
// creators the creator's size (POST/GET /api/polly/hooks). Re-opening a scan in the thread is free.
// Slow scans: after SLOW_MS the chat says they can leave; if they do, the backend emails them when it's ready
// (creator_hooks.notify_ready), with a link back here (?hooks=<scan_id> scrolls to this playbook).
const SLOW_MS = 40 * 1000;

export default function CreatorHooks({ hooks, onBrand }) {
  const [scan, setScan] = useState(hooks?.scan || null);
  const [error, setError] = useState('');
  const [slow, setSlow] = useState(false);
  const [waitedOut, setWaitedOut] = useState(false);
  const ref = useRef(null);

  useEffect(() => {  // opened from the "playbook ready" email: bring this playbook into view
    const wanted = new URLSearchParams(window.location.search).get('hooks');
    if (wanted && String(wanted) === String(hooks?.scan_id) && ref.current) {
      setTimeout(() => ref.current && ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' }), 400);
    }
  }, [hooks?.scan_id]);

  useEffect(() => {
    if (!hooks?.scan_id) return undefined;
    let cancelled = false;
    const began = Date.now();
    const tick = async () => {
      try {
        const { data } = await apiClient.get(`/api/polly/hooks/${hooks.scan_id}`);
        if (cancelled) return;
        if (!data?.success) throw new Error(data?.error || 'Could not load this scan.');
        setScan(data.scan);
        if (data.scan?.status === 'searching') {
          if (Date.now() - began > SLOW_MS) setSlow(true);
          if (Date.now() - began > POLL_TIMEOUT_MS) { setWaitedOut(true); return; }
          setTimeout(tick, POLL_MS);
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.error || err.message);
      }
    };
    if (hooks.scan?.status && hooks.scan.status !== 'searching') setScan(hooks.scan);
    else tick();
    return () => { cancelled = true; };
  }, [hooks?.scan_id, hooks?.scan]);

  if (error) return <Note>{error}</Note>;
  if (waitedOut) {
    return <Note ref={ref}>Still scanning. I'll email you as soon as your playbook is ready, and it'll be right here.</Note>;
  }
  if (!scan || scan.status === 'searching') {
    return (
      <Wrap ref={ref}>
        <Thinking step={scan?.step || 1} line={scan?.line || 'Searching TikTok in your niche…'} deep queries={scan?.queries} />
        {slow && (
          <Slow role="status">
            <Mail size={15} aria-hidden="true" />
            <span>Taking a bit longer than usual. You can leave this page: I'll email you when your playbook is ready.</span>
          </Slow>
        )}
      </Wrap>
    );
  }
  if (!(scan.sections || []).length) {
    return <Note>{scan.summary || "I couldn't find enough recent posts in your niche yet. Try again tomorrow."}</Note>;
  }
  return (
    <Wrap ref={ref}>
      <DeepAnswer report={{ ...scan, top_videos: [], matches: null, followups: [] }} onBrand={onBrand} />
    </Wrap>
  );
}

const Wrap = styled.div`
  margin-top: 12px;
  min-width: 0;
  width: 100%;
`;

const Note = styled.div`
  margin-top: 10px;
  font-size: 14px;
  color: #4b5563;
`;

const Slow = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #eef6f3;
  color: #095a46;
  font-size: 14px;
  line-height: 1.45;
  svg { flex-shrink: 0; margin-top: 2px; }
`;
