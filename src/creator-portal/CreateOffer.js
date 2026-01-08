import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Form, Input, Button, Select, InputNumber, notification, Card, Modal, Tooltip, Row, Col } from 'antd';
import { FiImage, FiVideo, FiCamera, FiFilm, FiFileText } from 'react-icons/fi';
import { MdOutlineLiveTv, MdOutlineAudiotrack } from 'react-icons/md';
import { UserContext } from '../contexts/UserContext';
import './CreateOffer.css';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Ensure Axios sends cookies globally (add this in index.js or a config file if not already present)
// axios.defaults.withCredentials = true;

const { TextArea } = Input;
const { Option } = Select;

function CreateOffer({ onClose }) {
    const { user } = useContext(UserContext);
    const [creatorId, setCreatorId] = useState(null);
    const [offerData, setOfferData] = useState({
        package_name: '',
        platform: '',
        content_type: '',
        description: '',
        price: '',
    });
    const [isRecapModalVisible, setIsRecapModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/profile', { withCredentials: true });
                console.log("🟢 Profile Response:", response.data);
                const fetchedCreatorId = response.data.creator_id;
                if (!fetchedCreatorId) {
                    throw new Error("Creator ID not found in profile response");
                }
                setCreatorId(fetchedCreatorId);
            } catch (error) {
                console.error('Error fetching user profile:', error);
                notification.error({
                    message: 'Error',
                    description: 'Failed to fetch user profile. Please log in again.',
                });
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOfferData({ ...offerData, [name]: value });
    };

    const handleContentTypeSelection = (content_type) => {
        setOfferData({ ...offerData, content_type });
    };

    const handlePlatformChange = (value) => {
        setOfferData({ ...offerData, platform: value });
    };

    const handlePriceChange = (value) => {
        setOfferData({ ...offerData, price: value });
    };

    const handleSubmit = async () => {
        if (!creatorId) {
            notification.error({
                message: 'Error',
                description: 'Creator ID is missing. Please log in again.',
            });
            return;
        }

        const payload = {
            creator_id: creatorId,
            package_name: offerData.package_name,
            platform: offerData.platform,
            content_type: offerData.content_type,
            price: offerData.price,
            description: offerData.description,
            quantity: 1,
        };

        try {
            setLoading(true);
            console.log("🟢 Submitting Offer Payload:", payload);
            const response = await axios.post(
                'http://localhost:5000/create-offer',
                payload,
                { withCredentials: true }
            );
            console.log("🟢 Create Offer Response:", response.data);

            notification.success({
                message: 'Offer Published!',
                description: response.data.message || 'Your offer has been created successfully.',
            });

            setIsRecapModalVisible(false);
            setOfferData({ package_name: '', platform: '', content_type: '', description: '', price: '' });
            onClose();
        } catch (error) {
            console.error('Error creating offer:', error);
            const errorMsg = error.response?.data?.error || 'Failed to create offer';
            notification.error({
                message: 'Error',
                description: errorMsg,
            });
            if (error.response?.status === 403) {
                notification.info({
                    message: 'Session Issue',
                    description: 'You may need to log in again to refresh your session.',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleReviewAndPublish = () => {
        const { package_name, platform, content_type, description, price } = offerData;
        if (!package_name || !platform || !content_type || !description || !price) {
            notification.error({
                message: 'Incomplete Form',
                description: 'Please fill out all required fields before reviewing.',
            });
            return;
        }
        setIsRecapModalVisible(true);
    };

    const contentTypes = [
        { type: 'Static Posts', icon: <FiImage /> },
        { type: 'Stories', icon: <FiCamera /> },
        { type: 'Short Videos', icon: <FiVideo /> },
        { type: '10min+ Videos', icon: <FiFilm /> },
        { type: 'User-Generated Content', icon: <FiFileText /> },
        { type: 'Live Streaming', icon: <MdOutlineLiveTv /> },
        { type: 'Audio Content', icon: <MdOutlineAudiotrack /> },
    ];

    return (
        <div className="create-offer-container">
            <h2>Create a New Offer</h2>
            {loading ? (
                <LoadingSpinner text="Creating offer..." />
            ) : (
                <Form layout="vertical" onFinish={handleSubmit}>
                    <Form.Item label="Select Content Type" required>
                        <Row gutter={[16, 16]}>
                            {contentTypes.map((content) => (
                                <Col span={8} key={content.type}>
                                    <Card
                                        hoverable
                                        className={offerData.content_type === content.type ? 'selected' : ''}
                                        onClick={() => handleContentTypeSelection(content.type)}
                                        style={{ borderRadius: '8px', padding: '12px', minHeight: '150px' }}
                                    >
                                        <div className="deliverable-card-content">
                                            {content.icon}
                                            <div className="deliverable-text">
                                                <strong>{content.type}</strong>
                                            </div>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Form.Item>

                    <Form.Item label="Platform" required>
                        <Select
                            placeholder="Select a platform"
                            value={offerData.platform}
                            onChange={handlePlatformChange}
                            style={{ width: '100%' }}
                        >
                            <Option value="Instagram">Instagram</Option>
                            <Option value="TikTok">TikTok</Option>
                            <Option value="YouTube">YouTube</Option>
                            <Option value="Facebook">Facebook</Option>
                            <Option value="Twitter">Twitter</Option>
                            <Option value="LinkedIn">LinkedIn</Option>
                            <Option value="Snapchat">Snapchat</Option>
                            <Option value="Pinterest">Pinterest</Option>
                            <Option value="Twitch">Twitch</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item label="Package Name" required>
                        <Input
                            name="package_name"
                            value={offerData.package_name}
                            onChange={handleChange}
                            placeholder="e.g., 'Basic YouTube Review'"
                        />
                    </Form.Item>

                    <Form.Item label="Offer Description" required>
                        <Tooltip title="Describe what's included in your content">
                            <TextArea
                                name="description"
                                value={offerData.description}
                                onChange={handleChange}
                                placeholder="Provide a quick overview of the offer"
                                rows={4}
                            />
                        </Tooltip>
                    </Form.Item>

                    <Form.Item label="Price (€)" required>
                        <Tooltip title="Set your price in Euros">
                            <InputNumber
                                style={{ width: '100%' }}
                                value={offerData.price}
                                onChange={handlePriceChange}
                                placeholder="Enter offer price"
                                min={0}
                                formatter={(value) => `${value}`.replace(/\D/g, '')}
                                parser={(value) => value.replace(/\D/g, '')}
                            />
                        </Tooltip>
                    </Form.Item>

                    <Row justify="space-between">
                        <Col>
                            <Button type="default" onClick={onClose} disabled={loading}>
                                Back
                            </Button>
                        </Col>
                        <Col>
                            <Button type="primary" onClick={handleReviewAndPublish} loading={loading}>
                                Review & Publish
                            </Button>
                        </Col>
                    </Row>
                </Form>
            )}

            <Modal
                title="Review and Publish Offer"
                visible={isRecapModalVisible}
                onCancel={() => setIsRecapModalVisible(false)}
                onOk={handleSubmit}
                okText="Publish"
                confirmLoading={loading}
            >
                <h3>Content Type</h3>
                <p>{offerData.content_type || 'N/A'}</p>
                <h3>Platform</h3>
                <p>{offerData.platform || 'N/A'}</p>
                <h3>Package Name</h3>
                <p>{offerData.package_name || 'N/A'}</p>
                <h3>Offer Description</h3>
                <p>{offerData.description || 'N/A'}</p>
                <h3>Price</h3>
                <p>{offerData.price ? `€${offerData.price}` : 'N/A'}</p>
            </Modal>
        </div>
    );
}

export default CreateOffer;