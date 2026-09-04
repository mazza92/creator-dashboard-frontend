import React from 'react';
import styled, { keyframes } from 'styled-components';
import { creatorTokens as tokens } from '../../theme/creatorTokens';

const shimmer = keyframes`
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const Bone = styled.div`
  background: linear-gradient(90deg, ${tokens.subtle} 25%, #f7f2e9 50%, ${tokens.subtle} 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
  border-radius: ${(p) => p.$radius || '8px'};
  width: ${(p) => p.$width || '100%'};
  height: ${(p) => p.$height || '16px'};
  flex-shrink: 0;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Card = styled.div`
  background: ${tokens.cream};
  border: 1px solid ${tokens.line};
  border-radius: 20px;
  overflow: hidden;
  box-shadow: ${tokens.shadowCard};
`;

const Body = styled.div`
  padding: 14px 16px 18px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 8px 0 24px;
  grid-column: 1 / -1;

  @media (min-width: 720px) {
    grid-template-columns: ${(p) => (p.$cols === 1 ? '1fr' : '1fr 1fr')};
    gap: 20px;
  }
`;

export function PrBrandCardSkeleton() {
  return (
    <Card aria-hidden="true">
      <Bone $height="clamp(96px, 16vw, 140px)" $radius="0" />
      <Body>
        <Row>
          <Bone $width="44px" $height="44px" $radius="12px" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Bone $width="58%" $height="18px" />
            <div style={{ height: 8 }} />
            <Bone $width="42%" $height="13px" />
          </div>
        </Row>
        <div style={{ height: 14 }} />
        <Bone $width="92%" $height="12px" />
        <div style={{ height: 8 }} />
        <Bone $width="70%" $height="12px" />
        <div style={{ height: 14 }} />
        <Row>
          <Bone $width="72px" $height="24px" $radius="999px" />
          <Bone $width="88px" $height="24px" $radius="999px" />
        </Row>
      </Body>
    </Card>
  );
}

export function PrFeedSkeleton({ count = 4, cols = 2, label = 'Loading brands' }) {
  return (
    <Grid $cols={cols} role="status" aria-live="polite" aria-label={label}>
      {Array.from({ length: count }).map((_, i) => (
        <PrBrandCardSkeleton key={i} />
      ))}
      <VisuallyHidden>Loading…</VisuallyHidden>
    </Grid>
  );
}

export function JobCardSkeleton() {
  return (
    <Card aria-hidden="true" style={{ borderRadius: 14, padding: 18 }}>
      <Row>
        <Bone $width="44px" $height="44px" $radius="12px" />
        <div style={{ flex: 1 }}>
          <Bone $width="46%" $height="16px" />
          <div style={{ height: 8 }} />
          <Bone $width="28%" $height="12px" />
        </div>
        <Bone $width="72px" $height="32px" $radius="10px" />
      </Row>
      <div style={{ height: 14 }} />
      <Bone $width="100%" $height="12px" />
      <div style={{ height: 8 }} />
      <Bone $width="78%" $height="12px" />
    </Card>
  );
}

export function JobFeedSkeleton({ count = 3 }) {
  return (
    <div role="status" aria-live="polite" aria-label="Loading UGC jobs" style={{ display: 'grid', gap: 12, padding: '8px 0 24px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
      <VisuallyHidden>Loading UGC jobs…</VisuallyHidden>
    </div>
  );
}

export function ApplyExamplesSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading recent PR examples">
      <Card style={{ borderRadius: 16, padding: 16, margin: '10px 0' }} aria-hidden="true">
        <Bone $width="48%" $height="18px" />
        <div style={{ height: 14 }} />
        <Row>
          <Bone $width="100%" $height="168px" $radius="14px" />
          <Bone $width="100%" $height="168px" $radius="14px" />
        </Row>
      </Card>
      <VisuallyHidden>Loading recent PR…</VisuallyHidden>
    </div>
  );
}

export function CreditChipSkeleton() {
  return (
    <ChipSkel aria-busy="true" aria-label="Loading credits">
      <Bone $width="88px" $height="12px" $radius="6px" />
      <Bone $width="54px" $height="10px" $radius="6px" />
    </ChipSkel>
  );
}

export function DirMoreSkeleton() {
  return (
    <More role="status" aria-live="polite" aria-label="Loading more brands">
      <Bone $width="160px" $height="12px" $radius="6px" />
    </More>
  );
}

const ChipSkel = styled.div`
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  min-width: 156px;
  padding: 12px 14px;
  background: ${tokens.cream};
  border: 1px solid ${tokens.line};
  border-radius: 16px;
  box-shadow: ${tokens.shadowCard};

  @media (max-width: 800px) {
    flex-direction: row;
    align-items: center;
    width: 100%;
    min-width: 0;
  }
`;

const More = styled.div`
  grid-column: 1 / -1;
  display: grid;
  place-items: center;
  padding: 12px 0 8px;
`;

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
