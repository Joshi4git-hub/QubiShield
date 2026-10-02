"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { MODEL_URLS, loadModelCached, getCachedModel } from "@/lib/modelCache";
import FallbackScene from "./FallbackScene";

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    function checkWebGL(): boolean {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
        );
      } catch {
        return false;
      }
    }

    if (!checkWebGL()) {
      requestAnimationFrame(() => setHasWebGL(false));
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040308);
    scene.fog = new THREE.FogExp2(0x040308, 0.045);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 90);
    const cameraTarget = new THREE.Vector3(0, 0.1, 0);
    camera.position.set(0, 0.35, width < 768 ? 9.8 : 7.6);
    camera.lookAt(cameraTarget);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setHasWebGL(false);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.replaceChildren(renderer.domElement);

    // --- High-Contrast Cinematic Lighting ---
    const ambientLight = new THREE.AmbientLight(0x0e0c24, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xf8fafc, 2.4);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLightLeft = new THREE.DirectionalLight(0x9333ea, 5.2);
    rimLightLeft.position.set(-6, 3.5, -3);
    scene.add(rimLightLeft);

    const rimLightRight = new THREE.DirectionalLight(0xa855f7, 4.5);
    rimLightRight.position.set(6, 3.5, -3);
    scene.add(rimLightRight);

    const underFill = new THREE.PointLight(0x38bdf8, 1.0, 10);
    underFill.position.set(-3, -2, 2);
    scene.add(underFill);

    const focusLight = new THREE.SpotLight(0xc084fc, 2.5, 12, Math.PI / 5, 0.3);
    focusLight.position.set(0, 4, 3);
    focusLight.target.position.set(0, 0, 0);
    scene.add(focusLight);
    scene.add(focusLight.target);

    // --- Scene Content Container ---
    const sceneContent = new THREE.Group();
    scene.add(sceneContent);

    // Character Groups (ONLY USER GLB MODELS - STRICTLY ZERO PROCEDURAL PLACEHOLDERS)
    const hamsterGroup = new THREE.Group();
    hamsterGroup.position.set(0, -0.4, 0);
    sceneContent.add(hamsterGroup);

    const aliceGroup = new THREE.Group();
    aliceGroup.position.set(-4.2, -0.1, -0.8);
    sceneContent.add(aliceGroup);

    const bobGroup = new THREE.Group();
    bobGroup.position.set(4.2, -0.1, -0.8);
    sceneContent.add(bobGroup);

    const eveGroup = new THREE.Group();
    eveGroup.position.set(0, 2.4, -3.5);
    sceneContent.add(eveGroup);

    // Mount user GLB models instantly from cache
    function attachModel(url: string, targetGroup: THREE.Group, scale: number, yOffset = 0) {
      function mount(model: THREE.Group) {
        model.scale.setScalar(scale);
        model.position.y = yOffset;
        targetGroup.add(model);
      }

      const cached = getCachedModel(url);
      if (cached) {
        mount(cached);
      } else {
        loadModelCached(url)
          .then((model) => mount(model))
          .catch((err) => console.error("Error mounting model in HeroScene:", url, err));
      }
    }

    attachModel(MODEL_URLS.hamster, hamsterGroup, 1.35, 0.0);
    attachModel(MODEL_URLS.alice, aliceGroup, 1.05, 0.0);
    attachModel(MODEL_URLS.bob, bobGroup, 1.05, 0.0);
    attachModel(MODEL_URLS.eve, eveGroup, 0.95, 0.0);

    // Floating Qubit Point Light on Hamster
    const qubitLight = new THREE.PointLight(0xa855f7, 2.8, 5);
    qubitLight.position.set(0, 0.2, 0.8);
    hamsterGroup.add(qubitLight);

    // --- Quantum Channel Spline & Holographic Shield ---
    const channelGroup = new THREE.Group();
    const pathPoints = [
      new THREE.Vector3(-4.0, 0.3, -0.6),
      new THREE.Vector3(-2.2, 0.4, 0.4),
      new THREE.Vector3(0, 0.1, 0.8),
      new THREE.Vector3(2.2, 0.4, 0.4),
      new THREE.Vector3(4.0, 0.3, -0.6),
    ];
    const channelCurve = new THREE.CatmullRomCurve3(pathPoints);

    const channelTube = new THREE.Mesh(
      new THREE.TubeGeometry(channelCurve, 64, 0.022, 12, false),
      new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.7 })
    );
    channelGroup.add(channelTube);

    const photonCount = 14;
    const photonGeos: THREE.Mesh[] = [];
    const pGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const pMat = new THREE.MeshBasicMaterial({ color: 0xe0e7ff });
    for (let i = 0; i < photonCount; i++) {
      const photon = new THREE.Mesh(pGeo, pMat);
      channelGroup.add(photon);
      photonGeos.push(photon);
    }
    sceneContent.add(channelGroup);

    // Holographic Shield Motif
    const shieldGroup = new THREE.Group();
    shieldGroup.position.set(0, 0.25, 0.2);

    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.8);
    shieldShape.lineTo(1.3, 1.4);
    shieldShape.lineTo(1.2, -0.6);
    shieldShape.lineTo(0, -1.8);
    shieldShape.lineTo(-1.2, -0.6);
    shieldShape.lineTo(-1.3, 1.4);
    shieldShape.closePath();

    const shieldExtrude = new THREE.ExtrudeGeometry(shieldShape, { depth: 0.08, bevelEnabled: false });
    shieldExtrude.center();
    const shieldMesh = new THREE.Mesh(
      shieldExtrude,
      new THREE.MeshPhysicalMaterial({ color: 0x7c3aed, roughness: 0.1, transmission: 0.9, transparent: true, opacity: 0.22 })
    );
    shieldGroup.add(shieldMesh);

    const shieldWire = new THREE.Mesh(
      shieldExtrude,
      new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.4 })
    );
    shieldGroup.add(shieldWire);
    shieldGroup.scale.set(1.6, 1.6, 1.6);
    sceneContent.add(shieldGroup);

    // --- Starfield Dust & Nebula ---
    const nebulaGroup = new THREE.Group();
    scene.add(nebulaGroup);

    const starCount = 1400;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 26;
      starPos[i + 1] = (Math.random() - 0.5) * 16;
      starPos[i + 2] = -8 + Math.random() * 12;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xddd6fe, size: 0.05, transparent: true, opacity: 0.55 });
    const stars = new THREE.Points(starGeo, starMat);
    nebulaGroup.add(stars);

    // Responsive character layout
    function updateResponsiveLayout(w: number) {
      const mobile = w < 768;
      const tablet = w >= 768 && w < 1024;

      if (mobile) {
        aliceGroup.position.set(-2.8, -0.6, -1.8);
        aliceGroup.scale.setScalar(0.78);
        bobGroup.position.set(2.8, -0.6, -1.8);
        bobGroup.scale.setScalar(0.78);
        hamsterGroup.scale.setScalar(1.05);
      } else if (tablet) {
        aliceGroup.position.set(-3.5, -0.2, -1.2);
        aliceGroup.scale.setScalar(0.9);
        bobGroup.position.set(3.5, -0.2, -1.2);
        bobGroup.scale.setScalar(0.9);
        hamsterGroup.scale.setScalar(1.2);
      } else {
        aliceGroup.position.set(-4.2, -0.1, -0.8);
        aliceGroup.scale.setScalar(1.05);
        bobGroup.position.set(4.2, -0.1, -0.8);
        bobGroup.scale.setScalar(1.05);
        hamsterGroup.scale.setScalar(1.35);
      }
    }
    updateResponsiveLayout(width);

    // Scroll & Mouse Parallax
    let targetScrollFraction = 0;
    let currentScrollFraction = 0;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollFraction = docHeight > 0 ? Math.min(Math.max(scrollY / docHeight, 0), 1) : 0;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      updateResponsiveLayout(newWidth);
    };
    window.addEventListener("resize", handleResize);

    // --- Render Loop ---
    let animationFrameId: number;
    const startTime = performance.now();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = (performance.now() - startTime) * 0.001;
      const speed = prefersReducedMotion ? 0.25 : 1.0;
      const adjustedTime = elapsedTime * speed;

      currentScrollFraction += (targetScrollFraction - currentScrollFraction) * 0.07;
      const s = currentScrollFraction;

      // Subtle character hovering
      hamsterGroup.position.y = -0.4 + Math.sin(adjustedTime * 1.5) * 0.08;
      aliceGroup.position.y = -0.1 + Math.sin(adjustedTime * 1.6 + 0.5) * 0.06;
      bobGroup.position.y = -0.1 + Math.sin(adjustedTime * 1.6 + 2.0) * 0.06;
      eveGroup.position.y = 2.4 + Math.sin(adjustedTime * 1.2) * 0.08;

      // Photon packet flow
      for (let i = 0; i < photonCount; i++) {
        const progress = ((adjustedTime * 0.18 + i / photonCount) % 1);
        photonGeos[i].position.copy(channelCurve.getPointAt(progress));
      }

      // Shield animation
      shieldGroup.rotation.y = Math.sin(adjustedTime * 0.4) * 0.06;

      // Scroll camera choreography
      const isMobile = (container.clientWidth || window.innerWidth) < 768;
      const baseDistance = isMobile ? 9.8 : 7.6;

      if (s < 0.28) {
        const p = s / 0.28;
        camera.position.x = THREE.MathUtils.lerp(0, -2.4, p);
        camera.position.y = THREE.MathUtils.lerp(0.35, 0.5, p);
        camera.position.z = THREE.MathUtils.lerp(baseDistance, baseDistance * 0.82, p);
        cameraTarget.set(THREE.MathUtils.lerp(0, -1.8, p), THREE.MathUtils.lerp(0.1, 0.2, p), 0);
        focusLight.intensity = THREE.MathUtils.lerp(2.5, 3.2, p);
        focusLight.position.x = THREE.MathUtils.lerp(0, -2.5, p);
      } else if (s < 0.62) {
        const p = (s - 0.28) / (0.62 - 0.28);
        camera.position.x = THREE.MathUtils.lerp(-2.4, 0, p);
        camera.position.y = THREE.MathUtils.lerp(0.5, 1.8, p);
        camera.position.z = THREE.MathUtils.lerp(baseDistance * 0.82, baseDistance * 0.88, p);
        cameraTarget.set(THREE.MathUtils.lerp(-1.8, 0, p), THREE.MathUtils.lerp(0.2, 1.0, p), THREE.MathUtils.lerp(0, -0.8, p));
        shieldGroup.rotation.y = adjustedTime * 0.4 + p * Math.PI;
        focusLight.intensity = 3.5;
        focusLight.position.set(0, 4.5, 1.0);
      } else {
        const p = (s - 0.62) / (1.0 - 0.62);
        camera.position.x = THREE.MathUtils.lerp(0, 2.5, p);
        camera.position.y = THREE.MathUtils.lerp(1.8, 0.4, p);
        camera.position.z = THREE.MathUtils.lerp(baseDistance * 0.88, baseDistance * 0.84, p);
        cameraTarget.set(THREE.MathUtils.lerp(0, 1.8, p), THREE.MathUtils.lerp(1.0, 0.1, p), 0);
        qubitLight.intensity = 2.5 + p * 2.0;
        focusLight.intensity = 3.2;
        focusLight.position.x = 2.5;
      }

      camera.lookAt(cameraTarget);

      if (!prefersReducedMotion) {
        mouse.x += (mouse.targetX - mouse.x) * 0.04;
        mouse.y += (mouse.targetY - mouse.y) * 0.04;
        sceneContent.rotation.y = mouse.x * 0.12;
        sceneContent.rotation.x = -mouse.y * 0.07;
        nebulaGroup.position.x = -mouse.x * 0.4;
        nebulaGroup.position.y = mouse.y * 0.25;
      }

      renderer.render(scene, camera);
    };

    animate();
    setIsLoaded(true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  if (!hasWebGL) {
    return <FallbackScene />;
  }

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-[#040308]">
      <div
        ref={containerRef}
        className={`w-full h-full min-h-screen transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 shadow-[inset_0_0_160px_rgba(4,3,8,0.95)]"
        aria-hidden="true"
      />
    </div>
  );
}
