"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { CharacterData } from "@/lib/characters";
import { loadModelCached, getCachedModel } from "@/lib/modelCache";

interface CharacterModelViewerProps {
  character: CharacterData;
  isHovered: boolean;
}

export default function CharacterModelViewer({
  character,
  isHovered,
}: CharacterModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isVisibleRef = useRef(false);
  const hoverRef = useRef(isHovered);

  // Keep hover ref updated without triggering full scene re-init
  useEffect(() => {
    hoverRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = null; // Transparent to preserve card's background gradient

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 450;

    // Camera positioned and angled to show complete character from head to toe
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.35, 4.6);
    camera.lookAt(0, 0.32, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch (e) {
      console.error("WebGL initialization error in CharacterModelViewer:", e);
      requestAnimationFrame(() => {
        setLoadError("WebGL unavailable");
        setLoading(false);
      });
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.replaceChildren(renderer.domElement);

    // --- Studio Lighting with Violet Rim Lighting ---
    const ambientLight = new THREE.AmbientLight(0x221c3e, 2.4);
    scene.add(ambientLight);

    // Main Key Light from front-right
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(2, 5, 4);
    scene.add(keyLight);

    // Front-fill light to ensure facial features and clothing details are bright & clear
    const frontLight = new THREE.DirectionalLight(0xf1f5f9, 2.0);
    frontLight.position.set(0, 2, 5);
    scene.add(frontLight);

    // Signature Electric Violet Rim Light from behind
    const rimLight = new THREE.DirectionalLight(0xa855f7, 4.5);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Pivot group for model rotation & positioning
    const modelGroup = new THREE.Group();
    const targetFrontAngle = character.frontAngle !== undefined ? character.frontAngle : 0;
    modelGroup.rotation.y = targetFrontAngle;
    scene.add(modelGroup);

    // --- Load 3D Model with Instant In-Memory Cache ---
    function setupModel(loadedScene: THREE.Group) {
      // 1. Measure raw dimensions
      const bbox = new THREE.Box3().setFromObject(loadedScene);
      const rawSize = bbox.getSize(new THREE.Vector3());

      // 2. Uniform scale so the character height fits comfortably (head to toe visible)
      const targetHeight = 2.15;
      const scale = rawSize.y > 0 ? targetHeight / rawSize.y : 1.0;
      loadedScene.scale.setScalar(scale);

      // 3. Recompute bounding box after scaling
      const scaledBbox = new THREE.Box3().setFromObject(loadedScene);
      const scaledCenter = scaledBbox.getCenter(new THREE.Vector3());
      const scaledMin = scaledBbox.min;

      // 4. Center horizontally and align feet safely above the bottom card text
      loadedScene.position.x = -scaledCenter.x;
      loadedScene.position.z = -scaledCenter.z;
      loadedScene.position.y = -scaledMin.y - 0.72;

      // 5. Enable shadows
      loadedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      // Clear any previous child before attaching
      while (modelGroup.children.length > 0) {
        modelGroup.remove(modelGroup.children[0]);
      }
      modelGroup.add(loadedScene);
      setLoading(false);
      setLoadError(null);
    }

    // Check synchronous cache first (0ms instantaneous!)
    const cached = getCachedModel(character.modelUrl);
    if (cached) {
      setupModel(cached);
    } else {
      loadModelCached(character.modelUrl)
        .then((sceneModel) => setupModel(sceneModel))
        .catch((err) => {
          console.error(`Error loading model for ${character.name}:`, err);
          setLoadError("Model failed to load");
          setLoading(false);
        });
    }

    // --- IntersectionObserver for Performance ---
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // --- Render Loop (Rotates ONLY when mouse hovers as requested) ---
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Skip render if outside viewport to conserve GPU
      if (!isVisibleRef.current) return;

      // Rotate as a showcase when hovered; smoothly return to front when not hovered!
      if (!prefersReducedMotion) {
        if (hoverRef.current) {
          modelGroup.rotation.y += 0.009; // Relaxed, smooth, premium showcase spin speed
        } else {
          // Shortest-path angular ease back to facing front
          const currentRot = modelGroup.rotation.y;
          const diff =
            ((targetFrontAngle - currentRot) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) -
            Math.PI;
          if (Math.abs(diff) > 0.002) {
            modelGroup.rotation.y += diff * 0.055;
          } else {
            modelGroup.rotation.y = targetFrontAngle;
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 300;
      const newH = container.clientHeight || 450;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [character]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className={`w-full h-full transition-opacity duration-700 ${
          loading ? "opacity-0" : "opacity-100"
        }`}
        aria-label={`3D model showcase of ${character.name}`}
      />

      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 pointer-events-none">
          <div className="w-9 h-9 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-500 font-mono">
            Loading {character.name}...
          </span>
        </div>
      )}

      {/* Error state */}
      {loadError && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          <span className="text-zinc-600 text-xs font-mono">{loadError}</span>
        </div>
      )}
    </div>
  );
}
