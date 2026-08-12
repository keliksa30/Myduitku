self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            return clientList[i].focus();
          }
        }
        return clientList[0].focus();
      }
      return clients.openWindow('/');
    })
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Waktunya Kasih Makan Kucing!';
  const options = {
    body: data.body || 'Meow! Jangan lupa catat pengeluaranmu hari ini ya, biar aku bisa makan enak 🐟',
    icon: '/android-icon-192x192.png',
    badge: '/android-icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    data: { url: '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
