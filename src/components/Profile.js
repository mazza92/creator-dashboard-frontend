import React, { useEffect, useState } from 'react';
import { Avatar, Card, Tabs, Button, Row, Col, Typography, Divider, Modal, Form, Input, List, Space, Tag, Upload, message } from 'antd';
import { UserOutlined, EditOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { InstagramOutlined, TwitterOutlined, FacebookOutlined, YoutubeOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import './Profile.css';
// eslint-disable-next-line no-unused-vars
import { useSecurity } from '../contexts/SecurityContext';
// eslint-disable-next-line no-unused-vars
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from './LoadingSpinner';
import ShippingAddressForm from './ShippingAddressForm';
import PRWishlistSettings from './PRWishlistSettings';
import { apiClient } from '../config/api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function Profile() {
    const [userData, setUserData] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [offers, setOffers] = useState([]); // ✅ Initialize offers state
    const [fileList, setFileList] = useState([]);
    const [editingField, setEditingField] = useState(null); // Field to edit
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [avatarTimestamp, setAvatarTimestamp] = useState(Date.now());
    const [stripeLoading, setStripeLoading] = useState(false);
    const [stripeConnected, setStripeConnected] = useState(false);
    const [showShippingForm, setShowShippingForm] = useState(false);
    const [showPRWishlist, setShowPRWishlist] = useState(false);

    // eslint-disable-next-line no-unused-vars
    const { id } = useParams(); // ✅ Get Creator ID from URL

    async function fetchUserData() {
        try {
            const response = await fetch("http://localhost:5000/profile", {
                method: "GET",
                credentials: "include",  // ✅ Ensures session cookies are sent
            });
    
            if (!response.ok) throw new Error("Failed to fetch profile data");
            const data = await response.json();
            setUserData(data);
        } catch (error) {
            console.error("Error fetching profile data:", error);
        }
    }
    
    useEffect(() => {
        fetchUserData();
    }, []);

    useEffect(() => {
        if (userData && userData.user_role === 'creator') {
            setStripeConnected(!!userData.stripe_account_id);
        }
    }, [userData]);

    if (!userData) return <LoadingSpinner text="Loading profile..." />;

        // Define colors for each niche value
        const nicheColors = {
            'Beauty & Fashion': 'magenta',
            'Fitness & Wellness': 'red',
            'Tech & Gadgets': 'blue',
            'Food & Nutrition': 'orange',
            'Travel & Adventure': 'cyan',
            'Gaming': 'geekblue',
            'Music & Entertainment': 'purple',
            'Sports': 'green',
            'Health & Medical': 'lime',
            'Finance & Business': 'gold',
            'Parenting & Family': 'volcano',
            'Arts & Crafts': 'pink',
            'Science & Education': 'blue',
        };

        const renderNicheTags = () => {
            const niches = userData?.niche ? JSON.parse(userData.niche) : [];
            return niches.map((niche) => (
                <Tag color={nicheColors[niche] || 'default'} key={niche}>
                    {niche}
                </Tag>
            ));
        };

    const goToDashboard = () => {
        const roleBasedPath = userData.user_role === 'creator' ? 'creator' : 'brand';
        navigate(`/${roleBasedPath}/dashboard/overview`);
    };

    if (!userData) return <LoadingSpinner text="Loading profile..." />;

    const regions = userData.regions ? JSON.parse(userData.regions).join(', ') : 'N/A';
    const audienceAgeRange = userData.primary_age_range || 'N/A';
    const socialLinks = userData.social_links ? JSON.parse(userData.social_links) : [];

    const renderSocialLinks = () => (
        <Space size="large">
            {socialLinks.map((link, index) => {
                const { platform, url, followersCount } = link;
                let icon;
                switch (platform) {
                    case 'Instagram':
                        icon = <InstagramOutlined style={{ fontSize: 24, color: '#E1306C' }} />;
                        break;
                    case 'Twitter':
                        icon = <TwitterOutlined style={{ fontSize: 24, color: '#1DA1F2' }} />;
                        break;
                    case 'Facebook':
                        icon = <FacebookOutlined style={{ fontSize: 24, color: '#1877F2' }} />;
                        break;
                    case 'YouTube':
                        icon = <YoutubeOutlined style={{ fontSize: 24, color: '#FF0000' }} />;
                        break;
                    default:
                        icon = <UserOutlined style={{ fontSize: 24 }} />;
                }
                return (
                    <Space key={index}>
                        {icon}
                        <Text><a href={url} target="_blank" rel="noopener noreferrer">{followersCount} Followers</a></Text>
                    </Space>
                );
            })}
        </Space>
    );

    const handleEditClick = (field) => {
        setEditingField(field);
        form.setFieldsValue({ [field]: userData[field] });
        setModalVisible(true);
    };

    const handleFileChange = ({ fileList: newFileList }) => setFileList(newFileList);

    const refreshAvatar = () => setAvatarTimestamp(Date.now());

    const handleSave = () => {
        form.validateFields().then(values => {
            const formData = new FormData();
            if (editingField === 'bio') {
                formData.append('bio', values.bio);
            } else if (editingField === 'image_profile' && fileList.length > 0) {
                formData.append('image', fileList[0].originFileObj);
            }
            fetch("http://localhost:5000/profile/update", {
                method: "PUT",
                body: formData,
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error("Error updating profile:", data.error);
                    } else {
                        setUserData(prev => ({
                            ...prev,
                            bio: editingField === 'bio' ? values.bio : prev.bio,
                            image_profile: editingField === 'image_profile' ? data.file_path : prev.image_profile,
                        }));
                        refreshAvatar();
                        setModalVisible(false);
                    }
                })
                .catch(error => console.error("Validation or submission failed:", error));
        });
    };

    const handleImageEdit = () => {
        setEditingField('image_profile');
        setModalVisible(true);
    };

    const handleConnectStripe = async () => {
        setStripeLoading(true);
        try {
            // Don't try to detect country from browser - let user select during Stripe onboarding
            const res = await fetch('http://localhost:5000/connect-stripe-account', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userData.email })
            });
            const data = await res.json();
            if (res.ok && data.url) {
                window.location.href = data.url;
            } else if (data.message) {
                message.success(data.message);
                setStripeConnected(true);
            } else {
                message.error(data.error || 'Failed to connect Stripe account.');
            }
        } catch (err) {
            message.error('Failed to connect Stripe account.');
        } finally {
            setStripeLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={goToDashboard}
                style={{ marginBottom: '20px' }}
            >
                Back to Dashboard
            </Button>

                        {/* Profile Overview */}
                        <Card className="profile-card">
                <Row gutter={[24, 24]} align="top">
                    {/* Left Column: Avatar and Bio */}
                    <Col xs={24} md={8}>
                        <div style={{ textAlign: 'center' }}>
                            <Avatar
                                size={200}
                                src={`${userData.image_profile}?t=${avatarTimestamp}`} // Cache-busting for avatar update
                                alt="Profile"
                                style={{ marginBottom: 16 }}
                            />
                            {/* Avatar Edit Button - Positioned within avatar div but outside the Avatar */}
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                onClick={handleImageEdit}
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    color: '#fff',
                                    borderRadius: '50%',
                                    fontSize: '1.2em',
                                    padding: 4
                                }}
                            />
                            <Title level={3}>{userData?.name}</Title>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Text type="secondary" style={{ fontSize: '0.9rem' }}>
                                    {userData?.bio || 'No bio available.'}
                                </Text>
                                <EditOutlined
                                    onClick={() => handleEditClick('bio')}
                                    style={{ marginLeft: 8, cursor: 'pointer', color: 'rgba(0, 0, 0, 0.45)' }}
                                />
                            </div>
                        </div>
                    </Col>

                    {/* Right Column with Padding */}
                    <Col xs={24} md={16}>
                        <div style={{ padding: '16px' }}>
                            {/* Creator Profile Section */}
                            <div className="creator-profile-section" style={{ marginBottom: '24px' }}>
                                <Title level={4}>Creator Profile</Title>
                                <Divider />
                                <Row gutter={16}>
                                    <Col span={12}>
                                    <Text strong>Niche:</Text>
                                        <div style={{ marginTop: 8 }}>
                                            {/* Render niche badges */}
                                            {renderNicheTags()}
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Regions:</Text> <Text>{regions}</Text>
                                    </Col>
                                </Row>
                                <Row gutter={16} style={{ marginTop: 12 }}>
                                    <Col span={12}>
                                        <Text strong>Audience Age:</Text> <Text>{audienceAgeRange}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Social Links:</Text>
                                        <div className="social-links" style={{ marginTop: 4 }}>
                                            {renderSocialLinks()}
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Contact Information Section */}
                            <div className="profile-details" style={{ marginTop: 24 }}>
                                <Title level={4}>Contact Information</Title>
                                <Divider />
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Text strong>Email:</Text> <Text>{userData?.email || 'N/A'}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Phone:</Text> <Text>{userData?.phone || 'N/A'}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Country:</Text> <Text>{userData?.country || 'N/A'}</Text>
                                    </Col>
                                    <Col span={12}>
                                        <Text strong>Platforms:</Text> <Text>{userData?.platforms || 'N/A'}</Text>
                                    </Col>
                                </Row>
                            </div>

                            {/* PR Preferences Section (for Creators) */}
                            {userData?.user_role === 'creator' && (
                                <div className="profile-details" style={{ marginTop: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <Title level={4} style={{ margin: 0 }}>PR Package Preferences</Title>
                                        <Button 
                                            type="primary" 
                                            icon={<EditOutlined />}
                                            onClick={() => setShowPRWishlist(true)}
                                        >
                                            Manage Preferences
                                        </Button>
                                    </div>
                                    <Divider />
                                    <div style={{ padding: '16px', background: '#f9fafb', borderRadius: 8 }}>
                                        <Text type="secondary" style={{ fontSize: 14 }}>
                                            Select categories you're interested in receiving PR packages for. 
                                            This helps brands find you for relevant offers.
                                        </Text>
                                    </div>
                                </div>
                            )}

                            {/* Shipping Address Section (for Creators) */}
                            {userData?.user_role === 'creator' && (
                                <div className="profile-details" style={{ marginTop: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <Title level={4} style={{ margin: 0 }}>Shipping Address</Title>
                                        <Button 
                                            type="primary" 
                                            icon={<EditOutlined />}
                                            onClick={() => setShowShippingForm(true)}
                                        >
                                            {userData?.shipping_address ? 'Edit' : 'Add'} Address
                                        </Button>
                                    </div>
                                    <Divider />
                                    {userData?.shipping_address ? (
                                        <div>
                                            {(() => {
                                                const address = typeof userData.shipping_address === 'string' 
                                                    ? JSON.parse(userData.shipping_address) 
                                                    : userData.shipping_address;
                                                return (
                                                    <Row gutter={16}>
                                                        <Col span={24}>
                                                            <Text strong>Full Name:</Text> <Text>{address.full_name || 'N/A'}</Text>
                                                        </Col>
                                                        <Col span={24}>
                                                            <Text strong>Address:</Text> <Text>
                                                                {address.address_line1}
                                                                {address.address_line2 && `, ${address.address_line2}`}
                                                            </Text>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Text strong>City:</Text> <Text>{address.city || 'N/A'}</Text>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Text strong>State:</Text> <Text>{address.state || 'N/A'}</Text>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Text strong>ZIP:</Text> <Text>{address.zip || 'N/A'}</Text>
                                                        </Col>
                                                        <Col span={24}>
                                                            <Text strong>Country:</Text> <Text>{address.country || 'N/A'}</Text>
                                                        </Col>
                                                        {address.phone && (
                                                            <Col span={24}>
                                                                <Text strong>Phone:</Text> <Text>{address.phone}</Text>
                                                            </Col>
                                                        )}
                                                        {userData?.size_preferences && (
                                                            <Col span={24} style={{ marginTop: 16 }}>
                                                                <Text strong>Size Preferences:</Text>
                                                                <div style={{ marginTop: 8 }}>
                                                                    {(() => {
                                                                        const sizes = typeof userData.size_preferences === 'string'
                                                                            ? JSON.parse(userData.size_preferences)
                                                                            : userData.size_preferences;
                                                                        return (
                                                                            <div>
                                                                                {sizes.clothing?.shirt && <Tag>Shirt: {sizes.clothing.shirt}</Tag>}
                                                                                {sizes.clothing?.pants && <Tag>Pants: {sizes.clothing.pants}</Tag>}
                                                                                {sizes.clothing?.shoes && <Tag>Shoes: {sizes.clothing.shoes}</Tag>}
                                                                                {sizes.skincare && <Tag>Skincare: {sizes.skincare}</Tag>}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </Col>
                                                        )}
                                                    </Row>
                                                );
                                            })()}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '24px', background: '#f9fafb', borderRadius: 8 }}>
                                            <Text type="secondary">No shipping address saved. Add one to streamline PR package acceptances.</Text>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Card>
    
            {/* Tabs for Billing, Settings, and Activity Log */}
            <Tabs defaultActiveKey="1" className="profile-tabs" style={{ marginTop: 20 }}>
                {/* Billing Tab */}
                <TabPane tab="Billing" key="1">
                    <Card bordered={false} className="tab-card">
                        <Title level={4}>Current Plan</Title>
                        <Divider />
                        <Row justify="center" style={{ textAlign: 'center' }}>
                            <Col span={24}>
                                <Tag color="blue" style={{ fontSize: '1.2rem', padding: '5px 10px' }}>Premium Plan</Tag>
                                <Text type="secondary">Enjoy unlimited access to campaigns and priority support.</Text>
                                <Divider />
                                <Button type="primary" style={{ marginTop: 12 }}>Upgrade Plan</Button>
                            </Col>
                        </Row>
                        {/* Stripe Connect Section for Creators */}
                        {userData.user_role === 'creator' && (
                            <div style={{ marginTop: 32, textAlign: 'center' }}>
                                <Divider />
                                <Title level={5}>Payouts (Stripe Connect)</Title>
                                {stripeConnected ? (
                                    <Tag color="green">Stripe account connected!</Tag>
                                ) : (
                                    <Button
                                        type="primary"
                                        loading={stripeLoading}
                                        onClick={handleConnectStripe}
                                        style={{ marginTop: 12 }}
                                    >
                                        Connect Stripe Account
                                    </Button>
                                )}
                                <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
                                    Required to receive payments from brands.
                                </div>
                            </div>
                        )}
                    </Card>
                </TabPane>
    
                {/* Settings Tab */}
                <TabPane tab="Settings" key="2">
                    <Card bordered={false} className="tab-card">
                        <Title level={4}>Change Password</Title>
                        <Form layout="vertical">
                            <Form.Item name="oldPassword" label="Old Password">
                                <Input.Password placeholder="Enter old password" prefix={<LockOutlined />} />
                            </Form.Item>
                            <Form.Item name="newPassword" label="New Password">
                                <Input.Password placeholder="Enter new password" prefix={<LockOutlined />} />
                            </Form.Item>
                            <Form.Item name="confirmPassword" label="Confirm Password">
                                <Input.Password placeholder="Confirm new password" prefix={<LockOutlined />} />
                            </Form.Item>
                            <Button type="primary" htmlType="submit">Update Password</Button>
                        </Form>
                    </Card>
                </TabPane>
    
                {/* Activity Log Tab */}
                <TabPane tab="Activity Log" key="3">
                    <Card bordered={false} className="tab-card">
                        <Title level={4}>Recent Activity</Title>
                        <List
                            dataSource={[
                                "Joined a new campaign.",
                                "Updated profile information.",
                                "Bookmarked a creator.",
                                "Connected Instagram account.",
                            ]}
                            renderItem={(item) => (
                                <List.Item>
                                    <Text>{item}</Text>
                                </List.Item>
                            )}
                        />
                    </Card>
                </TabPane>
            </Tabs>
    
            {/* Modal for Editing */}
            <Modal
                title={`Edit ${editingField}`}
                visible={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={handleSave}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name={editingField}
                        label={editingField === 'bio' ? 'Bio' : 'Image'}
                        rules={[{ required: true, message: `Please enter your ${editingField}.` }]}
                    >
                        {editingField === 'bio' ? (
                            <Input.TextArea rows={3} placeholder="Enter your bio" />
                        ) : (
                            <Upload
                                listType="picture-card"
                                fileList={fileList}
                                onChange={handleFileChange}
                                beforeUpload={() => false}
                            >
                                {fileList.length === 0 && (
                                    <div>
                                        <UserOutlined />
                                        <div style={{ marginTop: 8 }}>Upload</div>
                                    </div>
                                )}
                            </Upload>
                        )}
                    </Form.Item>
                </Form>
            </Modal>

            {/* Shipping Address Form Modal */}
            {showShippingForm && (
                <Modal
                    title="Shipping Address"
                    open={showShippingForm}
                    onCancel={() => setShowShippingForm(false)}
                    footer={null}
                    width={700}
                >
                    <ShippingAddressForm
                        initialData={userData?.shipping_address ? {
                            ...(typeof userData.shipping_address === 'string' 
                                ? JSON.parse(userData.shipping_address) 
                                : userData.shipping_address),
                            size_preferences: userData?.size_preferences ? (
                                typeof userData.size_preferences === 'string'
                                    ? JSON.parse(userData.size_preferences)
                                    : userData.size_preferences
                            ) : null
                        } : null}
                        onSave={async (data) => {
                            try {
                                const response = await apiClient.put('/api/creator/shipping-address', {
                                    shipping_address: data.shipping_address,
                                    size_preferences: data.size_preferences,
                                    shipping_phone: data.shipping_phone,
                                    shipping_notes: data.shipping_notes
                                });
                                
                                if (response.status === 200) {
                                    message.success('Shipping address updated successfully');
                                    setShowShippingForm(false);
                                    fetchUserData(); // Refresh profile data
                                }
                            } catch (err) {
                                console.error('Error updating shipping address:', err);
                                message.error(err.response?.data?.error || 'Failed to update shipping address');
                            }
                        }}
                        onCancel={() => setShowShippingForm(false)}
                        showSizePreferences={true}
                        saveToProfile={false}
                    />
                </Modal>
            )}

            {/* PR Wishlist Settings Modal */}
            {showPRWishlist && (
                <Modal
                    title="PR Package Preferences"
                    open={showPRWishlist}
                    onCancel={() => setShowPRWishlist(false)}
                    footer={null}
                    width={800}
                >
                    <PRWishlistSettings
                        onUpdate={(wishlist) => {
                            setShowPRWishlist(false);
                            fetchUserData(); // Refresh profile data
                        }}
                    />
                </Modal>
            )}
        </div>
    );
}

export default Profile;