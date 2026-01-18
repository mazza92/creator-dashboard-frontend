'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Button } from 'antd';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';

const primaryBlue = '#3B82F6';
const brightMagenta = '#EC4899';
const warmOrange = '#F59E0B';
const darkCharcoal = '#1F2937';
const offWhite = '#F9FAFB';

const Wrap = styled.div`
  padding: 10rem 24px 6rem;
  max-width: 1100px;
  margin: 0 auto;
`;

const Hero = styled.section`
  text-align: center;
  margin-bottom: 64px;
`;

const H1 = styled.h1`
  margin: 0 0 14px 0;
  font-size: 46px;
  line-height: 1.1;
  font-weight: 800;
  background: linear-gradient(90deg, ${primaryBlue}, ${brightMagenta});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const P = styled.p`
  margin: 0 auto;
  max-width: 820px;
  color: #6b7280;
  line-height: 1.7;
  font-size: 18px;
`;

const CTA = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 22px;
`;

const Section = styled.section`
  background: white;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 18px;
  padding: 22px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.05);
  margin-top: 18px;
`;

const H2 = styled.h2`
  margin: 0 0 10px 0;
  color: ${darkCharcoal};
  font-size: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 14px;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${offWhite};
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 16px;
  padding: 16px;
`;

const CardTitle = styled.div`
  font-weight: 800;
  color: ${darkCharcoal};
  margin-bottom: 8px;
`;

const CardBody = styled.div`
  color: #6b7280;
  line-height: 1.6;
  font-size: 14px;
`;

export default function PRPackagesClient() {
  return (
    <LandingPageLayoutNext canonicalUrl="https://newcollab.co/brands/pr-packages">
      <Wrap>
        <Hero>
          <H1>Send PR packages to influencers — without the spam DMs</H1>
          <P>
            Newcollab helps brands find creators that fit, send PR package opportunities, and convert PR into paid partnerships.
          </P>
          <CTA>
            <a href="/register/brand">
              <Button type="primary" size="large" style={{ background: warmOrange, borderColor: warmOrange }}>
                Start as a brand
              </Button>
            </a>
            <Link href="/blog">
              <Button size="large">Read the blog</Button>
            </Link>
          </CTA>
        </Hero>

        <Section>
          <H2>What you get</H2>
          <Grid>
            <Card>
              <CardTitle>Creator matching</CardTitle>
              <CardBody>Reach creators in your niche with real engagement and audience fit.</CardBody>
            </Card>
            <Card>
              <CardTitle>PR + paid pipeline</CardTitle>
              <CardBody>Turn gifted collaborations into consistent paid partnerships.</CardBody>
            </Card>
            <Card>
              <CardTitle>Better response rates</CardTitle>
              <CardBody>Creators opt-in, so you avoid cold outreach and low-quality lists.</CardBody>
            </Card>
          </Grid>
        </Section>

        <Section>
          <H2>Want creators to apply to your PR list?</H2>
          <P style={{ fontSize: 16, margin: 0, maxWidth: '100%' }}>
            Publish your opportunity and start receiving applications from creators.
          </P>
          <CTA style={{ justifyContent: 'flex-start' }}>
            <a href="/register/brand">
              <Button type="primary" style={{ background: warmOrange, borderColor: warmOrange }}>
                Send PR packages to influencers
              </Button>
            </a>
          </CTA>
        </Section>
      </Wrap>
    </LandingPageLayoutNext>
  );
}

