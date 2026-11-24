/*
 * Broken image fallback for the whole site and app (Nov 2026).
 * Brand logos come from many hosts and some 404, expire (Instagram CDN) or block hotlinking: instead of the
 * browser's broken-image icon and alt text, show a clean tile with the brand's initial.
 * Loaded first in <head> (CRA public/index.html and the Next root layout), and listens in the capture phase,
 * so it also catches images in server-rendered HTML that fail before the app's JavaScript runs.
 * Opt out on an image with data-fallback="off". Name source: data-name, else alt ("Olay logo" -> "O").
 */
(function () {
  if (typeof window === 'undefined' || window.__ncImgFallback) return;
  window.__ncImgFallback = true;

  function initial(img) {
    var name = (img.getAttribute('data-name') || img.getAttribute('alt') || '')
      .replace(/\s*(logo|image|icon)\s*$/i, '')
      .replace(/^[^A-Za-z0-9À-ɏ]+/, '')
      .trim();
    var c = name ? name.charAt(0).toUpperCase() : '';
    return /[<>&"']/.test(c) ? '' : c;
  }

  function tile(letter) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">'
      + '<rect width="100" height="100" fill="#f3f2ef"/>'
      + (letter
        ? '<text x="50" y="50" dy=".35em" text-anchor="middle" font-family="Inter,-apple-system,Segoe UI,Arial,sans-serif" font-weight="800" font-size="44" fill="#12141a">' + letter + '</text>'
        : '')
      + '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function fix(img) {
    if (!img || img.tagName !== 'IMG') return;
    if (img.getAttribute('data-fallback') === 'off' || img.getAttribute('data-nc-fallback')) return;
    img.setAttribute('data-nc-fallback', '1');
    img.removeAttribute('srcset');
    img.src = tile(initial(img));
    if (!img.style.objectFit) img.style.objectFit = 'cover';
    if (!img.style.background) img.style.background = '#f3f2ef';
  }

  window.addEventListener('error', function (event) { fix(event.target); }, true);

  // Images that failed before this script ran (it can load after the first paint on some pages).
  function sweep() {
    var imgs = document.images;
    for (var i = 0; i < imgs.length; i++) {
      var img = imgs[i];
      var src = img.getAttribute('src') || '';
      // SVGs without a width can report naturalWidth 0 while loaded fine (Firefox): only real errors for those.
      if (img.complete && src && img.naturalWidth === 0 && !/\.svg(\?|#|$)|^data:image\/svg/i.test(src)) fix(img);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sweep);
  else sweep();
  window.addEventListener('load', sweep);
})();
