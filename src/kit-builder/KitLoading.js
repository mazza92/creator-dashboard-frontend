'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';

export default function KitLoading({ label = 'Loading portfolio', error = false, inset = false }) {
  return (
    <Wrap $inset={inset}>
      <Inner>
        <Mark aria-hidden="true">{error ? '—' : 'N'}</Mark>
        {!error ? <Track><Bar /></Track> : null}
        <Label>{label}</Label>
      </Inner>
    </Wrap>
  );
}

const slide = keyframes`
  0% { transform: translateX(-120%); }
  100% { transform: translateX(320%); }
`;

const Wrap = styled.div`
  min-height: ${p => (p.$inset ? 'calc(100vh - 140px)' : '100vh')};
  padding-top: ${p => (p.$inset ? '40px' : '0')};
  display: grid;
  place-items: center;
  background: #f6f4ef;
  color: #14110e;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
`;
const Inner = styled.div`
  display: grid;
  justify-items: center;
  gap: 16px;
  width: min(220px, 70vw);
`;
const Mark = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: #14110e;
  color: #f6f4ef;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -.04em;
`;
const Track = styled.div`
  width: 100%;
  height: 2px;
  border-radius: 99px;
  background: #e6e1d6;
  overflow: hidden;
`;
const Bar = styled.div`
  width: 36%;
  height: 100%;
  border-radius: 99px;
  background: #c4a574;
  animation: ${slide} 1.05s cubic-bezier(.4,0,.2,1) infinite;
`;
const Label = styled.div`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .16em;
  text-transform: uppercase;
  color: #8a8478;
`;
