import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const clientDirectory = path.resolve("build/client");
const workerSource = path.resolve("public/service-worker.js");
const staticShellFiles = [
  "/",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/icon.svg",
  "/icons/icon-maskable.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  "/icons/apple-touch-icon.png",
];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );
  return files.flat();
}

const assetDirectory = path.join(clientDirectory, "assets");
const assetFiles = await listFiles(assetDirectory);
const assetUrls = assetFiles
  .map((file) => `/${path.relative(clientDirectory, file).split(path.sep).join("/")}`)
  .sort();
const precache = [...staticShellFiles, ...assetUrls];
const version = createHash("sha256").update(JSON.stringify(precache)).digest("hex").slice(0, 12);
const worker = await readFile(workerSource, "utf8");
const generatedWorker = `self.__PWA_CACHE_VERSION__ = ${JSON.stringify(version)};\nself.__PWA_PRECACHE_MANIFEST__ = ${JSON.stringify(precache)};\n${worker}`;

await writeFile(path.join(clientDirectory, "service-worker.js"), generatedWorker);
console.log(`Generated service worker with ${precache.length} precached files.`);
