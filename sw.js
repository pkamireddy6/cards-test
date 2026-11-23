/* Helper for the OGC digital business cards.
   It lets "Save Contact" open a real contact-card address on iPhones, so Safari
   shows its own "add contact" screen instead of saving a file.
   Keep this file next to index.html. It stores nothing and contacts no one. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (!/\/contact\.vcf$/.test(u.pathname) || !u.searchParams.has('d')) return;
  try {
    var s = u.searchParams.get('d').replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var text = new TextDecoder().decode(bytes);
    if (text.indexOf('BEGIN:VCARD') !== 0 || text.length > 4000) throw new Error('not a contact');
    e.respondWith(new Response(text, { status: 200, headers: { 'Content-Type': 'text/vcard; charset=utf-8', 'Cache-Control': 'no-store' } }));
  } catch (x) {
    e.respondWith(new Response('Invalid contact link', { status: 400 }));
  }
});
