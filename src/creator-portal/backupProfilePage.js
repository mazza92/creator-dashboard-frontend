import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, Card, Avatar, Row, Col, Spin, Button, Statistic, Tooltip, Badge, Modal, ConfigProvider } from 'antd';
import axios from 'axios';
import { FaInstagram, FaYoutube, FaTwitter, FaTiktok, FaSnapchatGhost, FaPinterest, FaTwitch } from 'react-icons/fa';
import { PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import BookingModal from './BookingModal';
import PostsHighlights from './PostsHighlights';
import { createStyles } from 'antd-style';


const { TabPane } = Tabs;



const getBadgeColor = (contentType) => {
    switch (contentType) {
        case 'Stories': return '#ff9800';
        case 'Live Streaming': return '#4caf50';
        case 'Static Posts': return '#9c27b0';
        case 'Short Videos': return '#e91e63';
        case '10min+ Videos': return '#2196f3';
        case 'User-Generated Content': return '#ff5722';
        case 'Audio Content': return '#795548';
        default: return '#607d8b';
    }
};

const renderPlatformsAndFollowers = (platforms, followers) => (
    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        {platforms &&
            Array.isArray(platforms) &&
            platforms.map(({ platform, followerCount }, index) => (
                <span key={index} style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                    {platformLogos[platform] || platform}
                    <span style={{ marginLeft: '4px' }}>{followerCount.toLocaleString()}</span>
                </span>
            ))}
    </div>
);

{/* Utility function for formatting numbers */}
const formatNumber = (num) => {
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(1)}M`;
    } else if (num >= 1_000) {
        return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toString();
};

const renderVisibilityBadges = (contentTypes = []) =>
    contentTypes.length > 0
        ? contentTypes.map((type, index) => (
              <Badge key={index} count={type.trim()} style={{ backgroundColor: getBadgeColor(type.trim()), marginRight: 5 }} />
          ))
        : <span style={{ color: '#aaa' }}>No content types specified</span>;




 

// Define reusable functions and constants at the top level
const platformLogos = {
    Instagram: <FaInstagram style={{ color: '#E1306C', fontSize: '1.2rem' }} />,
    YouTube: <FaYoutube style={{ color: '#FF0000', fontSize: '1.2rem' }} />,
    Twitter: <FaTwitter style={{ color: '#1DA1F2', fontSize: '1.2rem' }} />,
    TikTok: <FaTiktok style={{ color: '#000000', fontSize: '1.2rem' }} />,
    Snapchat: <FaSnapchatGhost style={{ color: '#FFFC00', fontSize: '1.2rem' }} />,
    Pinterest: <FaPinterest style={{ color: '#E60023', fontSize: '1.2rem' }} />,
    Twitch: <FaTwitch style={{ color: '#9146FF', fontSize: '1.2rem' }} />,
};


const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
      &.${prefixCls}-btn-primary {
        background: linear-gradient(135deg, #6253e1, #04befe) !important;
        border: none !important;
        color: white !important;
      }
  
      &:hover {
        background: linear-gradient(135deg, #04befe, #6253e1) !important;
      }
    `,
  }));

const ProfilePage = () => {
    console.log('ProfilePage rendered');
    const { id } = useParams();
    const { styles } = useStyle();
    const [creator, setCreator] = useState(null);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState(null);
    
    
    

    const closeModal = () => {
        console.log('Closing modal');
        setSelectedOffer(null);
        setIsModalVisible(false);
    };

    useEffect(() => {
        const fetchCreator = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/creators/${id}`);
                setCreator(response.data);
            } catch (error) {
                console.error("Error fetching creator data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreator();
    }, [id]);

    useEffect(() => {
        const fetchCreatorOffers = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/creators/${id}/offers`);
                setOffers(response.data);
            } catch (error) {
                console.error("Error fetching creator offers:", error);
            }
        };

        fetchCreatorOffers();
    }, [id]);

    if (loading) {
        return <Spin tip="Loading profile..." />;
    }

    if (!creator) {
        return <div>Creator not found.</div>;
    }



    if (loading) {
        return <Spin tip="Loading profile..." />;
    }

    if (!creator) {
        return <div>Creator not found.</div>;
    }


    
  

        return (
            
            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
                {/* Hero Section */}
                <Card style={{ marginBottom: '20px', textAlign: 'center', padding: '20px' }}>
                    <Avatar size={100} src={creator.image_profile || 'https://via.placeholder.com/100'} />
                    <h2 style={{ marginTop: '15px', marginBottom: '5px' }}>@{creator.username}</h2>
                    <p style={{ fontStyle: 'italic', color: '#666' }}>{creator.bio}</p>
        
                    {/* Metrics Section */}
                    <div style={{ marginTop: '20px' }}>
                    <Row gutter={[16, 16]} justify="center">
                        {/* Followers */}
                        <Col xs={24} sm={12} md={6}>
                            <Tooltip title="The total number of followers across all connected social platforms.">
                                <Card style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        {creator.social_links && Array.isArray(creator.social_links) && creator.social_links.length > 0 ? (
                                            creator.social_links.map(({ platform, followersCount }, index) => (
                                                <div
                                                    key={index}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                                                >
                                                    {platformLogos[platform] || platform}
                                                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>
                                                        {formatNumber(followersCount)} Followers
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <span style={{ fontStyle: 'italic', color: '#999' }}>
                                                No social media links available
                                            </span>
                                        )}
                                    </div>
                                </Card>
                            </Tooltip>
                        </Col>
                        {/* Collaborations */}
                        <Col xs={24} sm={12} md={6}>
                            <Tooltip title="The number of successful collaborations completed by the creator.">
                                <Card style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Statistic
                                        title="Collaborations"
                                        value={creator.collaborations_count === 0 ? 'New' : creator.collaborations_count || '0'}
                                        valueStyle={{ color: '#3f8600', textAlign: 'center' }}
                                    />
                                </Card>
                            </Tooltip>
                        </Col>
                        {/* Reviews */}
                        {creator.average_rating > 0 && (
                            <Col xs={24} sm={12} md={6}>
                                <Tooltip title="Average rating from all reviews submitted by brands.">
                                    <Card style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Statistic
                                            title="Reviews"
                                            value={`${creator.average_rating?.toFixed(1)} ⭐`}
                                            valueStyle={{ color: '#fadb14', textAlign: 'center' }}
                                        />
                                    </Card>
                                </Tooltip>
                            </Col>
                        )}
                        {/* Engagement Rate */}
                        <Col xs={24} sm={12} md={6}>
                            <Tooltip title="Calculated as (Total Likes + Total Comments) ÷ Total Followers.">
                                <Card style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Statistic
                                        title="Engagement Rate"
                                        value={creator.engagement_rate || 0}
                                        suffix="%"
                                        valueStyle={{ color: '#722ed1', textAlign: 'center' }}
                                    />
                                </Card>
                            </Tooltip>
                        </Col>
                    </Row>
                </div>

                        {/* Book Creator CTA */}
                            <ConfigProvider
                                button={{
                                    className: styles.linearGradientButton,
                                }}
                            >
                                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<ArrowRightOutlined />}
                                        style={{
                                            background: 'linear-gradient(135deg, #6253e1, #04befe)',
                                            border: 'none',
                                            color: 'white',
                                        }}
                                    >
                                        Book Creator
                                    </Button>
                                </div>
                            </ConfigProvider>
                        </Card>
            
        
                {/* Tabs Section */}
                <Tabs defaultActiveKey="1">
                   {/* Overview Metrics */}
            <TabPane tab="Overview" key="1">
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                    <Tooltip title="The total number of shares in the last 90 days.">
                <Card>
                    <Statistic
                        title="Total Shares"
                        value={creator.total_shares ? creator.total_shares.toLocaleString() : 'N/A'}
                        valueStyle={{ color: '#722ed1'}}
                    />

                            </Card>
                        </Tooltip>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Tooltip title="Total number of posts by the creator in the last 90 days.">
                            <Card>
                                <Statistic
                                    title="Total Posts"
                                    value={creator.total_posts || 0}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Tooltip>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Tooltip title="Total views received on all posts in the last 90 days.">
                            <Card>
                                <Statistic
                                    title="Total Views"
                                    value={creator.total_views || 0}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Tooltip>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Tooltip title="Total likes received on all posts in the last 90 days.">
                            <Card>
                                <Statistic
                                    title="Total Likes"
                                    value={creator.total_likes || 0}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                        </Tooltip>
                    </Col>
                </Row>


                        {/* Audience Data Section */}
                        <div style={{ marginTop: '40px' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Audience Insights</h2>
                        <Row gutter={[16, 16]} justify="center">
                            {/* Niche */}
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Niche"
                                        value={
                                            Array.isArray(creator.niche)
                                                ? creator.niche.join(', ')
                                                : (() => {
                                                    try {
                                                        return JSON.parse(creator.niche || '[]').join(', ');
                                                    } catch (error) {
                                                        console.error('Invalid niche JSON:', error);
                                                        return 'N/A';
                                                    }
                                                })()
                                        }
                                        valueStyle={{ color: '#2f54eb' }}
                                    />
                                </Card>
                            </Col>

                            {/* Regions */}
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Regions"
                                        value={
                                            Array.isArray(creator.regions)
                                                ? creator.regions.join(', ')
                                                : (() => {
                                                    try {
                                                        return JSON.parse(creator.regions || '[]').join(', ');
                                                    } catch (error) {
                                                        console.error('Invalid regions JSON:', error);
                                                        return 'N/A';
                                                    }
                                                })()
                                        }
                                        valueStyle={{ color: '#fa8c16' }}
                                    />
                                </Card>
                            </Col>


                            {/* Primary Age Range */}
                            <Col xs={24} sm={12} md={6}>
                                <Card>
                                    <Statistic
                                        title="Primary Age Range"
                                        value={creator.primary_age_range || 'N/A'}
                                        valueStyle={{ color: '#eb2f96' }}
                                    />
                                </Card>
                            </Col>
                        </Row>
                    </div>
        
                        {/* Posts Section */}
                        <PostsHighlights posts={creator.portfolio_links || []} />

                    </TabPane>
        
                    {/* Offers Tab */}
                    <TabPane tab="Offers" key="2">
                        {offers.length === 0 ? (
                            <p>No offers available.</p>
                        ) : (
                            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                                {offers.map((offer) => (
                                    <Col xs={24} sm={12} md={8} lg={6} key={offer.id}>
                                        <Card
                                            hoverable
                                            className="offer-card"
                                            style={{ marginBottom: '16px', borderRadius: '8px' }}
                                        >
                                            <Card.Meta
                                                title={<strong>{offer.package_name}</strong>}
                                                description={<p>{offer.description || 'No description available'}</p>}
                                            />
                                            <div style={{ marginTop: '10px' }}>
                                                <strong>Followers:</strong> {offer.followers_count?.toLocaleString() || 'N/A'}
                                            </div>
                                            {renderPlatformsAndFollowers(offer.platforms, offer.followers_count)}
                                            <div style={{ marginTop: '10px' }}>
                                                <strong>Content Types:</strong>{' '}
                                                {renderVisibilityBadges(offer.content_type ? offer.content_type.split(',') : [])}
                                            </div>
                                            <div style={{ marginTop: '10px' }}>
                                                <strong>Price:</strong> €{offer.price?.toLocaleString() || 'N/A'}
                                            </div>
                                            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                                <Button
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => console.log(`Book offer: ${offer.id}`)}
                                                >
                                                    Book Offer
                                                </Button>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </TabPane>
                </Tabs>
        
                {/* Offer Modal */}
                {selectedOffer && (
                    <Modal
                        title={selectedOffer.package_name || 'Offer Details'}
                        visible={isModalVisible}
                        onCancel={closeModal}
                        footer={null}
                        bodyStyle={{ overflowY: 'auto', maxHeight: '80vh' }}
                    >
                        <div>
                            <p><strong>Description:</strong> {selectedOffer.description || 'No description available'}</p>
                            <p><strong>Followers:</strong> {selectedOffer.followers_count?.toLocaleString() || 'N/A'}</p>
                            <p><strong>Price:</strong> €{selectedOffer.price?.toLocaleString() || 'N/A'}</p>
                            <div>
                                <strong>Platforms:</strong>
                                {renderPlatformsAndFollowers(selectedOffer.platforms, selectedOffer.followers_count)}
                            </div>
                            <div style={{ marginTop: '10px' }}>
                                <strong>Content Types:</strong>{' '}
                                {renderVisibilityBadges(selectedOffer.content_type ? selectedOffer.content_type.split(',') : [])}
                            </div>
                        </div>
                    </Modal>
                )}
            </div>
           
        );
        
};

export default ProfilePage;