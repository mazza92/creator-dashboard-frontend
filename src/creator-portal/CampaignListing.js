// src/creator-portal/CampaignListing.js
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Button, Modal, Drawer, notification, Spin, Badge, Dropdown, Menu, Space, Input, Result, Progress, Avatar } from 'antd';
import axios from 'axios';
import { HeartOutlined, HeartFilled, InfoCircleOutlined, PlusOutlined, DownOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons';
import moment from 'moment';
import './CampaignListing.css';

const { Meta } = Card;

function CampaignListing() {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [isSubmitRequestModalVisible, setIsSubmitRequestModalVisible] = useState(false);
    const [savedCampaigns, setSavedCampaigns] = useState([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [savedCampaignIds, setSavedCampaignIds] = useState(new Set());
    const [sortOrder, setSortOrder] = useState('recent');
    const [currentStep, setCurrentStep] = useState(1);
    const [pitchText, setPitchText] = useState('');
    const [postLinks, setPostLinks] = useState(['', '', '']);
    const [submissionProgress, setSubmissionProgress] = useState(33);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('savedCampaigns')) || [];
        setSavedCampaigns(saved);
        setSavedCampaignIds(new Set(saved.map((c) => c.id)));
    }, []);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/campaigns');
            const campaignsWithApplicants = await Promise.all(
                response.data.map(async (campaign) => {
                    const applicants = await axios.get(`http://localhost:5000/campaigns/${campaign.id}/applicants`);
                    return { ...campaign, applicants: applicants.data };
                })
            );
            setCampaigns(campaignsWithApplicants);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleSort = ({ key }) => setSortOrder(key);

    const sortMenu = (
        <Menu onClick={handleSort}>
            <Menu.Item key="recent">Most Recent</Menu.Item>
            <Menu.Item key="oldest">Oldest</Menu.Item>
        </Menu>
    );

    const sortedCampaigns = [...campaigns].sort((a, b) =>
        sortOrder === 'recent' ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at)
    );

    const openDetailsModal = (campaign) => {
        setSelectedCampaign(campaign);
        setIsDetailsModalVisible(true);
    };

    const handleSaveCampaign = (campaign) => {
        let updatedSavedCampaigns = [...savedCampaigns];
        if (savedCampaignIds.has(campaign.id)) {
            updatedSavedCampaigns = savedCampaigns.filter((c) => c.id !== campaign.id);
            setSavedCampaignIds(new Set(updatedSavedCampaigns.map((c) => c.id)));
            notification.info({
                message: 'Campaign Unsaved',
                description: 'This campaign has been removed from your saved campaigns.',
            });
        } else {
            updatedSavedCampaigns = [...savedCampaigns, campaign];
            setSavedCampaignIds(new Set(updatedSavedCampaigns.map((c) => c.id)));
            notification.success({
                message: 'Campaign Saved',
                description: 'You have successfully saved this campaign.',
            });
        }
        setSavedCampaigns(updatedSavedCampaigns);
        setDrawerVisible(true);
        localStorage.setItem('savedCampaigns', JSON.stringify(updatedSavedCampaigns));
    };

    const openSubmitRequestModal = (campaign) => {
        setSelectedCampaign(campaign);
        setCurrentStep(1);
        setPitchText('');
        setPostLinks(['', '', '']);
        setSubmissionProgress(33);
        setIsSubmitRequestModalVisible(true);
    };

    const handlePitchChange = (e) => setPitchText(e.target.value);

    const handlePostLinkChange = (index, value) => {
        const updatedLinks = [...postLinks];
        updatedLinks[index] = value;
        setPostLinks(updatedLinks);
    };

    const handleNextStep = () => {
        if (currentStep === 1 && pitchText.length < 150) {
            notification.warning({ message: 'Pitch must be at least 150 characters.' });
            return;
        }
        setCurrentStep((prev) => prev + 1);
        setSubmissionProgress((prev) => prev + 33);
    };

    const handlePrevStep = () => {
        setCurrentStep((prev) => prev - 1);
        setSubmissionProgress((prev) => prev - 33);
    };

    const handleSubmitRequest = async () => {
        try {
            const response = await axios.post('http://localhost:5000/submit-collaboration-request', {
                creator_id: 1, // Replace with the logged-in user's ID
                brand_id: selectedCampaign.brand_id,
                content_brief: pitchText,
                previous_collaborations: JSON.stringify(postLinks),
                status: 'pending',
                product_name: selectedCampaign.campaign_name,
                created_at: moment().format(),
            }, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.status === 200 || response.status === 201) {
                notification.success({
                    message: 'Request Submitted',
                    description: 'Your request has been submitted to the brand.',
                    placement: 'topRight'
                });
                setIsSubmitRequestModalVisible(false);
            } else {
                throw new Error("Request not successful");
            }
        } catch (error) {
            console.error('Error submitting request:', error);
            notification.error({
                message: 'Submission Failed',
                description: 'There was an error submitting your request. Please try again.',
                placement: 'topRight'
            });
        }
    };


    const calculateDaysLeft = (endDate) => {
        const endMoment = moment(endDate);
        const today = moment();
        return endMoment.diff(today, 'days');
    };

    const renderVisibilityBadges = (visibility) => {
        if (!visibility) return 'N/A';

        const visibilityItems = Array.isArray(visibility) ? visibility : visibility.replace(/[{"}]/g, '').split(',');

        return visibilityItems.map((item, index) => (
            <Badge
                key={index}
                count={item.trim()}
                style={{
                    backgroundColor: getBadgeColor(item.trim()),
                    marginRight: 5,
                }}
            />
        ));
    };

    const getBadgeColor = (visibilityType) => {
        switch (visibilityType) {
            case 'Stories':
                return '#ff9800';
            case 'Live Streaming':
                return '#4caf50';
            case 'Sponsored Post':
                return '#3f51b5';
            case 'Carousel':
                return '#009688';
            default:
                return '#607d8b';
        }
    };

    return (
        <div className="campaign-listing-container">
        <div className="header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h1>Discover Campaigns</h1>
            <Space>
                <Dropdown overlay={sortMenu}>
                    <Button>
                        Sort Campaigns <DownOutlined />
                    </Button>
                </Dropdown>
                <Button onClick={() => setDrawerVisible(true)}>Saved Campaigns</Button>
            </Space>
        </div>

        {loading ? (
            <Spin size="large" />
        ) : (
            <Row gutter={[16, 16]}>
                {sortedCampaigns.map((campaign) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={campaign.id}>
                        <Card
                            hoverable
                            cover={<img alt={campaign.campaign_name} src={campaign.brand_logo || 'default_image_url.jpg'} style={{ height: '150px', objectFit: 'cover' }} />}
                            bodyStyle={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
                        >
                                <Meta
                                    title={campaign.brand_name || 'Unknown Brand'}
                                    description={
                                        <>
                                            <p><strong>Campaign: </strong> {campaign.campaign_name || 'Unnamed Campaign'}</p>
                                            <p><strong>Description: </strong> 
                                                {campaign.campaign_description 
                                                    ? `${campaign.campaign_description.substring(0, 60)}...` 
                                                    : 'No description available'}
                                            </p>
                                            <p><strong>Visibility: </strong> {renderVisibilityBadges(campaign.visibility)}</p>
                                            <p><strong>Budget: </strong> ${campaign.budget || 'Not specified'}</p>
                                            <p><strong>Days left: </strong> 
                                                {campaign.application_end_date 
                                                    ? `${calculateDaysLeft(campaign.application_end_date)} days` 
                                                    : 'N/A'}
                                            </p>
                                        </>
                                    }
                                />
                                <Space className="card-actions" wrap>
                                    <Button
                                        type="link"
                                        icon={<InfoCircleOutlined />}
                                        onClick={() => openDetailsModal(campaign)}
                                    >
                                        More details
                                    </Button>
                                    <Button
                                        type="link"
                                        icon={savedCampaignIds.has(campaign.id) ? <HeartFilled style={{ color: '#eb2f96' }} /> : <HeartOutlined />}
                                        onClick={() => handleSaveCampaign(campaign)}
                                    >
                                        {savedCampaignIds.has(campaign.id) ? 'Saved' : 'Save'}
                                    </Button>
                                    <Button
                                        type="link"
                                        icon={<PlusOutlined />}
                                        onClick={() => openSubmitRequestModal(campaign)}
                                    >
                                        Submit request
                                    </Button>
                                    </Space>
                                  {/* Avatar Group for Popularity Indicator */}
                                  <Avatar.Group
                                max={{ count: 3, popover: { placement: 'top' } }}
                                size="small"
                                style={{ marginTop: 10 }}
                            >
                                {campaign.applicants && campaign.applicants.slice(0, 3).map((applicant, index) => (
                                    <Avatar
                                        key={index}
                                        src={<img src={applicant.image_profile} alt="avatar" />}
                                        icon={<UserOutlined />}
                                    />
                                ))}
                                {campaign.applicants && campaign.applicants.length > 3 && (
                                    <span>+{campaign.applicants.length - 3}</span>
                                )}
                            </Avatar.Group>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}

            {/* Ant Design Drawer for saved campaigns */}
            <Drawer
                title="Saved Campaigns"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                visible={drawerVisible}
                width={350}
            >
                {savedCampaigns.length > 0 ? (
                    savedCampaigns.map((campaign) => (
                        <Card 
                            key={campaign.id} 
                            style={{ marginBottom: '10px' }}
                            actions={[
                                <Button type="link" onClick={() => openDetailsModal(campaign)}>More details</Button>,
                                <Button type="link" onClick={() => openSubmitRequestModal(campaign)}>Apply</Button>
                            ]}
                        >
                            <Meta
                                title={campaign.brand_name || 'Unknown Brand'}
                                description={
                                    <>
                                        <p><strong>Campaign:</strong> {campaign.campaign_name}</p>
                                        <p><strong>Budget:</strong> ${campaign.budget || 'Not specified'}</p>
                                        <p><strong>Days left:</strong> {campaign.application_end_date ? `${calculateDaysLeft(campaign.application_end_date)} days` : 'N/A'}</p>
                                    </>
                                }
                            />
                        </Card>
                    ))
                ) : (
                    <p>No saved campaigns.</p>
                )}
            </Drawer>

            {/* Submit Request Multi-Step Form Modal */}
            <Modal
                title={`Submit Request for ${selectedCampaign?.campaign_name}`}
                visible={isSubmitRequestModalVisible}
                onCancel={() => setIsSubmitRequestModalVisible(false)}
                footer={null}
            >
                <Progress percent={submissionProgress} size="small" />
                {currentStep === 1 && (
                    <div>
                        <h3>Step 1: Pitch your content idea</h3>
                        <Input.TextArea
                            value={pitchText}
                            onChange={handlePitchChange}
                            placeholder="Describe your content idea for this campaign (at least 150 characters)"
                            showCount
                            minLength={150}
                            maxLength={500}
                            style={{ resize: 'none', marginTop: 16 }}
                        />
                        <div style={{ marginTop: 16 }}>
                            <Button onClick={handleNextStep} disabled={pitchText.length < 150} type="primary">
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div>
                        <h3>Step 2: Share links to your top 3 posts</h3>
                        {postLinks.map((link, index) => (
                            <Input
                                key={index}
                                placeholder={`Post link ${index + 1}`}
                                value={link}
                                onChange={(e) => handlePostLinkChange(index, e.target.value)}
                                style={{ marginBottom: 8 }}
                            />
                        ))}
                        <div style={{ marginTop: 16 }}>
                            <Button onClick={handlePrevStep} style={{ marginRight: 8 }}>
                                Previous
                            </Button>
                            <Button onClick={handleNextStep} type="primary">
                                Next
                            </Button>
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <Result
                        icon={<SmileOutlined />}
                        title="Review & Submit Application"
                        subTitle="Review your pitch and post links, then submit your application."
                        extra={[
                            <Button key="previous" onClick={handlePrevStep}>
                                Previous
                            </Button>,
                            <Button
                                key="submit"
                                type="primary"
                                onClick={handleSubmitRequest} // Correct function call
                            >
                                Submit Application
                            </Button>,
                        ]}
                    >
                        <div style={{ marginBottom: 16 }}>
                            <h4>Pitch:</h4>
                            <p>{pitchText}</p>
                        </div>
                        <div>
                            <h4>Your Top 3 Posts:</h4>
                            {postLinks.map((link, index) => (
                                <p key={index}>{link || 'No link provided'}</p>
                            ))}
                        </div>
                    </Result>
                )}
            </Modal>

            {/* Full Campaign Details Modal */}
            <Modal
                title={selectedCampaign?.campaign_name}
                visible={isDetailsModalVisible}
                onCancel={() => setIsDetailsModalVisible(false)}
                footer={null}
            >
                {selectedCampaign && (
                    <>
                        <p><strong>Brand:</strong> {selectedCampaign.brand_name || 'Unknown Brand'}</p>
                        <p><strong>Campaign Name:</strong> {selectedCampaign.campaign_name || 'Unnamed Campaign'}</p>
                        <p><strong>Description:</strong> {selectedCampaign.campaign_description || 'No description available'}</p>
                        <p><strong>Budget:</strong> ${selectedCampaign.budget || 'Not specified'}</p>
                        <p><strong>Visibility:</strong> {renderVisibilityBadges(selectedCampaign.visibility)}</p>
                        <p><strong>Days left:</strong> {selectedCampaign.application_end_date ? `${calculateDaysLeft(selectedCampaign.application_end_date)} days` : 'N/A'}</p>
                    </>
                )}
            </Modal>
        </div>
    );
}

export default CampaignListing;