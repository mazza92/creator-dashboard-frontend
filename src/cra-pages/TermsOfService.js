import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 24px;
  font-family: 'Inter', sans-serif;
`;

const Section = styled.section`
  margin-bottom: 40px;
`;

const LAST_UPDATED = '23 September 2026';

const TermsOfService = () => {
  return (
    <Container>
        <Title level={1}>Terms of Service</Title>
        <Paragraph>Last updated: {LAST_UPDATED}</Paragraph>
        <Paragraph>
          These terms govern your use of Newcollab on{' '}
          <a href="https://newcollab.co">newcollab.co</a> and{' '}
          <a href="https://app.newcollab.co">app.newcollab.co</a>. By creating an
          account or using the site you agree to them. If you do not agree, do
          not use Newcollab. Privacy practices are in the{' '}
          <a href="/privacy-policy">Privacy Policy</a>.
        </Paragraph>

        <Section>
          <Title level={2}>1. The product</Title>
          <Paragraph>
            Newcollab helps creators find brand PR and paid UGC, and helps DTC
            brands run gifted UGC rosters. It includes:
          </Paragraph>
          <ul>
            <li>A public directory of brands with PR application routes.</li>
            <li>Creator accounts: My Kit, gifted PR apply, pitches, Timeline, Polly, and paid UGC listing cards.</li>
            <li>Creator Pro: a paid subscription (currently advertised at $19/month) with extra apply credits and a monthly gifting-campaign placement as described in-app.</li>
            <li>Brand Gifted UGC: a branded roster, lock-and-ship CSV, and 6-month commercial usage on delivered files. First campaign is free of platform fee (product and shipping only); then $299/month if the brand opts in. We do not auto-bill that seat.</li>
          </ul>
          <Paragraph>
            Newcollab is not a paid-per-video marketplace, not an escrow for
            creator invoices, and not a full-service UGC agency. Brands do not
            pay creators through Newcollab for gifted campaigns. Third-party
            paid UGC cards link out to the source brief.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>2. Eligibility and accounts</Title>
          <Paragraph>
            You must be at least 18 (or the age of majority where you live) to
            apply for gifted PR, connect a professional Instagram or TikTok
            account, or buy a paid plan. You must provide accurate information
            and keep your password and connected logins safe. You are
            responsible for activity on your account. We may refuse, suspend, or
            close accounts that are fake, abusive, or underage.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>3. Creator terms</Title>
          <Paragraph>
            Directory unlocks and gifted applications use credits as shown in
            the app. Free credits are limited; Pro extends them. When you apply
            to a gifted roster you agree, unless the in-app brief says otherwise:
          </Paragraph>
          <ul>
            <li>The collab is gifted product, not a cash fee.</li>
            <li>If they ship: one organic post on your account plus one UGC file (photo or video) the brand can download, within 4 days of receipt.</li>
            <li>The brand gets 6-month commercial usage of that UGC (ads and their channels). You keep ownership. No exclusivity and no royalties during that term.</li>
            <li>You are added to their gifted list. Being on the list means they may pick who gets a box — it is not a shipping guarantee.</li>
          </ul>
          <Paragraph>
            You must disclose gifted or paid content as required by the FTC,
            ASA, and the platform you post on. Metrics you show must not be
            fake. Polly drafts pitches and advice; you send them. You are
            responsible for what you send brands.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>4. Brand terms</Title>
          <Paragraph>
            Brand roster seats work as described on{' '}
            <a href="https://newcollab.co/brands/pr-packages">/brands/pr-packages</a>:
            you select creators, lock, export shipping, gift product, and receive
            UGC with 6-month commercial usage. Creators keep copyright. You do
            not get perpetual ownership unless you strike a separate deal off
            platform. Honor shipping and selection in good faith. Do not scrape
            the creator pool or spam applicants.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>5. Subscriptions, credits, and refunds</Title>
          <Paragraph>
            Paid plans are billed by Stripe (or PayPal where a legacy checkout
            still runs). Creator Pro renews until you cancel in Account Settings
            or by emailing team@newcollab.co. Cancellation stops future renewals;
            it does not refund the current period unless we failed to deliver a
            promised gifting-campaign placement that month — in that case email
            us and we will place you on the next campaign or refund that invoice,
            as stated in the Pro offer.
          </Paragraph>
          <Paragraph>
            Brand $299 seats are opt-in after the free first campaign. We do not
            auto-bill that product. Cancel a paid brand seat by emailing
            team@newcollab.co. Usage already granted on delivered content
            continues for its 6-month term.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>6. Polly and listings</Title>
          <Paragraph>
            Polly is an automated assistant. Replies can be wrong. She is not
            legal, tax, or immigration advice. Paid UGC cards are scraped or
            sourced listings; availability, pay, and the application are
            controlled by the third party. We do not guarantee a brand reply, a
            PR box, or a paid job.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>7. Intellectual property</Title>
          <Paragraph>
            You keep your content. You grant Newcollab a license to host, display,
            and match it so the product works (kit, applications, roster, emails).
            Gifted usage rights between you and a brand are the ones you accept
            at apply time (section 3) or in a later written deal. Newcollab’s
            name, site, and software stay ours. Do not copy the directory or
            creator pool for a competing scrape.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>8. Acceptable use</Title>
          <Paragraph>
            Do not: scrape at scale, create fake engagement or fake kits, harass
            users, upload malware, attempt to access other accounts, or use
            Newcollab to send spam. We may remove content or close accounts that
            break these terms or the law.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>9. Disclaimers and liability</Title>
          <Paragraph>
            The service is provided as is. Brands, creators, and third-party
            listing sites are independent. To the fullest extent allowed by law,
            Newcollab is not liable for lost profits, lost deals, or indirect
            damages, and our total liability for a claim is limited to the fees
            you paid us in the 12 months before the claim (or $50 if you paid
            nothing). Some places do not allow these limits; in those places
            they apply only as far as the law allows. Consumers keep any
            mandatory rights they cannot waive.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>10. Changes and contact</Title>
          <Paragraph>
            We may update these terms and the product. The date at the top will
            change. Continued use after a material update means you accept the
            new terms. Questions, cancellations, and disputes: start with{' '}
            <a href="mailto:team@newcollab.co">team@newcollab.co</a>.
          </Paragraph>
        </Section>
    </Container>
  );
};

export default TermsOfService;
