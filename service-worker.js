const CACHE_VERSION = "revF-v2";
const CACHE_NAME = `axion-board-sanseimai-ip-nav-${CACHE_VERSION}`;

const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/base.css",
  "./css/layout-mobile.css",
  "./css/theme-lunier.css",
  "./js/main.js",
  "./js/pwa.js",
  "./js/storage.js",
  "./js/data-model.js",
  "./js/icon-assets.js",
  "./js/utils/html.js",
  "./js/components/axion-guide.js",
  "./js/components/bottom-nav.js",
  "./js/components/edit-sheet.js",
  "./js/components/savepoint-card.js",
  "./js/components/shelf-card.js",
  "./js/views/home-view.js",
  "./js/views/monthly-board-view.js",
  "./js/views/savepoint-view.js",
  "./js/views/settings-view.js",
  "./js/views/shelf-detail-view.js",
  "./js/views/phase-view.js",
  "./js/views/issues-view.js",
  "./js/views/shelves-view.js",
  "./data/seed/sanseimai_ip_nav_empty_seed.json",
  "./assets/backgrounds/three_sisters_hero.jpg",
  "./assets/backgrounds/lunier_savepoint_bg.jpg",
  "./assets/characters/axion_smile.png",
  "./assets/characters/axion_calm.png",
  "./assets/icons/characters/axion_icon_01.webp",
  "./assets/icons/characters/amaryllis_icon_01.webp",
  "./assets/icons/characters/ordina_icon_01.webp",
  "./assets/icons/characters/logos_icon_01.webp",
  "./assets/icons/characters/aulia_icon_01.webp",
  "./assets/icons/characters/ameri_icon_01.webp",
  "./assets/icons/characters/amezis_icon_01.webp",
  "./assets/icons/characters/elena_icon_01.webp",
  "./assets/icons/characters/elysia_icon_01.webp",
  "./assets/icons/characters/frigia_icon_01.webp",
  "./assets/icons/characters/ignifa_icon_01.webp",
  "./assets/icons/characters/kagetsu_icon_01.webp",
  "./assets/icons/characters/karien_icon_01.webp",
  "./assets/icons/characters/karin_icon_01.webp",
  "./assets/icons/characters/kelvas_icon_01.webp",
  "./assets/icons/characters/lumiana_icon_01.webp",
  "./assets/icons/characters/luxhaul_icon_01.webp",
  "./assets/icons/characters/mikage_icon_01.webp",
  "./assets/icons/characters/mistros_icon_01.webp",
  "./assets/icons/characters/mona_icon_01.webp",
  "./assets/icons/characters/rafal_icon_01.webp",
  "./assets/icons/characters/rao_icon_01.webp",
  "./assets/icons/characters/renaris_icon_01.webp",
  "./assets/icons/characters/riva_icon_01.webp",
  "./assets/icons/characters/ruga_icon_01.webp",
  "./assets/icons/characters/sakuya_orochi_icon_01.webp",
  "./assets/icons/characters/sena_icon_01.webp",
  "./assets/icons/characters/shien_icon_01.webp",
  "./assets/icons/characters/soleil_icon_01.webp",
  "./assets/icons/characters/solius_icon_01.webp",
  "./assets/icons/characters/soria_icon_01.webp",
  "./assets/icons/characters/tsukihane_icon_01.webp",
  "./assets/icons/characters/tsukuyo_icon_01.webp",
  "./assets/pwa/apple-touch-icon.png",
  "./assets/pwa/axion-board-icon-192.png",
  "./assets/pwa/axion-board-icon-512.png",
  "./assets/pwa/axion-board-maskable-512.png",
  "./assets/ui/save_aura_purple_transparent.png",
  "./assets/ui/save_block_node_transparent.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => (key.startsWith("axion-board-lunier-") || key.startsWith("axion-board-sanseimai-ip-nav-")) && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html").then((cached) => cached || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
