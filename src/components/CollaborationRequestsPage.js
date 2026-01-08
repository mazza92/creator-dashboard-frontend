import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Tooltip, Tag, Collapse, Avatar, Modal, Input, notification } from 'antd'; 
import { FacebookOutlined, TwitterOutlined, InstagramOutlined, YoutubeOutlined, LinkOutlined } from '@ant-design/icons';
import { MessageOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import Chatbox from '../components/Chatbox';

const { Panel } = Collapse;

function CollaborationRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [creators, setCreators] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false); // Modal control for inquiry
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false); // Modal control for reply
    const [messages, setMessages] = useState([]); // For chat messages
    const [currentMessage, setCurrentMessage] = useState(''); // Message input by brand
    const [selectedRequestId, setSelectedRequestId] = useState(null); // Selected request ID
    const [inquiryMessage, setInquiryMessage] = useState(''); // Message input for inquiry

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const [requestsRes, creatorsRes] = await Promise.all([
                    axios.get('http://localhost:5000/collaboration-requests'),
                    axios.get('http://localhost:5000/creators')  // Fetching creators data
                ]);

                setRequests(requestsRes.data);
                setCreators(creatorsRes.data);
            } catch (error) {
                console.error("Error fetching requests and creators:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRequests();
    }, []);

    const showReplyModal = async (requestId) => {
        setSelectedRequestId(requestId);
        setIsReplyModalVisible(true);

        // Fetch existing messages for the request
        try {
            const response = await axios.get(`http://localhost:5000/messages/${requestId}`);
            setMessages(response.data); // Load existing messages into the state
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const submitInquiry = async () => {
        try {
            await axios.put(`http://localhost:5000/applications/${selectedRequestId}/inquire`, {
                inquiry_message: inquiryMessage  // Custom inquiry message
            });

            // Update status to "Waiting for Creator Response" in the database and UI
            setRequests(requests.map(request => 
                request.id === selectedRequestId ? { ...request, status: 'Waiting for Creator Response' } : request
            ));

            notification.success({
                message: 'Inquiry Sent',
                description: 'Inquiry has been sent successfully!',
                placement: 'topRight',
            });
            setIsModalVisible(false);  // Close the modal
            setInquiryMessage('');  // Clear the inquiry message field
        } catch (error) {
            console.error('Error inquiring application:', error);
            notification.error({
                message: 'Inquiry Failed',
                description: 'Failed to send inquiry, please try again.',
                placement: 'topRight',
            });
        }
    };

    // Fetch unread message count for each request
    const getUnreadCount = (requestId) => {
        const request = requests.find(req => req.id === requestId);
        return request ? request.unread_count || 0 : 0;  // Ensure unread_count is fetched from backend
    };

    const handleSendReply = async () => {
        try {
            const senderType = 'brand';  // Set this to 'brand' when the brand is sending a message

            // Sending message
            await axios.post(`http://localhost:5000/reply-inquiry/${selectedRequestId}`, {
                message: currentMessage,
                sender_type: senderType,  // Pass the correct sender type
            });

            setMessages([...messages, { sender_type: senderType, message: currentMessage, created_at: new Date() }]);
            setCurrentMessage('');

            // Update status to "Waiting for Creator Response"
            await axios.put(`http://localhost:5000/applications/${selectedRequestId}/update-status`, {
                status: 'Waiting for Creator Response'
            });

            // Reflect the status change in the UI
            setRequests(requests.map(request => 
                request.id === selectedRequestId ? { ...request, status: 'Waiting for Creator Response' } : request
            ));

            notification.success({
                message: 'Reply Sent',
                description: 'Your reply has been successfully sent to the creator.',
                placement: 'topRight',
            });
        } catch (error) {
            console.error('Error sending reply:', error);
            notification.error({
                message: 'Reply Failed',
                description: 'Failed to send your reply, please try again.',
                placement: 'topRight',
            });
        }
    };

    // Function to merge creator data with requests
    const getCreatorData = (creatorId, key) => {
        const creator = creators.find(c => c.id === creatorId);
        return creator ? creator[key] : 'N/A';  // Return 'N/A' if creator data is not found
    };

    const handleAccept = async (requestId) => {
        try {
            await axios.put(`http://localhost:5000/applications/${requestId}/accept`);
            alert('Application accepted successfully!');
        } catch (error) {
            console.error('Error accepting application:', error);
        }
    };

    const handleDecline = async (requestId) => {
        try {
            await axios.put(`http://localhost:5000/applications/${requestId}/decline`);
            alert('Application declined successfully!');
        } catch (error) {
            console.error('Error declining application:', error);
        }
    };

    const renderTopics = (topics) => {
        if (typeof topics === 'string') {
            return topics.split(',').map(topic => topic.trim()).join(', ');
        }
        return 'N/A';  // Return 'N/A' if topics are empty or not a string
    };

    const renderSocialLinks = (socialLinks) => {
        try {
            const parsedLinks = JSON.parse(socialLinks);
            return (
                <div>
                    {parsedLinks.Instagram && (
                        <a href={parsedLinks.Instagram} target="_blank" rel="noopener noreferrer">
                            <InstagramOutlined style={{ fontSize: '20px', marginRight: '10px' }} />
                        </a>
                    )}
                    {parsedLinks.YouTube && (
                        <a href={parsedLinks.YouTube} target="_blank" rel="noopener noreferrer">
                            <YoutubeOutlined style={{ fontSize: '20px', marginRight: '10px' }} />
                        </a>
                    )}
                    {parsedLinks.Facebook && (
                        <a href={parsedLinks.Facebook} target="_blank" rel="noopener noreferrer">
                            <FacebookOutlined style={{ fontSize: '20px', marginRight: '10px' }} />
                        </a>
                    )}
                    {parsedLinks.Twitter && (
                        <a href={parsedLinks.Twitter} target="_blank" rel="noopener noreferrer">
                            <TwitterOutlined style={{ fontSize: '20px', marginRight: '10px' }} />
                        </a>
                    )}
                    {parsedLinks.website && (
                        <a href={parsedLinks.website} target="_blank" rel="noopener noreferrer">
                            <LinkOutlined style={{ fontSize: '20px' }} />
                        </a>
                    )}
                </div>
            );
        } catch (error) {
            return 'N/A';
        }
    };

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'creator_id',
            key: 'creator_id',
            render: (creatorId) => (
                <Avatar
                    src={getCreatorData(creatorId, 'profile_image') || "default_profile_image_url.jpg"}
                    size={50}
                />
            ),
        },
        {
            title: 'Creator Name',
            dataIndex: 'creator_id',
            key: 'creator_id',
            render: (creatorId) => <strong>{getCreatorData(creatorId, 'name')}</strong>,
        },
        {
            title: 'Topics',
            dataIndex: 'creator_id',
            key: 'creator_id',
            render: (creatorId) => renderTopics(getCreatorData(creatorId, 'topics')),
        },
        {
            title: 'Statistics',
            key: 'statistics',
            render: (text, record) => (
                <Collapse>
                    <Panel header="View Statistics" key="1">
                        <p><strong>Followers:</strong> {record.statistics?.followers_count || 'N/A'}</p>
                        <p><strong>Accounts Reached:</strong> {record.statistics?.accounts_reached || 'N/A'}</p>
                        <p><strong>Impressions:</strong> {record.statistics?.impressions || 'N/A'}</p>
                        <p><strong>Top Locations:</strong> {Array.isArray(record.statistics?.top_locations) ? record.statistics.top_locations.join(', ') : 'N/A'}</p>
                        <p><strong>Primary Age Range:</strong> {record.statistics?.primary_age_range || 'N/A'}</p>
                        <p><strong>Gender Reach Ratio:</strong> {record.statistics?.gender_reach_ratio || 'N/A'}</p>
                    </Panel>
                </Collapse>
            ),
        },
        {
            title: 'Commercial Model',
            dataIndex: 'commercial_model',
            key: 'commercial_model',
        },
        {
            title: 'Commission Percentage',
            dataIndex: 'commission_percentage',
            key: 'commission_percentage',
            render: (commission) => commission ? `${commission}%` : '-',
        },
        {
            title: 'Fixed Fee (€)',
            dataIndex: 'fixed_fee',
            key: 'fixed_fee',
            render: (fee) => fee ? `€${parseFloat(fee).toLocaleString()}` : '-',
        },
        {
            title: 'Social Links',
            dataIndex: 'creator_id',
            key: 'creator_id',
            render: (creatorId) => renderSocialLinks(getCreatorData(creatorId, 'social_links')),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>
            ),
        },
        {
            title: 'Submit Date',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => moment(date).format('YYYY-MM-DD'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Tooltip title="Accept">
                        <Button type="primary" shape="circle" icon={<CheckOutlined />} onClick={() => handleAccept(record.id)} />
                    </Tooltip>
                    <Tooltip title="Decline">
                        <Button type="danger" shape="circle" icon={<CloseOutlined />} onClick={() => handleDecline(record.id)} style={{ marginLeft: 10 }} />
                    </Tooltip>
                    <Tooltip title="Inquire">
                        {/* Message icon with badge */}
                        <Badge count={getUnreadCount(record.id)}>
                            <MessageOutlined 
                                onClick={() => showReplyModal(record.id)} 
                                style={{ fontSize: '24px', marginLeft: 10, cursor: 'pointer' }}
                            />
                        </Badge>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'green';
            case 'declined':
                return 'red';
            case 'pending':
                return 'blue';
            case 'Waiting for Creator Response':
                return 'gold';
            default:
                return 'gray';
        }
    };

    return (
        <div className="collaboration-requests-container">
            <h1>Collaboration Requests</h1>
            <Table
                columns={columns}
                dataSource={requests}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal for sending inquiry */}
            <Modal
                title="Send Inquiry"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={submitInquiry}
            >
                <Input.TextArea
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Type your inquiry message..."
                />
            </Modal>

            {/* Modal for replying to inquiry */}
            <Modal
                title="Message Creator"
                open={isReplyModalVisible}
                onCancel={() => setIsReplyModalVisible(false)}
                footer={null}
            >
               <Chatbox 
                    messages={messages}
                    currentMessage={currentMessage}
                    onMessageChange={(e) => setCurrentMessage(e.target.value)}  // Handle message change
                    onSendMessage={handleSendReply}  // Function to send a message
                    senderType="brand"  // To distinguish messages from brand
                />
            </Modal>
        </div>
    );
}

export default CollaborationRequestsPage;
