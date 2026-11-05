/**
 * JSON for <script type="application/ld+json">. JSON.stringify leaves "<" as is, so a creator headline or brand
 * description containing "</script><script>…" would run as code on our pages. Escape the characters that can
 * end the script tag or break the parser.
 */
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);

export function jsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(LINE_SEP).join('\\u2028')
    .split(PARA_SEP).join('\\u2029');
}

export default jsonLd;
