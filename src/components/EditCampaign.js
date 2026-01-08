import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Input, Button, notification, DatePicker, Card, Typography } from 'antd';
import moment from 'moment';
import './EditCampaign.css';

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title } = Typography;

function EditCampaign() {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/campaigns/${id}`);
                const data = response.data;

                setCampaign(data);

                // Set initial form values for editable fields only, checking that dates are valid
                form.setFieldsValue({
                    product_url: data.product_url,
                    campaign_description: data.campaign_description,
                    application_period: [
                        data.application_start_date && moment(data.application_start_date, 'YYYY-MM-DD').isValid()
                            ? moment(data.application_start_date, 'YYYY-MM-DD')
                            : null,
                        data.application_end_date && moment(data.application_end_date, 'YYYY-MM-DD').isValid()
                            ? moment(data.application_end_date, 'YYYY-MM-DD')
                            : null,
                    ],
                });
            } catch (error) {
                console.error('Error fetching campaign:', error);
                notification.error({
                    message: 'Error',
                    description: 'Failed to load campaign data.',
                });
            }
        };
        fetchCampaign();
    }, [id, form]);

    const handleUpdateCampaign = async (values) => {
        try {
            const updatedData = {
                ...campaign,
                ...values,
                application_start_date: values.application_period?.[0]?.format('YYYY-MM-DD') || null,
                application_end_date: values.application_period?.[1]?.format('YYYY-MM-DD') || null,
            };

            await axios.put(`http://localhost:5000/campaigns/${id}`, updatedData, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            notification.success({
                message: 'Success',
                description: 'Campaign updated successfully!',
            });
            navigate('/brand/dashboard/campaigns');
        } catch (error) {
            console.error('Error updating campaign:', error.response?.data || error.message);
            notification.error({
                message: 'Update Failed',
                description: error.response?.data?.error || 'Failed to update campaign.',
            });
        }
    };

    return campaign ? (
        <Card className="edit-campaign-container" bordered={false}>
            <Title level={3}>Edit Campaign</Title>
            <Form
                form={form}
                onFinish={handleUpdateCampaign}
                layout="vertical"
                initialValues={{
                    product_url: campaign.product_url,
                    campaign_description: campaign.campaign_description,
                    application_period: [
                        campaign.application_start_date && moment(campaign.application_start_date, 'YYYY-MM-DD').isValid()
                            ? moment(campaign.application_start_date, 'YYYY-MM-DD')
                            : null,
                        campaign.application_end_date && moment(campaign.application_end_date, 'YYYY-MM-DD').isValid()
                            ? moment(campaign.application_end_date, 'YYYY-MM-DD')
                            : null,
                    ],
                }}
            >
                {/* Product/Service URL */}
                <Form.Item
                    label="Product/Service URL"
                    name="product_url"
                    rules={[{ required: true, message: 'Please enter the product/service URL' }]}
                >
                    <Input placeholder="e.g., https://yourbrand.com/product" />
                </Form.Item>

                {/* Campaign Description */}
                <Form.Item
                    label="Campaign Description"
                    name="campaign_description"
                    rules={[{ required: true, min: 150, message: 'Minimum 150 characters required' }]}
                >
                    <TextArea showCount minLength={150} placeholder="Describe your campaign's mission, target audience, and goals..." />
                </Form.Item>

                {/* Application Period */}
                <Form.Item
                    label="Application Period"
                    name="application_period"
                    rules={[{ required: true, message: 'Please select the application period' }]}
                >
                    <RangePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"  // Enforce consistent date format
                        onChange={(dates) => form.setFieldsValue({ application_period: dates })}
                    />
                </Form.Item>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                    <Button type="default" onClick={() => navigate('/brand/dashboard/campaigns')}>Back</Button>
                    <Button type="primary" htmlType="submit">Update Campaign</Button>
                </div>
            </Form>
        </Card>
    ) : (
        <p>Loading campaign data...</p>
    );
}

export default EditCampaign;
