import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '120px 24px 80px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Brand not found</h1>
      <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
        This brand page doesn’t exist (or the API is unavailable).
      </p>
      <div style={{ marginTop: 16 }}>
        <Link href="/directory">Back to Directory</Link>
      </div>
    </div>
  );
}

