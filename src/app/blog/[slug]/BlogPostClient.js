'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Typography, Space } from 'antd';
import { CalendarOutlined, StarOutlined, LinkOutlined } from '@ant-design/icons';
import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';
import { isBlogWidgetEnabled, getFaqAnswerHtml, isBrandListPost } from '../../../lib/blogContent';
import BlogBrandSearchWidget from '../../../components/BlogBrandSearchWidget';
import useDashboardSession from '../../../hooks/useDashboardSession';
import BlogConversion from '../../components/seo/BlogConversion';
import StickyCtaBar from '../../components/seo/StickyCtaBar';
import { ExitIntentCard, WeeklyBrandsCard } from '../../components/seo/LeadCapture';

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

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
`;

const BlogContent = styled.div`
  max-width: 760px;
  margin: 0;
  font-size: 18px;
  line-height: 1.75;
  color: #2a2e38;

  h2 { scroll-margin-top: 96px; font-size: 1.6rem; line-height: 1.3; letter-spacing: -.015em; font-weight: 750; color: #12141a; }
  h3 { font-weight: 700; }
  h3 { font-size: 1.25rem; line-height: 1.35; }
  table { width: 100%; border-collapse: collapse; font-size: 15.5px; display: block; overflow-x: auto; }
  th, td { border: 1px solid #ECE9E1; padding: 10px 12px; text-align: left; vertical-align: top; }
  th { background: #FAF8F3; font-weight: 700; }

  @media (max-width: 640px) {
    font-size: 17px;
    h2 { font-size: 1.35rem; }
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 2em;
    margin-bottom: 1em;
    color: #1a1a1a;
  }

  a {
    color: #26A69A;
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

  .portfolio-scroll-stopper {
    margin: 2.75rem 0;
  }

  .portfolio-scroll-stopper p {
    margin: 0;
  }

  .portfolio-scroll-stopper .pss-btn {
    color: #fff !important;
    text-decoration: none !important;
  }
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

const Crumbs = styled.nav`
  max-width: 1100px;
  margin: 96px auto 0;
  padding: 0 4px;
  font-size: 13.5px;
  color: #6B7280;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  a { color: #6B7280; text-decoration: none; }
  a:hover { color: #12141a; text-decoration: underline; }
  span[aria-hidden] { color: #C7C3BA; }
  @media (max-width: 640px) { margin-top: 76px; font-size: 13px; }
`;

const Header = styled.header`
  max-width: 1100px;
  margin: 18px auto 0;
  padding: 0 4px;
  .topic {
    display: inline-flex; gap: 6px; align-items: center; font-size: 12.5px; font-weight: 800; letter-spacing: .06em;
    text-transform: uppercase; color: #0d7a5f; text-decoration: none;
  }
  h1 {
    font-size: clamp(28px, 4.4vw, 44px); line-height: 1.15; letter-spacing: -.02em; margin: 10px 0 14px;
    max-width: 860px; color: #12141a; font-weight: 800;
  }
  .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; font-size: 14px; color: #6B7280; }
  .meta a { color: #12141a; font-weight: 700; text-decoration: none; }
  .meta .dot { color: #C7C3BA; }
  .meta > * { white-space: nowrap; }
  @media (max-width: 640px) { .meta { font-size: 13.5px; gap: 6px 10px; } .ava { width: 24px; height: 24px; font-size: 11px; } }
  .ava {
    width: 28px; height: 28px; border-radius: 50%; background: #12141a; color: #fff; display: inline-grid;
    place-items: center; font-size: 12px; font-weight: 800; overflow: hidden; flex: none;
  }
  .ava img { width: 100%; height: 100%; object-fit: cover; }
  .who { display: inline-flex; align-items: center; gap: 8px; }
`;

const Layout = styled.div`
  max-width: 1100px;
  margin: 28px auto 0;
  padding: 0 4px;
  display: grid;
  grid-template-columns: minmax(0, 760px) 260px;
  gap: 56px;
  align-items: start;
  @media (max-width: 1100px) { grid-template-columns: minmax(0, 1fr); gap: 0; }
`;

const Aside = styled.aside`
  position: sticky;
  top: 96px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  @media (max-width: 1100px) { display: none; }
  .label { font-size: 12px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 10px; }
  ol { list-style: none; margin: 0; padding: 0; border-left: 2px solid #ECE9E1; }
  li a {
    display: block; padding: 6px 0 6px 14px; margin-left: -2px; border-left: 2px solid transparent; font-size: 14px;
    line-height: 1.4; color: #6B7280; text-decoration: none;
  }
  li a:hover { color: #12141a; }
  li a.on { color: #12141a; font-weight: 700; border-left-color: #12141a; }
  .cta {
    margin-top: 22px; padding: 16px; border-radius: 14px; background: #12141a; color: #fff; display: grid; gap: 8px;
  }
  .cta b { font-size: 15px; line-height: 1.35; }
  .cta span { font-size: 13px; color: #C9CBD1; line-height: 1.45; }
  .cta a {
    display: inline-block; text-align: center; background: #fff; color: #12141a; border-radius: 999px; padding: 9px 12px;
    font-weight: 800; font-size: 13.5px; text-decoration: none; margin-top: 4px;
  }
`;

const MobileToc = styled.details`
  display: none;
  margin: 0 0 22px;
  border: 1px solid #ECE9E1;
  border-radius: 14px;
  background: #fff;
  @media (max-width: 1100px) { display: block; }
  summary { cursor: pointer; padding: 13px 16px; font-weight: 700; font-size: 15px; list-style: none; display: flex; justify-content: space-between; }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: '▾'; color: #9CA3AF; }
  &[open] summary::after { content: '▴'; }
  ol { margin: 0; padding: 0 16px 12px 34px; }
  li { padding: 5px 0; font-size: 15px; }
  li a { color: #2a2e38; text-decoration: none; }
`;

const QuickAnswer = styled.section`
  margin: 0 0 28px;
  padding: 18px 20px;
  border-radius: 16px;
  background: #EEF6F3;
  border: 1px solid #B8D5CB;
  .k { font-size: 12px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #0d7a5f; margin-bottom: 6px; }
  p { margin: 0; font-size: 17px; line-height: 1.6; color: #12141a; }
`;

const Faq = styled.section`
  max-width: 760px;
  margin: 48px 0 0;
  h2 { font-size: 1.6rem; margin: 0 0 14px; letter-spacing: -.015em; font-weight: 750; }
  details { border-bottom: 1px solid #ECE9E1; }
  summary {
    cursor: pointer; padding: 16px 0; font-size: 17px; font-weight: 700; color: #12141a; list-style: none;
    display: flex; justify-content: space-between; gap: 16px;
  }
  summary::-webkit-details-marker { display: none; }
  summary::after { content: '+'; font-size: 22px; line-height: 1; color: #9CA3AF; flex: none; }
  details[open] summary::after { content: '−'; }
  .a { padding: 0 0 18px; font-size: 16.5px; line-height: 1.65; color: #2a2e38; }
`;

const AuthorBox = styled.section`
  max-width: 760px;
  margin: 44px 0 0;
  padding: 20px;
  border-radius: 16px;
  background: #FAF8F3;
  border: 1px solid #ECE9E1;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  .ava {
    width: 52px; height: 52px; border-radius: 50%; background: #12141a; color: #fff; display: grid; place-items: center;
    font-weight: 800; flex: none; overflow: hidden;
  }
  .ava img { width: 100%; height: 100%; object-fit: cover; }
  .k { font-size: 12px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #9CA3AF; }
  h3 { margin: 2px 0; font-size: 17px; }
  h3 a { color: #12141a; text-decoration: none; }
  .role { font-size: 13.5px; color: #6B7280; }
  p { margin: 8px 0 0; font-size: 14.5px; line-height: 1.6; color: #4B5563; }
`;

function initialsOf(name) {
  return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function useActiveHeading(ids) {
  const [active, setActive] = useState(ids[0] || null);
  useEffect(() => {
    if (!ids.length || typeof IntersectionObserver === 'undefined') return undefined;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    }, { rootMargin: '-96px 0px -65% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

export default function BlogPostClient({ post, article, topic, author, relatedPosts, canonicalUrl }) {
  const resolvedCanonical =
    canonicalUrl || post.canonicalUrl || `https://newcollab.co/blog/${post.slug}`;
  const contentRef = useRef(null);
  const signedIn = useDashboardSession().status === 'in';
  const contentHtml = article?.html || '';
  const toc = article?.toc || [];
  const tocIds = useMemo(() => toc.map((t) => t.id), [toc]);
  const active = useActiveHeading(tocIds);
  const ctaCtx = { ref: 'blog', slug: post.slug, page: `/blog/${post.slug}` };
  const stickyText = isBrandListPost(contentHtml)
    ? 'Let Polly pitch the brands on this list for you'
    : 'Get PR packages from brands that fit your niche';
  const updated = post.dateModified && post.dateModified > post.date;
  const authorHref = `/blog/author/${author?.slug || 'newcollab-editorial-team'}`;
  const signupHref = `https://app.newcollab.co/register/creator?ref=blog&source_page=${encodeURIComponent(post.slug)}&location=toc_rail`;

  return (
    <LandingPageLayoutNext canonicalUrl={resolvedCanonical}>
      <PageContainer>
        <Crumbs aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/blog">Blog</Link>
          {topic ? (<><span aria-hidden="true">/</span><Link href={`/blog/topic/${topic.slug}`}>{topic.title}</Link></>) : null}
        </Crumbs>

        <Header>
          {topic ? <Link className="topic" href={`/blog/topic/${topic.slug}`}>{topic.emoji} {topic.short}</Link> : null}
          <h1>{post.title}</h1>
          <div className="meta">
            <span className="who">
              <span className="ava" aria-hidden="true">
                {author?.image ? <img src={author.image} alt="" /> : initialsOf(author?.name)}
              </span>
              <Link href={authorHref}>{author?.name || post.author?.name}</Link>
            </span>
            <span className="dot">·</span>
            {updated
              ? <span>Updated <time dateTime={post.dateModified}>{formatDate(post.dateModified, 'long')}</time></span>
              : <time dateTime={post.date}>{formatDate(post.date, 'long')}</time>}
            {post.readTime ? (<><span className="dot">·</span><span>{post.readTime}</span></>) : null}
          </div>
        </Header>

        <Layout>
          <article>
            {article?.quickAnswer ? (
              <QuickAnswer className="nc-quick-answer" aria-label="Quick answer">
                <div className="k">Quick answer</div>
                <p>{article.quickAnswer}</p>
              </QuickAnswer>
            ) : null}

            {toc.length ? (
              <MobileToc>
                <summary>On this page</summary>
                <ol>{toc.map((t) => <li key={t.id}><a href={`#${t.id}`}>{t.text}</a></li>)}</ol>
              </MobileToc>
            ) : null}

            {isBlogWidgetEnabled(post.slug) && <BlogBrandSearchWidget postSlug={post.slug} />}

            <BlogContent ref={contentRef} dangerouslySetInnerHTML={{ __html: contentHtml }} />
            <BlogConversion contentRef={contentRef} slug={post.slug} signedIn={signedIn} />
            <WeeklyBrandsCard ctx={ctaCtx} signedIn={signedIn} />

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

            {/* FAQ: answers are in the HTML (native <details>), so search and AI crawlers read them without JS. */}
            {post.faq && post.faq.length > 0 && (
              <Faq className="nc-faq" id="faq">
                <h2>Frequently asked questions</h2>
                {post.faq.map((item, index) => (
                  <details key={index} open={index === 0}>
                    <summary>{item.question}</summary>
                    <div className="a" dangerouslySetInnerHTML={{ __html: getFaqAnswerHtml(item.answer, post.slug) }} />
                  </details>
                ))}
              </Faq>
            )}

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

            <AuthorBox aria-label="About the author">
              <div className="ava" aria-hidden="true">
                {author?.image ? <img src={author.image} alt="" /> : initialsOf(author?.name)}
              </div>
              <div>
                <div className="k">Written by</div>
                <h3><Link href={authorHref}>{author?.name}</Link></h3>
                {author?.role ? <div className="role">{author.role}</div> : null}
                {author?.bio ? <p>{author.bio}</p> : null}
              </div>
            </AuthorBox>
          </article>

          {toc.length ? (
            <Aside aria-label="On this page">
              <div className="label">On this page</div>
              <ol>
                {toc.map((t) => (
                  <li key={t.id}><a href={`#${t.id}`} className={active === t.id ? 'on' : ''}>{t.text}</a></li>
                ))}
              </ol>
              {!signedIn ? (
                <div className="cta">
                  <b>Find brands that send PR to creators your size</b>
                  <span>Free plan · No follower minimum</span>
                  <a href={signupHref}>Start free</a>
                </div>
              ) : null}
            </Aside>
          ) : null}
        </Layout>

        {relatedPosts && relatedPosts.length > 0 && (
          <RelatedPostsSection>
            <Title level={2} style={{ color: '#333', marginBottom: '1.5rem', textAlign: 'center' }}>
              Keep reading
            </Title>
            <RelatedPostsGrid>
              {relatedPosts.map((relatedPost) => (
                <RelatedPostCard key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <RelatedPostImage>
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      loading="lazy"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x400?text=Newcollab';
                      }}
                    />
                  </RelatedPostImage>
                  <RelatedPostContent>
                    <RelatedPostTitle>{relatedPost.title}</RelatedPostTitle>
                    <RelatedPostExcerpt>
                      {relatedPost.excerpt || relatedPost.metaDescription}
                    </RelatedPostExcerpt>
                    <RelatedPostMeta>
                      <Space>
                        <CalendarOutlined />
                        {formatDate(relatedPost.dateModified || relatedPost.date, 'short')}
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
      </PageContainer>
      {!signedIn && (
        <>
          <StickyCtaBar
            ctx={ctaCtx}
            text={stickyText}
            button="Start free"
            location="sticky_bar"
          />
          <ExitIntentCard ctx={ctaCtx} />
        </>
      )}
    </LandingPageLayoutNext>
  );
}
