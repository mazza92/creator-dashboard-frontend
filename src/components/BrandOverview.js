import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Spin, message } from "antd";
import { PlusOutlined, ArrowRightOutlined, TeamOutlined, GiftOutlined } from "@ant-design/icons";
import styled from "styled-components";
import api from "../config/api";

const { Text } = Typography;

// ---- Layout (minimal, lots of whitespace) ----
const Page = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px 48px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif;

  @media (max-width: 768px) {
    padding: 24px 16px 40px;
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
`;

const PageSubtitle = styled.p`
  font-size: 15px;
  color: #64748b;
  margin: 0 0 32px;
  line-height: 1.5;
`;

// ---- Stats row (single row, no heavy cards) ----
const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 32px;
  }
`;

const Stat = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid #e2e8f0;

  @media (max-width: 768px) {
    padding: 16px 0;
  }
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  letter-spacing: -0.02em;

  &.accent {
    color: #26A69A;
  }
`;

// ---- Section (needs attention, quick actions, recent) ----
const Section = styled.section`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
`;

const SectionLink = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: #26A69A;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

// ---- Needs attention card (single, minimal) ----
const AttentionCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 8px;
`;

const AttentionEmpty = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
`;

const AttentionItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 12px 0;
  cursor: pointer;
  font-size: 14px;
  color: #0f172a;
  border-bottom: 1px solid #e2e8f0;
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }

  &:hover {
    background: transparent;
    color: #26A69A;
  }

  .item-title {
    font-weight: 500;
  }

  .item-meta {
    font-size: 13px;
    color: #64748b;
    margin-top: 2px;
  }
`;

// ---- Quick actions (row of buttons) ----
const QuickActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const PrimaryAction = styled(Button)`
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
  font-size: 14px;
  border-radius: 10px;
  background: #26A69A;
  border-color: #26A69A;
  color: #fff;

  &:hover {
    background: #1e8f85;
    border-color: #1e8f85;
    color: #fff;
  }
`;

const SecondaryAction = styled(Button)`
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
  font-size: 14px;
  border-radius: 10px;
  color: #475569;
  border-color: #e2e8f0;
  background: #fff;

  &:hover {
    color: #26A69A;
    border-color: #26A69A;
    background: #f0fdfa;
  }
`;

// ---- Recent list (PR offers, minimal) ----
const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #fff;
  transition: background 0.15s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f8fafc;
  }
`;

const ListItemContent = styled.div`
  .list-title {
    font-size: 14px;
    font-weight: 500;
    color: #0f172a;
  }

  .list-meta {
    font-size: 13px;
    color: #64748b;
    margin-top: 2px;
  }
`;

const ListItemAction = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: inline-flex;
  align-items: center;

  &:hover {
    color: #26A69A;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 24px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  font-size: 14px;

  .empty-icon {
    font-size: 32px;
    margin-bottom: 12px;
    opacity: 0.4;
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

  useEffect(() => {
    const fetchBrandId = async () => {
      try {
        const response = await api.get(`/profile`, { withCredentials: true });
        if (response.data.user_role === "brand") {
          const actualBrandId = response.data.brand_id || response.data.id;
          setBrandId(actualBrandId);
        } else {
          message.error("Please log in as a brand to view the dashboard.");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Error fetching brand profile:", error);
        message.error("Failed to authenticate. Please log in again.");
        navigate("/login", { replace: true });
      }
    };
    fetchBrandId();
  }, [navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!brandId) return;

      setLoading(true);
      try {
        let summaryData;
        try {
          const response = await api.get(`/brand/dashboard-summary`, { withCredentials: true });
          summaryData = response.data;
        } catch (error) {
          const [bookingsRes, creatorsRes, prOffersRes] = await Promise.all([
            api.get(`/bookings?brand_id=${brandId}`, { withCredentials: true }).catch(() => ({ data: [] })),
            api.get(`/creators`, { withCredentials: true }).catch(() => ({ data: [] })),
            api.get(`/api/pr-offers`, { withCredentials: true }).catch(() => ({ data: [] })),
          ]);

          const bookings = bookingsRes.data || [];
          const creators = creatorsRes.data || [];
          const prOffers = prOffersRes.data || [];

          const pendingProjects = bookings.filter((b) =>
            ["Pending", "Draft", "pending", "draft"].includes(b.status?.toLowerCase())
          );
          const activeProjects = bookings.filter((b) =>
            ["Active", "In Progress", "active", "in_progress"].includes(b.status?.toLowerCase())
          );
          const inReviewProjects = bookings.filter((b) =>
            ["Submitted", "Draft Submitted", "submitted", "draft_submitted"].includes(b.status?.toLowerCase())
          );
          const completedProjects = bookings.filter((b) =>
            ["Completed", "Published", "completed", "published"].includes(b.status?.toLowerCase())
          );

          const recommended = creators
            .sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0))
            .slice(0, 5)
            .map((c) => ({
              id: c.id,
              name: c.username || c.name,
              image_profile: c.image_profile,
              followers_count: c.followers_count,
              niche: c.niche || "General",
            }));

          const totalSpend = bookings
            .filter((b) => ["Completed", "Published", "Paid"].includes(b.payment_status))
            .reduce((sum, b) => sum + parseFloat(b.bid_amount || b.total_cost || 0), 0);

          summaryData = {
            campaign_flow: {
              pending_count: pendingProjects.length,
              active_count: activeProjects.length,
              in_review_count: inReviewProjects.length,
              completed_count: completedProjects.length,
              pending_projects: pendingProjects.slice(0, 3).map((b) => ({
                id: b.id,
                name: b.product_name || b.package_name || `Project #${b.id}`,
                creator_name: b.creator_name || "Unknown Creator",
                status: b.status,
              })),
              in_review_projects: inReviewProjects.slice(0, 3).map((b) => ({
                id: b.id,
                name: b.product_name || b.package_name || `Project #${b.id}`,
                creator_name: b.creator_name || "Unknown Creator",
                status: b.status,
              })),
            },
            roi_snapshot: {
              total_spend_paid: totalSpend,
              total_value_gifted: 0,
              total_content_pieces: bookings.filter((b) => b.content_link).length,
              avg_engagement: 5.8,
            },
            recommended_creators: recommended,
            active_pr_offers: prOffers.slice(0, 5),
            unread_notifications: 0,
            is_new_brand: bookings.length === 0 && prOffers.length === 0,
          };
        }

        setDashboardData(summaryData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [brandId]);

  if (loading) {
    return (
      <Page style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320 }}>
        <Spin size="large" />
      </Page>
    );
  }

  const { campaign_flow, roi_snapshot, active_pr_offers, is_new_brand } = dashboardData;
  const needsAttention = campaign_flow.in_review_count + campaign_flow.pending_count;
  const attentionItems = [
    ...campaign_flow.in_review_projects.map((p) => ({ ...p, type: "review" })),
    ...campaign_flow.pending_projects.map((p) => ({ ...p, type: "pending" })),
  ].slice(0, 5);

  return (
    <Page>
      <PageTitle>Overview</PageTitle>
      <PageSubtitle>
        {is_new_brand
          ? "Get started by posting a PR offer or browsing creators."
          : "Your campaigns at a glance."}
      </PageSubtitle>

      {/* Stats row */}
      <StatsRow>
        <Stat>
          <StatLabel>Total spend</StatLabel>
          <StatValue>${roi_snapshot.total_spend_paid.toLocaleString()}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Content pieces</StatLabel>
          <StatValue>{roi_snapshot.total_content_pieces}</StatValue>
        </Stat>
        <Stat>
          <StatLabel>Active campaigns</StatLabel>
          <StatValue className="accent">
            {campaign_flow.active_count + campaign_flow.pending_count + campaign_flow.in_review_count}
          </StatValue>
        </Stat>
        <Stat>
          <StatLabel>PR offers</StatLabel>
          <StatValue>{active_pr_offers.length}</StatValue>
        </Stat>
      </StatsRow>

      {/* Needs attention */}
      <Section>
        <SectionHeader>
          <SectionTitle>Needs your attention</SectionTitle>
          {needsAttention > 0 && (
            <SectionLink onClick={() => navigate("/brand/dashboard/bookings")}>
              View all <ArrowRightOutlined style={{ fontSize: 12 }} />
            </SectionLink>
          )}
        </SectionHeader>
        {needsAttention > 0 ? (
          <AttentionCard>
            {attentionItems.map((item) => (
              <AttentionItem
                key={item.id}
                onClick={() => navigate(`/brand/dashboard/bookings?booking_id=${item.id}`)}
              >
                <span className="item-title">{item.name}</span>
                <span className="item-meta">
                  {item.creator_name} · {item.type === "review" ? "In review" : "Pending"}
                </span>
              </AttentionItem>
            ))}
          </AttentionCard>
        ) : (
          <AttentionEmpty>You're all caught up. No items need your action right now.</AttentionEmpty>
        )}
      </Section>

      {/* Quick actions */}
      <Section>
        <SectionTitle style={{ marginBottom: 16 }}>Quick actions</SectionTitle>
        <QuickActions>
          <PrimaryAction
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/brand/dashboard/pr-offers?create=true")}
          >
            New PR offer
          </PrimaryAction>
          <SecondaryAction icon={<TeamOutlined />} onClick={() => navigate("/brand/dashboard/marketplace")}>
            Browse creators
          </SecondaryAction>
          <SecondaryAction icon={<GiftOutlined />} onClick={() => navigate("/brand/dashboard/bookings")}>
            View campaigns
          </SecondaryAction>
        </QuickActions>
      </Section>

      {/* Recent PR offers */}
      <Section>
        <SectionHeader>
          <SectionTitle>Your PR offers</SectionTitle>
          <SectionLink onClick={() => navigate("/brand/dashboard/pr-offers")}>
            View all <ArrowRightOutlined style={{ fontSize: 12 }} />
          </SectionLink>
        </SectionHeader>
        {active_pr_offers.length > 0 ? (
          <List>
            {active_pr_offers.map((offer) => (
              <ListItem key={offer.id}>
                <ListItemContent>
                  <div className="list-title">{offer.title || offer.name || `PR Offer #${offer.id}`}</div>
                  <div className="list-meta">
                    {offer.status || "Active"}
                    {offer.applicants_count != null && ` · ${offer.applicants_count} applicant${offer.applicants_count !== 1 ? "s" : ""}`}
                  </div>
                </ListItemContent>
                <ListItemAction onClick={() => navigate("/brand/dashboard/pr-offers")}>
                  <ArrowRightOutlined />
                </ListItemAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <EmptyState>
            <div className="empty-icon">
              <GiftOutlined />
            </div>
            <div>No PR offers yet. Create one to start working with creators.</div>
            <PrimaryAction
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate("/brand/dashboard/pr-offers?create=true")}
              style={{ marginTop: 16 }}
            >
              Create PR offer
            </PrimaryAction>
          </EmptyState>
        )}
      </Section>
    </Page>
  );
};

export default BrandOverview;
