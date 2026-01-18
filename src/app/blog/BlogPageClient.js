'use client';

import { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Tag, Space, Input, Breadcrumb, Pagination } from 'antd';
import { SearchOutlined, CalendarOutlined, UserOutlined, HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';

const { Title, Paragraph } = Typography;
const { Search } = Input;

const PageContainer = styled.div`
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

export default function BlogPageClient({ initialPosts, categories }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const postsPerPage = 6;

  // Filter posts based on selected category and search query
  const filteredPosts = initialPosts.filter(post => {
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
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  // Reset to first page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  // Get unique categories from posts
  const getUniqueCategories = (posts) => {
    const uniqueCategories = [...new Set(posts.map(post => post.category))];
    return uniqueCategories.filter(category => category && category.trim() !== '');
  };

  return (
    <LandingPageLayoutNext canonicalUrl="https://newcollab.co/blog">
      <PageContainer>
        <main>
          <Section>
            <Breadcrumb
              style={{ marginBottom: '24px' }}
              items={[
                { title: <Link href="/"><HomeOutlined /></Link> },
                { title: 'Blog' },
              ]}
            />

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
              {getUniqueCategories(initialPosts).map(category => (
                <StyledTag
                  key={category}
                  color={selectedCategory === category ? '#26A69A' : 'default'}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </StyledTag>
              ))}
            </CategoryFilter>

            {/* Featured Posts Section */}
            {filteredPosts.length > 0 && selectedCategory === 'all' && (
              <section style={{ marginBottom: '48px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '32px', fontSize: '24px', fontWeight: '600' }}>
                  Featured: Creator Tools, Sponsorships & Brand Partnerships
                </h2>
                <Row gutter={[32, 32]}>
                  {(() => {
                    const pinnedSlugs = [
                      'list-of-companies-that-send-pr-packages-2025',
                      'pr-emails-for-brands-2025',
                      'free-creator-pr-list-skincare-fashion-beauty-2026'
                    ];
                    
                    const featuredPosts = pinnedSlugs
                      .map(slug => filteredPosts.find(post => post.slug === slug))
                      .filter(post => post !== undefined)
                      .slice(0, 3);
                    
                    return featuredPosts;
                  })().map((post) => (
                    <Col xs={24} md={8} key={`featured-${post.slug}`}>
                      <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                        <BlogCard
                          hoverable
                          cover={<img alt={post.title} src={post.image} onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'; }} />}
                        >
                          <Tag color="#26A69A">{post.category}</Tag>
                          <Title level={4} style={{ marginTop: '16px' }}>
                            {post.title}
                          </Title>
                          <Paragraph style={{ fontSize: '14px', color: '#666' }}>
                            {post.excerpt?.substring(0, 120)}...
                          </Paragraph>
                        </BlogCard>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </section>
            )}

            {/* All Posts Grid */}
            <Row gutter={[32, 32]}>
              {currentPosts.map((post) => (
                <Col xs={24} sm={12} lg={8} key={post.slug}>
                  <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <BlogCard
                      hoverable
                      cover={<img alt={post.title} src={post.image} onError={e => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'; }} />}
                    >
                      <Tag color="#26A69A">{post.category}</Tag>
                      <Title level={4} style={{ marginTop: '16px', minHeight: '60px' }}>
                        {post.title}
                      </Title>
                      <Paragraph style={{ fontSize: '14px', color: '#666', minHeight: '60px' }}>
                        {post.excerpt?.substring(0, 120)}...
                      </Paragraph>
                      <Space style={{ marginTop: '16px', fontSize: '12px', color: '#999' }}>
                        <Space>
                          <UserOutlined />
                          {post.author?.name}
                        </Space>
                        <Space>
                          <CalendarOutlined />
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <Pagination
                  current={currentPage}
                  total={filteredPosts.length}
                  pageSize={postsPerPage}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                />
              </div>
            )}

            {filteredPosts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <Title level={3}>No posts found</Title>
                <Paragraph>Try adjusting your search or category filter.</Paragraph>
              </div>
            )}
          </Section>
        </main>
      </PageContainer>
    </LandingPageLayoutNext>
  );
}
