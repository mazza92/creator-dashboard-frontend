'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';
import { Grid, LinkList, PostCard, shortDate } from './_ui/BlogCards';

// Every post is linked in the server HTML (hub sections below), so crawlers and AI engines reach all of them
// from /blog. Search only filters what is already on the page.

const CARDS_PER_HUB = 3;

export default function BlogPageClient({ hubs, featured, total }) {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    if (!query) return null;
    const seen = new Set();
    const out = [];
    hubs.forEach((h) => h.posts.forEach((p) => {
      if (seen.has(p.slug)) return;
      if (`${p.title} ${p.excerpt}`.toLowerCase().includes(query)) { seen.add(p.slug); out.push(p); }
    }));
    return out;
  }, [hubs, query]);

  return (
    <LandingPageLayoutNext canonicalUrl="https://newcollab.co/blog">
      <Page>
        <Crumbs aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span><span>Blog</span>
        </Crumbs>

        <Hero>
          <h1>UGC creator guides: rates, brand deals &amp; PR packages</h1>
          <p>
            What to charge, how to film UGC brands pay for, how to pitch, and which brands send PR packages to
            creators in the US, Canada and Europe. {total} guides, updated as brand programs change.
          </p>
          <SearchBox role="search">
            <Search aria-hidden="true" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search guides: UGC rates, PR packages, pitch email…"
              aria-label="Search guides"
            />
          </SearchBox>
          <Chips aria-label="Topics">
            {hubs.map((h) => (
              <a key={h.slug} href={`#${h.slug}`}>{h.emoji} {h.short}<b>{h.posts.length}</b></a>
            ))}
          </Chips>
        </Hero>

        {results ? (
          <Block>
            <Head><h2>{results.length} result{results.length === 1 ? '' : 's'} for “{q.trim()}”</h2></Head>
            {results.length ? <Grid>{results.map((p) => <PostCard key={p.slug} post={p} />)}</Grid> : (
              <Muted>No guide matches that yet. Try “rates”, “PR list” or “pitch”.</Muted>
            )}
          </Block>
        ) : (
          <>
            {featured.length ? (
              <Block>
                <Head><h2>Start here</h2><span>The three guides new UGC creators read first</span></Head>
                <Grid>{featured.map((p) => <PostCard key={p.slug} post={p} />)}</Grid>
              </Block>
            ) : null}

            {hubs.map((h) => (
              <Block key={h.slug} id={h.slug}>
                <Head>
                  <h2><Link href={`/blog/topic/${h.slug}`}>{h.emoji} {h.title}</Link></h2>
                  <Link className="all" href={`/blog/topic/${h.slug}`}>All {h.posts.length} →</Link>
                </Head>
                <Desc>{h.description}</Desc>
                <Grid>{h.posts.slice(0, CARDS_PER_HUB).map((p) => <PostCard key={p.slug} post={p} />)}</Grid>
                {h.posts.length > CARDS_PER_HUB ? (
                  <LinkList>
                    {h.posts.slice(CARDS_PER_HUB).map((p) => (
                      <li key={p.slug}>
                        <Link href={`/blog/${p.slug}`}><span>{p.title}</span><span>{shortDate(p.date)}</span></Link>
                      </li>
                    ))}
                  </LinkList>
                ) : null}
              </Block>
            ))}
          </>
        )}
      </Page>
    </LandingPageLayoutNext>
  );
}

const Page = styled.main`
  max-width: 1120px;
  margin: 0 auto;
  padding: 128px 20px 64px;
  @media (max-width: 640px) { padding: 92px 16px 48px; }
`;

const Crumbs = styled.nav`
  font-size: 13.5px; color: #6B7280; display: flex; gap: 6px;
  a { color: #6B7280; text-decoration: none; }
  a:hover { color: #12141a; text-decoration: underline; }
  span[aria-hidden] { color: #C7C3BA; }
`;

const Hero = styled.header`
  margin: 18px 0 40px;
  h1 { font-size: clamp(30px, 4.6vw, 48px); line-height: 1.1; letter-spacing: -.025em; margin: 0 0 14px; font-weight: 800; color: #12141a; max-width: 820px; }
  p { font-size: 17.5px; line-height: 1.6; color: #4B5563; max-width: 680px; margin: 0 0 22px; }
  @media (max-width: 640px) { margin-bottom: 28px; p { font-size: 16px; } }
`;

const SearchBox = styled.div`
  position: relative; max-width: 560px;
  svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: #9CA3AF; }
  input {
    width: 100%; height: 50px; border-radius: 999px; border: 1px solid #DDD8CC; background: #fff; padding: 0 18px 0 46px;
    font: inherit; font-size: 16px; color: #12141a; outline: none; box-sizing: border-box;
  }
  input:focus { border-color: #12141a; box-shadow: 0 0 0 3px rgba(18, 20, 26, .08); }
`;

const Chips = styled.nav`
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px;
  a {
    display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 999px; border: 1px solid #ECE9E1;
    background: #FAF8F3; font-size: 13.5px; font-weight: 650; color: #12141a; text-decoration: none;
  }
  a:hover { border-color: #12141a; }
  b { font-weight: 700; color: #9CA3AF; font-size: 12px; }
  @media (max-width: 640px) {
    flex-wrap: nowrap; overflow-x: auto; margin: 16px -16px 0; padding: 0 16px 4px; scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
    a { flex: none; }
  }
`;

const Block = styled.section`
  margin-top: 52px;
  scroll-margin-top: 90px;
  @media (max-width: 640px) { margin-top: 40px; }
`;

const Head = styled.div`
  display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 6px;
  h2 { margin: 0; font-size: 24px; letter-spacing: -.015em; font-weight: 800 !important; }
  h2 a { color: #12141a; text-decoration: none; font-weight: inherit; }
  h2 a:hover { text-decoration: underline; }
  span { color: #6B7280; font-size: 14px; }
  .all { font-size: 14px; font-weight: 700; color: #0d7a5f; text-decoration: none; white-space: nowrap; }
  @media (max-width: 640px) { h2 { font-size: 20px; } }
`;

const Desc = styled.p`
  margin: 0 0 16px; color: #6B7280; font-size: 15px; line-height: 1.55; max-width: 720px;
`;

const Muted = styled.p`
  color: #6B7280;
`;
