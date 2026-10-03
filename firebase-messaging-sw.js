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

// FCM `notification` yüklemesi ئۆزى ئاپتوماتىك كۆرسىتىلىدۇ؛ پەقەت data-only ئۇچۇرلار ئۈچۈن:
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
