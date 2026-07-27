'use client';

import React from 'react';
import { Typography, Breadcrumb, Space, Tag, Avatar, Divider, Collapse } from 'antd';
import { HomeOutlined, CalendarOutlined, ClockCircleOutlined, QuestionCircleOutlined, StarOutlined, LinkOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';
import { getPostContentHtml, isBlogWidgetEnabled } from '../../../lib/blogContent';
import BlogBrandSearchWidget from '../../../components/BlogBrandSearchWidget';

const MONTHS_LONG = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/**
 * Formats a date string using UTC methods so the output is identical
 * regardless of the server's or browser's local timezone.
 * toLocaleDateString() is timezone-sensitive: "2026-05-18T00:00:00.000Z"
 * renders as "May 17" for clients in UTC-6 but "May 18" on the UTC server,
 * causing React hydration error #418 and a full CSR bailout.
 */
function formatDate(dateStr, monthFormat = 'long') {
  const d = new Date(dateStr);
  const months = monthFormat === 'long' ? MONTHS_LONG : MONTHS_SHORT;
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const Section = styled.section`
  margin-bottom: 48px;
`;

const BlogHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const BreadcrumbWrapper = styled.div`
  margin: 80px 0 32px;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  max-width: 1200px;
  margin: 0 auto;
`;

const BlogContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  font-size: 18px;
  line-height: 1.8;
  color: #333;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 2em;
    margin-bottom: 1em;
    color: #1a1a1a;
  }

  p {
    margin-bottom: 1.5em;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 2em 0;
  }

  blockquote {
    border-left: 4px solid #26A69A;
    margin: 2em 0;
    padding: 1em 2em;
    background: #f8f9fa;
    font-style: italic;
  }

  ul, ol {
    margin: 1.5em 0;
    padding-left: 2em;
  }

  li {
    margin-bottom: 0.5em;
  }

  code {
    background: #f8f9fa;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
  }

  pre {
    background: #f8f9fa;
    padding: 1em;
    border-radius: 8px;
    overflow-x: auto;
    margin: 1.5em 0;
  }
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  margin: 48px 0;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const AuthorDetails = styled.div`
  margin-left: 16px;
`;

const TagsContainer = styled.div`
  margin-top: 48px;
  text-align: center;
`;

const TestimonialsSection = styled.div`
  background: #f8f9fa;
  padding: 2rem;
  margin: 2rem 0;
  border-radius: 8px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const TestimonialCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FAQSection = styled.div`
  margin: 2rem 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const SourcesSection = styled.div`
  margin-top: 2rem;
  font-size: 0.9rem;
  color: #6c757d;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const SourceLink = styled.a`
  color: #26A69A;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const RelatedPostsSection = styled.div`
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 2px solid #e2e8f0;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const RelatedPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RelatedPostCard = styled(Link)`
  display: block;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const RelatedPostImage = styled.div`
  width: 100%;
  height: 180px;
  overflow: hidden;
  background: #f0f0f0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  ${RelatedPostCard}:hover & img {
    transform: scale(1.05);
  }
`;

const RelatedPostContent = styled.div`
  padding: 1.5rem;
`;

const RelatedPostTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RelatedPostExcerpt = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 1rem 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RelatedPostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: #888;
`;

export default function BlogPostClient({ post, relatedPosts, canonicalUrl }) {
  const resolvedCanonical =
    canonicalUrl || post.canonicalUrl || `https://newcollab.co/blog/${post.slug}`;

  return (
    <LandingPageLayoutNext canonicalUrl={resolvedCanonical}>
      <PageContainer>
        <Section>
          <BreadcrumbWrapper>
            <StyledBreadcrumb
              items={[
                { title: <Link href="/"><HomeOutlined /></Link> },
                { title: <Link href="/blog">Blog</Link> },
                { title: <span style={{ padding: '4px 8px' }}>{post.title}</span> },
              ]}
            />
          </BreadcrumbWrapper>

          <BlogHeader>
            <Tag color="#26A69A">{post.category}</Tag>
            <Title level={1} style={{ marginTop: '24px' }}>
              {post.title}
            </Title>
            <Space style={{ marginTop: '16px' }}>
              <Space>
                <Avatar src={post.author.image} />
                <span>{post.author.name}</span>
              </Space>
              <Space>
                <CalendarOutlined />
                {formatDate(post.date, 'long')}
              </Space>
              <Space>
                <ClockCircleOutlined />
                {post.readTime}
              </Space>
            </Space>
          </BlogHeader>

          {/* Brand Search Widget (Phase 1: enabled posts only) */}
          {isBlogWidgetEnabled(post.slug) && (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
              <BlogBrandSearchWidget postSlug={post.slug} />
            </div>
          )}

          <BlogContent dangerouslySetInnerHTML={{ __html: getPostContentHtml(post) }} />

          {/* Testimonials Section */}
          {post.testimonials && post.testimonials.length > 0 && (
            <TestimonialsSection>
              <Title level={3} style={{ color: '#26A69A', marginBottom: '1.5rem', textAlign: 'center' }}>
                <StarOutlined style={{ marginRight: '8px' }} />
                Creator Success Stories
              </Title>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {post.testimonials.map((testimonial, index) => (
                  <TestimonialCard key={index}>
                    <Paragraph style={{ fontStyle: 'italic', marginBottom: '0.5rem', fontSize: '16px' }}>
                      "{testimonial.quote}"
                    </Paragraph>
                    <Paragraph style={{ fontWeight: 600, color: '#26A69A', margin: 0 }}>
                      - {testimonial.author}, {testimonial.role} ({testimonial.followers})
                    </Paragraph>
                  </TestimonialCard>
                ))}
              </div>
            </TestimonialsSection>
          )}

          {/* FAQ Section */}
          {post.faq && post.faq.length > 0 && (
            <FAQSection>
              <Title level={3} style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>
                <QuestionCircleOutlined style={{ marginRight: '8px' }} />
                Frequently Asked Questions
              </Title>
              <Collapse
                ghost
                expandIconPosition="end"
                style={{ background: 'transparent' }}
              >
                {post.faq.map((faq, index) => (
                  <Panel
                    header={
                      <span style={{ fontWeight: 600, color: '#26A69A', fontSize: '16px' }}>
                        {faq.question}
                      </span>
                    }
                    key={index}
                    style={{
                      background: '#f8f9fa',
                      marginBottom: '1rem',
                      border: 'none',
                      borderRadius: '6px'
                    }}
                  >
                    <Paragraph style={{ margin: 0, fontSize: '16px', lineHeight: '1.6' }}>
                      {faq.answer}
                    </Paragraph>
                  </Panel>
                ))}
              </Collapse>
            </FAQSection>
          )}

          {/* Sources Section */}
          {post.sources && post.sources.length > 0 && (
            <SourcesSection>
              <Title level={4} style={{ color: '#333', marginBottom: '1rem' }}>
                <LinkOutlined style={{ marginRight: '8px' }} />
                Sources & References
              </Title>
              <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', margin: 0 }}>
                {post.sources.map((source, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>
                    <SourceLink href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.name}, '{source.title}'
                    </SourceLink>
                  </li>
                ))}
              </ul>
            </SourcesSection>
          )}

          <AuthorInfo>
            <Avatar size={64} src={post.author.image} />
            <AuthorDetails>
              <Title level={4}>{post.author.name}</Title>
              <Paragraph>{post.author.role}</Paragraph>
              {post.author.description && (
                <Paragraph style={{ color: '#666', marginTop: '8px' }}>
                  {post.author.description}
                </Paragraph>
              )}
            </AuthorDetails>
          </AuthorInfo>

          <TagsContainer>
            {post.tags.map(tag => (
              <Tag key={tag} color="#26A69A">
                {tag}
              </Tag>
            ))}
          </TagsContainer>

          {/* Related Posts Section */}
          {relatedPosts && relatedPosts.length > 0 && (
            <RelatedPostsSection>
              <Title level={2} style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>
                Related Posts
              </Title>
              <RelatedPostsGrid>
                {relatedPosts.map((relatedPost) => (
                  <RelatedPostCard key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                    <RelatedPostImage>
                      <img
                        src={relatedPost.image}
                        alt={relatedPost.title}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found';
                        }}
                      />
                    </RelatedPostImage>
                    <RelatedPostContent>
                      <Tag color="#26A69A" style={{ marginBottom: '0.75rem' }}>
                        {relatedPost.category}
                      </Tag>
                      <RelatedPostTitle>{relatedPost.title}</RelatedPostTitle>
                      <RelatedPostExcerpt>
                        {relatedPost.excerpt || relatedPost.metaDescription}
                      </RelatedPostExcerpt>
                      <RelatedPostMeta>
                        <Space>
                          <CalendarOutlined />
                          {formatDate(relatedPost.date, 'short')}
                        </Space>
                        <span>•</span>
                        <span>{relatedPost.readTime}</span>
                      </RelatedPostMeta>
                    </RelatedPostContent>
                  </RelatedPostCard>
                ))}
              </RelatedPostsGrid>
            </RelatedPostsSection>
          )}
        </Section>
      </PageContainer>
    </LandingPageLayoutNext>
  );
}
