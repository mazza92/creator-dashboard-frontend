import React, { useState, useEffect } from "react";
import { Card, Row, Col, Avatar, Button, message, Spin, Tooltip, Empty, Modal } from "antd";
// eslint-disable-next-line no-unused-vars
import { FaDollarSign } from "react-icons/fa";
// eslint-disable-next-line no-unused-vars
import axios from "axios";
import api from '../config/api';
import moment from "moment";
import styled from "styled-components";
import { motion } from "framer-motion";

const Container = styled.div`
  padding: 40px;
  background: #f9fafb;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const InviteCard = styled(Card)`
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  border: none;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 24px;
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }
  .ant-card-body {
    padding: 20px;
  }
  @media (max-width: 768px) {
    margin-bottom: 16px;
    .ant-card-body {
      padding: 16px;
    }
  }
`;

const BrandWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const BrandName = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 24px;
  padding: 10px 24px;
  background: ${props =>
    props.primary ? "linear-gradient(135deg, #26A69A, #4DB6AC)" : "#fff"};
  border: ${props => (props.primary ? "none" : "1px solid #d1d5db")};
  color: ${props => (props.primary ? "#fff" : "#4b5563")};
  font-weight: 600;
  font-size: 14px;
  height: auto;
  &:hover {
    background: ${props =>
      props.primary
        ? "linear-gradient(135deg, #4DB6AC, #26A69A)"
        : "#e6f7ff"};
    color: ${props => (props.primary ? "#fff" : "#26A69A")};
    border-color: ${props => (props.primary ? "none" : "#26A69A")};
  }
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 16px;
  }
`;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

const DetailModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 20px;
    overflow: hidden;
  }
  .ant-modal-header {
    border-bottom: 1px solid #e5e7eb;
    padding: 20px 24px;
  }
  .ant-modal-body {
    padding: 24px;
  }
  .ant-modal-footer {
    border-top: 1px solid #e5e7eb;
    padding: 16px 24px;
  }
`;

const DetailSection = styled.div`
  margin-bottom: 20px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
`;

const DetailValue = styled.div`
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
`;

const CampaignInvites = () => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatorId, setCreatorId] = useState(null);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const fetchCreatorId = async () => {
      setLoading(true);
      try {
        console.log('🔍 Fetching creator profile at:', `${api.defaults.baseURL}/profile`);
        const response = await api.get('/profile');
        console.log('🔍 Profile response:', {
          status: response.status,
          data: response.data,
          headers: response.headers,
        });
        const { creator_id, user_role } = response.data;
        if (user_role === 'creator' && creator_id) {
          setCreatorId(creator_id);
          await fetchInvites(creator_id);
        } else {
          message.error('Please log in as a creator to view campaign invites.');
        }
      } catch (error) {
        console.error('🔥 Error fetching creator profile:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          request_url: `${api.defaults.baseURL}/profile`,
          timestamp: new Date().toISOString(),
        });
        let errorMessage = 'Failed to authenticate. Please log in again.';
        if (error.code === 'ERR_NETWORK') {
          errorMessage = 'Unable to connect to the server. Please check your internet connection or contact support at partner@newcollab.co.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Unauthorized: Please log in and try again.';
        }
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorId();

    const intervalId = setInterval(() => {
      if (creatorId) fetchInvites(creatorId);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [creatorId]);

  const fetchInvites = async (id) => {
    try {
      console.log(`🔍 Fetching campaign invites for creator_id: ${id}`);
      const response = await api.get(`/creators/${id}/campaign-invites?status=Invited`);
      console.debug('🔍 Campaign invites response:', JSON.stringify(response.data, null, 2));
      setInvites(response.data);
    } catch (error) {
      console.error('🔥 Error fetching campaign invites:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request_url: `${api.defaults.baseURL}/creators/${id}/campaign-invites?status=Invited`,
        timestamp: new Date().toISOString(),
      });
      let errorMessage = 'Failed to fetch campaign invites. Please try again later.';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection or contact support at partner@newcollab.co.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Unauthorized: Please log in and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'No campaign invites found.';
      }
      message.error(errorMessage);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      setLoading(true);
      const response = await api.post(
        `/bookings/${inviteId}/accept`,
        {},
        { withCredentials: true }
      );
      console.log("📌 Accept invite response:", response.data);
      message.success("Campaign invite accepted!");
      await fetchInvites(creatorId);
    } catch (error) {
      console.error("🔥 Error accepting invite:", error.response?.data || error);
      message.error(error.response?.data?.error || "Failed to accept invite.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectInvite = async (inviteId) => {
    try {
      setLoading(true);
      console.log(`🔍 Rejecting invite: ${inviteId}`);
      const response = await api.post(`/bookings/${inviteId}/reject`, {});
      console.log('📌 Reject invite response:', response.data);
      message.success('Campaign invite rejected.');
      await fetchInvites(creatorId);
    } catch (error) {
      console.error('🔥 Error rejecting invite:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request_url: `${api.defaults.baseURL}/bookings/${inviteId}/reject`,
        timestamp: new Date().toISOString(),
      });
      message.error(error.response?.data?.error || 'Failed to reject invite.');
    } finally {
      setLoading(false);
    }
  };

  const showInviteDetails = (invite) => {
    setSelectedInvite(invite);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedInvite(null);
  };

  const renderInviteCard = (invite) => {
    const bidAmount = Number(invite.bid_amount) || 0;
    let platforms = invite.platforms;
    if (typeof platforms === 'string') {
      try {
        platforms = JSON.parse(platforms);
      } catch (e) {
        console.warn('Failed to parse platforms JSON:', e);
        platforms = [];
      }
    }
    platforms = Array.isArray(platforms) ? platforms : [];

    return (
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <InviteCard onClick={() => showInviteDetails(invite)} style={{ cursor: 'pointer' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <BrandWrapper>
                <Avatar
                  src={invite.brand_logo || '/default-brand-logo.png'}
                  size={40}
                  style={{ border: '2px solid #e8ecef' }}
                />
                <a
                  href={`/brand/profile/${invite.brand_id}`} // Use relative path
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none' }}
                >
                  <BrandName>{invite.brand_name || 'Unknown Brand'}</BrandName>
                </a>
              </BrandWrapper>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>
                {invite.product_name || `Invite #${invite.id}`}
              </p>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>
                Bid: {require('../utils/currency').formatPrice(bidAmount)}
              </p>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>
                Due: {invite.promotion_date ? moment(invite.promotion_date).format('MMM D, YYYY') : 'N/A'}
              </p>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>
                Platforms: {platforms.join(', ') || 'N/A'}
              </p>
              <p style={{ fontSize: '12px', color: '#4b5563' }}>
                Free Sample: {invite.is_gifting ? 'Yes' : 'No'}
              </p>
            </Col>
            <Col xs={24} md={12}>
              {invite.status === 'Invited' ? (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <Tooltip title="Accept Invite">
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton
                        type="primary"
                        primary
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptInvite(invite.id);
                        }}
                        disabled={loading}
                        aria-label="Accept campaign invite"
                      >
                        Accept
                      </StyledButton>
                    </motion.div>
                  </Tooltip>
                  <Tooltip title="Reject Invite">
                    <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton
                        danger
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectInvite(invite.id);
                        }}
                        disabled={loading}
                        aria-label="Reject campaign invite"
                      >
                        Reject
                      </StyledButton>
                    </motion.div>
                  </Tooltip>
                </div>
              ) : (
                <p style={{ fontSize: '14px', color: '#4b5563', textAlign: 'right' }}>
                  Status: {invite.status || 'Unknown'}
                </p>
              )}
            </Col>
          </Row>
        </InviteCard>
      </motion.div>
    );
  };

  const renderInviteDetails = () => {
    if (!selectedInvite) return null;

    const bidAmount = Number(selectedInvite.bid_amount) || 0;
    let platforms = selectedInvite.platforms;
    if (typeof platforms === 'string') {
      try {
        platforms = JSON.parse(platforms);
      } catch (e) {
        console.warn('Failed to parse platforms JSON:', e);
        platforms = [];
      }
    }
    platforms = Array.isArray(platforms) ? platforms : [];

    return (
      <DetailModal
        title="Campaign Invite Details"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          selectedInvite.status === 'Invited' && (
            <div key="actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <StyledButton
                danger
                onClick={() => {
                  handleRejectInvite(selectedInvite.id);
                  handleModalClose();
                }}
                disabled={loading}
              >
                Reject
              </StyledButton>
              <StyledButton
                type="primary"
                primary
                onClick={() => {
                  handleAcceptInvite(selectedInvite.id);
                  handleModalClose();
                }}
                disabled={loading}
              >
                Accept
              </StyledButton>
            </div>
          ),
        ].filter(Boolean)}
        width={700}
      >
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <BrandWrapper>
              <Avatar
                src={selectedInvite.brand_logo || '/default-brand-logo.png'}
                size={48}
                style={{ border: '2px solid #e8ecef' }}
              />
              <a
                href={`/brand/profile/${selectedInvite.brand_id}`} // Use relative path
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <BrandName style={{ fontSize: '20px' }}>{selectedInvite.brand_name || 'Unknown Brand'}</BrandName>
              </a>
            </BrandWrapper>
          </Col>

          
          <Col span={24}>
            <DetailSection>
              <DetailLabel>Product Name</DetailLabel>
              <DetailValue>{selectedInvite.product_name || "N/A"}</DetailValue>
            </DetailSection>

            <DetailSection>
              <DetailLabel>Product Link</DetailLabel>
              <DetailValue>
                <a href={selectedInvite.product_link} target="_blank" rel="noopener noreferrer">
                  {selectedInvite.product_link || "N/A"}
                </a>
              </DetailValue>
            </DetailSection>

            <DetailSection>
              <DetailLabel>Brief</DetailLabel>
              <DetailValue style={{ whiteSpace: 'pre-wrap' }}>{selectedInvite.brief || "N/A"}</DetailValue>
            </DetailSection>

            <DetailSection>
              <DetailLabel>Bid Amount</DetailLabel>
              <DetailValue>{require('../utils/currency').formatPrice(bidAmount)}</DetailValue>
            </DetailSection>

            <DetailSection>
              <DetailLabel>Promotion Date</DetailLabel>
              <DetailValue>
                {selectedInvite.promotion_date ? moment(selectedInvite.promotion_date).format("MMMM D, YYYY") : "N/A"}
              </DetailValue>
            </DetailSection>

            <DetailSection>
              <DetailLabel>Platforms</DetailLabel>
              <DetailValue>
                {platforms.length > 0 ? platforms.join(', ') : "N/A"}
              </DetailValue>
            </DetailSection>

            <DetailSection>
              <DetailLabel>Free Sample</DetailLabel>
              <DetailValue>{selectedInvite.is_gifting ? "Yes" : "No"}</DetailValue>
            </DetailSection>

            <DetailSection>
              <DetailLabel>Status</DetailLabel>
              <DetailValue>{selectedInvite.status || "N/A"}</DetailValue>
            </DetailSection>

            <DetailSection>
              <DetailLabel>Created At</DetailLabel>
              <DetailValue>
                {selectedInvite.created_at ? moment(selectedInvite.created_at).format("MMMM D, YYYY h:mm A") : "N/A"}
              </DetailValue>
            </DetailSection>
          </Col>
        </Row>
      </DetailModal>
    );
  };

  return (
    <Container>
      <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#1f2937", marginBottom: 24 }}>
        Campaign Invites
      </h2>
      {loading ? (
        <Spin style={{ display: "block", textAlign: "center", marginTop: 50 }} />
      ) : invites.length > 0 ? (
        invites.map(renderInviteCard)
      ) : (
        <Empty description="No campaign invites yet." />
      )}
      {renderInviteDetails()}
    </Container>
  );
};

export default CampaignInvites;