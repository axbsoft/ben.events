/* benevents agency — calligraphy app: a helper that keeps the app working when the network of a
   venue drops (registered by assets/js/calli-app.js for /calligraphy only).

   Every file of the app is asked from the network first, so a new version is used as soon as it is
   published; each answer is also kept on the device. When the network does not answer (or takes
   more than a few seconds), the copy kept on the device is used instead. Contacts are never held
   here: the app keeps them itself and hands them over when the network is back. */
const KEPT = 'ben-calligraphy-1';
const OWN = /^\/(calligraphy(\/card)?$|assets\/(calligraphy\/|js\/(calli-|qrcode\.js$)|css\/(calli-app|style)\.css$|img\/favicon))/;
const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
const SLOW = 4000;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('ben-calligraphy-') && k !== KEPT).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!(url.origin === self.location.origin && OWN.test(url.pathname)) && !FONTS.test(request.url)) return;
  const kept = () => caches.match(request, { ignoreVary: true });
  const fresh = fetch(request).then(answer => {
    if (answer && (answer.ok || answer.type === 'opaque')) {
      const copy = answer.clone();
      caches.open(KEPT).then(cache => cache.put(request, copy)).catch(() => {});
    }
    return answer;
  });
  const late = new Promise(resolve => setTimeout(resolve, SLOW)).then(kept).then(hit => hit || fresh);
  event.respondWith(Promise.race([fresh, late]).catch(() => kept().then(hit => hit || Response.error())));
});
