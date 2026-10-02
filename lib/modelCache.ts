import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Global In-Memory Model Cache
 *
 * Preloads and caches parsed GLTF models so that switching between
 * Home, Simulation, and Characters is INSTANT (0ms) with zero lagging,
 * zero network re-fetching, and NO placeholder models!
 */

const gltfCache = new Map<string, THREE.Group>();
const pendingLoads = new Map<string, Promise<THREE.Group>>();
const loader = new GLTFLoader();

export const MODEL_URLS = {
  alice: "/models/alice.glb",
  eve: "/models/eve.glb",
  bob: "/models/bob.glb",
  hamster: "/models/hamster.glb",
} as const;

/**
 * Returns a cloned instance from memory cache if available, or null.
 */
export function getCachedModel(url: string): THREE.Group | null {
  const cached = gltfCache.get(url);
  if (cached) {
    return cached.clone(true);
  }
  return null;
}

/**
 * Loads a model and caches it in memory. If already cached, returns instantly.
 */
export function loadModelCached(url: string): Promise<THREE.Group> {
  const existing = gltfCache.get(url);
  if (existing) {
    return Promise.resolve(existing.clone(true));
  }

  const inFlight = pendingLoads.get(url);
  if (inFlight) {
    return inFlight.then((model) => model.clone(true));
  }

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const scene = gltf.scene;
        scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        gltfCache.set(url, scene);
        pendingLoads.delete(url);
        resolve(scene.clone(true));
      },
      undefined,
      (err) => {
        console.error(`[ModelCache] Failed to load model at ${url}:`, err);
        pendingLoads.delete(url);
        reject(err);
      }
    );
  });

  pendingLoads.set(url, promise);
  return promise;
}

/**
 * Preload all 4 character models into browser memory immediately.
 */
export function preloadAllCharacterModels() {
  if (typeof window === "undefined") return;
  loadModelCached(MODEL_URLS.alice).catch(() => {});
  loadModelCached(MODEL_URLS.eve).catch(() => {});
  loadModelCached(MODEL_URLS.bob).catch(() => {});
  loadModelCached(MODEL_URLS.hamster).catch(() => {});
}

// Automatically initiate preload on import in browser
if (typeof window !== "undefined") {
  preloadAllCharacterModels();
}
