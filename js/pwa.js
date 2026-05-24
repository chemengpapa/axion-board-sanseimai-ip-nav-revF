const SERVICE_WORKER_URL = new URL("../service-worker.js", import.meta.url);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(SERVICE_WORKER_URL, { scope: "./" })
      .then((registration) => {
        console.info("[Axion Board] Service worker registered:", registration.scope);
      })
      .catch((error) => {
        console.warn("[Axion Board] Service worker registration failed:", error);
      });
  });
} else {
  console.info("[Axion Board] Service worker is not available in this browser.");
}
