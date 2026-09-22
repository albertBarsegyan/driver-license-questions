/** Register only in production and only in browsers that support service workers. */
if (import.meta.env.PROD && typeof window !== "undefined" && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then((registration) => registration.update())
      .catch((error) => console.warn("PWA registration failed", error));
  });
}
