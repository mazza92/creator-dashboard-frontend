'use client';

import Link from 'next/link';
import styled from 'styled-components';
import LandingPageLayoutNext from '../components/LandingPageLayoutNext';

export default function SimplePage({ canonical, crumbs, eyebrow, title, intro, items }) {
  return (
    <LandingPageLayoutNext canonicalUrl={canonical}>
      <Page>
        <nav className="crumbs" aria-label="Breadcrumb">
          {crumbs.map(([href, label], i) => (
            <span key={label}>{i ? <i aria-hidden="true">/</i> : null}{href ? <Link href={href}>{label}</Link> : label}</span>
          ))}
        </nav>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p className="intro">{intro}</p>
        <div className="grid">
          {items.map((it) => (
            <Link key={it.href} href={it.href}><b>{it.title}</b><span>{it.text}</span></Link>
          ))}
        </div>
      </Page>
    </LandingPageLayoutNext>
  );
}

const Page = styled.main`
  max-width: 980px; margin: 0 auto; padding: 128px 20px 72px; color: #12141a;
  @media (max-width: 640px) { padding: 92px 16px 56px; }
  .crumbs { font-size: 13.5px; color: #6B7280; display: flex; gap: 6px; flex-wrap: wrap; }
  .crumbs a { color: #6B7280; text-decoration: none; }
  .crumbs i { font-style: normal; color: #C7C3BA; margin-right: 6px; }
  .eyebrow { margin-top: 18px; font-size: 12.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: #0d7a5f; }
  h1 { font-size: clamp(30px, 4.6vw, 48px); line-height: 1.08; letter-spacing: -.03em; margin: 10px 0 14px; font-weight: 800; max-width: 820px; }
  .intro { font-size: 17.5px; line-height: 1.6; color: #2a2e38; max-width: 720px; margin: 0 0 30px; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .grid a { display: grid; gap: 6px; padding: 18px 20px; border: 1px solid #ECE9E1; border-radius: 16px; background: #fff; text-decoration: none; color: inherit; }
  .grid a:hover { border-color: #12141a; }
  .grid b { font-size: 18px; }
  .grid span { color: #4B5563; font-size: 14.5px; line-height: 1.55; }
  @media (max-width: 760px) { .grid { grid-template-columns: minmax(0, 1fr); } }
`;
