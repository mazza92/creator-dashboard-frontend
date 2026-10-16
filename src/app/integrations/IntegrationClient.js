'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import {
  LAST_UPDATED,
  RATE_LIMIT,
  RESULT_FIELDS,
  SHARED_VALUE,
  TOOL_PARAMS,
  trackIntegrationClick,
  trackedUrl,
} from './_catalog';

export const colors = {
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

export const Wrap = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px;
`;

export const HeroSection = styled.section`
  padding: 150px 0 64px;
  background: linear-gradient(180deg, #fff 0%, ${colors.pinkSoft} 100%);
  border-bottom: 1px solid ${colors.lineSoft};
`;

export const HeroTag = styled.div`
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

export const H1 = styled.h1`
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.08;
  color: ${colors.ink};
  margin: 0 0 24px;
  max-width: 820px;
  span { color: ${colors.pink}; }
  @media (max-width: 720px) { font-size: 36px; }
`;

const Bullets = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 32px;
  li {
    font-size: 18px;
    color: ${colors.inkSoft};
    margin-bottom: 10px;
    padding-left: 28px;
    position: relative;
    line-height: 1.45;
  }
  li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: ${colors.green};
    font-weight: 800;
  }
`;

export const CTARow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
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

export const BtnPrimary = styled(Btn)`
  background: ${colors.pink};
  color: #fff;
  &:hover { background: ${colors.pinkHover}; color: #fff; }
`;

export const BtnSecondary = styled(Btn)`
  background: #fff;
  color: ${colors.ink};
  border: 1.5px solid ${colors.line};
  &:hover { border-color: ${colors.pink}; color: ${colors.ink}; }
`;

const Meta = styled.p`
  font-size: 13px;
  color: ${colors.muted};
  margin: 0;
  line-height: 1.5;
  max-width: 760px;
`;

export const Section = styled.section`
  padding: 72px 0;
  scroll-margin-top: 80px;
`;

export const SecLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${colors.pink};
  margin-bottom: 10px;
`;

export const SecTitle = styled.h2`
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${colors.ink};
  margin: 0 0 14px;
  span { color: ${colors.pink}; }
  @media (max-width: 720px) { font-size: 28px; }
`;

export const SecSub = styled.p`
  font-size: 17px;
  color: ${colors.inkSoft};
  max-width: 720px;
  line-height: 1.6;
  margin: 0 0 32px;
`;

const StepGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

export const Card = styled.div`
  background: #fff;
  border: 1px solid ${colors.line};
  border-radius: 16px;
  padding: 22px;
`;

const StepHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const StepNum = styled.div`
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
`;

const StepTime = styled.div`
  font-size: 12px;
  color: ${colors.muted};
`;

export const CardTitle = styled.h3`
  font-weight: 700;
  font-size: 18px;
  margin: 0 0 8px;
  color: ${colors.ink};
`;

export const CardText = styled.p`
  font-size: 15px;
  color: ${colors.inkSoft};
  line-height: 1.55;
  margin: 0;
`;

const CopyBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${colors.ink};
  color: #fff;
  border-radius: 12px;
  padding: 14px 14px 14px 18px;
  margin: 24px 0 10px;
  max-width: 760px;
  code {
    flex: 1;
    font-size: 14px;
    overflow-x: auto;
    white-space: nowrap;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  }
  button {
    background: ${colors.pink};
    color: #fff;
    border: 0;
    border-radius: 8px;
    padding: 9px 14px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    flex-shrink: 0;
  }
`;

const Chat = styled.div`
  border: 1px solid ${colors.line};
  border-radius: 18px;
  background: #fff;
  padding: 22px;
  max-width: 760px;
`;

const Bubble = styled.div`
  border-radius: 14px;
  padding: 14px 16px;
  font-size: 15px;
  line-height: 1.55;
  margin-bottom: 12px;
  max-width: 88%;
  ${(p) => (p.$user
    ? `background: ${colors.ink}; color: #fff; margin-left: auto;`
    : `background: ${colors.bgTint}; color: ${colors.ink}; border: 1px solid ${colors.lineSoft};`)}
`;

const Who = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${colors.muted};
  margin-bottom: 6px;
`;

const Via = styled.div`
  font-size: 12px;
  color: ${colors.muted};
  margin-top: 8px;
`;

const PromptGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

const PromptLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${colors.pink};
  margin-bottom: 8px;
`;

const ValueGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

export const TableWrap = styled.div`
  overflow-x: auto;
  border: 1px solid ${colors.line};
  border-radius: 16px;
  background: #fff;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14.5px;
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
  td:first-child { font-weight: 600; color: ${colors.ink}; white-space: nowrap; }
  tr:last-child td { border-bottom: 0; }
  code { font-size: 13px; }
`;

const DevGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 24px;
  @media (max-width: 860px) { grid-template-columns: 1fr; }
`;

const Pre = styled.pre`
  background: ${colors.ink};
  color: #fff;
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 12.5px;
  margin: 12px 0 0;
  overflow-x: auto;
  white-space: pre;
`;

const Related = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const RelLink = styled(Link)`
  border: 1px solid ${colors.line};
  border-radius: 100px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.ink};
  text-decoration: none;
  background: #fff;
  &:hover { border-color: ${colors.pink}; color: ${colors.pink}; }
`;

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 820px;
`;

const FAQItem = styled.div`
  background: #fff;
  border: 1px solid ${colors.lineSoft};
  border-radius: 12px;
  padding: 20px 22px;
`;

const FAQQ = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${colors.ink};
  margin: 0 0 8px;
`;

const FAQA = styled.p`
  font-size: 15px;
  color: ${colors.inkSoft};
  line-height: 1.6;
  margin: 0;
`;

export const FinalCTA = styled.section`
  background: ${colors.ink};
  color: #fff;
  padding: 80px 0;
  text-align: center;
  h2 {
    font-size: 40px;
    font-weight: 800;
    margin: 0 0 16px;
    span { color: ${colors.pink}; }
    @media (max-width: 720px) { font-size: 30px; }
  }
  p {
    color: #c7c9d0;
    max-width: 560px;
    margin: 0 auto 28px;
    line-height: 1.55;
  }
`;

function CopyLink({ url, onCopy }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <CopyBox>
      <code>{url}</code>
      <button type="button" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
    </CopyBox>
  );
}

export default function IntegrationClient({ assistant: a, others }) {
  const campaign = `integrations-${a.slug}`;
  const rosterUrl = trackedUrl('https://newcollab.co/brands/launch', campaign);
  const brandUrl = trackedUrl('https://app.newcollab.co/for-brands', campaign);
  const kitUrl = trackedUrl('/media-kit', campaign);
  const track = (location) => () => trackIntegrationClick(campaign, location);
  const statusLine = a.listed
    ? `Listed in the ${a.name} directory.`
    : a.status || `Directory listing in review with ${a.vendor}. The custom ${a.appTerm} link works today.`;

  return (
    <LandingPageLayoutNext canonicalUrl={`https://newcollab.co/integrations/${a.slug}`}>
      <HeroSection>
        <Wrap>
          <HeroTag>{a.name} + Newcollab · free {a.appTerm}</HeroTag>
          <H1>{a.h1[0]} <span>{a.h1[1]}</span></H1>
          <Bullets>
            {a.heroBullets.map((b) => <li key={b}>{b}</li>)}
          </Bullets>
          <CTARow>
            {a.listed && a.directoryUrl ? (
              <BtnPrimary href={a.directoryUrl} target="_blank" rel="noopener noreferrer" onClick={track('hero_directory')}>
                Add to {a.name} →
              </BtnPrimary>
            ) : (
              <BtnPrimary href="#setup" onClick={track('hero_setup')}>Add to {a.name} →</BtnPrimary>
            )}
            <BtnSecondary href={rosterUrl} onClick={track('hero_roster')}>Try the search on the web</BtnSecondary>
          </CTARow>
          <Meta>{statusLine} Last updated {LAST_UPDATED}.</Meta>
        </Wrap>
      </HeroSection>

      <Section>
        <Wrap>
          <SecLabel>What it is</SecLabel>
          <SecTitle>The Newcollab {a.appTerm} for {a.name}</SecTitle>
          <SecSub>{a.intro}</SecSub>
          <ValueGrid>
            {SHARED_VALUE.map((v) => (
              <Card key={v.title}>
                <div aria-hidden="true">{v.icon}</div>
                <CardTitle style={{ marginTop: 8 }}>{v.title}</CardTitle>
                <CardText>{v.desc}</CardText>
              </Card>
            ))}
          </ValueGrid>
        </Wrap>
      </Section>

      <Section id="setup" style={{ background: colors.bgTint }}>
        <Wrap>
          <SecLabel>Setup</SecLabel>
          <SecTitle>How to find UGC creators in {a.name} in <span>3 steps</span></SecTitle>
          <SecSub>Connect, ask, gift. Setup takes under a minute and needs no install, account or API key.</SecSub>
          <StepGrid>
            {a.steps.map((step, i) => (
              <Card key={step.name}>
                <StepHead>
                  <StepNum>{i + 1}</StepNum>
                  <StepTime>{step.time}</StepTime>
                </StepHead>
                <CardTitle>{step.name}</CardTitle>
                <CardText>{step.text}</CardText>
              </Card>
            ))}
          </StepGrid>
          <CopyLink url={a.mcpUrl} onCopy={track('copy_mcp_url')} />
          <Meta>{a.setupNote}</Meta>
        </Wrap>
      </Section>

      <Section>
        <Wrap>
          <SecLabel>Example</SecLabel>
          <SecTitle>What it looks like in {a.name}</SecTitle>
          <SecSub>Ask in plain English. {a.name} picks the filters, calls Newcollab and summarizes the creators it finds.</SecSub>
          <Chat>
            <Bubble $user><Who style={{ color: '#c7c9d0' }}>You</Who>{a.demo.prompt}</Bubble>
            <Bubble>
              <Who>{a.name}</Who>
              {a.demo.reply}
              <Via>via Newcollab · search_ugc_creators</Via>
            </Bubble>
          </Chat>
        </Wrap>
      </Section>

      <Section style={{ background: colors.bgTint }}>
        <Wrap>
          <SecLabel>Prompts</SecLabel>
          <SecTitle>What can I ask {a.name}?</SecTitle>
          <SecSub>Anything you would ask a teammate who knows the creator market. Name the niche, the platform and the country, or just describe the product.</SecSub>
          <PromptGrid>
            {a.prompts.map((p) => (
              <Card key={p.label}>
                <PromptLabel>{p.label}</PromptLabel>
                <CardText style={{ color: colors.ink }}>&ldquo;{p.text}&rdquo;</CardText>
              </Card>
            ))}
          </PromptGrid>
        </Wrap>
      </Section>

      <Section>
        <Wrap>
          <SecLabel>Results</SecLabel>
          <SecTitle>What {a.name} sees for each creator</SecTitle>
          <SecSub>Up to 8 creators per search, ranked by niche fit, gifting preference and engagement.</SecSub>
          <TableWrap>
            <Table>
              <thead><tr><th>Field</th><th>What it means</th></tr></thead>
              <tbody>
                {RESULT_FIELDS.map((r) => (
                  <tr key={r.field}><td>{r.field}</td><td>{r.desc}</td></tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </Wrap>
      </Section>

      <Section style={{ background: colors.bgTint }}>
        <Wrap>
          <SecLabel>Options</SecLabel>
          <SecTitle>{a.compare.columns[0]} vs {a.compare.columns[1].toLowerCase()}</SecTitle>
          <SecSub>Both talk to the same Newcollab search. The only difference is how you add it.</SecSub>
          <TableWrap>
            <Table>
              <thead>
                <tr><th> </th>{a.compare.columns.map((c) => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {a.compare.rows.map((r) => (
                  <tr key={r.label}><td>{r.label}</td><td>{r.a}</td><td>{r.b}</td></tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </Wrap>
      </Section>

      <Section id="developers">
        <Wrap>
          <SecLabel>For developers</SecLabel>
          <SecTitle>MCP server reference</SecTitle>
          <SecSub>
            A public, read-only Model Context Protocol server over Streamable HTTP with plain JSON responses.
            No authentication. One tool. {RATE_LIMIT} tool calls per minute per IP.
          </SecSub>
          <TableWrap>
            <Table>
              <tbody>
                <tr><td>Server URL</td><td><code>{a.mcpUrl}</code></td></tr>
                <tr><td>Transport</td><td>Streamable HTTP (POST, JSON responses)</td></tr>
                <tr><td>Authentication</td><td>None</td></tr>
                <tr><td>Tool</td><td><code>search_ugc_creators</code> (read-only, idempotent)</td></tr>
                <tr><td>Rate limit</td><td>{RATE_LIMIT} calls per minute per IP</td></tr>
              </tbody>
            </Table>
          </TableWrap>
          <div style={{ height: 24 }} />
          <TableWrap>
            <Table>
              <thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                {TOOL_PARAMS.map((p) => (
                  <tr key={p.name}>
                    <td><code>{p.name}</code>{p.required ? ' (required)' : ''}</td>
                    <td>{p.type}</td>
                    <td>{p.desc}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
          <DevGrid>
            {a.devExtras.map((d) => (
              <Card key={d.title}>
                <CardTitle>{d.title}</CardTitle>
                <CardText>{d.text}</CardText>
                <Pre>{d.code}</Pre>
              </Card>
            ))}
          </DevGrid>
        </Wrap>
      </Section>

      <Section style={{ background: colors.bgTint }}>
        <Wrap>
          <SecLabel>Privacy and security</SecLabel>
          <SecTitle>Read-only, no sign-in, no chat data</SecTitle>
          <ValueGrid>
            <Card>
              <CardTitle>What Newcollab receives</CardTitle>
              <CardText>
                Only the search filters {a.name} sends (niche, platform, country, number of results) and the calling
                server&apos;s IP address, used for rate limiting and kept for about a minute. Never your conversation,
                name or {a.vendor} account.
              </CardText>
            </Card>
            <Card>
              <CardTitle>What creators share</CardTitle>
              <CardText>
                Creators who published a public UGC portfolio appear with their handle and portfolio link. Everyone else
                appears as anonymous stats. Creators can unpublish their portfolio at any time.{' '}
                <Link href="/privacy-policy">Read the privacy policy</Link>.
              </CardText>
            </Card>
          </ValueGrid>
        </Wrap>
      </Section>

      <Section>
        <Wrap>
          <SecLabel>For creators</SecLabel>
          <SecTitle>Want brands to find you in {a.name}?</SecTitle>
          <SecSub>
            Brands searching from {a.name} see creators with a published Newcollab UGC portfolio first, with a direct
            link to their work. Build yours free in a few minutes, no Canva needed.
          </SecSub>
          <CTARow>
            <BtnSecondary href={kitUrl} onClick={track('creator_kit')}>Build my free UGC portfolio</BtnSecondary>
          </CTARow>
        </Wrap>
      </Section>

      <Section id="faq" style={{ background: colors.bgTint }}>
        <Wrap>
          <SecLabel>FAQ</SecLabel>
          <SecTitle>Frequently asked questions</SecTitle>
          <FAQList>
            {a.faqs.map((f) => (
              <FAQItem key={f.question}>
                <FAQQ>{f.question}</FAQQ>
                <FAQA>{f.answer}</FAQA>
              </FAQItem>
            ))}
          </FAQList>
        </Wrap>
      </Section>

      <Section>
        <Wrap>
          <SecLabel>Related</SecLabel>
          <SecTitle>Keep going</SecTitle>
          <Related>
            {others.map((o) => (
              <RelLink key={o.slug} href={`/integrations/${o.slug}`}>{o.navTitle}</RelLink>
            ))}
            <RelLink href="/integrations">All AI integrations</RelLink>
            <RelLink href="/brands/ugc-creators">Find UGC creators</RelLink>
            <RelLink href="/brands/product-seeding">Product seeding</RelLink>
            <RelLink href="/brands/ugc-for-ads">UGC for ads</RelLink>
            <RelLink href="/brands/pr-packages">Gifted UGC for brands</RelLink>
          </Related>
        </Wrap>
      </Section>

      <FinalCTA>
        <Wrap>
          <h2>Found your creators? <span>Gift them free.</span></h2>
          <p>
            Open a private roster, pick who to gift and export a shipping CSV. Your first campaign has no platform fee,
            then $299/month only if you opt in.
          </p>
          <BtnPrimary href={brandUrl} onClick={track('footer')}>Start free campaign →</BtnPrimary>
        </Wrap>
      </FinalCTA>
    </LandingPageLayoutNext>
  );
}
