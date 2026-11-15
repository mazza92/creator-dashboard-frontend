'use client';

import Link from 'next/link';
import styled from 'styled-components';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function shortDate(iso) {
  const d = new Date(iso);
  if (!iso || Number.isNaN(d.getTime())) return '';
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  @media (max-width: 960px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 620px) { grid-template-columns: minmax(0, 1fr); gap: 12px; }
`;

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  border: 1px solid #ECE9E1;
  border-radius: 16px;
  background: #fff;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: border-color .15s, box-shadow .15s, transform .15s;
  &:hover { border-color: #D9D4C8; box-shadow: 0 8px 24px rgba(18, 20, 26, .07); transform: translateY(-1px); }
  .img { aspect-ratio: 16 / 9; background: #F4F2EC; overflow: hidden; }
  .img img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .body { padding: 14px 16px 16px; display: grid; gap: 6px; }
  h3 { margin: 0; font-size: 16.5px; line-height: 1.35; font-weight: 750; color: #12141a; letter-spacing: -.005em; }
  p {
    margin: 0; font-size: 14px; line-height: 1.5; color: #6B7280; overflow: hidden; display: -webkit-box;
    -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }
  .meta { font-size: 12.5px; color: #9CA3AF; margin-top: 2px; }
  @media (max-width: 620px) {
    flex-direction: row;
    .img { flex: none; width: 108px; aspect-ratio: auto; }
    .body { padding: 12px 14px; }
    h3 { font-size: 15.5px; }
    p { display: none; }
  }
`;

export function PostCard({ post, withImage = true }) {
  return (
    <Card href={`/blog/${post.slug}`}>
      {withImage && post.image ? (
        <div className="img">
          <img
            src={String(post.image).replace(/([?&])w=\d+/, '$1w=640')}
            alt=""
            loading="lazy"
            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
          />
        </div>
      ) : null}
      <div className="body">
        <h3>{post.title}</h3>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
        <div className="meta">{[shortDate(post.date), post.readTime].filter(Boolean).join(' · ')}</div>
      </div>
    </Card>
  );
}

/** Compact text list: lets a hub link every post without a wall of images. */
export const LinkList = styled.ul`
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 32px;
  @media (max-width: 760px) { grid-template-columns: minmax(0, 1fr); }
  li { border-top: 1px solid #ECE9E1; }
  a {
    display: flex; justify-content: space-between; gap: 12px; padding: 11px 0; font-size: 15px; line-height: 1.4;
    color: #12141a; text-decoration: none;
  }
  a:hover span:first-child { text-decoration: underline; }
  a span:last-child { flex: none; color: #9CA3AF; font-size: 13px; }
`;
