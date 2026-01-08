import React, { useState, useEffect } from 'react';
import { Select, Button, Table, Spin, Modal, Drawer } from 'antd';  
import axios from 'axios';
import { Link } from 'react-router-dom';
import CreateCampaign from './CreateCampaign';
import moment from 'moment';

const { Option } = Select;

function ManageCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false); 
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const fetchCampaigns = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/campaigns');
            
            // Log the campaigns data to check if application_start_date and application_end_date are included
            console.log("Campaign Data:", response.data);
    
            // Sort campaigns by date created from newest to oldest
            const sortedCampaigns = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setCampaigns(sortedCampaigns);
            
        } catch (error) {
            console.error('Error fetching campaigns:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showDrawer = async (campaignId) => {
        try {
            const response = await axios.get(`http://localhost:5000/campaigns/${campaignId}`);
            const campaignData = response.data;
            setSelectedCampaign({
                ...campaignData,
                target_audience_location: Array.isArray(campaignData.target_audience_location) 
                    ? campaignData.target_audience_location 
                    : (campaignData.target_audience_location ? [campaignData.target_audience_location] : []),
                target_audience_age: Array.isArray(campaignData.target_audience_age) 
                    ? campaignData.target_audience_age 
                    : (campaignData.target_audience_age ? [campaignData.target_audience_age] : []),
                deliverables: Array.isArray(campaignData.deliverables) 
                    ? campaignData.deliverables 
                    : (campaignData.deliverables ? [campaignData.deliverables] : []),
            });
            setIsDrawerVisible(true);
        } catch (error) {
            console.error('Error fetching campaign summary:', error);
        }
    };

    const closeDrawer = () => setIsDrawerVisible(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);
    
    const updateCampaignStatus = async (id, newStatus) => {
        try {
            const response = await axios.put(`http://localhost:5000/campaigns/${id}/status`, { status: newStatus });
            console.log('Campaign status updated:', response.data);
    
            setCampaigns((prevCampaigns) => 
                prevCampaigns.map((campaign) => 
                    campaign.id === id ? { ...campaign, status: newStatus } : campaign
                )
            );
        } catch (error) {
            console.error('Error updating campaign status:', error.response?.data || error.message);
        }
    };

    const calculateDaysLeft = (startDate, endDate) => {
        if (!startDate || !endDate) return "N/A";
        
        const parsedStartDate = new Date(Date.parse(startDate));
        const parsedEndDate = new Date(Date.parse(endDate));
        const now = new Date();
    
        if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            console.log("Invalid date format detected");
            return "N/A";
        }
    
        const daysLeft = Math.round((parsedEndDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
        if (now < parsedStartDate) {
            const daysUntilStart = Math.round((parsedStartDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
            return `Starts in ${daysUntilStart} days`;
        } else if (now <= parsedEndDate) {
            return daysLeft > 0 ? `${daysLeft} days left` : 'Finished';
        } else {
            return "Expired";
        }
    };

    useEffect(() => {
        campaigns.forEach((campaign) => {
            const daysLeft = calculateDaysLeft(campaign.application_start_date, campaign.application_end_date);
            
            if (daysLeft === "Expired" && campaign.status !== "inactive") {
                // Set status to inactive only if it's currently not inactive
                updateCampaignStatus(campaign.id, "inactive");
            }
        });
    }, [campaigns]);
    
    

    const columns = [
        {
            title: 'Campaign Name',
            dataIndex: 'campaign_name',
            key: 'campaign_name',
        },
        {
            title: 'Date Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (text) => moment(text).format('DD/MM/YY'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Select
                    defaultValue={status}
                    onChange={(newStatus) => updateCampaignStatus(record.id, newStatus)}
                    style={{ width: 120 }}
                >
                    <Option value="active">Active</Option>
                    <Option value="paused">Paused</Option>
                    <Option value="inactive">Inactive</Option>
                </Select>
            ),
        },
        {
            title: 'Budget',
            dataIndex: 'budget',
            key: 'budget',
        },
        {
            title: 'Number of Requests',
            dataIndex: 'creator_requests',
            key: 'creator_requests',
        },
        {
            title: 'Time Left for Applications',
            key: 'time_left',
            render: (text, record) => calculateDaysLeft(record.application_start_date, record.application_end_date, record.id),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Link to={`/brand/dashboard/campaigns/edit/${record.id}`}>
                        <Button type="primary">Edit</Button>
                    </Link>
                    <Button onClick={() => showDrawer(record.id)}>Campaign Summary</Button>
                </div>
            ),
        },
    ];

    const showModal = () => {
        setIsModalVisible(true);
    };

    const closeModal = () => setIsModalVisible(false);

    const handleCampaignCreated = () => {
        fetchCampaigns();
        setIsModalVisible(false);
    };

    return (
        <div className="manage-campaigns-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Manage Campaigns</h1>
                <Button type="primary" onClick={showModal}>
                    Create Campaign
                </Button>
            </div>

            {isLoading ? (
                <Spin size="large" />
            ) : (
                <Table columns={columns} dataSource={campaigns} rowKey="id" />
            )}

            <Modal
                title="Create New Campaign"
                visible={isModalVisible}
                onCancel={closeModal}
                footer={null}
            >
                <CreateCampaign onClose={handleCampaignCreated} />
            </Modal>
        
            <Drawer
                title="Campaign Summary"
                placement="right"
                width={400}
                onClose={closeDrawer}
                visible={isDrawerVisible}
            >
                {selectedCampaign ? (
                    <>
                        <p><strong>Campaign Name:</strong> {selectedCampaign.campaign_name || 'Not provided'}</p>
                        <p><strong>Product/Service URL:</strong> {selectedCampaign.product_url || 'Not provided'}</p>
                        <p><strong>Description:</strong> {selectedCampaign.campaign_description || 'Not provided'}</p>
                        <p><strong>Audience Location:</strong> {selectedCampaign.target_audience_location.join(', ')}</p>
                        <p><strong>Audience Age:</strong> {selectedCampaign.target_audience_age.join(', ')}</p>
                        <p><strong>Deliverables:</strong> {selectedCampaign.deliverables.join(', ')}</p>
                        <p><strong>Application Period:</strong> 
                            {selectedCampaign.application_start_date && selectedCampaign.application_end_date 
                                ? `${moment(selectedCampaign.application_start_date).format('DD/MM/YY')} - ${moment(selectedCampaign.application_end_date).format('DD/MM/YY')}` 
                                : 'Not provided'}
                        </p>
                        <p><strong>Number of Creators Needed:</strong> {selectedCampaign.number_of_creators || 'Not provided'}</p>
                        <p><strong>Budget:</strong> {`${selectedCampaign.currency || 'USD'} ${selectedCampaign.budget || 'Not provided'}`}</p>
                        <p><strong>Gift Free Products:</strong> {selectedCampaign.gift_free_products === 'yes' ? 'Yes' : 'No'}</p>
                    </>
                ) : (
                    <Spin size="large" />
                )}
            </Drawer>
        </div>
    );
}

export default ManageCampaigns;
