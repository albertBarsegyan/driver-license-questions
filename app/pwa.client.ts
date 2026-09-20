/** Register only in supported browsers; SSR must never attempt service-worker APIs. */
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/service-worker.js").catch((error) => console.warn("PWA registration failed", error)));
}
