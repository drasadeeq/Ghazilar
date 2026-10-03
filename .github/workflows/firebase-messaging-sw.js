importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBhVedB0Md_FaRq84CoKQqV6-hGD8SUZxs",
  authDomain: "ghazi-foundation-f0319.firebaseapp.com",
  projectId: "ghazi-foundation-f0319",
  storageBucket: "ghazi-foundation-f0319.firebasestorage.app",
  messagingSenderId: "127522428349",
  appId: "1:127522428349:web:deed39176d1e30c7932ed4"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

const CACHE = 'gazi-saghlamliq-v9';
const CORE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const CDN = [
  'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil((async function () {
    const cache = await caches.open(CACHE);
    try { await cache.addAll(CORE); } catch (e) {}
    await Promise.all(CDN.map(async function (url) {
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (res && (res.ok || res.type === 'opaque')) await cache.put(url, res);
      } catch (e) {}
    }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(function (res) {
      const copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put('./index.html', copy); }).catch(function () {});
      return res;
    }).catch(function () { return caches.match('./index.html'); }));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.indexOf('/.well-known/') === 0 || url.pathname === '/assetlinks.json') return;
    event.respondWith(fetch(req).then(function (res) {
      const copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
      return res;
    }).catch(function () { return caches.match(req); }));
    return;
  }

  if (CDN.indexOf(req.url) !== -1) {
    event.respondWith(caches.match(req).then(function (cached) {
      return cached || fetch(req, { mode: 'cors' }).then(function (res) {
        const copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); }).catch(function () {});
        return res;
      });
    }));
  }
});

messaging.onBackgroundMessage(function (payload) {
  if (payload.notification) return;
  const d = payload.data || {};
  self.registration.showNotification(d.title || 'غازىلار ساقلىق مەركىزى', {
    body: d.speak || d.body || '',
    vibrate: [200, 100, 200],
    tag: 'gazi-' + Date.now()
  });
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    if (clients.openWindow) return clients.openWindow('./');
  }));
});
