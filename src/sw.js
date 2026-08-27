import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// @ts-expect-error WB_MANIFEST is injected at build time
precacheAndRoute(self.__WB_MANIFEST || []);
clientsClaim();
(self ).skipWaiting();
