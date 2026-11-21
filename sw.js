'use strict';
const CACHE = 'aiinfo-v138';
// registered as sw.js?n=1 when the visitor only turned on notifications: no caching, no fetch handling
const NOTIFY_ONLY = /[?&]n=1/.test(self.location.search);
const SHELL = ['./', '/style.css?v=214', '/ai.js?v=214', '/sources.js?v=214', '/core.js?v=214', '/search.js?v=214', '/fastlab.js?v=214', '/scamlab.js?v=214', '/welcome.js?v=214', '/compare.js?v=214', '/tools.js?v=214', '/quiz.js?v=214', '/dict.js?v=214', '/language.js?v=214', '/settings.js?v=214', '/legal.js?v=214', '/weather.js?v=214', '/video.js?v=214', '/quote.js?v=214', '/extras.js?v=214', '/app.js?v=214', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
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
  if (!hit) {
    // saved in pieces (8 MB each): serve the saved pieces, and fetch whatever is not saved from the original address
    const ck = i => target + (target.indexOf('?') < 0 ? '?' : '&') + '__vcc=' + i;
    const c0 = await c.match(ck(0));
    if (!c0) return Response.redirect(target, 302);
    const total = Number(c0.headers.get('x-total')) || 0, CH = Number(c0.headers.get('x-ch')) || 8388608, ptype = c0.headers.get('x-type') || 'video/mp4';
    if (!total) return Response.redirect(target, 302);
    const pm = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('range') || '');
    let ps = 0, pe = total - 1;
    if (pm) { ps = pm[1] === '' ? Math.max(0, total - Number(pm[2])) : Number(pm[1]); pe = pm[1] === '' || pm[2] === '' ? total - 1 : Math.min(Number(pm[2]), total - 1); }
    if (ps >= total || ps > pe) return new Response(null, { status: 416, headers: { 'content-range': 'bytes */' + total } });
    const i0 = Math.floor(ps / CH);
    const first = i0 === 0 ? c0 : await c.match(ck(i0));
    if (first) {
      const parts = [await first.blob()];
      let last = i0;
      while (last - i0 < 3 && (last + 1) * CH <= pe) { const nx = await c.match(ck(last + 1)); if (!nx) break; parts.push(await nx.blob()); last++; }
      const realEnd = Math.min(pe, (last + 1) * CH - 1, total - 1);
      const all = new Blob(parts, { type: ptype });
      const body = all.slice(ps - i0 * CH, realEnd - i0 * CH + 1, ptype);
      return new Response(body, { status: 206, headers: { 'content-type': ptype, 'content-length': String(realEnd - ps + 1), 'content-range': 'bytes ' + ps + '-' + realEnd + '/' + total, 'accept-ranges': 'bytes' } });
    }
    // not saved: the rest comes from the original address, up to the next saved piece
    try {
      const net = await fetch(target, { mode: 'cors', headers: { Range: 'bytes=' + ps + '-' + pe } });
      if (net.status === 206 && net.body) {
        const cr = /bytes (\d+)-(\d+)\/(\d+)/.exec(net.headers.get('content-range') || '');
        return new Response(net.body, { status: 206, headers: { 'content-type': net.headers.get('content-type') || ptype, 'content-length': net.headers.get('content-length') || String(pe - ps + 1), 'content-range': cr ? net.headers.get('content-range') : 'bytes ' + ps + '-' + pe + '/' + total, 'accept-ranges': 'bytes' } });
      }
    } catch (_) {}
    return Response.redirect(target, 302);
  }
  // (whole file saved) continue below
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
