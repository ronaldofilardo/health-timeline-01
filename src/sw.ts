
import { precacheAndRoute } from 'workbox-precaching';

// Para TypeScript reconhecer o self
declare let self: ServiceWorkerGlobalScope;

// Pré-cacheia recursos
precacheAndRoute(self.__WB_MANIFEST);

// Listeners do service worker
self.addEventListener('install', () => {
  void self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
