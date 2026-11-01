'use strict';
const CACHE = 'aiinfo-v77';
// registered as sw.js?n=1 when the visitor only turned on notifications: no caching, no fetch handling
const NOTIFY_ONLY = /[?&]n=1/.test(self.location.search);
const SHELL = ['./', '/style.css?v=137', '/ai.js?v=137', '/sources.js?v=137', '/core.js?v=137', '/search.js?v=137', '/scamlab.js?v=137', '/welcome.js?v=137', '/compare.js?v=137', '/tools.js?v=137', '/quiz.js?v=137', '/dict.js?v=137', '/language.js?v=137', '/settings.js?v=137', '/legal.js?v=137', '/weather.js?v=137', '/video.js?v=137', '/quote.js?v=137', '/app.js?v=137', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
// read-only API answers that are safe to show instantly and refresh in the background
const API_OK = /^\/api\/x\/(videos|feed|search|article|news|digest|weather|define)$/;
const FRESH = 5 * 60 * 1000, STALE = 6 * 3600 * 1000, MAXN = 60;
self.addEventListener('install', e => {
  if (NOTIFY_ONLY) { e.waitUntil(self.skipWaiting()); return; }
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    try { if (self.registration.navigationPreload) await self.registration.navigationPreload.enable(); } catch (_) {}
    if (NOTIFY_ONLY) { await self.clients.claim(); return; }
    const ks = await caches.keys();
    const old = ks.filter(k => /^aiinfo-/.test(k) && k !== CACHE); // never touch the video cache
    await Promise.all(old.map(k => caches.delete(k)));
    await self.clients.claim();
    if (old.length) (await self.clients.matchAll()).forEach(c => c.postMessage({ type: 'sw-updated' }));
  })());
});
async function trim(c) {
  const ks = (await c.keys()).filter(r => API_OK.test(new URL(r.url).pathname));
  for (let i = 0; i < ks.length - MAXN; i++) await c.delete(ks[i]);
}
// stamp a copy with the time it was stored so we can judge its age later
async function stamp(res) {
  const h = new Headers(res.headers); h.set('x-sw-time', String(Date.now()));
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: h });
}
async function apiFetch(e, req, key) {
  const c = await caches.open(CACHE);
  const hit = await c.match(key);
  const age = hit ? Date.now() - Number(hit.headers.get('x-sw-time') || 0) : Infinity;
  const net = fetch(req).then(async res => {
    if (res.ok) { try { const copy = await stamp(res.clone()); await c.put(key, copy); trim(c); } catch (_) {} }
    return res;
  }).catch(() => null);
  if (hit && age < FRESH) return hit;                       // fresh: no network wait at all
  if (hit && age < STALE) { e.waitUntil(net); return hit; } // stale-while-revalidate
  const res = await net;                                    // too old: try the network first
  return res || hit || new Response('{"ok":false,"error":"offline"}', { status: 503, headers: { 'content-type': 'application/json' } });
}
const VIDEO_CACHE = 'ai-v9-videos'; // filled by the page; never deleted here
// Play big saved videos straight from the cache with proper Range support (no giant blob in memory)
async function fromVideoCache(req, url) {
  let target = '';
  try { target = decodeURIComponent(url.pathname.slice(6)); } catch (_) {}
  if (!/^https:\/\//.test(target)) return new Response('Bad request', { status: 400 });
  const c = await caches.open(VIDEO_CACHE);
  const hit = await c.match(target);
  if (!hit) return Response.redirect(target, 302); // not saved (any more): play from the original address
  const blob = await hit.blob(), size = blob.size;
  const type = hit.headers.get('content-type') || 'video/mp4';
  const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || '');
  if (!m) return new Response(blob, { status: 200, headers: { 'content-type': type, 'content-length': String(size), 'accept-ranges': 'bytes' } });
  let start = m[1] === '' ? Math.max(0, size - Number(m[2])) : Number(m[1]);
  let end = m[1] === '' || m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'content-range': 'bytes */' + size } });
  return new Response(blob.slice(start, end + 1, type), { status: 206, headers: { 'content-type': type, 'content-length': String(end - start + 1), 'content-range': 'bytes ' + start + '-' + end + '/' + size, 'accept-ranges': 'bytes' } });
}
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const cs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of cs) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  })());
});
self.addEventListener('fetch', e => {
  if (NOTIFY_ONLY) return;
  const req = e.request, url = new URL(req.url);
  // saved videos are played through a same-origin address (the SW never touches ordinary remote video requests)
  if (req.method === 'GET' && url.origin === location.origin && url.pathname.startsWith('/__vc/')) { e.respondWith(fromVideoCache(req, url)); return; }
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  if (req.headers.has('range') || req.headers.has('x-ver-check')) return;
  if (url.pathname.startsWith('/api/')) {
    if (!API_OK.test(url.pathname)) return;
    e.respondWith(apiFetch(e, req, new Request(url.href)));
    return;
  }
  const nav = req.mode === 'navigate';
  const key = nav ? new Request(url.origin + '/') : req;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(key);
    const net = (async () => {
      let res = nav && e.preloadResponse ? await e.preloadResponse : null;
      if (!res) res = await fetch(req);
      if (res && res.ok && !(res.headers.get('cache-control') || '').includes('no-store')) c.put(key, res.clone()).catch(() => {});
      return res;
    })().catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    return res || (await c.match(new Request(url.origin + '/'))) || new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain' } });
  })());
});
