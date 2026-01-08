import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, List, Modal, Input, notification } from 'antd'; // Corrected Input import from 'antd'
import { Link, Route, Routes } from 'react-router-dom';
import Slider from "react-slick";  // For carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CreateCampaign from './components/CreateCampaign';
import ManageCampaigns from './components/ManageCampaigns';
import EditCampaign from './components/EditCampaign';
import './App.css';

// Import missing components
import CollaborationRequestsPage from './components/CollaborationRequestsPage';
import PartnerMatch from './components/PartnerMatch';

// Icons for quick actions
import { FaCheck, FaTimes, FaQuestionCircle, FaAngleRight } from 'react-icons/fa';

const ModalComponent = ({ show, onClose, creator }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button onClick={onClose} className="modal-close-button">X</button>
                {creator && (
                    <>
                        <h2>{creator.name}</h2>
                        <p><strong>Followers:</strong> {creator.followers_count}</p>
                        <p><strong>Bio:</strong> {creator.bio}</p>
                    </>
                )}
            </div>
        </div>
    );
};

function BrandApp() {
    const [creators, setCreators] = useState([]);
    const [requests, setRequests] = useState([]);
    const [applications, setApplications] = useState([]);  // New applications state
    const [modalVisible, setModalVisible] = useState(false);
    const [declineModalVisible, setDeclineModalVisible] = useState(false); // For Decline Modal
    const [selectedApplication, setSelectedApplication] = useState(null); // To track selected application
    const [selectedCreator, setSelectedCreator] = useState(null);
    const [declineReason, setDeclineReason] = useState('');  // Decline reason state
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [customMessage, setCustomMessage] = useState('');

    useEffect(() => {
        const fetchCreators = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("http://localhost:5000/creators");
                setCreators(response.data);
            } catch (error) {
                console.error("Error fetching creators:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchRequests = async () => {
            try {
                const response = await axios.get("http://localhost:5000/collaboration-requests");
                setRequests(response.data.slice(0, 6)); // Show only the 6 newest requests
            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };

        const fetchApplications = async () => {
            try {
                const response = await axios.get("http://localhost:5000/campaign-applications");
                setApplications(response.data); // Fetch active campaign applications
            } catch (error) {
                console.error("Error fetching campaign applications:", error);
            }
        };

        fetchCreators();
        fetchRequests();
        fetchApplications();  // Fetch campaign applications
    }, []); // No need for applications in dependencies because it's set internally

    const handleAccept = async (applicationId) => {
        try {
            await axios.put(`http://localhost:5000/applications/${applicationId}/accept`);
            setApplications(applications.map(app => 
                app.id === applicationId ? { ...app, status: 'accepted' } : app
            ));
            notification.success({
                message: 'Application Accepted',
                description: 'The application has been successfully accepted.',
                placement: 'topRight',
                duration: 3,
            });
        } catch (error) {
            console.error('Error accepting application:', error);
        }
    };

        // Handle Decline with Reason
        const handleDecline = (applicationId) => {
            setSelectedApplication(applicationId);
            setDeclineModalVisible(true);
        };
    
        const submitDeclineReason = async () => {
            try {
                await axios.put(`http://localhost:5000/applications/${selectedApplication}/decline`, {
                    reason: declineReason
                });
                setApplications(applications.map(app => 
                    app.id === selectedApplication ? { ...app, status: 'declined' } : app
                ));
                setDeclineModalVisible(false);
                setDeclineReason('');
                notification.success({
                    message: 'Application Declined',
                    description: 'The application has been successfully declined.',
                    placement: 'topRight',
                    duration: 3,
                });
            } catch (error) {
                console.error('Error declining application:', error);
            }
        };
    

        const closeModal = () => {
            setModalVisible(false);
            setSelectedCreator(null);
        };
    
        const handleInquireMore = (application) => {
            setSelectedApplication(application);
            setIsModalVisible(true);
        };
    
        const handleSendInquireMessage = async () => {
            try {
                await axios.put(`http://localhost:5000/applications/${selectedApplication.id}/inquire`, {
                    message: customMessage
                });
                setApplications(applications.map(app =>
                    app.id === selectedApplication.id ? { ...app, status: 'Waiting for Creator Response' } : app
                ));
                setIsModalVisible(false);
                setCustomMessage('');
                notification.success({
                    message: 'Inquire Message Sent',
                    description: 'The message has been sent to the creator.',
                    placement: 'topRight',
                    duration: 3,
                });
            } catch (error) {
                console.error('Error sending inquire message:', error);
            }
        };
    
        const settings = {
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 3,
            slidesToScroll: 1,
            responsive: [
                { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1, infinite: true, dots: true } },
                { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
            ],
        };
    
        return (
            <div className="app-container">
                <nav>
                <Link to="">Dashboard</Link> |
                <Link to="collaboration-requests">Collaboration Requests</Link> |
                <Link to="partner-match">Partner Match</Link> |
                <Link to="manage-campaigns">Manage Campaigns</Link> |
                <Link to="create-campaign">Create Campaign</Link>
            </nav>
    
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <h1 className="section-title">Creator Spotlight</h1>
                                {isLoading ? (
                                    <p>Loading creators...</p>
                                ) : creators.length > 0 ? (
                                    <div className="carousel-container">
                                        <Slider {...settings}>
                                            {creators.slice(0, 10).map((creator) => (
                                                <div
                                                    key={creator.id}
                                                    className="carousel-slide"
                                                    onClick={() => {setSelectedCreator(creator); setModalVisible(true);}}
                                                >
                                                    <div className="creator-card-carousel">
                                                        <h3>{creator.name}</h3>
                                                        <p>Followers: {creator.followers_count}</p>
                                                        <p>Bio: {creator.bio}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>
                                ) : (
                                    <p>No creators found</p>
                                )}

                            {/* New Applications Overview */}
                            <div className="applications-overview">
                                <h2>New Campaign Applications</h2>
                                {isLoading ? (
                                    <p>Loading applications...</p>
                                ) : applications.length > 0 ? (
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={applications}
                                        renderItem={(application) => (
                                            <List.Item
                                                actions={[
                                                    <Button onClick={() => handleAccept(application.id)}>Accept</Button>,
                                                    <Button onClick={() => handleDecline(application.id, declineReason)}>Decline</Button>,
                                                    <Button onClick={() => handleInquireMore(application)}>Inquire</Button>
                                                ]}
                                            >
                                                <List.Item.Meta
                                                    title={<strong>{application.creator_name}</strong>}
                                                    description={
                                                        <>
                                                            <p><strong>Followers:</strong> {application.followers_count}</p>
                                                            <p><strong>Status:</strong> {application.status}</p>
                                                        </>
                                                    }
                                                />
                                            </List.Item>
                                        )}
                                    />
                                ) : (
                                    <p>No new applications available</p>
                                )}
                            </div>

                            {/* Decline Modal */}
                            <Modal
                                title="Decline Application"
                                visible={declineModalVisible}
                                onOk={submitDeclineReason}
                                onCancel={() => setDeclineModalVisible(false)}
                                okText="Submit"
                                cancelText="Cancel"
                            >
                                <p>Please provide a reason for declining this application:</p>
                                <Input
                                    placeholder="Enter reason"
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                />
                            </Modal>


                            {/* Collaboration Requests Notification Center */}
                            <div className="notification-center">
                                <div className="notification-header">
                                    <h2>Collaboration Requests</h2>
                                    <Link to="/collaboration-requests" className="view-all-link">
                                        View All <FaAngleRight />
                                    </Link>
                                </div>
                                <div className="notification-list">
                                    {requests.length > 0 ? (
                                        requests.map((request) => (
                                            <div key={request.id} className="notification-card">
                                                <div className="notification-info">
                                                    <h4>{request.creator_name}</h4>
                                                    <p>Followers: {request.followers_count}</p>
                                                    <p>Status: <strong>{request.status}</strong></p>
                                                </div>
                                                <div className="notification-actions">
                                                    <button className="accept-btn" onClick={() => handleAccept(request.id)}>
                                                        <FaCheck /> Accept
                                                    </button>
                                                    <button className="decline-btn" onClick={() => handleDecline(request.id)}>
                                                        <FaTimes /> Decline
                                                    </button>
                                                    <button className="inquire-btn" onClick={() => handleInquireMore(request.id)}>
                                                        <FaQuestionCircle /> Inquire
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p>No collaboration requests found</p>
                                    )}
                                </div>
                            </div>

                            {/* Modal for sending custom inquire message */}
            <Modal
                title="Send Custom Message"
                visible={isModalVisible}
                onOk={handleSendInquireMessage}
                onCancel={() => setIsModalVisible(false)}
            >
                <p>Send a custom message to inquire more details from the creator:</p>
                <Input.TextArea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    placeholder="Enter your message here..."
                />
            </Modal>

                            {/* Modal for viewing creator details */}
                            {modalVisible && selectedCreator && (
                                <ModalComponent
                                    show={modalVisible}
                                    onClose={closeModal}
                                    creator={selectedCreator}
                                />
                            )}
                        </>
                    }
                />
                <Route path="dashboard/collaboration-requests" element={<CollaborationRequestsPage />} />
                <Route path="dashboard/partner-match" element={<PartnerMatch />} />
                <Route path="dashboard/manage-campaigns" element={<ManageCampaigns />} />
                <Route path="dashboard/create-campaign" element={<CreateCampaign />} />
                <Route path="dashboard/edit-campaign/:id" element={<EditCampaign />} />
            </Routes>
        </div>
    );
}

export default BrandApp;