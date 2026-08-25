// Wikimedia Commons' Special:FilePath endpoint serves the original,
// full-resolution upload by default — several of the ones this app uses
// are 2-5MB JPEGs, which is why hero/card photos were loading slowly (or
// looking "missing" while a multi-megabyte download was still in flight).
// Special:FilePath supports a `width` query param that returns a properly
// resized JPEG from Wikimedia's own thumbnail pipeline, so this is a
// server-side resize, not a client-side workaround.
// https://www.mediawiki.org/wiki/Manual:Special:FilePath
const WIKIMEDIA_FILEPATH_RE = /^https?:\/\/commons\.wikimedia\.org\/wiki\/Special:FilePath\//i;

/**
 * Appends a Wikimedia thumbnail width to a Special:FilePath URL. Any other
 * URL (a future CDN-hosted asset, a local require(), etc.) passes through
 * unchanged, so this is safe to apply everywhere an imageUrl is rendered.
 */
export function optimizeImageUrl(url, width = 900) {
  if (!url || typeof url !== 'string') return url;
  if (!WIKIMEDIA_FILEPATH_RE.test(url) || url.includes('?')) return url;
  return `${url}?width=${width}`;
}
