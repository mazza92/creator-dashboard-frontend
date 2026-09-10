/**
 * Soft brand acquisition CTA for public /brand/{slug} pages.
 * Creator unlock remains primary; this is a quiet secondary path.
 */
export default function AreYouThisBrand({ brandName }) {
  const name = brandName || 'this brand';
  const href =
    '/brands/pr-packages?utm_source=seo&utm_medium=organic&utm_campaign=brand-directory&utm_content=are-you-this-brand';

  return (
    <aside
      style={{
        marginTop: 14,
        padding: '14px 16px',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#64748b',
          marginBottom: 6,
        }}
      >
        Brand owner?
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
        Are you {name}?
      </div>
      <p
        style={{
          margin: '6px 0 10px',
          fontSize: 13,
          lineHeight: 1.5,
          color: '#64748b',
        }}
      >
        Run a gifted UGC roster instead of chasing creators one by one. First
        campaign free, then $299/mo if you opt in.
      </p>
      <a
        href={href}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          fontWeight: 700,
          color: '#e11d48',
          textDecoration: 'none',
        }}
      >
        See gifted UGC for brands
        <span aria-hidden="true">→</span>
      </a>
    </aside>
  );
}
