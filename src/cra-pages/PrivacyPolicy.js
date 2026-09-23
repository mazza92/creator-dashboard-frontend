import React from 'react';
import styled from 'styled-components';
import { Typography } from 'antd';
import { openCookieSettings } from '../lib/cookieConsent';

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

const PrivacyPolicy = () => {
  return (
    <Container>
        <Title level={1}>Privacy Policy</Title>
        <Paragraph>Last updated: {LAST_UPDATED}</Paragraph>
        <Paragraph>
          This policy explains how Newcollab collects, uses, and shares personal
          data on <a href="https://newcollab.co">newcollab.co</a> and{' '}
          <a href="https://app.newcollab.co">app.newcollab.co</a>. It is written
          for Google, TikTok, Instagram, and payment-provider reviews as well as
          for you. Questions: <a href="mailto:team@newcollab.co">team@newcollab.co</a>.
        </Paragraph>

        <Section>
          <Title level={2}>1. Who we are</Title>
          <Paragraph>
            Newcollab is a creator–brand collaboration product: a public PR
            directory, gifted PR applications, media kits, an in-app assistant
            (Polly), paid UGC listing cards, creator Pro, and a gifted UGC roster
            for brands. We are the controller of personal data processed for
            those services. We are not a law firm; this page describes our
            actual practices.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>2. Data we collect</Title>
          <Paragraph>Depending on how you use Newcollab, we may process:</Paragraph>
          <ul>
            <li>Account data: name, email, password hash or social login ID, role (creator or brand), location you enter.</li>
            <li>Creator profile and kit: bio, niches, handles, rates, portfolio posts, shipping address and phone when you apply for gifted PR.</li>
            <li>Connected social accounts: TikTok Login Kit and Instagram Login Kit (Creator or Business) can give us your handle, user ID, follower counts, and public media used to build your kit and matching.</li>
            <li>Google Sign-In: name, email, Google user ID, and profile photo if Google provides them (see section 8).</li>
            <li>Collaboration data: brand applications, gifted-list status, pitches, timeline events, kit views by brands, Polly chat messages.</li>
            <li>Brand data: company name, site, campaign notes, roster picks, shipping CSVs they export from a roster they locked.</li>
            <li>Payment data: Stripe (and, where still used, PayPal) handles card and payout details. We store subscription status, customer IDs, and invoices — not full card numbers.</li>
            <li>Usage and device data: pages viewed, referring site, approximate location from IP, cookies, and crash/diagnostic logs.</li>
            <li>Emails you send to team@newcollab.co and lifecycle emails we send you.</li>
          </ul>
        </Section>

        <Section>
          <Title level={2}>3. How we use it (and why)</Title>
          <Paragraph>
            We use personal data to run the product you signed up for (contract):
            accounts, kits, directory, gifted applications, pitches, Polly,
            subscriptions, and brand rosters. We also use it to keep the service
            secure, prevent abuse, measure what works, send product and campaign
            emails you can unsubscribe from, and meet legal duties (legitimate
            interests / legal obligation). Marketing emails and optional cookies
            that are not strictly necessary rely on consent where the law requires it.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>4. Who we share it with</Title>
          <Paragraph>
            We do not sell personal data. We do not rent Google, TikTok, or
            Instagram user data. We share only as needed to operate Newcollab:
          </Paragraph>
          <ul>
            <li>Brands you apply to: kit, selected posts, and the shipping details you submitted so they can decide and ship a PR package.</li>
            <li>Creators on a brand roster: the brand sees applicants they unlocked on their roster page.</li>
            <li>Processors: Google (Firebase Auth, Gemini for Polly, Analytics), Meta (Instagram Login, ads pixel), TikTok (Login Kit), Stripe, Microsoft Clarity, email delivery, and hosting.</li>
            <li>Law enforcement or a buyer of the business, if we are legally required or transferring the product under the same protections.</li>
          </ul>
          <Paragraph>
            Paid UGC “Apply here” cards send you to a third-party brief. That
            site has its own privacy policy.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>5. TikTok Login Kit</Title>
          <Paragraph>
            If you connect TikTok, we request the account and video data needed
            to fill your Newcollab kit and match brands (identity, public stats,
            and media you authorize). We use it only for your Newcollab account,
            kit, and matching. We do not post to TikTok for you, do not use
            TikTok data to advertise to other people, and do not sell it.
            Disconnect TikTok in Account Settings; deleting your Newcollab
            account also removes the connected TikTok data we stored.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>6. Instagram Login</Title>
          <Paragraph>
            Instagram Login (Creator or Business) is used the same way: handle,
            professional account metrics, and media you authorize for kit and
            matching. We do not post on your behalf. Disconnect in Account
            Settings or delete your Newcollab account.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>7. Polly (AI assistant)</Title>
          <Paragraph>
            Polly is Newcollab’s in-app creator assistant. To answer you she
            may send the current message, recent thread, and a short profile
            snapshot (niche, kit facts, brands already in the thread) to Google
            Gemini. We do not use that content to train a public model we own.
            Do not paste secrets (passwords, full card numbers) into Polly.
            Chat history is stored on your account so the conversation can resume.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>8. Google Sign-In and Google user data</Title>
          <Paragraph>
            You can create or log into a Newcollab account with Google. That uses
            Firebase Authentication on Google Cloud project auth-app-feed3.
            When you choose Google, we receive the information Google shares
            for a basic sign-in: your name, email address, Google user ID, and
            profile photo if you have one. We use that only to authenticate you,
            create or link your Newcollab account, and show your name in the app.
            We do not sell Google user data, do not use it for advertising, and
            do not share it with brands except as part of your public creator
            profile if you choose to display a name there.
          </Paragraph>
          <Paragraph>
            Google’s own practices are described in the{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Google Privacy Policy
            </a>
            . You can stop using Google Sign-In by deleting your Newcollab
            account in Account Settings, which removes the Google-linked profile
            from our production database as described below.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>9. Cookies, analytics, and ads</Title>
          <Paragraph>
            Strictly necessary cookies keep you logged in and remember this
            cookie choice. They do not require consent. Analytics and marketing
            cookies are off in the EEA, UK, and Switzerland until you accept
            them in our banner. You can change that anytime via{' '}
            <a href="#cookie-settings" onClick={(e) => { e.preventDefault(); openCookieSettings(); }}>
              Cookie settings
            </a>
            . The choice is stored for 13 months on newcollab.co and
            app.newcollab.co.
          </Paragraph>
          <Paragraph>If you accept analytics, we load:</Paragraph>
          <ul>
            <li>Google Analytics 4 (G-5RET5C6MZ8), including cross-domain measurement. Google receives Consent Mode signals so ads storage stays denied unless you also accept marketing.</li>
            <li>Microsoft Clarity for session diagnostics (how the product is used, not to identify you to brands).</li>
          </ul>
          <Paragraph>If you accept marketing, we load:</Paragraph>
          <ul>
            <li>Meta Pixel (2008333943133119) on pages where we measure sign-up and checkout, so we can see if our own ads worked.</li>
            <li>TikTok Pixel (D8RDMRBC77U5P88O6G70) for the same purpose on TikTok ads.</li>
          </ul>
          <Paragraph>
            Rejecting optional cookies does not block the product. You can also
            block cookies in your browser. Google offers a browser Analytics
            opt-out.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>10. Payments</Title>
          <Paragraph>
            Creator Pro and brand seats are billed by Stripe. Stripe’s terms and
            privacy policy apply to card data. We keep subscription state and
            what you bought so we can deliver credits and invoices. Some older
            brand booking flows may still use PayPal. We never store full PAN
            (card) numbers on our servers.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>11. International transfers</Title>
          <Paragraph>
            We and our processors (including Google, Meta, TikTok, Stripe, and
            Microsoft) may process data in the United States and other countries.
            Where required, we rely on contractual safeguards those providers
            offer for international transfers.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>12. Retention</Title>
          <Paragraph>
            We keep account, kit, application, and billing records while the
            account is open and as long as we need them for disputes, tax, and
            security. Polly threads and kit-view logs are kept to operate the
            product. After you delete your account we remove production copies
            as described below; encrypted backups may linger up to 30 days.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>13. Your rights</Title>
          <Paragraph>
            Depending on where you live (including the UK/EEA and California),
            you can ask to access, correct, delete, or export your data, object
            to or restrict some processing, and withdraw consent. We do not sell
            personal information as that term is used in CCPA/CPRA, and we do
            not use Google, TikTok, or Instagram data for cross-context
            behavioral ads to third parties.
          </Paragraph>
          <Paragraph>
            Creators can delete their account from Account Settings. That
            request permanently removes your profile, media kit, pitches, saved
            brands, Polly threads, messages, and connected social data from our
            production database. Paid subscriptions are canceled immediately.
            Encrypted backups may retain residual copies for up to 30 days, and
            payment processors keep invoices they are legally required to store.
            After deletion you can create a new account with the same email.
            Email team@newcollab.co if you cannot use Settings or you are a brand.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>14. Children</Title>
          <Paragraph>
            Newcollab is not directed at children under 13, and we do not
            knowingly collect their data. Gifted PR, shipping, and paid plans
            are for users 18 or over (or the age of majority where you live).
            If we learn we have an underage account, we delete it.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>15. Changes</Title>
          <Paragraph>
            We will update this page when our practices change and revise the
            date above. Material changes that affect Google, TikTok, or
            Instagram user data will stay consistent with this disclosure.
          </Paragraph>
        </Section>

        <Section>
          <Title level={2}>16. Contact</Title>
          <Paragraph>
            Privacy requests: <a href="mailto:team@newcollab.co">team@newcollab.co</a>
            <br />
            Related: <a href="/terms-of-service">Terms of Service</a>
          </Paragraph>
        </Section>
    </Container>
  );
};

export default PrivacyPolicy;
