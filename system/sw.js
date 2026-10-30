// THE SYSTEM — service worker. Only here so timer notifications can show on
// phones (Android Chrome won't show them from the page itself). No caching.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
    const win = list.find(c => c.url.includes("/system"));
    return win ? win.focus() : self.clients.openWindow("./");
  }));
});
