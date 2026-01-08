import React, { useState, useEffect, useContext, useRef } from 'react';
import { Card, Button, List, Spin, message } from 'antd';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext'; // ✅ Import UserContext
import './ActiveCampaigns.css';

function ActiveCampaigns() {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useContext(UserContext); // ✅ Get user from context
    const isMounted = useRef(true); // ✅ Prevent state update after unmount

    useEffect(() => {
        const fetchActiveCampaigns = async () => {
            try {
                console.log("🔍 Fetching active campaigns...");
                const response = await axios.get('http://localhost:5000/active-campaigns');
                
                if (isMounted.current) {
                    setCampaigns(response.data);
                }
            } catch (error) {
                console.error('❌ Error fetching active campaigns:', error);
            } finally {
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        };

        fetchActiveCampaigns();

        return () => { isMounted.current = false; }; // ✅ Cleanup function
    }, []);

    const handleApply = async (campaignId) => {
        if (!user?.id) {
            message.error("You need to be logged in to apply.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/apply-to-campaign', {
                campaign_id: campaignId,
                creator_id: user.id, // ✅ Dynamic creator ID
                content_brief: ''
            });

            message.success(response.data.message);
        } catch (error) {
            console.error('❌ Error applying to campaign:', error);
            message.error('Failed to apply to the campaign.');
        }
    };

    if (isLoading) {
        return <Spin size="large" />;
    }

    return (
        <div className="active-campaigns-page">
            <h1>Active Campaigns</h1>
            {campaigns.length > 0 ? (
                <List
                    grid={{ gutter: 16, column: 2 }}
                    dataSource={campaigns}
                    renderItem={(campaign) => (
                        <List.Item>
                            <Card
                                title={campaign.campaign_name}
                                extra={<Button type="primary" onClick={() => handleApply(campaign.id)}>Apply</Button>}
                            >
                                <p><strong>Brand:</strong> {campaign.brand_id}</p>
                                <p><strong>Budget:</strong> ${campaign.budget}</p>
                                <p><strong>Goals:</strong> {campaign.campaign_goals}</p>
                                <p><strong>Product/Service:</strong> {campaign.product_or_service}</p>
                                <p><strong>Created At:</strong> {new Date(campaign.created_at).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {campaign.status}</p>
                            </Card>
                        </List.Item>
                    )}
                />
            ) : (
                <p>No active campaigns available.</p>
            )}
        </div>
    );
}

export default ActiveCampaigns;
