'use client';

import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../../../components/LandingPageLayoutNext';
import { Grid, LinkList, PostCard, shortDate } from '../../_ui/BlogCards';

const CARDS = 6;

export default function TopicPageClient({ topic, posts, others }) {
  return (
    <LandingPageLayoutNext canonicalUrl={`https://newcollab.co/blog/topic/${topic.slug}`}>
      <Page>
        <Crumbs aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/blog">Blog</Link><span aria-hidden="true">/</span>
          <span>{topic.short}</span>
        </Crumbs>
        <Hero>
          <div className="k">{topic.emoji} Topic · {posts.length} guides</div>
          <h1>{topic.title}</h1>
          <p>{topic.description}</p>
        </Hero>

        <Grid>{posts.slice(0, CARDS).map((p) => <PostCard key={p.slug} post={p} />)}</Grid>
        {posts.length > CARDS ? (
          <>
            <H2>More {topic.short.toLowerCase()} guides</H2>
            <LinkList>
              {posts.slice(CARDS).map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`}><span>{p.title}</span><span>{shortDate(p.date)}</span></Link>
                </li>
              ))}
            </LinkList>
          </>
        ) : null}

        <H2>Other topics</H2>
        <Others>
          {others.map((t) => (
            <Link key={t.slug} href={`/blog/topic/${t.slug}`}>
              <b>{t.emoji} {t.title}</b>
              <span>{t.description}</span>
            </Link>
          ))}
        </Others>
      </Page>
    </LandingPageLayoutNext>
  );
}

const Page = styled.main`
  max-width: 1120px; margin: 0 auto; padding: 128px 20px 64px;
  @media (max-width: 640px) { padding: 92px 16px 48px; }
`;

const Crumbs = styled.nav`
  font-size: 13.5px; color: #6B7280; display: flex; gap: 6px; flex-wrap: wrap;
  a { color: #6B7280; text-decoration: none; }
  a:hover { color: #12141a; text-decoration: underline; }
  span[aria-hidden] { color: #C7C3BA; }
`;

const Hero = styled.header`
  margin: 18px 0 32px;
  .k { font-size: 12.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #0d7a5f; }
  h1 { font-size: clamp(30px, 4.6vw, 46px); line-height: 1.1; letter-spacing: -.025em; margin: 10px 0 12px; font-weight: 800; color: #12141a; }
  p { font-size: 17.5px; line-height: 1.6; color: #4B5563; max-width: 680px; margin: 0; }
  @media (max-width: 640px) { p { font-size: 16px; } }
`;

const H2 = styled.h2`
  margin: 48px 0 0; font-size: 22px; font-weight: 800 !important; letter-spacing: -.015em;
`;

const Others = styled.div`
  margin-top: 14px; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px;
  a {
    display: grid; gap: 4px; padding: 14px 16px; border: 1px solid #ECE9E1; border-radius: 14px; background: #FAF8F3;
    text-decoration: none; color: inherit;
  }
  a:hover { border-color: #12141a; }
  b { font-size: 15px; color: #12141a; }
  span { font-size: 13.5px; color: #6B7280; line-height: 1.45; }
`;
