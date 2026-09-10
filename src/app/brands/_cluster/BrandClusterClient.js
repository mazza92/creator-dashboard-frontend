'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';
import {
  DEFAULT_HOW,
  DEFAULT_VALUE,
  brandSignupUrl,
  relatedLinks,
  trackBrandCtaClick,
} from './catalog';

const colors = {
  pink: '#e8395f',
  pinkHover: '#c92549',
  pinkSoft: '#fef2f4',
  ink: '#15161a',
  inkSoft: '#4a4d55',
  muted: '#6b6f78',
  line: '#e5e7eb',
  lineSoft: '#f1f2f4',
  bgTint: '#fafafa',
  green: '#0f9d58',
};

const Wrap = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const HeroSection = styled.section`
  padding: 150px 0 64px;
  background: linear-gradient(180deg, #fff 0%, ${colors.pinkSoft} 100%);
  border-bottom: 1px solid ${colors.lineSoft};
`;

const HeroTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid ${colors.line};
  padding: 8px 14px;
  border-radius: 100px;
  font-size: 12.5px;
  font-weight: 600;
  color: ${colors.inkSoft};
  margin-bottom: 24px;
`;

const H1 = styled.h1`
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.08;
  color: ${colors.ink};
  margin: 0 0 20px;
  max-width: 820px;
  span { color: ${colors.pink}; }
  @media (max-width: 720px) { font-size: 36px; }
`;

const HeroSub = styled.p`
  font-size: 19px;
  color: ${colors.inkSoft};
  max-width: 640px;
  margin: 0 0 32px;
  line-height: 1.5;
`;

const CTARow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 28px;
`;

const Btn = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 16px 26px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 15.5px;
  text-decoration: none;
  cursor: pointer;
`;

const BtnPrimary = styled(Btn)`
  background: ${colors.pink};
  color: #fff;
  &:hover { background: ${colors.pinkHover}; color: #fff; }
`;

const BtnSecondary = styled(Btn)`
  background: #fff;
  color: ${colors.ink};
  border: 1.5px solid ${colors.line};
`;

const Trust = styled.div`
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  font-size: 13px;
  color: ${colors.muted};
`;

const Section = styled.section`
  padding: 72px 0;
`;

const SecLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${colors.pink};
  margin-bottom: 10px;
`;

const SecTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${colors.ink};
  margin: 0 0 14px;
  span { color: ${colors.pink}; }
  @media (max-width: 720px) { font-size: 28px; }
`;

const SecSub = styled.p`
  font-size: 17px;
  color: ${colors.inkSoft};
  max-width: 680px;
  line-height: 1.55;
  margin: 0 0 32px;
`;

const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

const ValueCard = styled.div`
  background: ${colors.bgTint};
  border: 1px solid ${colors.lineSoft};
  border-radius: 16px;
  padding: 22px;
`;

const ValueTitle = styled.div`
  font-weight: 700;
  font-size: 17px;
  margin: 8px 0;
  color: ${colors.ink};
`;

const ValueDesc = styled.div`
  font-size: 15px;
  color: ${colors.inkSoft};
  line-height: 1.55;
`;

const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid ${colors.line};
  border-radius: 16px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th, td {
    text-align: left;
    padding: 14px 16px;
    border-bottom: 1px solid ${colors.lineSoft};
    vertical-align: top;
  }
  th {
    background: ${colors.bgTint};
    font-size: 13px;
    letter-spacing: 0.02em;
  }
  th:last-child, td:last-child { color: ${colors.ink}; font-weight: 600; }
  tr:last-child td { border-bottom: 0; }
`;

const Source = styled.p`
  font-size: 12px;
  color: ${colors.muted};
  margin: 12px 0 0;
  line-height: 1.45;
`;

const HowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 820px) { grid-template-columns: 1fr; }
`;

const HowCard = styled.div`
  border: 1px solid ${colors.lineSoft};
  border-radius: 16px;
  padding: 22px;
`;

const HowNum = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${colors.pink};
  color: #fff;
  font-weight: 800;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`;

const Related = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const RelLink = styled(Link)`
  border: 1px solid ${colors.line};
  border-radius: 100px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.ink};
  text-decoration: none;
  &:hover { border-color: ${colors.pink}; color: ${colors.pink}; }
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 820px;
`;

const FAQItem = styled.div`
  background: ${colors.bgTint};
  border: 1px solid ${colors.lineSoft};
  border-radius: 12px;
  padding: 20px 22px;
`;

const FAQQ = styled.div`
  font-size: 17px;
  font-weight: 700;
  color: ${colors.ink};
  margin-bottom: 8px;
`;

const FAQA = styled.div`
  font-size: 15px;
  color: ${colors.inkSoft};
  line-height: 1.6;
`;

const FinalCTA = styled.section`
  background: ${colors.ink};
  color: #fff;
  padding: 80px 0;
  text-align: center;
  h2 {
    font-size: 40px;
    font-weight: 800;
    margin: 0 0 16px;
    span { color: ${colors.pink}; }
  }
  p {
    color: #c7c9d0;
    max-width: 520px;
    margin: 0 auto 28px;
    line-height: 1.55;
  }
`;

export default function BrandClusterClient({ page }) {
  const campaign = page.slug;
  const signupUrl = brandSignupUrl(campaign);
  const related = relatedLinks(page.slug);
  const onCta = (location) => () => trackBrandCtaClick(campaign, location);

  return (
    <LandingPageLayoutNext canonicalUrl={`https://newcollab.co/brands/${page.slug}`}>
      <HeroSection>
        <Wrap>
          <HeroTag>For DTC brands · gifted UGC</HeroTag>
          <H1>{page.h1[0]} <span>{page.h1[1]}</span></H1>
          <HeroSub>{page.sub}</HeroSub>
          <CTARow>
            <BtnPrimary href={signupUrl} onClick={onCta('hero')}>Start free campaign →</BtnPrimary>
            <BtnSecondary href="#how">See how it works</BtnSecondary>
          </CTARow>
          <Trust>
            <span>First campaign free</span>
            <span>Then $299/mo if you opt in</span>
            <span>6-month commercial usage</span>
            <span>No auto-billing</span>
          </Trust>
        </Wrap>
      </HeroSection>

      <Section>
        <Wrap>
          <SecLabel>What you get</SecLabel>
          <SecTitle>Gifted UGC on rails.</SecTitle>
          <ValueGrid>
            {DEFAULT_VALUE.map((item) => (
              <ValueCard key={item.title}>
                <div>{item.icon}</div>
                <ValueTitle>{item.title}</ValueTitle>
                <ValueDesc>{item.desc}</ValueDesc>
              </ValueCard>
            ))}
          </ValueGrid>
        </Wrap>
      </Section>

      <Section style={{ background: colors.bgTint }}>
        <Wrap>
          <SecLabel>Why this page exists</SecLabel>
          <SecTitle>{page.uniqueTitle} <span>{page.uniqueSpan}</span></SecTitle>
          <SecSub>{page.uniqueBody}</SecSub>
          {page.compare && (
            <>
              <TableWrap>
                <Table>
                  <thead>
                    <tr>
                      <th> </th>
                      {page.compare.columns.map((col) => <th key={col}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {page.compare.rows.map((row) => (
                      <tr key={row.label}>
                        <td>{row.label}</td>
                        <td>{row.them}</td>
                        <td>{row.us}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
              {page.compare.source && <Source>{page.compare.source}</Source>}
            </>
          )}
        </Wrap>
      </Section>

      <Section id="how">
        <Wrap>
          <SecLabel>How it works</SecLabel>
          <SecTitle>Three steps. No discovery. No DMs.</SecTitle>
          <HowGrid>
            {DEFAULT_HOW.map((step, i) => (
              <HowCard key={step.name}>
                <HowNum>{i + 1}</HowNum>
                <ValueTitle>{step.name}</ValueTitle>
                <ValueDesc>{step.text}</ValueDesc>
              </HowCard>
            ))}
          </HowGrid>
        </Wrap>
      </Section>

      {related.length > 0 && (
        <Section style={{ paddingTop: 0 }}>
          <Wrap>
            <SecLabel>Related for brands</SecLabel>
            <SecTitle>Keep going.</SecTitle>
            <Related>
              {related.map((item) => (
                <RelLink key={item.href} href={item.href}>{item.label}</RelLink>
              ))}
            </Related>
          </Wrap>
        </Section>
      )}

      <Section id="faq" style={{ background: colors.bgTint }}>
        <Wrap>
          <SecLabel>FAQ</SecLabel>
          <SecTitle>What brands ask.</SecTitle>
          <FAQList>
            {page.faqs.map((item) => (
              <FAQItem key={item.question}>
                <FAQQ>{item.question}</FAQQ>
                <FAQA>{item.answer}</FAQA>
              </FAQItem>
            ))}
          </FAQList>
        </Wrap>
      </Section>

      <FinalCTA>
        <Wrap>
          <h2>Start your <span>free campaign</span>.</h2>
          <p>Open a branded roster, gift product, get UGC with 6-month commercial usage. Pay $299/mo only if it works.</p>
          <BtnPrimary href={signupUrl} onClick={onCta('footer')}>Start free campaign →</BtnPrimary>
        </Wrap>
      </FinalCTA>
    </LandingPageLayoutNext>
  );
}
