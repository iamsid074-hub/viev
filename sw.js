/* =========================================================
   VIEVS - SERVICE WORKER & PUSH NOTIFICATION ENGINE
   Special Liquid Glass Experience for Princess Digi & Honey
   ========================================================= */

const CACHE_NAME = 'viev-cache-v3.1';
const OFFLINE_URL = './index.html';

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Push Event (Web Push API / FCM / Remote Triggers)
self.addEventListener('push', (event) => {
  let data = {
    title: 'Digi Viev ❤️',
    body: 'A special update is waiting for you in VIEVS!',
    icon: 'assets/digi.png',
    badge: 'assets/digi.png',
    tag: 'viev-alert-' + Date.now(),
    data: { url: './index.html', action: 'open_home' }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = Object.assign(data, payload);
    } catch (e) {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || 'assets/digi.png',
    badge: data.badge || 'assets/digi.png',
    tag: data.tag || 'viev-notification',
    data: data.data || { url: './index.html' },
    vibrate: [100, 50, 100],
    renotify: true,
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event (Opens VIEVS & directs to relevant section)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || './index.html';
  const action = notifData.action || 'open_home';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a VIEVS window is already open, focus it and dispatch navigation message
      for (let client of clientList) {
        if ('focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            action: action,
            data: notifData
          });
          return;
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl).then((newClient) => {
          if (newClient) {
            setTimeout(() => {
              newClient.postMessage({
                type: 'NOTIFICATION_CLICKED',
                action: action,
                data: notifData
              });
            }, 1000);
          }
        });
      }
    })
  );
});

// Message listener from web app client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Direct show notification request
  if (event.data.type === 'SHOW_NOTIFICATION') {
    const payload = event.data.payload || {};
    self.registration.showNotification(payload.title || 'Digi Viev', {
      body: payload.body || '',
      icon: payload.icon || 'assets/digi.png',
      badge: payload.badge || 'assets/digi.png',
      tag: payload.tag || 'viev-local-alert',
      data: payload.data || {},
      vibrate: [80, 40, 80],
      renotify: true
    });
  }
});

