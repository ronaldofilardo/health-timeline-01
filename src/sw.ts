
import { precacheAndRoute } from 'workbox-precaching';

// Necessário para o TypeScript reconhecer a variável self
declare let self: ServiceWorkerGlobalScope;

// Pré-cacheia os recursos gerados pelo plugin Vite PWA
precacheAndRoute(self.__WB_MANIFEST);

// Adiciona um event listener para instalar o service worker
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Adiciona um event listener para ativar o service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
