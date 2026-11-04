self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : '' };
  }

  const options = {
    body: data.body || 'Ada brief project baru yang perlu ditinjau.',
    icon: '/push-icon.svg',
    badge: '/push-icon.svg',
    data: { url: typeof data.url === 'string' ? data.url : '/admin/inquiries' },
    tag: typeof data.tag === 'string' ? data.tag : 'project-inquiry-new',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Inquiry Project Baru', options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  let targetUrl = new URL('/admin/inquiries', self.location.origin);
  try {
    const requestedUrl = new URL(
      event.notification.data && event.notification.data.url
        ? event.notification.data.url
        : '/admin/inquiries',
      self.location.origin
    );
    if (requestedUrl.origin === self.location.origin) targetUrl = requestedUrl;
  } catch {
    targetUrl = new URL('/admin/inquiries', self.location.origin);
  }

  event.waitUntil(
    (async function () {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of windows) {
        if (!('focus' in client)) continue;
        let clientPath = '';
        try {
          clientPath = new URL(client.url).pathname;
        } catch {
          clientPath = '';
        }
        if (!clientPath.startsWith('/admin')) continue;
        if ('navigate' in client) {
          try {
            await client.navigate(targetUrl.href);
          } catch {
            // Focus the existing admin tab even if navigation is unavailable.
          }
        }
        return client.focus();
      }
      return self.clients.openWindow(targetUrl.href);
    })()
  );
});
