import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { message, Modal } from 'antd';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Utility function to get brand logo URL
const getBrandLogoUrl = (brand) => {
  // If we already have a logo_url, use it
  if (brand.logo_url) {
    return brand.logo_url;
  }

  // If we have a website, try Clearbit Logo API
  if (brand.website) {
    try {
      const url = new URL(brand.website.startsWith('http') ? brand.website : `https://${brand.website}`);
      const domain = url.hostname.replace('www.', '');
      return `https://logo.clearbit.com/${domain}`;
    } catch (e) {
      // Invalid URL, return placeholder
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brand_name)}&size=128&background=3B82F6&color=fff&bold=true`;
    }
  }

  // Fallback to UI Avatars placeholder
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(brand.brand_name)}&size=128&background=3B82F6&color=fff&bold=true`;
};

// Mobile-First 4-Tab Pipeline Component
const PRPipeline = () => {
  const [activeTab, setActiveTab] = useState('saved');
  const [brands, setBrands] = useState([]);
  const [stageCounts, setStageCounts] = useState({
    saved: 0,
    pitched: 0,
    responded: 0,
    success: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Fetch pipeline brands
  useEffect(() => {
    fetchPipelineBrands();
    fetchEmailTemplates();
  }, [activeTab]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchPipelineBrands = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/pr-crm/pipeline`, {
        params: { stage: activeTab },
        withCredentials: true
      });
      setBrands(response.data.pipeline || []);
      setStageCounts(response.data.stage_counts || {
        saved: 0,
        pitched: 0,
        responded: 0,
        success: 0
      });
    } catch (error) {
      console.error('Error fetching pipeline:', error);
      message.error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailTemplates = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pr-crm/templates`, {
        withCredentials: true
      });
      setEmailTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const updateStage = async (pipelineId, newStage) => {
    try {
      await axios.patch(`${API_BASE}/api/pr-crm/pipeline/${pipelineId}/update-stage`, {
        stage: newStage
      }, { withCredentials: true });

      message.success(`Moved to ${newStage}!`);
      fetchPipelineBrands();
    } catch (error) {
      console.error('Error updating stage:', error);
      message.error('Failed to update stage');
    }
  };

  const removeBrand = async (pipelineId) => {
    try {
      await axios.delete(`${API_BASE}/api/pr-crm/pipeline/${pipelineId}`, {
        withCredentials: true
      });

      message.success('Removed from pipeline');
      fetchPipelineBrands();
    } catch (error) {
      console.error('Error removing brand:', error);
      message.error('Failed to remove brand');
    }
  };

  const renderTemplate = async (template) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/pr-crm/templates/${template.id}/render`,
        {},
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error rendering template:', error);
      return template;
    }
  };

  const handlePitch = (brand) => {
    setSelectedBrand(brand);
    setShowEmailModal(true);
  };

  const handleCopyTemplate = async (template) => {
    const rendered = await renderTemplate(template);
    const emailContent = `Subject: ${rendered.subject}\n\n${rendered.body}`;

    try {
      await navigator.clipboard.writeText(emailContent);
      message.success('Email template copied! Paste it into your email client');
      setShowEmailModal(false);

      // Move to "pitched" stage
      updateStage(selectedBrand.id, 'pitched');
    } catch (error) {
      message.error('Failed to copy template');
    }
  };

  const tabs = [
    { key: 'saved', label: 'Saved', emoji: '💾', color: '#3B82F6' },
    { key: 'pitched', label: 'Pitched', emoji: '📧', color: '#EC4899' },
    { key: 'responded', label: 'Responded', emoji: '💬', color: '#F59E0B' },
    { key: 'success', label: 'Success', emoji: '🎉', color: '#10B981' }
  ];

  const getNextStage = (currentStage) => {
    const stages = ['saved', 'pitched', 'responded', 'success'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  };

  return (
    <Container>
      {/* Header */}
      <Header>
        <Title>PR Pipeline</Title>
        <Subtitle>Track your outreach journey</Subtitle>
      </Header>

      {/* 4-Tab Navigation */}
      <TabNavigation>
        {tabs.map(tab => (
          <Tab
            key={tab.key}
            active={activeTab === tab.key}
            color={tab.color}
            onClick={() => setActiveTab(tab.key)}
          >
            <TabEmoji>{tab.emoji}</TabEmoji>
            <TabLabel active={activeTab === tab.key}>{tab.label}</TabLabel>
            <TabCount active={activeTab === tab.key}>
              {stageCounts[tab.key] || 0}
            </TabCount>
          </Tab>
        ))}
      </TabNavigation>

      {/* Brand Cards */}
      <BrandList>
        {loading ? (
          <LoadingText>Loading brands...</LoadingText>
        ) : brands.length === 0 ? (
          <EmptyState>
            <EmptyEmoji>{tabs.find(t => t.key === activeTab)?.emoji}</EmptyEmoji>
            <EmptyTitle>No brands yet</EmptyTitle>
            <EmptyText>
              {activeTab === 'saved' && 'Start discovering brands to save them here'}
              {activeTab === 'pitched' && 'Pitch saved brands to move them here'}
              {activeTab === 'responded' && 'Brands will appear here when they respond'}
              {activeTab === 'success' && 'Successfully secured PR packages will appear here'}
            </EmptyText>
          </EmptyState>
        ) : (
          <AnimatePresence>
            {brands.map(brand => (
              <BrandCard
                key={brand.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <BrandHeader>
                  <LogoContainer>
                    <BrandLogo
                      src={getBrandLogoUrl(brand)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const placeholder = e.target.nextSibling;
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <LogoPlaceholder style={{ display: 'none' }}>
                      {brand.brand_name.charAt(0).toUpperCase()}
                    </LogoPlaceholder>
                  </LogoContainer>
                  <BrandInfo>
                    <BrandName>{brand.brand_name}</BrandName>
                    <BrandCategory>{brand.category}</BrandCategory>
                  </BrandInfo>
                </BrandHeader>

                <BrandDetails>
                  {brand.contact_email && (
                    <Detail>
                      <DetailLabel>Email:</DetailLabel>
                      <DetailValue>{brand.contact_email}</DetailValue>
                    </Detail>
                  )}
                  {brand.instagram_handle && (
                    <Detail>
                      <DetailLabel>Instagram:</DetailLabel>
                      <DetailValue>{brand.instagram_handle.startsWith('@') ? brand.instagram_handle : `@${brand.instagram_handle}`}</DetailValue>
                    </Detail>
                  )}
                  <Detail>
                    <DetailLabel>Saved:</DetailLabel>
                    <DetailValue>
                      {brand.created_at
                        ? new Date(brand.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Recently'
                      }
                    </DetailValue>
                  </Detail>
                </BrandDetails>

                <ActionButtons>
                  {activeTab === 'saved' && (
                    <PrimaryButton onClick={() => handlePitch(brand)}>
                      📧 Pitch Brand
                    </PrimaryButton>
                  )}

                  {getNextStage(activeTab) && activeTab !== 'saved' && (
                    <PrimaryButton onClick={() => updateStage(brand.id, getNextStage(activeTab))}>
                      Move to {getNextStage(activeTab)}
                    </PrimaryButton>
                  )}

                  <SecondaryButton onClick={() => removeBrand(brand.id)}>
                    🗑️ Remove
                  </SecondaryButton>
                </ActionButtons>
              </BrandCard>
            ))}
          </AnimatePresence>
        )}
      </BrandList>

      {/* Email Template Modal */}
      <Modal
        open={showEmailModal}
        onCancel={() => setShowEmailModal(false)}
        footer={null}
        width="90%"
        style={{ maxWidth: '500px', top: 20 }}
      >
        <ModalHeader>
          <ModalTitle>Choose Email Template</ModalTitle>
          <ModalSubtitle>Select a template to pitch {selectedBrand?.brand_name}</ModalSubtitle>
        </ModalHeader>

        <TemplateList>
          {emailTemplates.map(template => (
            <TemplateCard key={template.id} onClick={() => setSelectedTemplate(template)}>
              <TemplateName>{template.name}</TemplateName>
              <TemplateSubject>Subject: {template.subject_line}</TemplateSubject>
              <TemplatePreview>{template.body_template.substring(0, 120)}...</TemplatePreview>
              <TemplateStats>
                {template.success_rate && (
                  <SuccessRate>✅ {template.success_rate}% success rate</SuccessRate>
                )}
              </TemplateStats>
              <CopyButton onClick={(e) => {
                e.stopPropagation();
                handleCopyTemplate(template);
              }}>
                📋 Copy & Use
              </CopyButton>
            </TemplateCard>
          ))}
        </TemplateList>
      </Modal>
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  width: 100%;
  background: #FAFAFA;
  padding: 0;
`;

const Header = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 20px 16px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const TabNavigation = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 20px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    margin: 0 16px 20px;
    gap: 6px;
    padding: 6px;
  }
`;

const Tab = styled.button`
  background: ${props => props.active ? `linear-gradient(135deg, ${props.color}15, ${props.color}25)` : '#F9FAFB'};
  border: 2px solid ${props => props.active ? props.color : 'transparent'};
  border-radius: 12px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  &:hover {
    background: ${props => props.active ? `linear-gradient(135deg, ${props.color}20, ${props.color}30)` : '#F3F4F6'};
  }

  @media (max-width: 768px) {
    padding: 10px 6px;
  }
`;

const TabEmoji = styled.span`
  font-size: 20px;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const TabLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.active ? '#111827' : '#6B7280'};
  text-align: center;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const TabCount = styled.span`
  font-size: 10px;
  color: ${props => props.active ? '#111827' : '#9CA3AF'};
  background: ${props => props.active ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)'};
  padding: 2px 8px;
  border-radius: 10px;
  margin-top: 2px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 9px;
    padding: 2px 6px;
  }
`;

const BrandList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px 100px;

  @media (max-width: 768px) {
    padding: 0 16px 120px;
    gap: 12px;
  }
`;

const BrandCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const BrandHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const LogoContainer = styled.div`
  position: relative;
  width: 60px;
  height: 60px;
  min-width: 60px;
  border-radius: 12px;
  background: white;
  border: 1px solid #E5E7EB;
  overflow: hidden;
`;

const BrandLogo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 8px;
`;

const LogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 24px;
  font-weight: 700;
`;

const BrandLogoStyled = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: contain;
  background: white;
  padding: 8px;
  border: 1px solid #E5E7EB;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    padding: 6px;
  }
`;

const BrandInfo = styled.div`
  flex: 1;
`;

const BrandName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const BrandCategory = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0;
  text-transform: capitalize;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const BrandDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 12px;
`;

const Detail = styled.div`
  display: flex;
  gap: 8px;
  font-size: 13px;
`;

const DetailLabel = styled.span`
  color: #6B7280;
  font-weight: 600;
  min-width: 80px;
`;

const DetailValue = styled.span`
  color: #1F2937;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const PrimaryButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #3B82F6 0%, #EC4899 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 11px 14px;
    font-size: 13px;
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #DC2626;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #FEF2F2;
    border-color: #DC2626;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 11px 14px;
    font-size: 13px;
  }

  &:hover {
    background: rgba(239, 68, 68, 0.2);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);

  @media (max-width: 768px) {
    padding: 40px 20px;
  }
`;

const EmptyEmoji = styled.div`
  font-size: 64px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: #6B7280;
  font-size: 16px;
  padding: 40px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 30px;
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const ModalSubtitle = styled.p`
  font-size: 14px;
  color: #6B7280;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const TemplateList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
`;

const TemplateCard = styled.div`
  background: #F9FAFB;
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #3B82F6;
    background: white;
  }

  @media (max-width: 768px) {
    padding: 14px;
  }
`;

const TemplateName = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const TemplateSubject = styled.p`
  font-size: 13px;
  color: #6B7280;
  margin: 0 0 8px 0;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const TemplatePreview = styled.p`
  font-size: 12px;
  color: #9CA3AF;
  margin: 0 0 12px 0;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

const TemplateStats = styled.div`
  margin-bottom: 12px;
`;

const SuccessRate = styled.span`
  font-size: 12px;
  color: #10B981;
  font-weight: 600;
`;

const CopyButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #3B82F6 0%, #EC4899 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 9px;
    font-size: 13px;
  }
`;

export default PRPipeline;
