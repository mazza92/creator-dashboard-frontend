import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Tooltip, Tag, Collapse, Avatar, Modal, notification } from 'antd';
import { MessageOutlined } from '@ant-design/icons';
import axios from 'axios';
import Chatbox from '../components/Chatbox';

const { Panel } = Collapse;

function MyCreatorsPage() {
    const [creators, setCreators] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isReplyModalVisible, setIsReplyModalVisible] = useState(false); 
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [selectedCreatorId, setSelectedCreatorId] = useState(null);

    useEffect(() => {
        const fetchSavedCreators = async () => {
            try {
                const response = await axios.get('http://localhost:5000/saved-creators');
                setCreators(response.data);
            } catch (error) {
                console.error("Error fetching saved creators:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSavedCreators();
    }, []);

    const showReplyModal = async (creatorId) => {
        setSelectedCreatorId(creatorId);
        setIsReplyModalVisible(true);
        try {
            const response = await axios.get(`http://localhost:5000/messages/${creatorId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendReply = async () => {
        try {
            const senderType = 'brand';
            await axios.post(`http://localhost:5000/reply-inquiry/${selectedCreatorId}`, {
                message: currentMessage,
                sender_type: senderType,
            });
            setMessages([...messages, { sender_type: senderType, message: currentMessage, created_at: new Date() }]);
            setCurrentMessage('');
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

    const removeSavedCreator = async (creatorId) => {
        try {
            await axios.delete(`http://localhost:5000/remove-creator/${creatorId}`);
            setCreators(creators.filter(creator => creator.id !== creatorId));
            notification.success({
                message: 'Creator Removed',
                description: 'This creator has been removed from your saved list.',
                placement: 'topRight',
                duration: 3,
            });
        } catch (error) {
            console.error('Error removing creator:', error);
        }
    };

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'creator_id',
            key: 'creator_id',
            render: (creatorId) => (
                <Avatar src={creators.find(creator => creator.id === creatorId)?.profile_image || "default_profile_image_url.jpg"} size={50} />
            ),
        },
        {
            title: 'Creator Name',
            dataIndex: 'creator_id',
            key: 'creator_id',
            render: (creatorId) => <strong>{creators.find(creator => creator.id === creatorId)?.name || 'N/A'}</strong>,
        },
        {
            title: 'Topics',
            dataIndex: 'creator_id',
            key: 'creator_id',
            render: (creatorId) => creators.find(creator => creator.id === creatorId)?.topics || 'N/A',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => <Tag color={getStatusColor(status)}>{status.toUpperCase()}</Tag>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <div>
                    <Tooltip title="Remove Creator">
                        <Button type="primary" danger onClick={() => removeSavedCreator(record.creator_id)}>
                            Remove
                        </Button>
                    </Tooltip>
                    <Tooltip title="Message Creator">
                        <Badge count={messages.length}>
                            <MessageOutlined onClick={() => showReplyModal(record.creator_id)} style={{ fontSize: '24px', marginLeft: 10, cursor: 'pointer' }} />
                        </Badge>
                    </Tooltip>
                </div>
            ),
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'collaborated':
                return 'green';
            case 'saved':
                return 'blue';
            default:
                return 'gray';
        }
    };

    return (
        <div className="my-creators-page">
            <h1>My Creators</h1>
            <Table
                columns={columns}
                dataSource={creators}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
            />

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

export default MyCreatorsPage;
