// Satu-satunya titik akses ke MangaDex — lewat proxy Cloudflare Worker, jangan
// pernah fetch langsung ke api.mangadex.org/uploads.mangadex.org (di-DNS-block
// ISP Indonesia). Lihat DECISIONS.md #001.
export const MANGADEX_PROXY_BASE_URL = 'https://mangadex-proxy.mangaholic.workers.dev';
