const cacheName = "V1";
const cacheFiles = ["./assets/no-connection.svg", "./offline.html"];

const deleteCache = async (key) => {
   await caches.delete(key);
};

const deleteOldCaches = async () => {
   const cacheKeepList = [cacheName];
   const keyList = await caches.keys();
   const cachesToDelete = keyList.filter((key) => !cacheKeepList.includes(key));
   await Promise.all(cachesToDelete.map(deleteCache));
};

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
   event.waitUntil(clients.claim(), deleteOldCaches());
});

self.addEventListener("fetch", async (event) => {
   event.respondWith(
      cacheResponse({
         request: event.request,
         fallbackurl: "./offline.html",
      })
   );
});
