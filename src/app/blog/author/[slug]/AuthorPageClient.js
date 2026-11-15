'use client';

import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../../../components/LandingPageLayoutNext';
import { Grid, PostCard } from '../../_ui/BlogCards';

function initials(name) {
  return String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function AuthorPageClient({ author, posts }) {
  return (
    <LandingPageLayoutNext canonicalUrl={`https://newcollab.co/blog/author/${author.slug}`}>
      <Page>
        <Crumbs aria-label="Breadcrumb">
          <Link href="/">Home</Link><span aria-hidden="true">/</span>
          <Link href="/blog">Blog</Link><span aria-hidden="true">/</span>
          <span>{author.name}</span>
        </Crumbs>
        <Profile>
          <div className="ava" aria-hidden="true">{author.image ? <img src={author.image} alt="" /> : initials(author.name)}</div>
          <div>
            <h1>{author.name}</h1>
            <div className="role">{author.role}</div>
            <p>{author.bio}</p>
            {author.sameAs?.length ? (
              <div className="links">{author.sameAs.map((u) => <a key={u} href={u} rel="me noopener" target="_blank">{new URL(u).hostname.replace(/^www\./, '')}</a>)}</div>
            ) : null}
          </div>
        </Profile>
        <H2>{posts.length} guide{posts.length === 1 ? '' : 's'} by {author.name}</H2>
        <Grid>{posts.map((p) => <PostCard key={p.slug} post={p} />)}</Grid>
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
  span[aria-hidden] { color: #C7C3BA; }
`;

const Profile = styled.header`
  margin: 22px 0 8px; display: flex; gap: 20px; align-items: flex-start; max-width: 760px;
  .ava { width: 76px; height: 76px; border-radius: 50%; background: #12141a; color: #fff; display: grid; place-items: center; font-weight: 800; font-size: 24px; flex: none; overflow: hidden; }
  .ava img { width: 100%; height: 100%; object-fit: cover; }
  h1 { margin: 0; font-size: clamp(28px, 4vw, 40px); letter-spacing: -.02em; font-weight: 800; }
  .role { color: #6B7280; font-size: 15px; margin-top: 2px; }
  p { font-size: 16.5px; line-height: 1.6; color: #4B5563; margin: 12px 0 0; }
  .links { display: flex; gap: 12px; margin-top: 10px; }
  .links a { font-weight: 700; color: #0d7a5f; }
  @media (max-width: 640px) { flex-direction: column; gap: 12px; .ava { width: 60px; height: 60px; font-size: 20px; } }
`;

const H2 = styled.h2`
  margin: 40px 0 16px; font-size: 22px; font-weight: 800 !important; letter-spacing: -.015em;
`;
