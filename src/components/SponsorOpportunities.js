import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, message, Spin, Typography, Tag, Tooltip, Input, Table, Popconfirm, Tabs, Modal, Form, Select, Space } from "antd";
import { FaInstagram, FaTiktok, FaYoutube, FaFacebook, FaTwitter, FaLinkedin, FaSnapchat, FaPinterest, FaTwitch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import axios from "axios";
import styled from "styled-components";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input; // Import TextArea from Input
const { Option } = Select; // Import Option from Select

const Container = styled.div`
  padding: 24px;
`;

const DraftCard = styled(Card)`
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .ant-card-head {
    padding: 16px;
    min-height: 72px;
    display: flex;
    align-items: center;
  }
`;

const CardContent = styled.div`
  padding: 16px;
`;

const CreatorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CreatorName = styled(Link)`
  font-weight: 700;
  font-size: 16px;
  color: #000;
  &:hover {
    text-decoration: underline;
    color: #1890ff;
  }
`;

const CreatorText = styled(Text)`
  font-weight: 700;
  color: #000;
`;

const ProfileImage = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #e8e8e8;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
  margin-bottom: 16px;
  background: #000;

  @media (max-width: 575px) {
    max-height: 200px;
  }

  @media (min-width: 768px) {
    max-height: 300px;
  }
`;

const StyledVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  max-height: inherit;
`;

const DescriptionText = styled(Text)`
  display: block;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 16px;
  white-space: pre-wrap;
`;

const ReadMoreLink = styled.a`
  color: #1890ff;
  cursor: pointer;
`;

const TagList = styled.div`
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const PlatformItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #595959;
`;

const FieldLabel = styled(Text)`
  font-weight: 500;
  margin-right: 8px;
`;

const SponsorOpportunities = () => {
  const [drafts, setDrafts] = useState([]);
  const [bids, setBids] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [loadingBids, setLoadingBids] = useState(true);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedDraftId, setSelectedDraftId] = useState(null);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [form] = Form.useForm();
  const [reviewForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    const fetchDrafts = async () => {
      setLoadingDrafts(true);
      try {
        const response = await axios.get("http://localhost:5000/sponsor-drafts", { withCredentials: true });
        console.log("Published Sponsor Opportunities:", response.data);
        setDrafts(response.data || []);
      } catch (error) {
        console.error("Error fetching sponsor opportunities:", error.response?.data || error.message);
        message.error("Failed to load sponsor opportunities.");
        setDrafts([]);
      } finally {
        setLoadingDrafts(false);
      }
    };

    const fetchBids = async () => {
      setLoadingBids(true);
      try {
        const response = await axios.get("http://localhost:5000/my-sponsor-bids", { withCredentials: true });
        console.log("My Sponsor Bids:", response.data);
        setBids(response.data || []);
      } catch (error) {
        console.error("Error fetching sponsor bids:", error.response?.data || error.message);
        message.error("Failed to load your bids.");
        setBids([]);
      } finally {
        setLoadingBids(false);
      }
    };

    fetchDrafts();
    fetchBids();
  }, []);

  const handleOpenBidModal = (draftId) => {
    setSelectedDraftId(draftId);
    setBidModalVisible(true);
  };

  const handleCloseBidModal = () => {
    setBidModalVisible(false);
    setSelectedDraftId(null);
    form.resetFields();
  };

  const handleSubmitBid = async (values) => {
    const { bid_amount, pitch } = values;
    if (!bid_amount || bid_amount <= 0) {
      message.error('Please enter a valid bid amount.');
      return;
    }
    try {
      const selectedDraft = drafts.find(draft => draft.id === selectedDraftId);
      console.log('🟢 Drafts state:', drafts); // Log drafts to debug
      console.log('🟢 Selected draft:', selectedDraft);
      if (!selectedDraft) {
        message.error('Selected draft not found.');
        return;
      }
      if (!selectedDraft.creator_id) {
        console.error('🔥 Creator ID missing for draft:', selectedDraft);
        message.error('Cannot place bid: Creator ID is missing for this draft.');
        return;
      }
      const payload = {
        creator_id: selectedDraft.creator_id,
        bid_amount: parseFloat(bid_amount),
        pitch: pitch || 'Interested in sponsoring this post!'
      };
      console.log('🟢 Submitting bid payload:', payload);
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        `http://localhost:5000/sponsor-drafts/${selectedDraftId}/bid`,
        payload,
        { withCredentials: true }
      );
      message.success({
        content: (
          <span>
            Bid of €{bid_amount} submitted successfully for draft #{selectedDraftId}!
          </span>
        ),
        duration: 5,
      });
      handleCloseBidModal();
      const draftsResponse = await axios.get('http://localhost:5000/sponsor-drafts', { withCredentials: true });
      setDrafts(draftsResponse.data || []);
      const bidsResponse = await axios.get('http://localhost:5000/my-sponsor-bids', { withCredentials: true });
      setBids(bidsResponse.data || []);
    } catch (error) {
      console.error('🔥 Error submitting bid:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || 'Unknown error';
      if (errorMessage === 'You already submitted a bid for this draft') {
        message.error('You already submitted a bid for this draft. Please withdraw your existing bid to submit a new one.');
      } else {
        message.error('Failed to submit bid: ' + errorMessage);
      }
    }
  };

  const handleWithdrawBid = async (bidId) => {
    try {
      await axios.post(
        `http://localhost:5000/sponsor-bids/${bidId}/withdraw`,
        {},
        { withCredentials: true }
      );
      message.success("Bid withdrawn successfully!");
      const response = await axios.get("http://localhost:5000/my-sponsor-bids", { withCredentials: true });
      setBids(response.data || []);
      const draftsResponse = await axios.get("http://localhost:5000/sponsor-drafts", { withCredentials: true });
      setDrafts(draftsResponse.data || []);
    } catch (error) {
      message.error("Failed to withdraw bid: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  const handleOpenReviewModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setReviewModalVisible(true);
  };

  const handleCloseReviewModal = () => {
    setReviewModalVisible(false);
    setSelectedBookingId(null);
    reviewForm.resetFields();
  };

  const handleReviewContent = async (values) => {
    try {
      await axios.post(
        `http://localhost:5000/bookings/${selectedBookingId}/review-content`,
        values,
        { withCredentials: true }
      );
      message.success(`Content ${values.action}d successfully!`);
      handleCloseReviewModal();
      const bidsResponse = await axios.get("http://localhost:5000/my-sponsor-bids", { withCredentials: true });
      setBids(bidsResponse.data || []);
    } catch (error) {
      message.error("Failed to review content: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  const handleOpenPaymentModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setPaymentModalVisible(true);
  };

  const handleClosePaymentModal = () => {
    setPaymentModalVisible(false);
    setSelectedBookingId(null);
    paymentForm.resetFields();
  };

  const handleCompletePayment = async (values) => {
    try {
      await axios.post(
        `http://localhost:5000/bookings/${selectedBookingId}/complete-payment`,
        values,
        { withCredentials: true }
      );
      message.success("Payment completed successfully!");
      handleClosePaymentModal();
      const bidsResponse = await axios.get("http://localhost:5000/my-sponsor-bids", { withCredentials: true });
      setBids(bidsResponse.data || []);
    } catch (error) {
      message.error("Failed to complete payment: " + (error.response?.data?.error || "Unknown error"));
    }
  };

  const toggleDescription = (draftId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [draftId]: !prev[draftId],
    }));
  };


  // Format follower count (e.g., 16500000 -> 16.5M)
  const formatFollowerCount = (count) => {
    if (!count) return "N/A";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Format dates (e.g., 2025-04-01 -> Apr 1, 2025)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "N/A";
    }
  };

  const platforms = [
    { name: "Instagram", icon: <FaInstagram /> },
    { name: "TikTok", icon: <FaTiktok /> },
    { name: "YouTube", icon: <FaYoutube /> },
    { name: "Facebook", icon: <FaFacebook /> },
    { name: "Twitter", icon: <FaTwitter /> },
    { name: "LinkedIn", icon: <FaLinkedin /> },
    { name: "Snapchat", icon: <FaSnapchat /> },
    { name: "Pinterest", icon: <FaPinterest /> },
    { name: "Twitch", icon: <FaTwitch /> },
  ];

  const getPlatformIcon = (platformName) => {
    const platform = platforms.find(p => p.name.toLowerCase() === platformName.toLowerCase());
    return platform ? platform.icon : null;
  };

  // Table columns for My Bids tab
  const bidColumns = [
    {
      title: "Draft ID",
      dataIndex: "draft_id",
      key: "draft_id",
      render: (draftId) => (
        <Link to={`/brand/dashboard/sponsor-opportunities#draft-${draftId}`}>{draftId}</Link>
      ),
    },
    {
      title: "Creator",
      key: "creator",
      render: (_, record) => (
        <Link to={`/creator/profile/${record.creator_id}`}>
          {record.creator_username || "Unknown Creator"}
        </Link>
      ),
    },
    {
      title: "Draft Description",
      dataIndex: "draft_description",
      key: "draft_description",
      render: (text) => (
        <span>{text.length > 50 ? `${text.substring(0, 50)}...` : text}</span>
      ),
    },
    {
      title: "Bid Amount",
      dataIndex: "bid_amount",
      key: "bid_amount",
      render: (amount) => `€${amount}`,
    },
    {
      title: "Pitch",
      dataIndex: "pitch",
      key: "pitch",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Pending" ? "blue" : status === "Accepted" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Content Status",
      dataIndex: "content_status",
      key: "content_status",
      render: (status) => (
        <Tag color={status === "Pending" ? "orange" : status === "Submitted" ? "blue" : status === "Approved" ? "green" : "red"}>
          {status || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => (
        <Tag color={status === "Pending" ? "orange" : status === "On Hold" ? "blue" : status === "Completed" ? "green" : "red"}>
          {status || "N/A"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status === "Pending" && (
            <Popconfirm
              title="Are you sure you want to withdraw this bid?"
              onConfirm={() => handleWithdrawBid(record.bid_id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" danger>
                Withdraw
              </Button>
            </Popconfirm>
          )}
          {record.status === "Accepted" && record.content_status === "Submitted" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenReviewModal(record.bid_id)}
            >
              Review Content
            </Button>
          )}
          {record.status === "Accepted" && record.content_status === "Approved" && record.payment_status !== "Completed" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenPaymentModal(record.bid_id)}
            >
              Complete Payment
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Container>
      <Title level={2}>Sponsor Opportunities</Title>
      <Text type="secondary">Browse and bid on creator drafts to sponsor unique content.</Text>
      <Tabs defaultActiveKey="1" style={{ marginTop: 16 }}>
        <TabPane tab="Browse Opportunities" key="1">
          {loadingDrafts ? (
            <Spin style={{ display: "block", margin: "50px auto" }} />
          ) : drafts.length === 0 ? (
            <Text style={{ display: "block", textAlign: "center", marginTop: 20 }}>
              No sponsor opportunities available yet.
            </Text>
          ) : (
            <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
              {drafts.map((draft) => {
                const isExpanded = expandedDescriptions[draft.id];
                const maxLength = 100;
                const shouldTruncate = draft.description.length > maxLength;
                const displayDescription = isExpanded || !shouldTruncate
                  ? draft.description
                  : `${draft.description.substring(0, maxLength)}...`;

                return (
                  <Col xs={24} sm={12} md={8} key={draft.id}>
                    <DraftCard
                      id={`draft-${draft.id}`}
                      title={
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <CreatorInfo>
                            <CreatorName to={`/creator/profile/${draft.creator_id || 'unknown'}`}>
                              {draft.username || "Unknown Creator"}
                            </CreatorName>
                            <CreatorText>
                              {formatFollowerCount(draft.followers_count)} Followers
                            </CreatorText>
                            <Tooltip title="Engagement Rate">
                              <CreatorText>
                                {draft.engagement_rate ? `${draft.engagement_rate}% Engagement` : "N/A Engagement"}
                              </CreatorText>
                            </Tooltip>
                          </CreatorInfo>
                          {draft.image_profile ? (
                            <ProfileImage src={draft.image_profile} alt="Creator Profile" />
                          ) : (
                            <ProfileImage src="https://via.placeholder.com/48" alt="Default Profile" />
                          )}
                        </div>
                      }
                    >
                      <CardContent>
                        {draft.snippet_url ? (
                          <VideoContainer>
                            <StyledVideo controls src={draft.snippet_url} />
                          </VideoContainer>
                        ) : (
                          <Text type="secondary">No video preview available</Text>
                        )}
                        <DescriptionText>
                          {displayDescription}
                          {shouldTruncate && (
                            <ReadMoreLink onClick={() => toggleDescription(draft.id)}>
                              {isExpanded ? " Read Less" : " Read More"}
                            </ReadMoreLink>
                          )}
                        </DescriptionText>
                        <p>
                          <FieldLabel>Platforms:</FieldLabel>
                        </p>
                        <TagList>
                          {Array.isArray(draft.platforms) && draft.platforms.length > 0 ? (
                            draft.platforms.map((platform) => {
                              const Icon = getPlatformIcon(platform);
                              return (
                                <PlatformItem key={platform}>
                                  {Icon && <span>{Icon}</span>}
                                  <span>{platform}</span>
                                </PlatformItem>
                              );
                            })
                          ) : (
                            <Text type="secondary">N/A</Text>
                          )}
                        </TagList>
                        <p>
                          <FieldLabel>Target Audiences:</FieldLabel>
                        </p>
                        <TagList>
                          {Array.isArray(draft.audience_targets) && draft.audience_targets.length > 0 ? (
                            draft.audience_targets.map((target) => (
                              <Tag key={target} color="cyan">{target}</Tag>
                            ))
                          ) : (
                            <Text type="secondary">N/A</Text>
                          )}
                        </TagList>
                        <p>
                          <FieldLabel>Regions:</FieldLabel>
                          {Array.isArray(draft.regions) && draft.regions.length > 0 ? (
                            draft.regions.slice(0, 3).map((region) => (
                              <Tag key={region} color="blue">{region}</Tag>
                            ))
                          ) : (
                            <Text type="secondary">N/A</Text>
                          )}
                        </p>
                        <p>
                          <FieldLabel>Topics:</FieldLabel>
                        </p>
                        <TagList>
                          {Array.isArray(draft.topics) && draft.topics.length > 0 ? (
                            draft.topics.map((topic) => (
                              <Tag key={topic} color="purple">{topic}</Tag>
                            ))
                          ) : (
                            <Text type="secondary">N/A</Text>
                          )}
                        </TagList>
                        <p>
                          <FieldLabel>Gifting/Invite Required:</FieldLabel>
                          {draft.gifting_invite_required || "N/A"}
                        </p>
                        <p>
                          <FieldLabel>Posting Date:</FieldLabel>
                          {formatDate(draft.posting_date)}
                        </p>
                        <p>
                          <FieldLabel>Projected Views:</FieldLabel>
                          {draft.projected_views || "N/A"}
                        </p>
                        <p>
                          <FieldLabel>Min Bid:</FieldLabel>
                          €{draft.min_bid || "N/A"}
                        </p>
                        <p>
                          <FieldLabel>Bidding Deadline:</FieldLabel>
                          {formatDate(draft.bidding_deadline)}
                        </p>
                        <p>
                          <FieldLabel>Current Bids:</FieldLabel>
                          {draft.bid_count || 0}
                        </p>
                        <Tooltip title="Submit your bid to sponsor this post">
                          <Button type="primary" onClick={() => handleOpenBidModal(draft.id)}>
                            Place Bid
                          </Button>
                        </Tooltip>
                      </CardContent>
                    </DraftCard>
                  </Col>
                );
              })}
            </Row>
          )}
        </TabPane>
        <TabPane tab="My Bids" key="2">
          {loadingBids ? (
            <Spin style={{ display: "block", margin: "50px auto" }} />
          ) : bids.length === 0 ? (
            <Text style={{ display: "block", textAlign: "center", marginTop: 20 }}>
              You have not submitted any bids yet.
            </Text>
          ) : (
            <Table
              columns={bidColumns}
              dataSource={bids}
              rowKey="bid_id"
              pagination={{ pageSize: 5 }}
              style={{ marginTop: 16 }}
            />
          )}
        </TabPane>
      </Tabs>

      {/* Bid Modal */}
      <Modal
        title="Place a Bid"
        open={bidModalVisible}
        onCancel={handleCloseBidModal}
        footer={null}
      >
        <Form form={form} onFinish={handleSubmitBid} layout="vertical">
          <Form.Item
            name="bid_amount"
            label="Bid Amount (€)"
            rules={[{ required: true, message: "Please enter a bid amount" }]}
          >
            <Input type="number" min="0" step="1" placeholder="e.g., 500" />
          </Form.Item>
          <Form.Item
            name="pitch"
            label="Pitch (One Line)"
            rules={[{ required: true, message: "Please enter a pitch" }]}
          >
            <Input placeholder="e.g., Interested in sponsoring this post!" maxLength={100} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Bid
          </Button>
        </Form>
      </Modal>

      {/* Review Content Modal */}
      <Modal
        title="Review Content"
        open={reviewModalVisible}
        onCancel={handleCloseReviewModal}
        footer={null}
      >
        <Form form={reviewForm} onFinish={handleReviewContent} layout="vertical">
          <Form.Item
            name="action"
            label="Action"
            rules={[{ required: true, message: "Please select an action" }]}
          >
            <Select placeholder="Select an action">
              <Option value="approve">Approve</Option>
              <Option value="request-revision">Request Revision</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="revision_notes"
            label="Revision Notes (Required if requesting revision)"
            dependencies={['action']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('action') === 'request-revision' && !value) {
                    return Promise.reject(new Error('Please provide revision notes'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <TextArea rows={3} placeholder="e.g., Please adjust the lighting in the video" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Review
          </Button>
        </Form>
      </Modal>

      {/* Complete Payment Modal */}
      <Modal
        title="Complete Payment"
        open={paymentModalVisible}
        onCancel={handleClosePaymentModal}
        footer={null}
      >
        <Form form={paymentForm} onFinish={handleCompletePayment} layout="vertical">
          <Form.Item
            name="transaction_id"
            label="Transaction ID (Simulated)"
            rules={[{ required: true, message: "Please provide a transaction ID" }]}
          >
            <Input placeholder="e.g., txn_123456789" />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Complete Payment
          </Button>
        </Form>
      </Modal>
    </Container>
  );
};

export default SponsorOpportunities;