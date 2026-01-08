import React, { useState } from 'react';
import axios from 'axios';
import { Form, Input, Button, Select, DatePicker, InputNumber, notification, Radio, Row, Col, Card, Modal, Tooltip } from 'antd';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { FiImage, FiVideo, FiCamera, FiFilm, FiFileText } from 'react-icons/fi';  // Feather icons
import { MdOutlineLiveTv, MdOutlineAudiotrack } from 'react-icons/md';  // Material icons
import './CreateCampaign.css';  // Custom styles

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

function CreateCampaign({ onClose }) {
    const { trackAdSlotPublished } = useAnalytics();
    const [campaignData, setCampaignData] = useState({
        campaign_name: '',
        product_url: '',
        campaign_description: '',
        target_audience_location: [],
        target_audience_age: [],
        application_start_date: null,  // Separate start date
        application_end_date: null,    // Separate end date
        deliverables: [],
        number_of_creators: 1,
        budget: '',
        currency: 'USD',
        gift_free_products: 'no',
    });

    const [isRecapModalVisible, setIsRecapModalVisible] = useState(false); // For recap modal visibility


    const handleChange = (e) => {
        const { name, value } = e.target;
        setCampaignData({ ...campaignData, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.post('http://localhost:5000/create-campaign', {
                brand_id: 1,  // Replace with dynamic brand_id from session or state
                ...campaignData,
            });
            
            // Track ad slot/campaign published
            trackAdSlotPublished({
                campaign_id: response.data.campaign_id || response.data.id,
                campaign_name: campaignData.campaign_name,
                currency: campaignData.currency,
                budget: campaignData.budget,
                number_of_creators: campaignData.number_of_creators,
                target_audience_location: campaignData.target_audience_location,
                deliverables: campaignData.deliverables
            }, 'brand');
            
            notification.success({
                message: 'Campaign Published!',
                description: response.data.message,
            });
            setIsRecapModalVisible(false);  // Close recap modal
            onClose();  // Close the CreateCampaign modal
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response ? error.response.data.error : 'Failed to create campaign',
            });
        }
    };

    const handleDeliverablesSelection = (deliverable) => {
        setCampaignData((prev) => {
            const newDeliverables = [...prev.deliverables];
            if (newDeliverables.includes(deliverable)) {
                return { ...prev, deliverables: newDeliverables.filter((d) => d !== deliverable) };
            } else {
                return { ...prev, deliverables: [...newDeliverables, deliverable] };
            }
        });
    };

    const handleLocationChange = (value) => {
        setCampaignData({ ...campaignData, target_audience_location: value || [] });
    };

    const handleAgeChange = (value) => {
        setCampaignData({ ...campaignData, target_audience_age: value || [] });
    };

    // Handle Review and Publish
    const handleReviewAndPublish = () => setIsRecapModalVisible(true);

    return (
        <div className="create-campaign-container">
            <h2>Create a New Campaign</h2>
            <p>Create a new campaign that will be visible to all content creators and receive collaboration requests from interested creators.</p>

            <Form layout="vertical" onFinish={handleSubmit}>
                {/* Campaign Name */}
                <Form.Item label="Campaign Name" required>
                    <Tooltip title="This is the first thing creators will see, make sure it's informative e.g., New Spring Summer 25 Collection launch">
                        <Input
                            name="campaign_name"
                            value={campaignData.campaign_name}
                            onChange={handleChange}
                            placeholder="Enter campaign name"
                        />
                    </Tooltip>
                </Form.Item>

                {/* Product/Service URL */}
                <Form.Item label="Product/Service URL" required>
                    <Tooltip title="Creators want to see the specific product/service you would like to promote">
                        <Input
                            name="product_url"
                            value={campaignData.product_url}
                            onChange={handleChange}
                            placeholder="Enter product/service URL"
                        />
                    </Tooltip>
                </Form.Item>

                {/* Campaign Description */}
                <Form.Item label="Campaign Description" required>
                    <Tooltip title="Describe your brand's mission, audience base, and campaign goals. (Minimum 150 characters required)">
                        <TextArea
                            name="campaign_description"
                            value={campaignData.campaign_description}
                            onChange={handleChange}
                            placeholder="Describe your campaign (Minimum 150 characters)"
                            showCount
                            minLength={150}
                        />
                    </Tooltip>
                </Form.Item>

                {/* Audience Location */}
                <Form.Item label="Audience Location" required>
                <Select
                    mode="multiple"
                    placeholder="Select audience location"
                    value={campaignData.target_audience_location}
                    onChange={handleLocationChange}
                >
                    <Option value="US">United States</Option>
                    <Option value="UK">United Kingdom</Option>
                    <Option value="EU">Europe</Option>
                    <Option value="Asia">Asia</Option>
                </Select>
            </Form.Item>

                {/* Audience Age */}
                <Form.Item label="Audience Age" required>
                <Select
                    mode="multiple"
                    placeholder="Select audience age range"
                    value={campaignData.target_audience_age}
                    onChange={handleAgeChange}
                >
                    <Option value="18-24">18-24</Option>
                    <Option value="25-34">25-34</Option>
                    <Option value="35-44">35-44</Option>
                    <Option value="45-54">45-54</Option>
                </Select>
            </Form.Item>

                {/* Application Period */}
                <Form.Item label="Application Period" required>
                    <RangePicker
                        style={{ width: '100%' }}
                        onChange={(dates, dateStrings) => setCampaignData({
                            ...campaignData,
                            application_start_date: dateStrings[0],
                            application_end_date: dateStrings[1],
                        })}
                    />
                </Form.Item>

                {/* Deliverables */}
                <Form.Item label="Deliverables" required>
                    <Row gutter={[16, 16]}>
                        <Col span={8}>
                            <Card
                                hoverable
                                className={campaignData.deliverables.includes('Static Posts') ? 'selected' : ''}
                                onClick={() => handleDeliverablesSelection('Static Posts')}
                                style={{ borderRadius: '8px', padding: '12px', minHeight: '150px' }}
                            >
                                <div className="deliverable-card-content">
                                    <FiImage className="deliverable-icon" />
                                    <div className="deliverable-text">
                                        <strong>Static Posts</strong>
                                        <p>Image/Video Posts, Blogs</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card
                                hoverable
                                className={campaignData.deliverables.includes('Stories') ? 'selected' : ''}
                                onClick={() => handleDeliverablesSelection('Stories')}
                                style={{ borderRadius: '8px', padding: '12px', minHeight: '150px' }}
                            >
                                <div className="deliverable-card-content">
                                    <FiVideo className="deliverable-icon" />
                                    <div className="deliverable-text">
                                        <strong>Stories</strong>
                                        <p>Image and Video Stories</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card
                                hoverable
                                className={campaignData.deliverables.includes('Short Videos') ? 'selected' : ''}
                                onClick={() => handleDeliverablesSelection('Short Videos')}
                                style={{ borderRadius: '8px', padding: '12px', minHeight: '150px' }}
                            >
                                <div className="deliverable-card-content">
                                    <FiCamera className="deliverable-icon" />
                                    <div className="deliverable-text">
                                        <strong>Short Videos</strong>
                                        <p>Reels, TikTok-style, Shorts</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card
                                hoverable
                                className={campaignData.deliverables.includes('10min+ Videos') ? 'selected' : ''}
                                onClick={() => handleDeliverablesSelection('10min+ Videos')}
                                style={{ borderRadius: '8px', padding: '12px', minHeight: '150px' }}
                            >
                                <div className="deliverable-card-content">
                                    <FiFilm className="deliverable-icon" />
                                    <div className="deliverable-text">
                                        <strong>10min+ Videos</strong>
                                        <p>In-Depth Reviews, Tutorials</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card
                                hoverable
                                className={campaignData.deliverables.includes('Live Streaming') ? 'selected' : ''}
                                onClick={() => handleDeliverablesSelection('Live Streaming')}
                                style={{ borderRadius: '8px', padding: '12px', minHeight: '150px' }}
                            >
                                <div className="deliverable-card-content">
                                    <MdOutlineLiveTv className="deliverable-icon" />
                                    <div className="deliverable-text">
                                        <strong>Live Streaming</strong>
                                        <p>Product Launches, Events</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col span={8}>
                        <Card
                            hoverable
                            className={campaignData.deliverables.includes('User-Generated Content') ? 'selected' : ''}
                            onClick={() => handleDeliverablesSelection('User-Generated Content')}
                            style={{ borderRadius: '8px', padding: '12px', minHeight: '150px' }}
                        >
                            <div className="deliverable-card-content">
                                <FiFileText className="deliverable-icon" />
                                <div className="deliverable-text">
                                    <strong>User-Generated Content</strong>
                                    <p>Branded Photoshoots, Raw Content</p>
                                </div>
                            </div>
                        </Card>
                        </Col>
                        <Col span={8}>
                            <Card
                                hoverable
                                className={campaignData.deliverables.includes('Audio Content') ? 'selected' : ''}
                                onClick={() => handleDeliverablesSelection('Audio Content')}
                                style={{ borderRadius: '8px', padding: '12px', minHeight: '150px' }}
                            >
                                <div className="deliverable-card-content">
                                    <MdOutlineAudiotrack className="deliverable-icon" />
                                    <div className="deliverable-text">
                                        <strong>Audio Content</strong>
                                        <p>Podcast Mentions, Sponsored Episodes</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Form.Item>

                {/* Number of Creators */}
                <Form.Item label="Number of Creators Needed">
                    <InputNumber
                        min={1}
                        value={campaignData.number_of_creators}
                        onChange={(value) => setCampaignData({ ...campaignData, number_of_creators: value })}
                        addonBefore="-"
                        addonAfter="+"
                    />
                </Form.Item>

                {/* Budget */}
                <Form.Item label="Budget">
                <Input.Group compact>
                    <Select
                        defaultValue={campaignData.currency}
                        onChange={(value) => setCampaignData({ ...campaignData, currency: value })}
                        style={{ width: '25%' }}
                    >
                        <Option value="USD">USD</Option>
                        <Option value="EUR">EUR</Option>
                        <Option value="GBP">GBP</Option>
                    </Select>
                    <InputNumber
                        style={{ width: '75%' }}
                        name="budget"
                        value={campaignData.budget}
                        onChange={(value) => setCampaignData({ ...campaignData, budget: value })}
                        placeholder="Enter budget"
                        min={0}  // Set minimum value to prevent negative input
                        formatter={(value) => `${value}`.replace(/\D/g, '')} // Formats only numbers in the display
                        parser={(value) => value.replace(/\D/g, '')}  // Parses only numeric input
                    />
                    </Input.Group>
                    </Form.Item>

                {/* Gift Free Products */}
                <Form.Item label="Gift Free Products">
                    <Radio.Group
                        onChange={(e) => setCampaignData({ ...campaignData, gift_free_products: e.target.value })}
                        value={campaignData.gift_free_products}
                    >
                        <Radio value="yes">Yes</Radio>
                        <Radio value="no">No</Radio>
                    </Radio.Group>
                </Form.Item>

                {/* Buttons */}
                <Row justify="space-between">
                <Col>
                    <Button
                        type="default"
                        onClick={onClose}  // Close the modal
                    >
                        Back
                    </Button>
                    </Col>
                    <Col>
                    <Button type="primary" onClick={handleReviewAndPublish}>
                            Review & Publish
                        </Button>
                    </Col>
                </Row>
            </Form>
        
                {/* Recap Modal for Review */}
                <Modal
                title="Review and Publish Campaign"
                visible={isRecapModalVisible}
                onCancel={() => setIsRecapModalVisible(false)}
                onOk={handleSubmit}  // Publish campaign on OK
                okText="Publish"
            >
                <h3>Campaign Name</h3>
                <p>{campaignData.campaign_name || 'N/A'}</p>
                <h3>Product/Service URL</h3>
                <p>{campaignData.product_url || 'N/A'}</p>
                <h3>Campaign Description</h3>
                <p>{campaignData.campaign_description || 'N/A'}</p>
                <h3>Audience Location</h3>
                <p>{(campaignData.target_audience_location || []).join(', ')}</p>
                <h3>Audience Age</h3>
                <p>{(campaignData.target_audience_age || []).join(', ')}</p>
                <h3>Application Period</h3>
                <p>{campaignData.application_start_date || 'N/A'} - {campaignData.application_end_date || 'N/A'}</p>
                <h3>Deliverables</h3>
                <p>{(campaignData.deliverables || []).join(', ')}</p>
                <h3>Number of Creators Needed</h3>
                <p>{campaignData.number_of_creators || 'N/A'}</p>
                <h3>Budget</h3>
                <p>{`${campaignData.currency || 'USD'} ${campaignData.budget || 'N/A'}`}</p>
                <h3>Gift Free Products</h3>
                <p>{campaignData.gift_free_products === 'yes' ? 'Yes' : 'No'}</p>
            </Modal>
        </div>
    );
}

export default CreateCampaign;
