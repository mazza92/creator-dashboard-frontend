import React, { useState } from 'react';
import { Button, Typography } from 'antd';
import { FaPlay, FaImage, FaTiktok, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';

const { Text } = Typography;

const SocialPostPreview = ({ url, platform }) => {
    const [showEmbed, setShowEmbed] = useState(false);
    const [embedError, setEmbedError] = useState(false);

    const getPlatformIcon = () => {
        switch (platform) {
            case 'TikTok': return <FaTiktok style={{ color: '#000' }} />;
            case 'Instagram': return <FaInstagram style={{ color: '#E4405F' }} />;
            case 'X': case 'Twitter': return <FaTwitter style={{ color: '#1DA1F2' }} />;
            case 'YouTube': return <FaYoutube style={{ color: '#FF0000' }} />;
            default: return <FaImage style={{ color: '#666' }} />;
        }
    };

    const getEmbedUrl = () => {
        if (platform === 'TikTok') {
            // Extract video ID from TikTok URL
            const videoIdMatch = url.match(/\/video\/(\d+)/);
            if (videoIdMatch) {
                return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`;
            }
        }
        return url;
    };

    const handleEmbedError = () => {
        setEmbedError(true);
        setShowEmbed(false);
    };

    if (embedError || !showEmbed) {
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '250px', 
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                border: '2px dashed #ddd',
                position: 'relative'
            }}>
                <div style={{ 
                    fontSize: '3rem', 
                    marginBottom: '15px',
                    opacity: 0.7
                }}>
                    {getPlatformIcon()}
                </div>
                
                <Text strong style={{ fontSize: '16px', marginBottom: '8px' }}>
                    {platform} Post
                </Text>
                
                <Text style={{ 
                    color: '#666', 
                    textAlign: 'center', 
                    marginBottom: '15px',
                    fontSize: '14px'
                }}>
                    Click to view this {platform} post
                </Text>
                
                <Button 
                    type="primary"
                    icon={<FaPlay style={{ marginRight: '5px' }} />}
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                        borderRadius: '20px',
                        height: '40px',
                        paddingLeft: '20px',
                        paddingRight: '20px'
                    }}
                >
                    View on {platform}
                </Button>
                
                <div style={{ 
                    position: 'absolute', 
                    top: '10px', 
                    right: '10px',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '4px',
                    padding: '4px 8px'
                }}>
                    <Text style={{ color: 'white', fontSize: '12px' }}>
                        {platform}
                    </Text>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '400px' }}>
            <iframe
                src={getEmbedUrl()}
                title={`${platform} Post`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '10px',
                }}
                onError={handleEmbedError}
            />
            
            <div style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                borderRadius: '4px',
                padding: '4px 8px'
            }}>
                <Text style={{ color: 'white', fontSize: '12px' }}>
                    {platform}
                </Text>
            </div>
        </div>
    );
};

export default SocialPostPreview;
