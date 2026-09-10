'use client';

import Link from 'next/link';
import styled from 'styled-components';

const Band = styled.aside`
  margin-top: 40px;
  padding: 28px 32px;
  background: #0f0f0f;
  color: #fff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }
`;

const Copy = styled.div`
  .eyebrow {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #fda4af;
  }

  h2 {
    margin: 0 0 8px;
    font-size: 22px;
    line-height: 1.25;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: #fff;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.55;
    color: #c7c9d0;
    max-width: 520px;
  }
`;

const Cta = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 14px 22px;
  background: #e11d48;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  border-radius: 12px;

  &:hover {
    background: #be123c;
    color: #fff;
  }
`;

export default function ForBrandsCta() {
  return (
    <Band>
      <Copy>
        <p className="eyebrow">For brands</p>
        <h2>Find vetted UGC creators for your brand.</h2>
        <p>
          Gift a PR package, lock shipping, get 5–10 ad-ready videos with 6-month
          commercial use. First campaign free, then $299/month if you opt in.
        </p>
      </Copy>
      <Cta href="/brands/pr-packages">
        Start free campaign
        <span aria-hidden="true">→</span>
      </Cta>
    </Band>
  );
}
