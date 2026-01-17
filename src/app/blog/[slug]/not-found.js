import Link from 'next/link';
import { HomeOutlined } from '@ant-design/icons';
import LandingPageLayoutNext from '../../components/LandingPageLayoutNext';

export default function NotFound() {
  return (
    <LandingPageLayoutNext>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '4rem', color: '#26A69A', margin: 0 }}>404</h1>
        <h2 style={{ fontSize: '2rem', marginTop: '24px' }}>Post Not Found</h2>
        <p style={{ fontSize: '1.125rem', color: '#666', marginTop: '16px', marginBottom: '32px' }}>
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <div>
          <Link href="/blog" style={{ color: '#26A69A', fontSize: '16px' }}>
            ← Back to Blog
          </Link>
        </div>
      </div>
    </LandingPageLayoutNext>
  );
}
