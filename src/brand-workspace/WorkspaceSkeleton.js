// Loading state for the brand workspace: the real layout (sidebar + chat pane) in shimmering placeholders, so
// auth check, lazy chunk and workspace data all show the same screen instead of three different loaders.
// Kept tiny and eager-loaded (App.js uses it before the workspace chunk arrives).
import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% { background-position: -480px 0; }
  100% { background-position: 480px 0; }
`;

export const Bone = styled.div`
  height: ${(p) => p.$h || 14}px;
  width: ${(p) => p.$w || '100%'};
  border-radius: ${(p) => p.$r || 8}px;
  margin: ${(p) => p.$m || '0 0 10px'};
  background: linear-gradient(90deg, #f0f1f3 0%, #f8f8f9 50%, #f0f1f3 100%);
  background-size: 960px 100%;
  animation: ${shimmer} 1.3s linear infinite;
`;

const Shell = styled.div`
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: #fff;

  *, *::before, *::after { box-sizing: border-box; }
`;

const Side = styled.aside`
  position: fixed;
  inset: 0 auto 0 0;
  width: 260px;
  background: #fbfbfc;
  border-right: 1px solid #f0f1f3;
  padding: 18px 14px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Main = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: 0 20px;

  @media (max-width: 900px) {
    margin-left: 0;
    padding: 0 16px;
  }
`;

const Pane = styled.div`
  max-width: 780px;
  margin: 0 auto;
  padding-top: 12vh;

  @media (max-width: 560px) {
    padding-top: 72px;
  }
`;

const Center = styled.div`
  display: flex;
  justify-content: center;
`;

export function ListSkeleton({ rows = 3 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => <Bone key={i} $h={72} $r={14} $m="0 0 10px" />)}
    </div>
  );
}

export default function WorkspaceSkeleton() {
  return (
    <Shell role="status" aria-label="Loading your workspace">
      <Side aria-hidden="true">
        <Bone $w="58%" $h={18} $m="4px 0 22px" />
        <Bone $h={38} $r={10} $m="0 0 16px" />
        {[78, 64, 70, 60].map((w) => <Bone key={w} $w={`${w}%`} $h={16} $m="0 0 16px 6px" />)}
        <Bone $w="40%" $h={12} $m="28px 0 14px 6px" />
        {[66, 52, 58].map((w) => <Bone key={w} $w={`${w}%`} $h={12} $m="0 0 14px 6px" />)}
      </Side>
      <Main aria-hidden="true">
        <Pane>
          <Center><Bone $w="62%" $h={34} $r={10} $m="0 0 26px" /></Center>
          <Bone $h={112} $r={20} $m="0 0 12px" />
          <Bone $w="38%" $h={12} $m="0 0 40px 4px" />
          <Bone $w="24%" $h={14} $m="0 0 16px" />
          {[0, 1, 2, 3].map((i) => <Bone key={i} $h={58} $r={12} $m="0 0 10px" />)}
        </Pane>
      </Main>
    </Shell>
  );
}
