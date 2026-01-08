import React, { useEffect, useState } from 'react';
import { Avatar, Button, List, Skeleton, Card, Carousel, Row, Col, Modal, Form, Input, Statistic } from 'antd';
import CountUp from 'react-countup';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../config/api';
import './CreatorDashboard.css';

const { Meta } = Card;

const CreatorDashboard = () => {
    const [recentRequests, setRecentRequests] = useState([]);
    // const [activeCampaigns, setActiveCampaigns] = useState([]);
    const [submissionMetrics, setSubmissionMetrics] = useState({});
    const [spotlightBrands, setSpotlightBrands] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [packages, setPackages] = useState([]);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [initLoading, setInitLoading] = useState(true);
    const [list, setList] = useState([]);
    const [editForm] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [metricsRes, requestsRes, brandsRes, packagesRes ] = await Promise.all([
                    apiClient.get('/creator-submission-metrics'),
                    apiClient.get('/creator-recent-requests'),
                    apiClient.get('/spotlight-brands'),
                    apiClient.get('/packages'),
                    apiClient.get('/active-campaigns')
                ]);

                setSubmissionMetrics(metricsRes.data);
                setRecentRequests(requestsRes.data);
                setSpotlightBrands(brandsRes.data.brands || []);
                setPackages(packagesRes.data);
                setList(packagesRes.data);
                // Add activeCampaigns fetch when needed

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setInitLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatter = (value) => <CountUp end={value} separator="," />;

    const openEditModal = (pkg) => {
        setCurrentPackage(pkg);
        editForm.setFieldsValue(pkg);
        setIsEditing(true); // Ensure modal visibility is set to true
    };

    const handleEditSubmit = async () => {
        try {
            const updatedPackage = editForm.getFieldsValue();
            await apiClient.put(`/packages/${currentPackage.id}`, updatedPackage);
            setPackages(packages.map(pkg => (pkg.id === currentPackage.id ? { ...pkg, ...updatedPackage } : pkg)));
            setIsEditing(false); // Close modal after submission
        } catch (error) {
            console.error('Error updating package:', error);
        }
    };

    if (initLoading) {
        return <Skeleton active />;
    }


    return (
        <div className="creator-dashboard">
            <h1>Creator Dashboard</h1>

            {/* Spotlight Carousel for Brands */}
            <div className="spotlight-section" style={{ marginBottom: '30px' }}>
                <h2>Spotlight Brands</h2>
                <Carousel autoplay>
                    {spotlightBrands.slice(0, 6).map((brand) => (
                        <div key={brand.id} className="carousel-slide">
                            <Card hoverable cover={<img alt={brand.name} src={brand.logo || 'default_logo.jpg'} style={{ height: '150px', objectFit: 'contain' }} />}>
                                <Meta title={brand.name} description={brand.description} />
                            </Card>
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* Submission Metrics - Enhanced with AntD Statistics and CountUp */}
            <Row gutter={16} style={{ marginTop: '20px' }}>
                <Col span={24}>
                    <Card title="Collaboration Metrics">
                        <Row gutter={16}>
                            <Col span={12}>
                                <Statistic
                                    title="Total Requests Submitted"
                                    value={submissionMetrics.total_requests || 0}
                                    formatter={formatter}
                                />
                            </Col>
                            <Col span={12}>
                                <Statistic
                                    title="Requests Accepted"
                                    value={submissionMetrics.accepted_requests || 0}
                                    formatter={formatter}
                                />
                            </Col>
                            <Col span={12} style={{ marginTop: '16px' }}>
                                <Statistic
                                    title="Pending Requests"
                                    value={submissionMetrics.pending_requests || 0}
                                    formatter={formatter}
                                />
                            </Col>
                            <Col span={12} style={{ marginTop: '16px' }}>
                                <Statistic
                                    title="Declined Requests"
                                    value={submissionMetrics.declined_requests || 0}
                                    formatter={formatter}
                                />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Active Packages */}
            <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
                <Col span={24}>
                    <Card title="Active Packages">
                        <List
                            className="no-shadow-list"
                            loading={initLoading}
                            itemLayout="horizontal"
                            dataSource={list}
                            renderItem={(pkg) => (
                                <List.Item
                                    actions={[
                                        <Button key="view" type="link" onClick={() => navigate('/creator/dashboard/my-offers')}>View</Button>,
                                        <Button key="edit" type="link" onClick={() => openEditModal(pkg)}>Edit</Button>,
                                    ]}
                                >
                                    <Skeleton avatar title={false} loading={pkg.loading} active>
                                        <List.Item.Meta
                                            avatar={<Avatar style={{ backgroundColor: '#87d068' }}>{pkg.package_name[0]}</Avatar>}
                                            title={<strong>{pkg.package_name}</strong>}
                                            description={
                                                <>
                                                    <p><strong>Platform:</strong> {pkg.platform}</p>
                                                    <p><strong>Deliverables:</strong> {pkg.deliverables}</p>
                                                    <p><strong>Price:</strong> ${pkg.price}</p>
                                                </>
                                            }
                                        />
                                    </Skeleton>
                                </List.Item>
                            )}
                        />
                        <Button type="primary" block style={{ marginTop: '12px' }} onClick={() => navigate('/creator/dashboard/my-offers')}>
                            View My Offers
                        </Button>
                    </Card>
                </Col>
            </Row>

            {/* Quick Navigation */}
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col span={24}>
                    <Card title="Quick Navigation">
                        <Row gutter={[16, 16]}>
                            <Col span={8}>
                                <Button type="primary" block onClick={() => navigate('/creator/dashboard/bookings')}>
                                    Bookings
                                </Button>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" block onClick={() => navigate('/creator/dashboard/content-bids')}>
                                    Content Bids
                                </Button>
                            </Col>
                            <Col span={8}>
                                <Button type="primary" block onClick={() => navigate('/creator/dashboard/profile')}>
                                    Profile
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Recent Collaboration Requests */}
            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                <Col span={24}>
                    <Card title="Recent Collaboration Requests">
                        <List
                            itemLayout="horizontal"
                            dataSource={recentRequests}
                            renderItem={(request) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<strong>{request.brand_name || 'N/A'}</strong>}
                                        description={<span>{request.content_brief || 'N/A'}<br /><strong>Status:</strong> {request.status || 'N/A'}</span>}
                                    />
                                </List.Item>
                            )}
                        />
                        <Button type="primary"><Link to="/creator/dashboard/manage-requests">View All Requests</Link></Button>
                    </Card>
                </Col>
            </Row>

            
         {/* Modal for editing package details */}
         <Modal
                title="Edit Package"
                visible={isEditing}
                onCancel={() => setIsEditing(false)}
                onOk={handleEditSubmit} // Ensure submission on OK click
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item label="Package Name" name="package_name" rules={[{ required: true }]}>
                        <Input placeholder="Enter package name" />
                    </Form.Item>
                    <Form.Item label="Platform" name="platform" rules={[{ required: true }]}>
                        <Input placeholder="Enter platform" />
                    </Form.Item>
                    <Form.Item label="Deliverables" name="deliverables" rules={[{ required: true }]}>
                        <Input placeholder="Enter deliverables" />
                    </Form.Item>
                    <Form.Item label="Price" name="price" rules={[{ required: true }]}>
                        <Input placeholder="Enter price" />
                    </Form.Item>
                    <Form.Item label="Description" name="description" rules={[{ required: true }]}>
                        <Input.TextArea placeholder="Enter description" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CreatorDashboard;