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

function listStart(line) {
  const m = line.match(/^\s*(\d+)[.)]\s+/);
  return m ? parseInt(m[1], 10) : 1;
}

// Blank lines between items of the same kind keep one list, so "1.\n\n2." never renders as "1. 1.".
export function parseBlocks(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n').map((l) => l.trimEnd());
  const blocks = [];
  let cur = null;
  let gap = false;
  lines.forEach((line) => {
    if (!line.trim()) {
      gap = true;
      return;
    }
    const heading = isHeading(line);
    const kind = listKind(line);
    if (heading) {
      blocks.push({ type: 'heading', ...heading });
      cur = null;
    } else if (kind) {
      const text = listText(line);
      if (!text.trim()) return;
      if (cur && cur.type === kind) {
        cur.items.push([text]);
      } else {
        cur = { type: kind, start: kind === 'ol' ? listStart(line) : 1, items: [[text]] };
        blocks.push(cur);
      }
    } else if (cur && (cur.type === 'ol' || cur.type === 'ul') && !gap) {
      cur.items[cur.items.length - 1].push(line.trim());
    } else if (cur && cur.type === 'p' && !gap) {
      cur.lines.push(line);
    } else {
      cur = { type: 'p', lines: [line] };
      blocks.push(cur);
    }
    gap = false;
  });
  return blocks;
}

function renderLines(lines, keyBase) {
  return lines.map((line, li) => (
    <React.Fragment key={`${keyBase}-${li}`}>
      {li > 0 ? <br /> : null}
      {renderInline(line, `${keyBase}${li}`)}
    </React.Fragment>
  ));
}

export default function PollyRichText({ text }) {
  const blocks = parseBlocks(text);
  return (
    <>
      {blocks.map((block, bi) => {
        if (block.type === 'heading') {
          const Tag = block.level === 1 ? 'h3' : 'h4';
          return <Tag key={`h-${bi}`}>{renderInline(block.text, `h${bi}`)}</Tag>;
        }
        if (block.type === 'ol' || block.type === 'ul') {
          const Tag = block.type;
          return (
            <Tag key={`l-${bi}`} {...(block.type === 'ol' && block.start > 1 ? { start: block.start } : {})}>
              {block.items.map((item, li) => (
                <li key={`l-${bi}-${li}`}>{renderLines(item, `l${bi}-${li}`)}</li>
              ))}
            </Tag>
          );
        }
        return <p key={`p-${bi}`}>{renderLines(block.lines, `p${bi}`)}</p>;
      })}
    </>
  );
}
