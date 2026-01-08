import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Tag, Space, Input, Breadcrumb, Pagination } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import LandingPageLayout from '../Layouts/LandingPageLayout';

const { Title, Paragraph } = Typography;
const { Search } = Input;

const PageContainer = styled.div`
  padding-top: 80px;
  min-height: 100vh;
  background: #f8f9fa;
`;

const Section = styled.section`
  padding: 80px 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const BlogCard = styled(Card)`
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .ant-card-cover {
    height: 200px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }
  }

  &:hover .ant-card-cover img {
    transform: scale(1.05);
  }
`;

const CategoryFilter = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const StyledTag = styled(Tag)`
  margin: 4px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const BlogPage = () => {
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const postsPerPage = 6;

  // Categories for content organization - using actual post categories
  // eslint-disable-next-line no-unused-vars
  const categories = [
    'Monetization',
    'Brand Partnerships',
    'Influencer Marketing',
    'Content Strategy',
    'Creator Success',
    'Industry Trends',
    'Audience Growth',
    'Micro-Influencer Marketing',
    'UGC Content',
    'Creator Economy'
  ];

  // Get unique categories from actual posts
  const getUniqueCategories = (posts) => {
    const uniqueCategories = [...new Set(posts.map(post => post.category))];
    return uniqueCategories.filter(category => category && category.trim() !== '');
  };

  // Load posts from JSON files
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        // Import the posts index
        const postsIndex = await import('../content/posts/posts.json');
        const postPromises = postsIndex.default.map(async (slug, index) => {
          try {
            const postData = await import(`../content/posts/${slug}.json`);
            return {
              id: index + 1,
              ...postData.default
            };
          } catch (error) {
            console.warn(`Post ${slug} not found, skipping...`);
            return null;
          }
        });
        const loadedPosts = (await Promise.all(postPromises))
          .filter(post => post !== null)
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, most recent first
        setPosts(loadedPosts);
      } catch (error) {
        console.error('Error loading posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  // Filter posts based on selected category and search query
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  // eslint-disable-next-line no-unused-vars
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Reset to first page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Generate structured data for the blog
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Newcollab Blog - Free Link in Bio for Paid Partnerships",
    "description": "Expert content on free link in bio for paid partnerships, sponsorships for influencers, and creator monetization strategies.",
    "url": "https://newcollab.co/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Newcollab",
      "logo": {
        "@type": "ImageObject",
        "url": "https://newcollab.co/logo.png"
      }
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "image": post.image,
      "datePublished": post.date,
      "dateModified": post.date,
      "author": {
        "@type": "Person",
        "name": post.author.name,
        "jobTitle": post.author.role,
        "image": post.author.image
      },
      "publisher": {
        "@type": "Organization",
        "name": "Newcollab",
        "logo": {
          "@type": "ImageObject",
          "url": "https://newcollab.co/logo.png"
        }
      },
      "description": post.metaDescription || post.excerpt,
      "keywords": post.keywords?.join(', ') || post.tags?.join(', '),
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://newcollab.co/blog/${post.slug}`
      },
      "articleSection": post.category,
      "wordCount": post.content?.length || 0
    }))
  };

  return (
    <LandingPageLayout canonicalUrl="https://newcollab.co/blog">
      <Helmet>
        <title>Free Link in Bio for Paid Partnerships | Sponsorships for Influencers Blog | Newcollab</title>
        <meta name="description" content="Discover how to get free link in bio for paid partnerships and sponsorships for influencers. Expert tips on brand deals, micro-influencer strategies, and creator monetization." />
        <meta name="keywords" content="free link in bio for paid partnerships, sponsorships for influencers, brand sponsorships for influencers, paid partnerships, influencer sponsorships, micro-influencer brand deals, creator monetization, brand partnerships, content strategy, influencer marketing" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:title" content="Free Link in Bio for Paid Partnerships | Sponsorships for Influencers Blog | Newcollab" />
        <meta property="og:description" content="Discover how to get free link in bio for paid partnerships and sponsorships for influencers. Expert tips on brand deals, micro-influencer strategies, and creator monetization." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newcollab.co/blog" />
        <meta property="og:image" content="https://newcollab.co/og-image.jpg" />
        <meta property="og:site_name" content="Newcollab" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Link in Bio for Paid Partnerships | Sponsorships for Influencers Blog | Newcollab" />
        <meta name="twitter:description" content="Discover how to get free link in bio for paid partnerships and sponsorships for influencers. Expert tips on brand deals, micro-influencer strategies, and creator monetization." />
        <meta name="twitter:image" content="https://newcollab.co/og-image.jpg" />
        <meta name="twitter:creator" content="@newcollab" />
        <meta name="twitter:site" content="@newcollab" />
        
        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <meta name="language" content="English" />
        <meta name="author" content="Newcollab" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="alternate" type="application/rss+xml" title="Newcollab Blog RSS" href="https://newcollab.co/blog/rss.xml" />
        
        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Additional Schema for Blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Newcollab Blog",
            "url": "https://newcollab.co/blog",
            "description": "Free link in bio for paid partnerships and sponsorships for influencers. Expert content on brand deals, micro-influencer strategies, and creator monetization.",
            "publisher": {
              "@type": "Organization",
              "name": "Newcollab",
              "logo": {
                "@type": "ImageObject",
                "url": "https://newcollab.co/logo.png"
              }
            },
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://newcollab.co/blog?search={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      <PageContainer>
        <main>
          <Section>
            <Breadcrumb style={{ marginBottom: '24px' }}>
              <Breadcrumb.Item>
                <Link to="/"><HomeOutlined /></Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Blog</Breadcrumb.Item>
            </Breadcrumb>

          <Title level={1} style={{ textAlign: 'center', marginBottom: '24px' }}>
            Free Link in Bio for Paid Partnerships & Sponsorships for Influencers
          </Title>
          <Paragraph style={{ textAlign: 'center', fontSize: '18px', maxWidth: '600px', margin: '0 auto 48px' }}>
            Discover expert strategies for getting free link in bio for paid partnerships and sponsorships for influencers. Learn how to monetize your content and secure brand deals.
          </Paragraph>

          <div style={{ maxWidth: '600px', margin: '0 auto 48px' }}>
            <Search
              placeholder="Search for free link in bio, paid partnerships, sponsorships for influencers..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={(value) => setSearchQuery(value.toLowerCase())}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
            />
          </div>

          <CategoryFilter>
            <StyledTag 
              color={selectedCategory === 'all' ? '#26A69A' : 'default'}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </StyledTag>
            {getUniqueCategories(posts).map(category => (
              <StyledTag
                key={category}
                color={selectedCategory === category ? '#26A69A' : 'default'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </StyledTag>
            ))}
          </CategoryFilter>

          {/* Featured Posts Section for SEO */}
          {!loading && filteredPosts.length > 0 && selectedCategory === 'all' && (
            <section style={{ marginBottom: '48px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '24px', fontWeight: '600' }}>
                Featured: Creator Tools, Sponsorships & Brand Partnerships
              </h2>
              <Row gutter={[32, 32]}>
                {(() => {
                  // Pinned posts (always shown first)
                  const pinnedSlugs = [
                    'list-of-companies-that-send-pr-packages-2025',
                    'pr-emails-for-brands-2025',
                    'free-creator-pr-list-skincare-fashion-beauty-2026'
                  ];
                  
                  // Get pinned posts in order
                  const featuredPosts = pinnedSlugs
                    .map(slug => filteredPosts.find(post => post.slug === slug))
                    .filter(post => post !== undefined)
                    .slice(0, 3);
                  
                  return featuredPosts;
                })().map((post) => (
                  <Col xs={24} md={8} key={`featured-${post.id}`}>
                    <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                      <BlogCard
                        hoverable
                        cover={<img alt={post.title} src={post.image} onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'; }} />}
                      >
                        <Tag color="#26A69A">{post.category}</Tag>
                        <Title level={4} style={{ marginTop: '16px' }}>
                          {post.title}
                        </Title>
                        <Paragraph style={{ fontSize: '14px', color: '#666' }}>
                          {post.excerpt.substring(0, 120)}...
                        </Paragraph>
                      </BlogCard>
                    </Link>
                  </Col>
                ))}
              </Row>
            </section>
          )}

          {loading ? (
            <Paragraph style={{ textAlign: 'center' }}>Loading posts...</Paragraph>
          ) : filteredPosts.length === 0 ? (
            <Paragraph style={{ textAlign: 'center' }}>No posts found for this category.</Paragraph>
          ) : (
            <>
            <section>
              <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '24px', fontWeight: '600' }}>
                {selectedCategory === 'all' ? 'All Posts: Sponsorships for Influencers' : `${selectedCategory} Posts`}
              </h2>
              <Row gutter={[32, 32]}>
            {currentPosts.map((post) => (
              <Col xs={24} md={12} lg={8} key={post.id}>
                <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                  <BlogCard
                    hoverable
                    cover={<img alt={post.title} src={post.image} onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'; }} />}
                  >
                    <Tag color="#26A69A">{post.category}</Tag>
                    <Title level={3} style={{ marginTop: '16px' }}>
                      {post.title}
                    </Title>
                    <Paragraph style={{ fontSize: '16px', color: '#666' }}>
                      {post.excerpt}
                    </Paragraph>
                    <Space style={{ marginTop: '24px' }}>
                      <Space>
                        <UserOutlined />
                        {post.author.name}
                      </Space>
                      <Space>
                        <CalendarOutlined />
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Space>
                      <span>{post.readTime}</span>
                    </Space>
                  </BlogCard>
                </Link>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Pagination
              current={currentPage}
              total={filteredPosts.length}
              pageSize={postsPerPage}
              onChange={setCurrentPage}
              showSizeChanger={false}
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            />
          </div>
            </section>
            </>
          )}
        </Section>
        </main>
      </PageContainer>
    </LandingPageLayout>
  );
};

export default BlogPage; 