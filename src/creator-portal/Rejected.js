import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import api from '../config/api';
import { UserContext } from '../contexts/UserContext';

export default function Rejected() {
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const { handleLogout } = useContext(UserContext);

  useEffect(() => {
    const fetchRejectionDetails = async () => {
      try {
        const { data } = await api.get('/api/user/approval-status');
        if (data.rejection_reason) {
          setRejectionReason(data.rejection_reason);
        }
      } catch (err) {
        console.error('Failed to fetch rejection details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRejectionDetails();
  }, []);

  return (
    <PageWrapper>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <IconCircle>
          <IconEmoji>😔</IconEmoji>
        </IconCircle>

        <Headline>Application not approved</Headline>
        <Subline>
          Thank you for your interest in Newcollab. Unfortunately, we're unable to approve your creator profile at this time.
        </Subline>

        {!loading && rejectionReason && (
          <ReasonCard>
            <ReasonLabel>Reason</ReasonLabel>
            <ReasonText>{rejectionReason}</ReasonText>
          </ReasonCard>
        )}

        <InfoSection>
          <InfoTitle>What happens next?</InfoTitle>
          <InfoText>
            We maintain high standards to ensure quality matches between brands and creators.
            While we can't accept your application right now, we encourage you to continue growing your content and audience.
          </InfoText>
        </InfoSection>

        <CTASection>
          <CTATitle>Need help or have questions?</CTATitle>
          <CTAButton
            href="mailto:team@newcollab.co?subject=Creator Application Question"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Contact Support
          </CTAButton>
          <CTASubtext>
            Email us at <EmailLink href="mailto:team@newcollab.co">team@newcollab.co</EmailLink>
          </CTASubtext>
        </CTASection>

        <Divider />

        <TipsSection>
          <TipsTitle>Tips for future applications</TipsTitle>
          <TipsList>
            <TipItem>
              <TipIcon>📈</TipIcon>
              <TipText>Grow your follower count and engagement rate</TipText>
            </TipItem>
            <TipItem>
              <TipIcon>🎨</TipIcon>
              <TipText>Create high-quality, consistent content</TipText>
            </TipItem>
            <TipItem>
              <TipIcon>🎯</TipIcon>
              <TipText>Define a clear niche and target audience</TipText>
            </TipItem>
            <TipItem>
              <TipIcon>💡</TipIcon>
              <TipText>Showcase authentic brand collaborations</TipText>
            </TipItem>
          </TipsList>
        </TipsSection>

        <Footer>
          <SignOutButton onClick={handleLogout}>
            Sign out
          </SignOutButton>
        </Footer>
      </Card>
    </PageWrapper>
  );
}

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const Card = styled(motion.div)`
  background: #fff;
  border-radius: 20px;
  max-width: 560px;
  width: 100%;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(15, 17, 20, 0.12), 0 8px 24px rgba(15, 17, 20, 0.08);
  text-align: center;

  @media (max-width: 480px) {
    padding: 36px 24px;
    border-radius: 16px;
  }
`;

const IconCircle = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border: 2px solid #fecaca;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
`;

const IconEmoji = styled.span`
  font-size: 36px;
`;

const Headline = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
  line-height: 1.2;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const Subline = styled.p`
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 32px;
  max-width: 440px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const ReasonCard = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
`;

const ReasonLabel = styled.div`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #991b1b;
  margin-bottom: 8px;
`;

const ReasonText = styled.p`
  font-size: 15px;
  color: #374151;
  margin: 0;
  line-height: 1.6;
`;

const InfoSection = styled.div`
  background: #f9fafb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
`;

const CTASection = styled.div`
  margin-bottom: 32px;
`;

const CTATitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px;
`;

const CTAButton = styled(motion.a)`
  display: inline-block;
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  padding: 14px 32px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.3);
  text-decoration: none;
  transition: all 0.2s;
  margin-bottom: 12px;

  &:hover {
    box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
    color: #fff;
  }
`;

const CTASubtext = styled.p`
  font-size: 13px;
  color: #9ca3af;
  margin: 0;
`;

const EmailLink = styled.a`
  color: #ec4899;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #e5e7eb;
  margin: 32px 0;
`;

const TipsSection = styled.div`
  margin-bottom: 32px;
`;

const TipsTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 20px;
`;

const TipsList = styled.div`
  text-align: left;
`;

const TipItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TipIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const TipText = styled.p`
  font-size: 14px;
  color: #374151;
  margin: 3px 0 0;
  line-height: 1.6;
`;

const Footer = styled.div`
  padding-top: 8px;
`;

const SignOutButton = styled.button`
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #6b7280;
  }
`;
