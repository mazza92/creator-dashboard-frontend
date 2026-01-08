import React, { useState, useEffect } from 'react';
import { Table, Button, Tooltip, Tag, Modal, notification } from 'antd'; // Import Ant Design components
import axios from 'axios';
import moment from 'moment';
import Chatbox from '../components/Chatbox';  // Assuming you put Chatbox.js inside src/components

function SubmissionHistory() {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false); // Modal control
    const [messages, setMessages] = useState([]);   // For chat messages
    const [currentMessage, setCurrentMessage] = useState('');
    const [selectedRequestId, setSelectedRequestId] = useState(null); // To track which request is being replied to

    useEffect(() => {
        // Fetch all submissions
        const fetchSubmissions = async () => {
            try {
                const response = await axios.get('http://localhost:5000/creator-submission-history');
                setSubmissions(response.data);
            } catch (error) {
                console.error("Error fetching submissions:", error);
            } finally {
                setIsLoading(false); // Set loading to false when the fetch is done
            }
        };
        fetchSubmissions();
    }, []);

    const showReplyModal = async (requestId) => {
        setSelectedRequestId(requestId);
        setIsModalVisible(true); // Open the modal

        // Fetch existing messages for the request
        try {
            const response = await axios.get(`http://localhost:5000/messages/${requestId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendReply = async () => {
            try {
        await axios.post(`http://localhost:5000/reply-inquiry/${selectedRequestId}`, {
            message: currentMessage,  // Ensure this is coming from the input field
            sender_type: 'creator'  // Set this based on the sender (can be 'creator' or 'brand')
        });
    
            setMessages([...messages, { sender_type: 'creator', message: currentMessage, created_at: new Date() }]);
            setCurrentMessage('');
    
            // Update status to "Waiting for Brand Response"
            await axios.put(`http://localhost:5000/applications/${selectedRequestId}/update-status`, {
                status: 'Waiting for Brand Response'
            });
    
            // Reflect the status change in the UI
            setSubmissions(submissions.map(submission => 
                submission.id === selectedRequestId ? { ...submission, status: 'Waiting for Brand Response' } : submission
            ));
    
            notification.success({
                message: 'Reply Sent',
                description: 'Your reply has been successfully sent to the brand.',
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

    const columns = [
        {
            title: 'Brand',
            dataIndex: 'brand_name',
            key: 'brand_name',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)} key={status}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Date of Submission',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => moment(date).format('YYYY-MM-DD'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                record.status === 'Waiting for Creator Response' ? (
                    <Tooltip title="Reply to Brand Inquiry">
                        <Button type="primary" onClick={() => showReplyModal(record.id)}>
                            Reply
                        </Button>
                    </Tooltip>
                ) : (
                    <span>No actions available</span>
                )
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
            case 'Waiting for Brand Response':
                return 'orange';
            default:
                return 'gray';
        }
    };

    return (
        <div className="submission-history-container">
            <h1>Your Collaboration Requests</h1>
            <Table
                columns={columns}
                dataSource={submissions}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal for replying to inquiry */}
            <Modal
                title="Reply to Inquiry"
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsModalVisible(false)}>Cancel</Button>,
                    <Button key="send" type="primary" onClick={handleSendReply}>Send Reply</Button>
                ]}
            >
                <Chatbox 
        messages={messages}
        currentMessage={currentMessage}
        onMessageChange={(e) => setCurrentMessage(e.target.value)}  // Handle message change
        onSendMessage={handleSendReply}  // Function to send a message
        senderType="creator"  // To distinguish messages from the creator
    />
</Modal>
        </div>
    );
}

export default SubmissionHistory;
