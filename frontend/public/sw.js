/* eslint-disable no-restricted-globals */
/**
 * Service Worker for Web Push Notifications
 */
/// <reference lib="webworker" />

self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/logo.png',
      badge: '/badge.png',
      data: data.data,
      vibrate: [200, 100, 200, 100, 200, 100, 400],
      tag: data.data?.type === 'sos' ? 'sos-alert' : 'general-alert',
      renotify: true,
      actions: [
        { action: 'view', title: 'View Map' },
        { action: 'resolve', title: 'Resolve' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const alertData = event.notification.data;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/alerts');
      }
    })
  );
});
