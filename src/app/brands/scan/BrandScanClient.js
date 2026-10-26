'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { Sparkles, Users, TrendingUp } from 'lucide-react';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';
import ScanInput from './ScanInput';
import { ScanTurn, useScanTurns } from './ScanReport';
import { pollScan, startScan } from './scanApi';
import { scan } from './theme';

const PAGE_URL = 'https://newcollab.co/brands/scan';

// ============================================================================
// LAYOUT
// ============================================================================

const Page = styled.div`
  min-height: 100vh;
  background: ${scan.bg};
  padding: 120px 16px 160px;
`;

const Column = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

const Hero = styled.div`
  text-align: center;
  padding: 8vh 0 32px;

  h1 {
    font-size: clamp(28px, 4.4vw, 40px);
    line-height: 1.15;
    letter-spacing: -0.02em;
    font-weight: 700 !important;
    color: ${scan.ink};
    margin-bottom: 12px;
  }

  p {
    font-size: 16px;
    line-height: 1.6;
    color: ${scan.muted};
    max-width: 560px;
    margin: 0 auto 28px;
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600 !important;
  color: ${scan.accent};
  background: ${scan.accentSoft};
  border-radius: 999px;
  padding: 5px 12px;
  margin-bottom: 18px;
`;

const Learn = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 40px;
  text-align: left;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }

  div {
    border: 1px solid ${scan.lineSoft};
    border-radius: 14px;
    padding: 16px;
    background: ${scan.bgSoft};
  }

  strong {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600 !important;
    color: ${scan.ink};
    margin-bottom: 4px;
  }

  span {
    font-size: 13px;
    line-height: 1.5;
    color: ${scan.muted};
  }
`;

const Dock = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px 16px 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 32%);
  z-index: 20;

  > div {
    max-width: 760px;
    margin: 0 auto;
  }
`;

// ============================================================================
// PAGE
// ============================================================================

export default function BrandScanClient() {
  const params = useSearchParams();
  const ref = useRef(params.get('ref') || params.get('utm_source') || 'scan_page');
  const started = useRef(false);
  const start = useCallback((brand) => startScan(brand, ref.current), []);
  const { turns, run, busy } = useScanTurns({ start, poll: pollScan, source: ref.current });

  useEffect(() => {
    const b = params.get('b');
    if (b && !started.current) {
      started.current = true;
      run(b);
    }
  }, [params, run]);

  useEffect(() => {
    if (turns.length) {
      const last = document.getElementById(`turn-${turns[turns.length - 1].id}`);
      if (last) last.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [turns.length]);

  return (
    <LandingPageLayoutNext canonicalUrl={PAGE_URL}>
      <Page>
        <Column>
          {turns.length === 0 ? (
            <Hero>
              <Badge><Sparkles size={13} /> Brand Scan · free</Badge>
              <h1>Which brand&apos;s creators do you want to see?</h1>
              <p>Type any brand. See the TikTok creators posting about it, the hooks they repeat, and the videos that win. Then get creators like them posting for you.</p>
              <ScanInput onSubmit={run} large autoFocus />
              <Learn>
                <div><strong><Users size={15} /> Every creator</strong><span>Who posts about the brand, their size, and whether they were gifted or paid.</span></div>
                <div><strong><Sparkles size={15} /> Hooks that repeat</strong><span>The opening lines creators reuse. That&apos;s the brand&apos;s creator script.</span></div>
                <div><strong><TrendingUp size={15} /> Videos that win</strong><span>Top posts by views, ready to brief your own creators on.</span></div>
              </Learn>
            </Hero>
          ) : (
            turns.map((t) => <ScanTurn key={t.id} turn={t} />)
          )}
        </Column>
      </Page>
      {turns.length > 0 && (
        <Dock>
          <div><ScanInput onSubmit={run} busy={busy} chips={false} placeholder="Scan another brand…" /></div>
        </Dock>
      )}
    </LandingPageLayoutNext>
  );
}
