// File: Listing.js

import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Avatar, Button, Drawer, Modal, Slider, Select, Input, Row, Col, Badge, Spin, message, notification,
} from 'antd';
import { FaInstagram, FaYoutube, FaTwitter, FaFacebook } from 'react-icons/fa';
import { SearchOutlined, StarOutlined, StarFilled, PlusOutlined, ArrowRightOutlined } from '@ant-design/icons';
import ReactWorldFlags from 'react-world-flags';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Listing.css';

const { Option } = Select;

const platformLogos = {
    Instagram: <FaInstagram style={{ color: '#E1306C', fontSize: '18px' }} />,
    YouTube: <FaYoutube style={{ color: '#FF0000', fontSize: '18px' }} />,
    Twitter: <FaTwitter style={{ color: '#1DA1F2', fontSize: '18px' }} />,
    Facebook: <FaFacebook style={{ color: '#1877F2', fontSize: '18px' }} />,
};

const getBadgeColor = (contentType) => {
    switch (contentType) {
        case 'Stories': return '#ff9800';
        case 'Live Streaming': return '#4caf50';
        case 'Static Posts': return '#9c27b0';
        case 'Short Videos': return '#e91e63';
        case '10min+ Videos': return '#2196f3';
        case 'User-Generated Content': return '#ff5722';
        case 'Audio Content': return '#795548';
        case 'Newsletter': return '#ffaa00';
        default: return '#607d8b';
    }
};

const Listing = () => {
    const [offers, setOffers] = useState([]);
    const [filteredOffers, setFilteredOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [savedDrawerVisible, setSavedDrawerVisible] = useState(false);
    const [savedOffers, setSavedOffers] = useState([]);
    const [savedOfferIds, setSavedOfferIds] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContentTypes, setSelectedContentTypes] = useState([]);
    const [selectedNiche, setSelectedNiche] = useState([]);
    const [followerRange, setFollowerRange] = useState([1000, 50000]);
    const [priceRange, setPriceRange] = useState([100, 5000]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
    const [selectedRegions, setSelectedRegions] = useState([]); // For regions
    const [selectedAudienceAge, setSelectedAudienceAge] = useState([]);

    const navigate = useNavigate();
        // Ref to track the latest query
    const latestQueryRef = useRef(searchQuery);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                setIsLoading(true);
                latestQueryRef.current = searchQuery.trim(); // Update the latest query reference
    
                // Fetch data from API
                const response = await axios.get('http://localhost:5000/creator-offers', {
                    params: { keyword: latestQueryRef.current || '' },
                });
    
                const data = response.data || [];
                const validOffers = data.filter((offer) => offer && offer.offer_id && offer.name);
    
                // Set state only if the query matches the latest one
                if (latestQueryRef.current === searchQuery.trim()) {
                    setOffers(validOffers);
                    setFilteredOffers(validOffers);
    
                    // Load and validate saved offers from localStorage
                    const saved = JSON.parse(localStorage.getItem('savedOffers')) || [];
                    const validSavedOffers = saved.filter((offer) => offer && offer.offer_id);
    
                    setSavedOffers(validSavedOffers);
                    setSavedOfferIds(new Set(validSavedOffers.map((o) => o.offer_id)));
                }
            } catch (error) {
                console.error('Error fetching offers:', error);
                message.error('Error fetching creator offers. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
    
        const debounceFetch = debounce(fetchOffers, 300); // Debounce the API call
        debounceFetch();
    
        return () => debounceFetch.cancel(); // Cleanup on unmount or dependency change
    }, [searchQuery]);
    
    const handleCardClick = (creatorId) => {
        if (!creatorId) {
            console.error('Creator ID is undefined');
            return;
        }
        navigate(`/creator/profile/${creatorId}`);
    };
    
    const toggleSaveOffer = (offer) => {
        if (!offer || !offer.offer_id) {
            console.error('Invalid offer cannot be saved:', offer);
            return; // Prevent saving invalid offers
        }
    
        const offerId = offer.offer_id;
        const isAlreadySaved = savedOfferIds.has(offerId);
    
        // Update savedOffers and savedOfferIds
        const updatedSavedOffers = isAlreadySaved
            ? savedOffers.filter((o) => o.offer_id !== offerId) // Remove the specific offer
            : [...savedOffers, offer]; // Add the specific offer
    
        const updatedSavedOfferIds = new Set(updatedSavedOffers.map((o) => o.offer_id));
    
        setSavedOffers(updatedSavedOffers);
        setSavedOfferIds(updatedSavedOfferIds);
    
        // Persist updated state in localStorage
        localStorage.setItem('savedOffers', JSON.stringify(updatedSavedOffers));
    
        // Notify the user
        notification[isAlreadySaved ? 'info' : 'success']({
            message: isAlreadySaved ? 'Offer Unsaved' : 'Offer Saved',
            description: `Offer "${offer.package_name}" has been ${isAlreadySaved ? 'removed from' : 'saved to'} your saved offers.`,
        });
    };
        
    const applyFilters = () => {
        const filtered = offers.filter((offer) => {
            const matchesSearchQuery = searchQuery.trim()
                ? offer.name.toLowerCase().includes(searchQuery.toLowerCase())
                : true;

            const matchesContentTypes = selectedContentTypes.length
                ? selectedContentTypes.some((type) => offer.content_type?.includes(type))
                : true;    
    
            const matchesNiche = selectedNiche.length
                ? selectedNiche.some((niche) => offer.niche?.includes(niche))
                : true;
    
            const matchesFollowers =
                offer.followers_count >= followerRange[0] && offer.followers_count <= followerRange[1];
    
            const matchesPrice =
                offer.price >= priceRange[0] && offer.price <= priceRange[1];
    
            const matchesRegions = selectedRegions.length
                ? selectedRegions.some((region) => offer.regions?.includes(region))
                : true;
    
            const matchesAudienceAge = selectedAudienceAge.length
                ? selectedAudienceAge.includes(offer.primary_age_range)
                : true;
    
            return (
                matchesSearchQuery &&
                matchesContentTypes && 
                matchesNiche &&
                matchesFollowers &&
                matchesPrice &&
                matchesRegions &&
                matchesAudienceAge
            );
        });
    
        setFilteredOffers(filtered);
        setDrawerVisible(false); // Close the filter drawer after applying filters
    };
    
    const clearFilters = () => {
        setSearchQuery('');
        setSelectedContentTypes([]);
        setSelectedNiche([]);
        setSelectedRegions([]);
        setSelectedAudienceAge([]);
        setFollowerRange([1000, 50000]);
        setPriceRange([100, 5000]);
        setFilteredOffers(offers); // Reset filtered offers to all offers
    };
    
    const openDetailsModal = (offer) => {
        setSelectedOffer(offer);
        setIsDetailsModalVisible(true);
    };
    
    const renderPlatformsAndFollowers = (platforms, followers) => (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            {platforms &&
                typeof platforms === 'string' &&
                platforms.split(',').map((platform, index) => (
                    <span key={index} className="platform-item" style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                        {platformLogos[platform] || platform}
                        <span style={{ marginLeft: '4px' }}>{followers.toLocaleString()}</span>
                    </span>
                ))}
        </div>
    );
    
    const renderVisibilityBadges = (contentTypes) => (
        contentTypes.map((type, index) => (
            <Badge key={index} count={type.trim()} style={{ backgroundColor: getBadgeColor(type.trim()), marginRight: 5 }} />
        ))
    );
    
  

    return (
        <div className="listing-container">
            <div className="search-bar">
                <Input
                    placeholder="Search by niche or creator name"
                    prefix={<SearchOutlined />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}
                />
                <Button onClick={() => setDrawerVisible(true)} style={{ marginLeft: 'auto' }}>Filters</Button>
                <Button onClick={() => setSavedDrawerVisible(true)} style={{ marginLeft: '10px' }}>
                    Saved Offers
                </Button>
            </div>
    
                            <Drawer
                    title="Filter Options"
                    placement="right"
                    onClose={() => setDrawerVisible(false)}
                    visible={drawerVisible}
                >
                    <div>
                        {/* Content Types Filter */}
                        <h4>Content Types</h4>
                        <Select
                            mode="multiple"
                            value={selectedContentTypes}
                            onChange={setSelectedContentTypes}
                            style={{ width: '100%' }}
                            placeholder="Select content types"
                        >
                            <Option value="Stories">Stories</Option>
                            <Option value="Live Streaming">Live Streaming</Option>
                            <Option value="Static Posts">Static Posts</Option>
                            <Option value="Short Videos">Short Videos</Option>
                            <Option value="10min+ Videos">10min+ Videos</Option>
                            <Option value="User-Generated Content">User-Generated Content</Option>
                            <Option value="Audio Content">Audio Content</Option>
                            <Option value="Newsletter">Newsletter</Option>
                        </Select>

                        {/* Niche Filter */}
                        <h4>Niche</h4>
                        <Select
                            mode="multiple"
                            value={selectedNiche}
                            onChange={setSelectedNiche}
                            style={{ width: '100%' }}
                        >
                            <Option value="Fitness">Fitness</Option>
                            <Option value="Tech">Tech</Option>
                            <Option value="Lifestyle">Lifestyle</Option>
                        </Select>

                        {/* Regions Filter */}
                        <h4>Regions</h4>
                        <Select
                            mode="multiple"
                            value={selectedRegions}
                            onChange={setSelectedRegions}
                            style={{ width: '100%' }}
                        >
                            <Option value="US">US</Option>
                            <Option value="UK">UK</Option>
                            <Option value="Europe">Europe</Option>
                            <Option value="Asia">Asia</Option>
                        </Select>

                        {/* Audience Age Range Filter */}
                        <h4>Audience Age Range</h4>
                        <Select
                            mode="multiple"
                            value={selectedAudienceAge}
                            onChange={setSelectedAudienceAge}
                            style={{ width: '100%' }}
                        >
                            <Option value="18-24">18-24</Option>
                            <Option value="25-34">25-34</Option>
                            <Option value="35-44">35-44</Option>
                            <Option value="45+">45+</Option>
                        </Select>

                        {/* Follower Range Filter */}
                        <h4>Follower Range</h4>
                        <Slider
                            range
                            value={followerRange}
                            onChange={setFollowerRange}
                            min={1000}
                            max={50000}
                        />

                        {/* Price Range Filter */}
                        <h4>Price Range (€)</h4>
                        <Slider
                            range
                            value={priceRange}
                            onChange={setPriceRange}
                            min={100}
                            max={5000}
                        />

                        {/* Filter Buttons */}
                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button
                                type="primary"
                                onClick={applyFilters}
                                style={{ width: '45%' }}
                            >
                                Apply Filters
                            </Button>
                            <Button
                                type="text"
                                onClick={clearFilters}
                                style={{ width: '45%' }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    </div>
                </Drawer>
    
            {isLoading ? (
                <Spin tip="Loading offers..." style={{ marginTop: '50px' }} />
            ) : (
                <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                {filteredOffers.map((offer) => {
                    if (!offer || !offer.name) {
                        console.error('Invalid offer:', offer); // Skip invalid offers
                        return null;
                    }

                    return (
                        <Col xs={24} sm={12} md={8} lg={6} key={offer.id}>
                            <Card
                                hoverable
                                className="offer-card"
                                style={{ marginBottom: '16px', borderRadius: '8px' }}
                                onClick={() => handleCardClick(offer.creator_id)}
                            >
                                
                                <Card.Meta
                                    avatar={<Avatar src={offer.image_profile || 'default-profile.jpg'} />}
                                    title={<strong>@{offer.name}</strong>}
                                    description={
                                        <>
                                            {/* Display Niches as Colored Badges */}
                                            <div style={{ marginTop: '10px' }}>
                                                {offer.niche
                                                    ? offer.niche.split(',').map((niche, idx) => (
                                                        <span
                                                            key={idx}
                                                            style={{
                                                                display: 'inline-block',
                                                                backgroundColor: '#e0f7fa',
                                                                color: '#00796b',
                                                                borderRadius: '12px',
                                                                padding: '5px 10px',
                                                                marginRight: '5px',
                                                                marginBottom: '5px',
                                                                fontSize: '12px',
                                                            }}
                                                        >
                                                            {niche.trim()}
                                                        </span>
                                                    ))
                                                    : 'No niches specified'}
                                            </div>

                                            {/* Reach */}
                                            <div style={{ marginTop: '10px' }}>
                                                <strong style={{ color: '#000' }}>Reach:</strong>
                                                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginTop: '5px' }}>
                                                    {offer.regions
                                                        ? offer.regions.split(',').map((region, idx) => (
                                                            <span
                                                                key={idx}
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    marginRight: '10px',
                                                                    marginBottom: '5px',
                                                                }}
                                                            >
                                                                <ReactWorldFlags
                                                                    code={region.trim()}
                                                                    style={{
                                                                        width: '1.2em',
                                                                        height: '1.2em',
                                                                        borderRadius: '50%',
                                                                        objectFit: 'cover',
                                                                    }}
                                                                />
                                                                <span style={{ marginLeft: '5px', color: '#000' }}>{region}</span>
                                                            </span>
                                                        ))
                                                        : <span style={{ color: '#000' }}>N/A</span>}
                                                </div>
                                            </div>
                                        </>
                                    }
                                />
                                {renderPlatformsAndFollowers(offer.platforms, offer.followers_count)}
                                <div style={{ marginTop: '10px' }}>
                                    <strong>Format:</strong>{' '}
                                    {renderVisibilityBadges(offer.content_type ? offer.content_type.split(',') : [])}
                                </div>
                                <p style={{ marginTop: '10px' }}>
                                    <strong>Description:</strong>{' '}
                                    {offer.description ? `${offer.description.substring(0, 60)}...` : 'No description available'}
                                </p>
                                <p>
                                    <strong>Price:</strong> €{offer.price}
                                </p>
                                {/* Action Buttons */}
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginTop: '10px',
                                        flexWrap: 'wrap',
                                        gap: '8px', // Space between buttons
                                    }}
                                >
                                    <Button
                                        type="link"
                                        icon={savedOfferIds.has(offer.offer_id) ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSaveOffer(offer);
                                        }}
                                        size="small"
                                        style={{ flex: 1 }}
                                    >
                                        {savedOfferIds.has(offer.offer_id) ? 'Saved' : 'Save'}
                                    </Button>
                                    <Button
                                        type="link"
                                        icon={<PlusOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDetailsModal(offer);
                                        }}
                                        size="small"
                                        style={{ flex: 1 }}
                                    >
                                        Details
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="small"
                                        icon={<ArrowRightOutlined />}
                                        style={{
                                            flex: 2, // Slightly larger space for "Book Creator"
                                            background: 'linear-gradient(135deg, #6253e1, #04befe)',
                                            border: 'none',
                                            color: 'white',
                                            textAlign: 'center',
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            console.log(`Book Creator: ${offer.creator_id}`);
                                            // Add the navigation logic here
                                        }}
                                    >
                                        Book Creator
                                    </Button>
                            </div>
                        </Card>
                        </Col>
                        );
                        })}
                        </Row>
                        )}                                               
    
                                <Drawer
                                title="Saved Offers"
                                placement="right"
                                onClose={() => setSavedDrawerVisible(false)}
                                visible={savedDrawerVisible}
                                width={350}
                            >
                                {savedOffers.length > 0 ? (
                                    savedOffers.map((offer) => {
                                        if (!offer || !offer.name) {
                                            console.error('Invalid saved offer:', offer); // Log invalid offers for debugging
                                            return null; // Skip invalid offers
                                        }

                                        return (
                                            <Card
                                                key={offer.id}
                                                style={{ marginBottom: '10px' }}
                                                actions={[
                                                    <Button
                                                        type="link"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleSaveOffer(offer);
                                                        }}
                                                    >
                                                        Unsave
                                                    </Button>,
                                                    <Button
                                                        type="link"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openDetailsModal(offer);
                                                        }}
                                                    >
                                                        Details
                                                    </Button>,
                                                <Button
                                                type="primary"
                                                size="small"
                                                icon={<ArrowRightOutlined />}
                                                style={{
                                                    background: 'linear-gradient(135deg, #6253e1, #04befe)',
                                                    border: 'none',
                                                    color: 'white',
                                                    textAlign: 'center',
                                                    flex: 1, // Maintain consistent button size
                                                    whiteSpace: 'nowrap', // Prevent text wrapping
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log(`Book Creator: ${offer.creator_id}`);
                                                    // Add the navigation logic here
                                                }}
                                            >
                                                Book Creator
                                            </Button>,
                                        ]}
                                            >
                                                <Card.Meta
                                                    title={offer.name}
                                                    description={
                                                        <>
                                                            <p>
                                                                <strong>{renderPlatformsAndFollowers(offer.platforms, offer.followers_count)}</strong>
                                                            </p>
                                                            <p>
                                                                <strong>Content Types:</strong>{' '}
                                                                {renderVisibilityBadges(offer.content_type ? offer.content_type.split(',') : [])}
                                                            </p>
                                                            <p>
                                                                <strong>Price:</strong> €{offer.price}
                                                            </p>
                                                            <p>
                                                                {offer.description
                                                                    ? `${offer.description.substring(0, 60)}...`
                                                                    : 'No description available'}
                                                            </p>
                                                        </>
                                                    }
                                                />
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <p>No saved offers.</p>
                                )}
                            </Drawer>
    
            <Modal
                title={selectedOffer?.name}
                visible={isDetailsModalVisible}
                onCancel={() => setIsDetailsModalVisible(false)}
                footer={null}
                width="90%"
                style={{ maxWidth: '600px' }}
                bodyStyle={{ overflowY: 'auto', maxHeight: '80vh' }}
            >
                {selectedOffer && (
                    <>
                        <p>
                            <strong>{selectedOffer.package_name}</strong>
                        </p>
                        <p>
                            <strong>Content Types:</strong>{' '}
                            {selectedOffer.content_type ? renderVisibilityBadges(selectedOffer.content_type.split(',')) : 'N/A'}
                        </p>
                        <p>
                            <strong>Platforms:</strong> {renderPlatformsAndFollowers(selectedOffer.platforms, selectedOffer.followers_count)}
                        </p>
                        <p>
                            <strong>Description:</strong> {selectedOffer.description}
                        </p>
                        <p>
                            <strong>Price:</strong> €{selectedOffer.price}
                        </p>
                    </>
                )}
            </Modal>
        </div>
    );
    
};

export default Listing;
