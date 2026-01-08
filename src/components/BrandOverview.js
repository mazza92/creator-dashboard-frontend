import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Typography, Button, Row, Col, Spin, Statistic, Avatar, Space, message, Badge, Tag } from "antd";
import { PlusOutlined, ArrowRightOutlined, DollarOutlined, GiftOutlined, FileTextOutlined, TrophyOutlined, CheckCircleOutlined, ClockCircleOutlined, EyeOutlined } from "@ant-design/icons";
import { FiTrendingUp, FiUsers } from "react-icons/fi";
import styled from "styled-components";
import { motion } from "framer-motion";
import api from "../config/api";

const { Title, Text } = Typography;

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Bento Grid Container
const BentoContainer = styled.div`
  padding: 32px 40px;
  background: #f8fafc;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px 20px;
  }

  /* Custom scrollbar for kanban on mobile */
  .kanban-scroll::-webkit-scrollbar {
    height: 6px;
  }

  .kanban-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .kanban-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .kanban-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
`;

// Bento Grid Layout
const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
  margin-top: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(8, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
  }
`;

// Module Styling
const BentoModule = styled(Card)`
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  background: #ffffff;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;

  .ant-card-body {
    padding: 24px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
    border-color: #cbd5e1;
  }

  @media (max-width: 768px) {
    .ant-card-body {
      padding: 20px;
    }
  }
`;

// Module A: Action Hero Header (Large - Top Left)
const ActionHeroModule = styled(BentoModule)`
  grid-column: span 6;
  min-height: 280px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;

  .ant-card-body {
    justify-content: space-between;
  }

  @media (max-width: 1200px) {
    grid-column: span 8;
  }

  @media (max-width: 768px) {
    grid-column: span 4;
    min-height: 240px;
  }
`;

// Module B: Campaign Flow (Wide - Top Right/Main)
const CampaignFlowModule = styled(BentoModule)`
  grid-column: span 6;
  min-height: 400px;
  overflow: hidden;

  @media (max-width: 1200px) {
    grid-column: span 8;
  }

  @media (max-width: 768px) {
    grid-column: span 4;
    min-height: 350px;
  }
`;

// Module C: Creator Discovery (Wide - Middle)
const CreatorDiscoveryModule = styled(BentoModule)`
  grid-column: span 12;
  min-height: 320px;

  @media (max-width: 768px) {
    grid-column: span 4;
    min-height: 280px;
  }
`;

// Module D: ROI Snapshot (Square)
const ROIModule = styled(BentoModule)`
  grid-column: span 4;
  min-height: 280px;

  @media (max-width: 1200px) {
    grid-column: span 4;
  }

  @media (max-width: 768px) {
    grid-column: span 4;
    min-height: 240px;
  }
`;

// Module E: PR Offers (Wide - Bottom)
const PROffersModule = styled(BentoModule)`
  grid-column: span 8;
  min-height: 280px;

  @media (max-width: 1200px) {
    grid-column: span 8;
  }

  @media (max-width: 768px) {
    grid-column: span 4;
    min-height: 240px;
  }
`;

// Kanban Column
const KanbanColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: ${props => props.empty ? '#f8fafc' : 'transparent'};
  border-radius: 12px;
  border: ${props => props.empty ? '2px dashed #cbd5e1' : 'none'};
  min-height: 300px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.empty ? '#f1f5f9' : 'transparent'};
  }

  @media (max-width: 768px) {
    min-width: 200px;
    min-height: 250px;
    padding: 12px;
  }
`;

const KanbanHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const KanbanCard = styled.div`
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #26A69A;
    box-shadow: 0 2px 8px rgba(38, 166, 154, 0.1);
    transform: translateY(-1px);
  }
`;

const CreatorCard = styled(Card)`
  border-radius: 12px;
  text-align: center;
  max-width: 280px;
  margin: 0 auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  background: #ffffff;
  transition: all 0.3s ease;
  overflow: hidden;

  .ant-card-body {
    padding: 20px;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: #26A69A;
    box-shadow: 0 4px 18px rgba(38, 166, 154, 0.12);
  }
`;

const PrimaryButton = styled(Button)`
  background: #fff;
  border: none;
  color: #667eea;
  font-weight: 600;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-weight: 500;
  height: 48px;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    color: #fff;
  }
`;

const BrandOverview = () => {
  const [loading, setLoading] = useState(true);
  const [brandId, setBrandId] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    campaign_flow: {
      pending_count: 0,
      active_count: 0,
      in_review_count: 0,
      completed_count: 0,
      pending_projects: [],
      active_projects: [],
      in_review_projects: [],
      completed_projects: [],
    },
    roi_snapshot: {
      total_spend_paid: 0,
      total_value_gifted: 0,
      total_content_pieces: 0,
      avg_engagement: 0,
    },
    recommended_creators: [],
    active_pr_offers: [],
    unread_notifications: 0,
    is_new_brand: false,
  });
  const navigate = useNavigate();

  // Fetch brand ID
  useEffect(() => {
    const fetchBrandId = async () => {
      try {
        const response = await api.get(`${API_URL}/profile`, { withCredentials: true });
        if (response.data.user_role === "brand") {
          const actualBrandId = response.data.brand_id || response.data.id;
          setBrandId(actualBrandId);
        } else {
          message.error("Please log in as a brand to view the dashboard.");
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error("🔥 Error fetching brand profile:", error);
        message.error("Failed to authenticate. Please log in again.");
        navigate('/login', { replace: true });
      }
    };
    fetchBrandId();
  }, [navigate]);

  // Fetch dashboard summary data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!brandId) return;

      setLoading(true);
      try {
        // Try new endpoint first, fallback to existing endpoints
        let summaryData;
        try {
          const response = await api.get(`${API_URL}/brand/dashboard-summary`, { withCredentials: true });
          summaryData = response.data;
        } catch (error) {
          console.warn('⚠️ Dashboard summary endpoint not available, using fallback');
          // Fallback: fetch from existing endpoints
          const [bookingsRes, creatorsRes, prOffersRes] = await Promise.all([
            api.get(`${API_URL}/bookings?brand_id=${brandId}`, { withCredentials: true }).catch(() => ({ data: [] })),
            api.get(`${API_URL}/creators`, { withCredentials: true }).catch(() => ({ data: [] })),
            api.get(`${API_URL}/api/pr-offers`, { withCredentials: true }).catch(() => ({ data: [] })),
          ]);

          const bookings = bookingsRes.data || [];
          const creators = creatorsRes.data || [];
          const prOffers = prOffersRes.data || [];

          // Calculate campaign flow with project data
          const pendingProjects = bookings.filter(b => ['Pending', 'Draft', 'pending', 'draft'].includes(b.status?.toLowerCase()));
          const activeProjects = bookings.filter(b => ['Active', 'In Progress', 'active', 'in_progress'].includes(b.status?.toLowerCase()));
          const inReviewProjects = bookings.filter(b => ['Submitted', 'Draft Submitted', 'submitted', 'draft_submitted'].includes(b.status?.toLowerCase()));
          const completedProjects = bookings.filter(b => ['Completed', 'Published', 'completed', 'published'].includes(b.status?.toLowerCase()));

          const pending = pendingProjects.length;
          const active = activeProjects.length;
          const inReview = inReviewProjects.length;
          const completed = completedProjects.length;

          // Calculate ROI
          const totalSpend = bookings
            .filter(b => ['Completed', 'Published', 'Paid'].includes(b.payment_status))
            .reduce((sum, b) => sum + (parseFloat(b.bid_amount || b.total_cost || 0)), 0);

          const totalContent = bookings.filter(b => b.content_link).length;
          const avgEngagement = 5.8; // Placeholder - would need to calculate from actual data

          // Get recommended creators (top 4-5 by followers or recent)
          const recommended = creators
            .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
            .slice(0, 5)
            .map(c => ({
              id: c.id,
              name: c.username || c.name,
              image_profile: c.image_profile,
              followers_count: c.followers_count,
              niche: c.niche || 'General',
            }));

          summaryData = {
            campaign_flow: {
              pending_count: pending,
              active_count: active,
              in_review_count: inReview,
              completed_count: completed,
              pending_projects: pendingProjects.slice(0, 3).map(b => ({
                id: b.id,
                name: b.product_name || b.package_name || `Project #${b.id}`,
                creator_name: b.creator_name || 'Unknown Creator',
                status: b.status,
              })),
              active_projects: activeProjects.slice(0, 3).map(b => ({
                id: b.id,
                name: b.product_name || b.package_name || `Project #${b.id}`,
                creator_name: b.creator_name || 'Unknown Creator',
                status: b.status,
              })),
              in_review_projects: inReviewProjects.slice(0, 3).map(b => ({
                id: b.id,
                name: b.product_name || b.package_name || `Project #${b.id}`,
                creator_name: b.creator_name || 'Unknown Creator',
                status: b.status,
              })),
              completed_projects: completedProjects.slice(0, 3).map(b => ({
                id: b.id,
                name: b.product_name || b.package_name || `Project #${b.id}`,
                creator_name: b.creator_name || 'Unknown Creator',
                status: b.status,
              })),
            },
            roi_snapshot: {
              total_spend_paid: totalSpend,
              total_value_gifted: 0, // Would need PR offers data
              total_content_pieces: totalContent,
              avg_engagement: avgEngagement,
            },
            recommended_creators: recommended,
            active_pr_offers: prOffers.slice(0, 5),
            unread_notifications: 0,
            is_new_brand: bookings.length === 0 && prOffers.length === 0,
          };
        }

        setDashboardData(summaryData);
      } catch (error) {
        console.error("🔥 Error fetching dashboard data:", error);
        message.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [brandId]);

  const handleProposePRPackage = (creatorId) => {
    navigate(`/brand/dashboard/pr-offers?create=true&creator_id=${creatorId}`);
  };

  const handleBrowseCreators = () => {
    navigate('/brand/dashboard/marketplace');
  };

  if (loading) {
    return <Spin size="large" style={{ display: "block", margin: "50px auto" }} />;
  }

  return (
    <BentoContainer>
      <BentoGrid>
        {/* Module A: Action Hero Header */}
        <ActionHeroModule>
          {dashboardData.is_new_brand ? (
            <>
              <div>
                <Title level={2} style={{ color: '#fff', marginBottom: 8, fontSize: 28, fontWeight: 700 }}>
                  Welcome to Newcollab! 🚀
                </Title>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, display: 'block', marginBottom: 24 }}>
                  Let's launch your first campaign and connect with creators.
                </Text>
              </div>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <PrimaryButton
                  type="primary"
                  icon={<PlusOutlined />}
                  block
                  onClick={() => navigate('/brand/dashboard/pr-offers?create=true')}
                >
                  Post a PR Offer
                </PrimaryButton>
                <SecondaryButton
                  block
                  icon={<EyeOutlined />}
                  onClick={handleBrowseCreators}
                >
                  Browse Creators
                </SecondaryButton>
              </Space>
            </>
          ) : (
            <>
              <div>
                <Title level={2} style={{ color: '#fff', marginBottom: 8, fontSize: 28, fontWeight: 700 }}>
                  Campaign Snapshot
                </Title>
                <div style={{ marginTop: 16 }}>
                  {dashboardData.campaign_flow.in_review_count > 0 && (
                    <Text
                      style={{ color: '#fff', fontSize: 16, display: 'block', marginBottom: 8, cursor: 'pointer' }}
                      onClick={() => navigate('/brand/dashboard/bookings')}
                    >
                      {dashboardData.campaign_flow.in_review_count} new PR proposal{dashboardData.campaign_flow.in_review_count !== 1 ? 's' : ''} awaiting review
                    </Text>
                  )}
                  {dashboardData.campaign_flow.pending_count > 0 && (
                    <Text
                      style={{ color: '#fff', fontSize: 16, display: 'block', cursor: 'pointer' }}
                      onClick={() => navigate('/brand/dashboard/bookings')}
                    >
                      {dashboardData.campaign_flow.pending_count} project{dashboardData.campaign_flow.pending_count !== 1 ? 's' : ''} pending your action
                    </Text>
                  )}
                  {dashboardData.unread_notifications > 0 && (
                    <Text
                      style={{ color: '#fff', fontSize: 16, display: 'block', marginTop: 8, cursor: 'pointer' }}
                      onClick={() => navigate('/brand/dashboard/bookings')}
                    >
                      {dashboardData.unread_notifications} unread notification{dashboardData.unread_notifications !== 1 ? 's' : ''}
                    </Text>
                  )}
                </div>
              </div>
              <Space>
                <PrimaryButton
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/brand/dashboard/pr-offers?create=true')}
                >
                  New Campaign
                </PrimaryButton>
                <SecondaryButton
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate('/brand/dashboard/bookings')}
                >
                  View All
                </SecondaryButton>
              </Space>
            </>
          )}
        </ActionHeroModule>

        {/* Module B: Campaign Flow Kanban */}
        <CampaignFlowModule>
          <Title level={4} style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>
            My Campaign Flow
          </Title>
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            height: '100%', 
            overflowX: 'auto',
            overflowY: 'hidden',
            paddingBottom: 8,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
            msOverflowStyle: '-ms-autohiding-scrollbar',
          }}
          className="kanban-scroll"
          >
            {/* Pending Column */}
            <KanbanColumn empty={dashboardData.campaign_flow.pending_count === 0}>
              <KanbanHeader>
                <div>
                  <Text strong style={{ fontSize: 14, color: '#64748b' }}>PENDING</Text>
                  <Badge count={dashboardData.campaign_flow.pending_count} style={{ marginLeft: 8 }} />
                </div>
                {dashboardData.campaign_flow.pending_count === 0 && (
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => navigate('/brand/dashboard/pr-offers?create=true')}
                  />
                )}
              </KanbanHeader>
              {dashboardData.campaign_flow.pending_count > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dashboardData.campaign_flow.pending_projects.map((project) => (
                    <KanbanCard
                      key={project.id}
                      onClick={() => navigate(`/brand/dashboard/bookings?booking_id=${project.id}`)}
                    >
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                        {project.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {project.creator_name}
                      </Text>
                    </KanbanCard>
                  ))}
                  {dashboardData.campaign_flow.pending_count > 3 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate('/brand/dashboard/bookings')}
                      style={{ padding: 0, fontSize: 12 }}
                    >
                      View all {dashboardData.campaign_flow.pending_count} →
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    block
                    onClick={() => navigate('/brand/dashboard/pr-offers?create=true')}
                    style={{ borderColor: '#cbd5e1', color: '#94a3b8' }}
                  >
                    Start Campaign
                  </Button>
                </div>
              )}
            </KanbanColumn>

            {/* Active Column */}
            <KanbanColumn empty={dashboardData.campaign_flow.active_count === 0}>
              <KanbanHeader>
                <div>
                  <Text strong style={{ fontSize: 14, color: '#64748b' }}>ACTIVE</Text>
                  <Badge count={dashboardData.campaign_flow.active_count} style={{ marginLeft: 8 }} />
                </div>
              </KanbanHeader>
              {dashboardData.campaign_flow.active_count > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dashboardData.campaign_flow.active_projects.map((project) => (
                    <KanbanCard
                      key={project.id}
                      onClick={() => navigate(`/brand/dashboard/bookings?booking_id=${project.id}`)}
                    >
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                        {project.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {project.creator_name}
                      </Text>
                    </KanbanCard>
                  ))}
                  {dashboardData.campaign_flow.active_count > 3 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate('/brand/dashboard/bookings')}
                      style={{ padding: 0, fontSize: 12 }}
                    >
                      View all {dashboardData.campaign_flow.active_count} →
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
                  No active campaigns
                </div>
              )}
            </KanbanColumn>

            {/* In Review Column */}
            <KanbanColumn empty={dashboardData.campaign_flow.in_review_count === 0}>
              <KanbanHeader>
                <div>
                  <Text strong style={{ fontSize: 14, color: '#64748b' }}>IN REVIEW</Text>
                  <Badge count={dashboardData.campaign_flow.in_review_count} style={{ marginLeft: 8 }} />
                </div>
              </KanbanHeader>
              {dashboardData.campaign_flow.in_review_count > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dashboardData.campaign_flow.in_review_projects.map((project) => (
                    <KanbanCard
                      key={project.id}
                      onClick={() => navigate(`/brand/dashboard/bookings?booking_id=${project.id}`)}
                    >
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                        {project.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {project.creator_name}
                      </Text>
                    </KanbanCard>
                  ))}
                  {dashboardData.campaign_flow.in_review_count > 3 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate('/brand/dashboard/bookings')}
                      style={{ padding: 0, fontSize: 12 }}
                    >
                      View all {dashboardData.campaign_flow.in_review_count} →
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
                  All caught up!
                </div>
              )}
            </KanbanColumn>

            {/* Completed Column */}
            <KanbanColumn empty={dashboardData.campaign_flow.completed_count === 0}>
              <KanbanHeader>
                <div>
                  <Text strong style={{ fontSize: 14, color: '#64748b' }}>COMPLETED</Text>
                  <Badge count={dashboardData.campaign_flow.completed_count} style={{ marginLeft: 8 }} />
                </div>
              </KanbanHeader>
              {dashboardData.campaign_flow.completed_count > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dashboardData.campaign_flow.completed_projects.map((project) => (
                    <KanbanCard
                      key={project.id}
                      onClick={() => navigate(`/brand/dashboard/bookings?booking_id=${project.id}`)}
                    >
                      <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 4 }}>
                        {project.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {project.creator_name}
                      </Text>
                    </KanbanCard>
                  ))}
                  {dashboardData.campaign_flow.completed_count > 3 && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => navigate('/brand/dashboard/bookings')}
                      style={{ padding: 0, fontSize: 12 }}
                    >
                      View all {dashboardData.campaign_flow.completed_count} →
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
                  No completed campaigns yet
                </div>
              )}
            </KanbanColumn>
          </div>
        </CampaignFlowModule>

        {/* Module C: Creator Discovery Grid */}
        <CreatorDiscoveryModule>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Title level={4} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
              New Creators in Your Niche
            </Title>
            <Button
              type="link"
              icon={<ArrowRightOutlined />}
              onClick={handleBrowseCreators}
            >
              View All
            </Button>
          </div>
          {dashboardData.recommended_creators.length > 0 ? (
            <Row gutter={[20, 20]}>
              {dashboardData.recommended_creators.slice(0, 3).map((creator) => (
                <Col xs={24} sm={12} md={8} key={creator.id}>
                  <CreatorCard>
                  <Avatar
                    src={creator.image_profile}
                    size={80}
                    style={{ marginBottom: 12, border: '2px solid #e8ecef' }}
                  >
                    {creator.name?.charAt(0).toUpperCase() || 'C'}
                  </Avatar>
                  <Title level={5} style={{ marginBottom: 4, fontSize: 16, fontWeight: 600 }}>
                    {creator.name}
                  </Title>
                  <Text style={{ color: '#64748b', fontSize: 12, display: 'block', marginBottom: 8 }}>
                    {creator.niche}
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 13, display: 'block', marginBottom: 16 }}>
                    {creator.followers_count ? `${(creator.followers_count / 1000).toFixed(1)}K` : 'N/A'} followers
                  </Text>
                  <Button
                    type="primary"
                    block
                    size="small"
                    onClick={() => handleProposePRPackage(creator.id)}
                    style={{
                      background: 'linear-gradient(135deg, #26A69A, #4DB6AC)',
                      border: 'none',
                      borderRadius: 8,
                    }}
                  >
                    Propose PR Package
                  </Button>
                </CreatorCard>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <Text>No creators available. Check back soon!</Text>
            </div>
          )}
        </CreatorDiscoveryModule>

        {/* Module D: ROI Snapshot */}
        <ROIModule>
          <Title level={4} style={{ marginBottom: 20, fontSize: 20, fontWeight: 600 }}>
            ROI Snapshot
          </Title>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>Total Spend (Paid)</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginTop: 4 }}>
                ${dashboardData.roi_snapshot.total_spend_paid.toLocaleString()}
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>Total Value (Gifted)</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#26A69A', marginTop: 4 }}>
                ${dashboardData.roi_snapshot.total_value_gifted.toLocaleString()}
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>Total Content Pieces</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginTop: 4 }}>
                {dashboardData.roi_snapshot.total_content_pieces}
              </div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 13 }}>Avg. Engagement Rate</Text>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#26A69A', marginTop: 4 }}>
                {dashboardData.roi_snapshot.avg_engagement.toFixed(1)}%
              </div>
            </div>
          </Space>
        </ROIModule>

        {/* Module E: My PR Offers */}
        <PROffersModule>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Title level={4} style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
              My PR Offers
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/brand/dashboard/pr-offers?create=true')}
              style={{
                background: 'linear-gradient(135deg, #26A69A, #4DB6AC)',
                border: 'none',
              }}
            >
              Create New
            </Button>
          </div>
          {dashboardData.active_pr_offers.length > 0 ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {dashboardData.active_pr_offers.map((offer) => (
                <Card
                  key={offer.id}
                  size="small"
                  style={{ border: '1px solid #e2e8f0', borderRadius: 8 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 15 }}>{offer.title || offer.name || `PR Offer #${offer.id}`}</Text>
                      <div style={{ marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Tag color={offer.status === 'Active' ? 'green' : 'default'}>
                          {offer.status || 'Active'}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          {offer.applicants_count || 0} applicant{offer.applicants_count !== 1 ? 's' : ''}
                        </Text>
                        {offer.filled_count !== undefined && offer.total_count !== undefined && (
                          <Text type="secondary" style={{ fontSize: 13 }}>
                            {offer.filled_count}/{offer.total_count} filled
                          </Text>
                        )}
                      </div>
                    </div>
                    <Button
                      type="link"
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate('/brand/dashboard/pr-offers')}
                    >
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </Space>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
              <GiftOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
              <Text style={{ display: 'block', marginBottom: 16 }}>No PR offers yet</Text>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/brand/dashboard/pr-offers?create=true')}
                style={{
                  background: 'linear-gradient(135deg, #26A69A, #4DB6AC)',
                  border: 'none',
                }}
              >
                Create Your First PR Offer
              </Button>
            </div>
          )}
        </PROffersModule>
      </BentoGrid>
    </BentoContainer>
  );
};

export default BrandOverview;
