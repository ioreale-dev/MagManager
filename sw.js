/* MagManager: tiene una copia dell'app sul dispositivo, così si apre anche senza internet.
   Per distribuire una nuova versione, cambia il numero in VERSIONE: al prossimo avvio con rete
   il telefono scarica i file nuovi e quello successivo li usa. */
const VERSIONE = 'magmanager-1';
const FILE = ['./', './index.html', './three.min.js', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(nomi => Promise.all(nomi.filter(n => n !== VERSIONE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(trovato => trovato || fetch(e.request).then(risposta => {
      if (risposta.ok) { const copia = risposta.clone(); caches.open(VERSIONE).then(c => c.put(e.request, copia)); }
      return risposta;
    }).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});
