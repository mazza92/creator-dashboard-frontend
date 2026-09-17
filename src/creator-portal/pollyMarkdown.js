import React from 'react';

const INLINE_RE = /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|\*[^*\n]+?\*|`[^`\n]+?`|\[[^\]]+\]\([^)\s]+\)|https?:\/\/[^\s)<]+)/g;

function safeHref(href) {
  const raw = String(href || '').trim();
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return '';
}

function renderInline(text, keyBase) {
  if (!text) return null;
  const parts = [];
  let last = 0;
  let i = 0;
  const src = String(text);
  src.replace(INLINE_RE, (match, _g, offset) => {
    if (offset > last) {
      parts.push(src.slice(last, offset));
    }
    const key = `${keyBase}-${i++}`;
    if (match.startsWith('**') && match.endsWith('**')) {
      parts.push(<strong key={key}>{match.slice(2, -2)}</strong>);
    } else if (match.startsWith('__') && match.endsWith('__')) {
      parts.push(<u key={key}>{match.slice(2, -2)}</u>);
    } else if (match.startsWith('*') && match.endsWith('*')) {
      parts.push(<em key={key}>{match.slice(1, -1)}</em>);
    } else if (match.startsWith('`') && match.endsWith('`')) {
      parts.push(<code key={key}>{match.slice(1, -1)}</code>);
    } else if (match.startsWith('[')) {
      const m = match.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = m ? safeHref(m[2]) : '';
      if (href) {
        const external = /^https?:\/\//i.test(href);
        parts.push(
          <a
            key={key}
            href={href}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {m[1]}
          </a>
        );
      } else {
        parts.push(match);
      }
    } else {
      const cleaned = match.replace(/[.,;:!?]+$/, '');
      const trailing = match.slice(cleaned.length);
      parts.push(
        <a key={key} href={cleaned} target="_blank" rel="noopener noreferrer">
          {cleaned}
        </a>
      );
      if (trailing) parts.push(trailing);
    }
    last = offset + match.length;
    return match;
  });
  if (last < src.length) parts.push(src.slice(last));
  return parts;
}

function isHeading(line) {
  const m = line.match(/^(#{1,3})\s+(.+)$/);
  return m ? { level: m[1].length, text: m[2] } : null;
}

function listKind(line) {
  if (/^\s*[-*]\s+/.test(line)) return 'ul';
  if (/^\s*\d+[.)]\s+/.test(line)) return 'ol';
  return null;
}

function listText(line) {
  return line.replace(/^\s*(?:[-*]\s+|\d+[.)]\s+)/, '');
}

function splitBlocks(text) {
  return String(text || '').replace(/\r\n/g, '\n').split(/\n{2,}/);
}

export default function PollyRichText({ text }) {
  const blocks = splitBlocks(text);
  return (
    <>
      {blocks.map((block, bi) => {
        const lines = block.split('\n').map((l) => l.trimEnd()).filter((l, idx, arr) => !(l === '' && idx === arr.length - 1));
        if (!lines.length) return null;
        const heading = lines.length === 1 ? isHeading(lines[0]) : null;
        if (heading) {
          const Tag = heading.level === 1 ? 'h3' : 'h4';
          return <Tag key={`h-${bi}`}>{renderInline(heading.text, `h${bi}`)}</Tag>;
        }
        const kinds = lines.map(listKind);
        if (kinds.every(Boolean) && new Set(kinds).size === 1) {
          const Tag = kinds[0] === 'ol' ? 'ol' : 'ul';
          return (
            <Tag key={`l-${bi}`}>
              {lines.map((line, li) => (
                <li key={`l-${bi}-${li}`}>{renderInline(listText(line), `l${bi}${li}`)}</li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={`p-${bi}`}>
            {lines.map((line, li) => (
              <React.Fragment key={`p-${bi}-${li}`}>
                {li > 0 ? <br /> : null}
                {renderInline(line, `p${bi}${li}`)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}
