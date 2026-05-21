export const metadata = {
  title: "Unsubscribed | Newcollab",
  robots: { index: false },
};

export default function UnsubscribedPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f7',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      padding: '24px',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '48px 40px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,.06), 0 8px 32px rgba(0,0,0,.08)',
      }}>
        <div style={{ fontSize: '44px', marginBottom: '20px' }}>✓</div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1d1d1f', margin: '0 0 12px' }}>
          You've been unsubscribed
        </h1>
        <p style={{ fontSize: '15px', color: '#6e6e73', lineHeight: 1.6, margin: '0 0 32px' }}>
          You won't receive any more emails from Newcollab.
          If this was a mistake, you can re-enable emails from your account settings.
        </p>
        <a
          href="https://newcollab.co"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: '#1d1d1f',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '15px',
          }}
        >
          Back to Newcollab
        </a>
        <p style={{ fontSize: '13px', color: '#aeaeb2', margin: '24px 0 0' }}>
          Changed your mind?{' '}
          <a
            href="https://app.newcollab.co/creator/dashboard/settings"
            style={{ color: '#6e6e73', textDecoration: 'underline' }}
          >
            Manage email preferences
          </a>
        </p>
      </div>
    </div>
  );
}
