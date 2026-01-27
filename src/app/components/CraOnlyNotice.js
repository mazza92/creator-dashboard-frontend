import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function CraOnlyNotice({ title, path }) {
  const origin = process.env.CRA_ORIGIN || process.env.NEXT_PUBLIC_CRA_ORIGIN;

  // redirect() works by throwing a special NEXT_REDIRECT error.
  // It must NOT be inside a try/catch — otherwise the redirect is swallowed.
  if (origin) {
    redirect(`${origin}${path}`);
  }

  // Fallback UI only shown when CRA_ORIGIN is not configured
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '120px 24px 80px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>{title}</h1>
      <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
        This page is served by the React (CRA) app. CRA routing isn&apos;t available from this deployment unless{' '}
        <code>CRA_ORIGIN</code> is set correctly.
      </p>
      <ul style={{ marginTop: 14, opacity: 0.85, lineHeight: 1.7 }}>
        <li>
          Run <code>npm run dev:hybrid</code> to use Next (3000) + CRA (3001) together, or
        </li>
        <li>
          Set <code>CRA_ORIGIN</code> to your CRA host to enable automatic redirects.
        </li>
      </ul>
      <div style={{ marginTop: 18 }}>
        <Link href="/blog" style={{ marginRight: 12 }}>Go to Blog</Link>
        <Link href="/directory">Go to Directory</Link>
      </div>
    </div>
  );
}
