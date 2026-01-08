import React, { useEffect, useRef } from 'react';
import { Card, Row, Col } from 'antd';
import { FaInstagram, FaYoutube, FaTwitter, FaTiktok, FaSnapchatGhost, FaFacebook, FaLinkedin } from 'react-icons/fa';
import SocialPostPreview from './SocialPostPreview';
import { createStyles } from 'antd-style';

const useStyle = createStyles(({ css }) => ({
    postCard: css`
      border-radius: 12px;
      padding: 0px;
      background: #FFFFFF;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      overflow: hidden;
      max-width: 100%;
      &:hover {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
    `,
}));

const BrandPostsHighlights = ({ posts }) => {
    const { styles } = useStyle();
    const cardRefs = useRef([]);

    // Adjust card height dynamically to fit embed content
    const adjustCardHeights = () => {
        cardRefs.current.forEach((card) => {
            if (card) {
                const iframe = card.querySelector('iframe');
                if (iframe) {
                    const isTikTok = iframe.src.includes('tiktok.com');
                    const isYouTube = iframe.src.includes('youtube.com');
                    const aspectRatio = isTikTok ? 1.78 : isYouTube ? 1.77 : 1.91; // TikTok ~9:16, YouTube ~16:9, Instagram ~1:1.91
                    iframe.style.height = `${iframe.offsetWidth * aspectRatio}px`;
                }
            }
        });
    };

    // Get embed URL or fallback based on platform
    const getEmbedUrl = (url) => {
        console.log(`🟢 Checking URL: ${url}`);
        console.log(`🟢 URL type: ${typeof url}`);
        console.log(`🟢 URL length: ${url?.length}`);
        
        // Clean and validate URL
        if (!url || typeof url !== 'string') {
            console.log('❌ Invalid URL provided:', url);
            return { url: '', platform: 'Unknown' };
        }
        
        // Trim whitespace
        url = url.trim();
        
        // Ensure URL has protocol
        if (!url.startsWith('http')) {
            url = 'https://' + url;
            console.log(`🟢 Added protocol: ${url}`);
        }
        
        console.log(`🟢 Final URL: ${url}`);

        // TikTok detection
        if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
            console.log('🎵 TikTok URL detected');
            const videoIdMatch = url.match(/\/video\/(\d+)/);
            const videoId = videoIdMatch ? videoIdMatch[1] : null;
            console.log(`TikTok Match: ${videoIdMatch}, ID: ${videoId}`);
            return videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : { url, platform: 'TikTok' };
        }

        // YouTube detection
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            console.log('📺 YouTube URL detected');
            
            // Handle YouTube Live streams
            if (url.includes('/live/')) {
                const liveIdMatch = url.match(/\/live\/([^/?]+)/);
                const liveId = liveIdMatch ? liveIdMatch[1] : null;
                console.log(`YouTube Live Match: ${liveIdMatch}, ID: ${liveId}`);
                return liveId ? `https://www.youtube.com/embed/${liveId}` : { url, platform: 'YouTube' };
            }
            
            // Handle YouTube Shorts
            if (url.includes('/shorts/')) {
                const shortIdMatch = url.match(/\/shorts\/([^/?]+)/);
                const shortId = shortIdMatch ? shortIdMatch[1] : null;
                console.log(`YouTube Shorts Match: ${shortIdMatch}, ID: ${shortId}`);
                return shortId ? `https://www.youtube.com/embed/${shortId}` : { url, platform: 'YouTube' };
            }
            
            // Handle regular YouTube videos
            if (url.includes('/watch')) {
                const videoIdMatch = url.match(/[?&]v=([^&]+)/);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;
                console.log(`YouTube Watch Match: ${videoIdMatch}, ID: ${videoId}`);
                return videoId ? `https://www.youtube.com/embed/${videoId}` : { url, platform: 'YouTube' };
            }
            
            // Handle youtu.be links
            if (url.includes('youtu.be/')) {
                const videoIdMatch = url.match(/youtu\.be\/([^/?]+)/);
                const videoId = videoIdMatch ? videoIdMatch[1] : null;
                console.log(`YouTube Short Match: ${videoIdMatch}, ID: ${videoId}`);
                return videoId ? `https://www.youtube.com/embed/${videoId}` : { url, platform: 'YouTube' };
            }
            
            return { url, platform: 'YouTube' };
        }

        // Instagram detection
        if (url.includes('instagram.com') || url.includes('instagr.am')) {
            console.log('📸 Instagram URL detected - using fallback due to embed restrictions');
            return { url, platform: 'Instagram' };
        }

        // Twitter/X detection
        if (url.includes('twitter.com') || url.includes('x.com') || url.includes('t.co')) {
            console.log('🐦 Twitter/X URL detected - using fallback due to embed restrictions');
            return { url, platform: 'X' };
        }

        // Snapchat detection
        if (url.includes('snapchat.com')) {
            console.log('👻 Snapchat URL detected');
            return { url, platform: 'Snapchat' };
        }
        
        // Facebook detection
        if (url.includes('facebook.com') || url.includes('fb.com')) {
            console.log('📘 Facebook URL detected');
            return { url, platform: 'Facebook' };
        }
        
        // LinkedIn detection
        if (url.includes('linkedin.com')) {
            console.log('💼 LinkedIn URL detected');
            return { url, platform: 'LinkedIn' };
        }

        console.log('❌ Unknown platform, falling back to Unknown');
        return { url, platform: 'Unknown' };
    };

    const platformIcons = {
        TikTok: <FaTiktok style={{ color: '#000000', fontSize: '1.5rem' }} />,
        YouTube: <FaYoutube style={{ color: '#FF0000', fontSize: '1.5rem' }} />,
        Instagram: <FaInstagram style={{ color: '#E1306C', fontSize: '1.5rem' }} />,
        X: <FaTwitter style={{ color: '#1DA1F2', fontSize: '1.5rem' }} />,
        Twitter: <FaTwitter style={{ color: '#1DA1F2', fontSize: '1.5rem' }} />,
        Snapchat: <FaSnapchatGhost style={{ color: '#FFFC00', fontSize: '1.5rem' }} />,
        Facebook: <FaFacebook style={{ color: '#1877F2', fontSize: '1.5rem' }} />,
        LinkedIn: <FaLinkedin style={{ color: '#0077B5', fontSize: '1.5rem' }} />,
        Unknown: <span>🔗</span>,
    };

    const renderEmbed = (embedUrl, title) => (
        <iframe
            src={embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
                width: '100%',
                border: 'none',
                borderRadius: '10px',
            }}
        />
    );

    // eslint-disable-next-line no-unused-vars
    const renderFallback = (url, platform) => (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '200px', 
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
        }}>
            <div style={{ marginBottom: '12px' }}>
                {platformIcons[platform] || platformIcons.Unknown}
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                    textDecoration: 'none', 
                    color: '#333',
                    fontWeight: '500',
                    fontSize: '14px',
                    textAlign: 'center'
                }}
            >
                View on {platform}
            </a>
            <div style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginTop: '8px',
                textAlign: 'center'
            }}>
                Click to open in new tab
            </div>
        </div>
    );

    const renderPost = (url) => {
        const embedResult = getEmbedUrl(url);
        console.log(`🟢 Rendering post: ${url}, Embed Result:`, embedResult);

        if (typeof embedResult === 'string') {
            // Direct embed URL (YouTube, etc.)
            if (url.includes('youtube.com')) {
                return renderEmbed(embedResult, 'YouTube Post');
            }
            // For other platforms, use preview component
            if (url.includes('tiktok.com')) {
                return <SocialPostPreview url={url} platform="TikTok" />;
            }
            if (url.includes('instagram.com')) {
                return <SocialPostPreview url={url} platform="Instagram" />;
            }
        }

        // Fallback for non-embeddable URLs
        const { url: fallbackUrl, platform } = embedResult;
        return <SocialPostPreview url={fallbackUrl} platform={platform} />;
    };

    useEffect(() => {
        adjustCardHeights();
        return () => {
            cardRefs.current = [];
        };
    }, [posts]);

    // Debug logging
    console.log('🟢 BrandPostsHighlights received posts:', posts);
    console.log('🟢 Posts type:', typeof posts);
    console.log('🟢 Posts is array:', Array.isArray(posts));
    console.log('🟢 Posts length:', posts?.length);

    return (
        <div style={{ marginTop: '40px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: '600', color: '#212121' }}>
                Posts Highlights
            </h2>
            <Row gutter={[16, 16]} justify="center">
                {Array.isArray(posts) && posts.length > 0 ? (
                    posts.map((post, index) => {
                        console.log(`🟢 Rendering brand post ${index}:`, post);
                        return (
                            <Col xs={24} sm={12} md={8} key={post.id || index}>
                                <Card
                                    hoverable
                                    ref={(el) => (cardRefs.current[index] = el)}
                                    className={styles.postCard}
                                    bodyStyle={{ padding: '0px' }}
                                >
                                    {renderPost(post.post_url || post)}
                                </Card>
                            </Col>
                        );
                    })
                ) : (
                    <p style={{ textAlign: 'center', color: '#757575', fontSize: '16px' }}>
                        {posts ? 'No posts available.' : 'Loading posts...'}
                    </p>
                )}
            </Row>
        </div>
    );
};

export default BrandPostsHighlights;