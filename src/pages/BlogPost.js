import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
// eslint-disable-next-line no-unused-vars
import { Typography, Breadcrumb, Space, Tag, Avatar, Divider, Collapse } from 'antd';
// eslint-disable-next-line no-unused-vars
import { HomeOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, QuestionCircleOutlined, StarOutlined, LinkOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import styled from 'styled-components';
import LandingPageLayout from '../Layouts/LandingPageLayout';
import LoadingSpinner from '../components/LoadingSpinner';

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

// New AI-optimized section styles
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

// eslint-disable-next-line no-unused-vars
const FAQItem = styled.div`
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
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

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const postData = await import(`../content/posts/${slug}.json`);
        setPost(postData.default);
      } catch (error) {
        console.error('Error loading post:', error);
        setError('Post not found');
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [slug]);

  // Load related posts when post is loaded
  useEffect(() => {
    const loadRelatedPosts = async () => {
      if (!post) return;

      try {
        // Import all posts
        const postsIndex = await import('../content/posts/posts.json');
        const allPosts = await Promise.all(
          postsIndex.default
            .filter(postSlug => postSlug !== slug) // Exclude current post
            .map(async (postSlug) => {
              try {
                const postData = await import(`../content/posts/${postSlug}.json`);
                return postData.default;
              } catch (error) {
                return null;
              }
            })
        );

        const validPosts = allPosts.filter(p => p !== null);

        // Score posts based on relevance
        const scoredPosts = validPosts.map(relatedPost => {
          let score = 0;

          // Category match (highest weight)
          if (relatedPost.category === post.category) {
            score += 10;
          }

          // Tag matches (medium weight)
          if (post.tags && relatedPost.tags) {
            const commonTags = post.tags.filter(tag =>
              relatedPost.tags.some(rt => rt.toLowerCase() === tag.toLowerCase())
            );
            score += commonTags.length * 3;
          }

          // Keyword matches (lower weight)
          if (post.keywords && relatedPost.keywords) {
            const commonKeywords = post.keywords.filter(kw =>
              relatedPost.keywords.some(rk => rk.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(rk.toLowerCase()))
            );
            score += commonKeywords.length * 2;
          }

          // Title similarity (bonus)
          const postTitleWords = post.title.toLowerCase().split(/\s+/);
          const relatedTitleWords = relatedPost.title.toLowerCase().split(/\s+/);
          const commonTitleWords = postTitleWords.filter(word =>
            word.length > 3 && relatedTitleWords.includes(word)
          );
          score += commonTitleWords.length;

          return { ...relatedPost, score };
        });

        // Sort by score and take top 3
        const topRelated = scoredPosts
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(({ score, ...post }) => post); // Remove score before storing

        setRelatedPosts(topRelated);
      } catch (error) {
        console.error('Error loading related posts:', error);
        setRelatedPosts([]);
      }
    };

    loadRelatedPosts();
  }, [post, slug]);

  // Simple scroll to top on mount
  useEffect(() => {
    // Ensure page starts at top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Additional effect to handle scroll restoration after content renders
  useEffect(() => {
    if (post) {
      // Temporarily disable smooth scrolling for immediate scroll restoration
      const originalScrollBehavior = document.documentElement.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = 'auto';

      // Ensure scroll position is at top after content renders
      const ensureScrollToTop = () => {
        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
      };

      // Execute immediately and after a short delay
      ensureScrollToTop();
      const timeoutId = setTimeout(ensureScrollToTop, 200);

      // Re-enable smooth scrolling after scroll restoration
      const restoreScrollBehavior = setTimeout(() => {
        document.documentElement.style.scrollBehavior = originalScrollBehavior || 'smooth';
      }, 300);

      return () => {
        clearTimeout(timeoutId);
        clearTimeout(restoreScrollBehavior);
        // Ensure smooth scrolling is restored on cleanup
        document.documentElement.style.scrollBehavior = originalScrollBehavior || 'smooth';
      };
    }
  }, [post]);

  // Show loading state while fetching post
  if (loading) {
    return (
      <LandingPageLayout>
        <PageContainer>
          <LoadingSpinner text="Loading post..." />
        </PageContainer>
      </LandingPageLayout>
    );
  }

  // Only show error if we've finished loading and there's an error
  if (error || !post) {
    return (
      <LandingPageLayout>
        <PageContainer>
          <Section>
            <Title level={2} style={{ textAlign: 'center', marginTop: '100px' }}>Post not found</Title>
          </Section>
        </PageContainer>
      </LandingPageLayout>
    );
  }

  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "jobTitle": post.author.role,
      "image": post.author.image,
      ...(post.author.description && { "description": post.author.description })
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
    // Add FAQ schema if available
    ...(post.faq && {
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": post.faq.map(faq => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    })
  };

  return (
    <LandingPageLayout canonicalUrl={`https://newcollab.co/blog/${post.slug}`}>
      <>
        <Helmet>
          <title>{post.title} | Newcollab Creator Blog</title>
          <meta name="description" content={post.metaDescription || post.excerpt} />
          <meta name="keywords" content={post.keywords?.join(', ') || post.tags?.join(', ')} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="article" />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.metaDescription || post.excerpt} />
          <meta property="og:image" content={post.image} />
          <meta property="og:url" content={`https://newcollab.co/blog/${post.slug}`} />
          <meta property="og:site_name" content="Newcollab" />
          <meta property="article:published_time" content={post.date} />
          <meta property="article:modified_time" content={post.date} />
          <meta property="article:author" content={post.author.name} />
          <meta property="article:section" content={post.category} />
          {post.tags?.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}

          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={post.title} />
          <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
          <meta name="twitter:image" content={post.image} />
          <meta name="twitter:creator" content="@newcollab" />

          {/* Additional SEO tags */}
          <meta name="robots" content="index, follow, max-image-preview:large" />
          <meta name="author" content={post.author.name} />
          <meta name="language" content="English" />

          {/* Structured Data */}
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>

        <PageContainer>
          <Section>
            <BreadcrumbWrapper>
              <StyledBreadcrumb>
                <Breadcrumb.Item>
                  <Link to="/"><HomeOutlined /></Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Link to="/blog">Blog</Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <span style={{ padding: '4px 8px' }}>{post.title}</span>
                </Breadcrumb.Item>
              </StyledBreadcrumb>
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
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Space>
                <Space>
                  <ClockCircleOutlined />
                  {post.readTime}
                </Space>
              </Space>
            </BlogHeader>

            <BlogContent dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* AI-Optimized Testimonials Section */}
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

            {/* AI-Optimized FAQ Section */}
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

            {/* AI-Optimized Sources Section */}
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
            {relatedPosts.length > 0 && (
              <RelatedPostsSection>
                <Title level={2} style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>
                  Related Posts
                </Title>
                <RelatedPostsGrid>
                  {relatedPosts.map((relatedPost) => (
                    <RelatedPostCard key={relatedPost.slug} to={`/blog/${relatedPost.slug}`}>
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
                            {new Date(relatedPost.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
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
      </>
    </LandingPageLayout>
  );
};

export default BlogPost;
