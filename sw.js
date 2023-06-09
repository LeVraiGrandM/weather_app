const cacheName = "V9";
const cacheFiles = ["/assets/no-connection.svg", "/offline.html"];

const cacheResponse = async ({ request, fallbackurl }) => {
   try {
      const repsonseFromNetwork = await fetch(request);
      return repsonseFromNetwork;
   } catch (error) {
      const fallbackResponse = await caches.open(cacheName);
      if (fallbackResponse) {
         return fallbackResponse.match(fallbackurl);
      }
   }
};

self.addEventListener("install", async () => {
   self.skipWaiting();
   const cache = await caches.open(cacheName);
   await cache.addAll(cacheFiles);
});

self.addEventListener("activate", (event) => {
   event.waitUntil(clients.claim());
});

self.addEventListener("fetch", async (event) => {
   event.respondWith(
      cacheResponse({
         request: event.request,
         fallbackurl: "./offline.html",
      })
   );
});
