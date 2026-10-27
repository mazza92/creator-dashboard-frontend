import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { apiClient } from '../config/api';
import { DeepAnswer, Thinking } from '../app/brands/scan/ScanReport';
import { POLL_MS, POLL_TIMEOUT_MS } from '../app/brands/scan/scanApi';

// "Hooks that work in my niche": the brand workspace's deep answer (opening lines, formats, brands), read from
// creators the creator's size (POST/GET /api/polly/hooks). Re-opening a scan in the thread is free.

export default function CreatorHooks({ hooks, onBrand }) {
  const [scan, setScan] = useState(hooks?.scan || null);
  const [error, setError] = useState('');

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
          if (Date.now() - began > POLL_TIMEOUT_MS) throw new Error('This one is taking longer than usual. Open it again in a minute.');
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
  if (!scan || scan.status === 'searching') {
    return (
      <Wrap>
        <Thinking step={scan?.step || 1} line={scan?.line || 'Searching TikTok in your niche…'} deep queries={scan?.queries} />
      </Wrap>
    );
  }
  if (!(scan.sections || []).length) {
    return <Note>{scan.summary || "I couldn't find enough recent posts in your niche yet. Try again tomorrow."}</Note>;
  }
  return (
    <Wrap>
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
