'use client';

import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import {
  BtnPrimary,
  Card,
  CardText,
  CardTitle,
  FinalCTA,
  H1,
  HeroSection,
  HeroTag,
  SecLabel,
  SecSub,
  SecTitle,
  Section,
  Table,
  TableWrap,
  Wrap,
  colors,
} from './IntegrationClient';
import { LAST_UPDATED, RATE_LIMIT, trackIntegrationClick, trackedUrl } from './_catalog';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  @media (max-width: 900px) { grid-template-columns: 1fr; }
`;

const CardLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: inherit;
  height: 100%;
  &:hover > div { border-color: ${colors.pink}; }
`;

const Status = styled.div`
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  color: ${colors.inkSoft};
  background: ${colors.bgTint};
  border: 1px solid ${colors.lineSoft};
  border-radius: 100px;
  padding: 4px 10px;
  margin-bottom: 12px;
`;

const More = styled.div`
  margin-top: 14px;
  font-weight: 700;
  font-size: 14px;
  color: ${colors.pink};
`;

const Sub = styled.p`
  font-size: 19px;
  color: ${colors.inkSoft};
  max-width: 660px;
  margin: 0 0 12px;
  line-height: 1.5;
`;

const Meta = styled.p`
  font-size: 13px;
  color: ${colors.muted};
  margin: 0;
`;

export default function IntegrationsHubClient({ assistants, genericMcpUrl }) {
  const campaign = 'integrations-hub';
  const brandUrl = trackedUrl('https://app.newcollab.co/for-brands', campaign);

  return (
    <LandingPageLayoutNext canonicalUrl="https://newcollab.co/integrations">
      <HeroSection>
        <Wrap>
          <HeroTag>AI integrations · free · read-only</HeroTag>
          <H1>Find UGC creators from <span>your AI assistant</span></H1>
          <Sub>
            Newcollab plugs its vetted UGC creator directory into ChatGPT, Claude and any MCP client. Ask for creators
            by niche, platform and country and get a shortlist back in the chat.
          </Sub>
          <Meta>Last updated {LAST_UPDATED}.</Meta>
        </Wrap>
      </HeroSection>

      <Section>
        <Wrap>
          <SecLabel>Pick your assistant</SecLabel>
          <SecTitle>Setup guides</SecTitle>
          <SecSub>Each guide covers setup, example prompts, what the search returns and privacy.</SecSub>
          <Grid>
            {assistants.map((a) => (
              <CardLink key={a.slug} href={`/integrations/${a.slug}`}>
                <Card style={{ height: '100%' }}>
                  <Status>{a.listed ? 'Listed in directory' : 'Directory review · link live'}</Status>
                  <CardTitle>{a.navTitle}</CardTitle>
                  <CardText>{a.description}</CardText>
                  <More>Open the {a.name} guide →</More>
                </Card>
              </CardLink>
            ))}
            <Card>
              <Status>Live</Status>
              <CardTitle>Any MCP client</CardTitle>
              <CardText>
                Cursor, Claude Code, VS Code and other MCP clients can add the server URL below over Streamable HTTP. No
                authentication.
              </CardText>
            </Card>
          </Grid>
        </Wrap>
      </Section>

      <Section style={{ background: colors.bgTint }}>
        <Wrap>
          <SecLabel>For developers</SecLabel>
          <SecTitle>One public MCP server</SecTitle>
          <TableWrap>
            <Table>
              <tbody>
                <tr><td>Server URL</td><td><code>{genericMcpUrl}</code></td></tr>
                <tr><td>Transport</td><td>Streamable HTTP (POST, JSON responses)</td></tr>
                <tr><td>Authentication</td><td>None</td></tr>
                <tr><td>Tool</td><td><code>search_ugc_creators</code> (read-only)</td></tr>
                <tr><td>Rate limit</td><td>{RATE_LIMIT} calls per minute per IP</td></tr>
              </tbody>
            </Table>
          </TableWrap>
        </Wrap>
      </Section>

      <FinalCTA>
        <Wrap>
          <h2>Found your creators? <span>Gift them free.</span></h2>
          <p>
            Open a private roster, pick who to gift and export a shipping CSV. Your first campaign has no platform fee,
            then $299/month only if you opt in.
          </p>
          <BtnPrimary href={brandUrl} onClick={() => trackIntegrationClick(campaign, 'footer')}>
            Start free campaign →
          </BtnPrimary>
        </Wrap>
      </FinalCTA>
    </LandingPageLayoutNext>
  );
}
