"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { QubitRecord } from "@/lib/bb84";
import { MODEL_URLS, loadModelCached, getCachedModel } from "@/lib/modelCache";

export type SimulationStage =
  | "idle"
  | "prep"
  | "transmission"
  | "eve_intercept"
  | "bob_measure"
  | "reconcile"
  | "error_detection"
  | "completed";

interface SimulationSceneProps {
  stage: SimulationStage;
  progress: number;
  currentQubit: QubitRecord | null;
  eveEnabled: boolean;
  qubitIndex: number;
  totalQubits: number;
}

export default function SimulationScene({
  stage,
  progress,
  currentQubit,
  eveEnabled,
  qubitIndex,
  totalQubits,
}: SimulationSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 3D Entities
  const qubiGroupRef = useRef<THREE.Group | null>(null);
  const eveBeamRef = useRef<THREE.Mesh | null>(null);
  const eveLightRef = useRef<THREE.PointLight | null>(null);
  const aliceEmitterRef = useRef<THREE.Mesh | null>(null);
  const shieldRef = useRef<THREE.Group | null>(null);
  const disturbanceParticlesRef = useRef<THREE.Points | null>(null);
  const activePhotonRef = useRef<THREE.PointLight | null>(null);
  const eveRouteMatRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const directChannelMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Target X position for Qubi
  const targetQubiXRef = useRef<number>(-2.8);

  useEffect(() => {
    let targetX = -2.8;
    const isIntercepted = currentQubit?.eveIntercepted ?? false;

    if (stage === "idle") {
      targetX = -2.8;
    } else if (stage === "prep") {
      targetX = -3.2; // at Alice
    } else if (stage === "transmission") {
      // If intercepted, Qubi moves to Eve at center (0.0).
      // If NOT intercepted, Qubi moves directly along channel towards Bob (1.8).
      targetX = isIntercepted ? 0.0 : 1.8;
    } else if (stage === "eve_intercept") {
      // Eve intercepts and measures at center
      targetX = 0.0;
    } else if (stage === "bob_measure") {
      // At Bob's detector
      targetX = 3.2;
    } else if (stage === "reconcile" || stage === "error_detection") {
      targetX = 0.0;
    } else if (stage === "completed") {
      targetX = 3.2;
    }
    targetQubiXRef.current = targetX;
  }, [stage, progress, currentQubit]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040308);
    scene.fog = new THREE.FogExp2(0x040308, 0.02);

    const width = container.clientWidth || 1000;
    const height = container.clientHeight || 640;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 70);
    camera.position.set(0, 0.5, 8.2);
    camera.lookAt(0, 0.15, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    container.replaceChildren(renderer.domElement);

    // --- High-Contrast Cinematic Lighting ---
    const ambientLight = new THREE.AmbientLight(0x130e28, 1.8);
    scene.add(ambientLight);

    const mainKeyLight = new THREE.DirectionalLight(0xffffff, 2.6);
    mainKeyLight.position.set(2, 6, 5);
    scene.add(mainKeyLight);

    const frontFill = new THREE.DirectionalLight(0xe0e7ff, 1.4);
    frontFill.position.set(0, 2, 6);
    scene.add(frontFill);

    const rimVioletLeft = new THREE.DirectionalLight(0x9333ea, 4.5);
    rimVioletLeft.position.set(-6, 3, -2);
    scene.add(rimVioletLeft);

    const rimVioletRight = new THREE.DirectionalLight(0xa855f7, 4.5);
    rimVioletRight.position.set(6, 3, -2);
    scene.add(rimVioletRight);

    // Active Photon Light travelling with Qubi
    const photonLight = new THREE.PointLight(0xc084fc, 3.0, 5);
    photonLight.position.set(0, 0.3, 0.5);
    scene.add(photonLight);
    activePhotonRef.current = photonLight;

    // --- Background Stars & Particles ---
    const starCount = 900;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 28;
      starPos[i + 1] = (Math.random() - 0.5) * 16;
      starPos[i + 2] = -6 + Math.random() * 10;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xddd6fe, size: 0.045, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // --- Horizontal Direct Quantum Channel Line ---
    const channelGroup = new THREE.Group();
    scene.add(channelGroup);

    const channelCurve = new THREE.LineCurve3(new THREE.Vector3(-3.8, 0, 0), new THREE.Vector3(3.8, 0, 0));
    const channelTubeGeo = new THREE.TubeGeometry(channelCurve, 64, 0.028, 12, false);
    const channelTubeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 });
    directChannelMatRef.current = channelTubeMat;
    const channelTube = new THREE.Mesh(channelTubeGeo, channelTubeMat);
    channelGroup.add(channelTube);

    const channelSheathGeo = new THREE.TubeGeometry(channelCurve, 48, 0.075, 8, false);
    const channelSheathMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.22, wireframe: true });
    const channelSheath = new THREE.Mesh(channelSheathGeo, channelSheathMat);
    channelGroup.add(channelSheath);

    // --- Eve Interception Route (Arc Diversion to Eve) ---
    const eveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.8, 0, 0),
      new THREE.Vector3(-0.9, 0.28, -0.15),
      new THREE.Vector3(0, 0.42, -0.2),
      new THREE.Vector3(0.9, 0.28, -0.15),
      new THREE.Vector3(1.8, 0, 0),
    ]);
    const eveTubeGeo = new THREE.TubeGeometry(eveCurve, 48, 0.026, 10, false);
    const eveTubeMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.08 });
    eveRouteMatRef.current = eveTubeMat;
    const eveTubeMesh = new THREE.Mesh(eveTubeGeo, eveTubeMat);
    scene.add(eveTubeMesh);

    const eveSheathGeo = new THREE.TubeGeometry(eveCurve, 36, 0.065, 8, false);
    const eveSheathMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.04, wireframe: true });
    const eveSheathMesh = new THREE.Mesh(eveSheathGeo, eveSheathMat);
    scene.add(eveSheathMesh);

    const pulseCount = 12;
    const pulseGeos: THREE.Mesh[] = [];
    const sphereNodeGeo = new THREE.SphereGeometry(0.065, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xede9fe });
    for (let i = 0; i < pulseCount; i++) {
      const pMesh = new THREE.Mesh(sphereNodeGeo, pulseMat);
      channelGroup.add(pMesh);
      pulseGeos.push(pMesh);
    }

    // --- Holographic Geometric Shield Motif ---
    const shieldGroup = new THREE.Group();
    shieldRef.current = shieldGroup;
    shieldGroup.position.set(0, 0.55, -0.9);

    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 2.0);
    shieldShape.lineTo(1.5, 1.5);
    shieldShape.lineTo(1.4, -0.7);
    shieldShape.lineTo(0, -2.0);
    shieldShape.lineTo(-1.4, -0.7);
    shieldShape.lineTo(-1.5, 1.5);
    shieldShape.closePath();

    const shieldExtrude = new THREE.ExtrudeGeometry(shieldShape, { depth: 0.05, bevelEnabled: false });
    shieldExtrude.center();
    const shieldWireMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true, transparent: true, opacity: 0.35 });
    const shieldWire = new THREE.Mesh(shieldExtrude, shieldWireMat);
    shieldGroup.add(shieldWire);

    const shieldRingGeo = new THREE.TorusGeometry(2.1, 0.02, 12, 48);
    const shieldRingMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 });
    const shieldRing = new THREE.Mesh(shieldRingGeo, shieldRingMat);
    shieldGroup.add(shieldRing);
    scene.add(shieldGroup);

    // --- Character Groups (ONLY USER GLB MODELS - NO PROCEDURAL PLACEHOLDERS!) ---
    // 1. Alice Group (Left)
    const aliceGroup = new THREE.Group();
    aliceGroup.position.set(-3.7, -0.65, 0);
    scene.add(aliceGroup);

    const aliceEmitter = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }));
    aliceEmitter.position.set(0.5, 0.35, 0.2);
    aliceGroup.add(aliceEmitter);
    aliceEmitterRef.current = aliceEmitter;

    // 2. Eve Group (Center - Lowered so face is clear)
    const eveGroup = new THREE.Group();
    eveGroup.position.set(0, 0.45, -0.4);
    scene.add(eveGroup);

    const beamGeo = new THREE.CylinderGeometry(0.05, 0.16, 1.3, 16);
    beamGeo.translate(0, -0.65, 0);
    const beamMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.0 });
    const eveBeam = new THREE.Mesh(beamGeo, beamMat);
    eveBeam.position.set(0, 0.2, 0.3);
    eveGroup.add(eveBeam);
    eveBeamRef.current = eveBeam;

    const eveLight = new THREE.PointLight(0xf43f5e, 0, 5);
    eveLight.position.set(0, 0.2, 0.3);
    eveGroup.add(eveLight);
    eveLightRef.current = eveLight;

    const distCount = 80;
    const distGeo = new THREE.BufferGeometry();
    const distPos = new Float32Array(distCount * 3);
    for (let i = 0; i < distCount * 3; i += 3) {
      distPos[i] = (Math.random() - 0.5) * 1.0;
      distPos[i + 1] = (Math.random() - 0.5) * 1.0;
      distPos[i + 2] = (Math.random() - 0.5) * 1.0;
    }
    distGeo.setAttribute("position", new THREE.BufferAttribute(distPos, 3));
    const distMat = new THREE.PointsMaterial({ color: 0xfb7185, size: 0.055, transparent: true, opacity: 0 });
    const distPoints = new THREE.Points(distGeo, distMat);
    distPoints.position.set(0, 0, 0);
    scene.add(distPoints);
    disturbanceParticlesRef.current = distPoints;

    // 3. Bob Group (Right)
    const bobGroup = new THREE.Group();
    bobGroup.position.set(3.7, -0.65, 0);
    scene.add(bobGroup);

    // 4. Qubi Group (Hamster Qubit Carrier)
    const qubiGroup = new THREE.Group();
    qubiGroup.position.set(-2.8, -0.05, 0.3);
    scene.add(qubiGroup);
    qubiGroupRef.current = qubiGroup;

    // --- INSTANT CACHED MODEL MOUNTING (NO LAGGING, NO PROCEDURAL PLACEHOLDERS) ---
    function attachModel(url: string, targetGroup: THREE.Group, scale: number, yOffset = 0) {
      function mount(model: THREE.Group) {
        model.scale.setScalar(scale);
        model.position.y = yOffset;
        targetGroup.add(model);
      }

      // Check synchronous cache first (0ms instantaneous!)
      const cached = getCachedModel(url);
      if (cached) {
        mount(cached);
      } else {
        loadModelCached(url)
          .then((model) => mount(model))
          .catch((err) => console.error("Could not load model:", url, err));
      }
    }

    attachModel(MODEL_URLS.alice, aliceGroup, 1.45, 0.0);
    attachModel(MODEL_URLS.eve, eveGroup, 1.35, 0.0);
    attachModel(MODEL_URLS.bob, bobGroup, 1.45, 0.0);
    attachModel(MODEL_URLS.hamster, qubiGroup, 0.95, 0.0);

    // --- Render Loop ---
    let animId: number;
    const startTime = performance.now();

    const render = () => {
      animId = requestAnimationFrame(render);
      const time = (performance.now() - startTime) * 0.001;

      // Smooth horizontal travel of Qubi along channel
      if (qubiGroupRef.current) {
        const currentX = qubiGroupRef.current.position.x;
        const targetX = targetQubiXRef.current;
        qubiGroupRef.current.position.x += (targetX - currentX) * 0.12;
        qubiGroupRef.current.position.y = -0.05 + Math.sin(time * 3.5) * 0.08;

        if (activePhotonRef.current) {
          activePhotonRef.current.position.x = qubiGroupRef.current.position.x;
          activePhotonRef.current.position.y = qubiGroupRef.current.position.y + 0.3;
        }
      }

      // Channel pulse nodes
      for (let i = 0; i < pulseCount; i++) {
        const offset = ((time * 0.35 + i / pulseCount) % 1);
        pulseGeos[i].position.x = -3.8 + offset * 7.6;
        pulseGeos[i].position.y = Math.sin(offset * Math.PI) * 0.05;
        const pScale = 0.8 + Math.sin(time * 5 + i) * 0.3;
        pulseGeos[i].scale.setScalar(pScale);
      }

      if (shieldRef.current) {
        shieldRef.current.rotation.y = Math.sin(time * 0.4) * 0.08;
      }

      // Dynamic Eve Route vs Direct Channel route illumination
      const isIntercepted = currentQubit?.eveIntercepted ?? false;
      const isQubitStage = stage === "prep" || stage === "transmission" || stage === "eve_intercept" || stage === "bob_measure";

      if (eveRouteMatRef.current && directChannelMatRef.current) {
        if (isIntercepted && isQubitStage) {
          // Eve route shines brightly in rose
          eveRouteMatRef.current.opacity += (0.8 - eveRouteMatRef.current.opacity) * 0.15;
          directChannelMatRef.current.opacity += (0.35 - directChannelMatRef.current.opacity) * 0.15;
        } else {
          // Direct channel shines in cyan, Eve route is dimmed
          eveRouteMatRef.current.opacity += (0.05 - eveRouteMatRef.current.opacity) * 0.15;
          directChannelMatRef.current.opacity += (0.85 - directChannelMatRef.current.opacity) * 0.15;
        }
      }

      // Eve Interception Laser & Sparks (ACTIVE ONLY WHEN EVE ACTUALLY INTERCEPTS)
      const isIntercepting = stage === "eve_intercept" && eveEnabled && isIntercepted;
      if (eveBeamRef.current && eveLightRef.current && disturbanceParticlesRef.current) {
        const targetBeamOpacity = isIntercepting ? 0.9 : 0.0;
        const beamMat = eveBeamRef.current.material as THREE.MeshBasicMaterial;
        beamMat.opacity += (targetBeamOpacity - beamMat.opacity) * 0.2;

        const targetLight = isIntercepting ? 4.5 : 0.0;
        eveLightRef.current.intensity += (targetLight - eveLightRef.current.intensity) * 0.2;

        const distMat = disturbanceParticlesRef.current.material as THREE.PointsMaterial;
        const targetDistOpacity = isIntercepting ? 0.95 : 0.0;
        distMat.opacity += (targetDistOpacity - distMat.opacity) * 0.2;
        if (isIntercepting) {
          disturbanceParticlesRef.current.rotation.y += 0.06;
          disturbanceParticlesRef.current.rotation.x += 0.04;
        }
      }

      if (aliceEmitterRef.current) {
        const emitScale = 1.0 + Math.sin(time * 4.0) * 0.25;
        aliceEmitterRef.current.scale.setScalar(emitScale);
      }

      renderer.render(scene, camera);
    };

    render();
    requestAnimationFrame(() => setIsLoaded(true));

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 1000;
      const newH = container.clientHeight || 640;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [currentQubit, eveEnabled, stage]);

  const getStageDescription = () => {
    if (!currentQubit) return "Ready to start simulation";
    switch (stage) {
      case "idle":
        return `Ready — Qubit #${qubitIndex + 1} of ${totalQubits}`;
      case "prep":
        return `01 Alice Prepares: Encoding Bit [${currentQubit.aliceBit}] with Basis [${currentQubit.aliceBasis}]`;
      case "transmission":
        return currentQubit.eveIntercepted
          ? `02 Transmission: In transit along channel — Routing through Eve's intercept zone`
          : `02 Transmission: Direct transit to Bob (Channel uncompromised — Eve skipped)`;
      case "eve_intercept":
        return `03 Eve Intercepts: Measured in [${currentQubit.eveBasis}] basis → Resending [${currentQubit.eveMeasuredBit}]`;
      case "bob_measure":
        return `04 Bob Measures: Measuring in [${currentQubit.bobBasis}] basis → Got [${currentQubit.bobMeasuredBit}]`;
      case "reconcile":
        return `05 Basis Reconciliation: Publicly comparing Alice & Bob bases across all ${totalQubits} qubits`;
      case "error_detection":
        return `06 Error Detection: Comparing public test sample to detect eavesdropping (calculating QBER)...`;
      case "completed":
        return `Protocol Complete: Analysis finished across all ${totalQubits} transmitted qubits`;
      default:
        return "Quantum channel active";
    }
  };

  const isCurrentIntercepted = currentQubit?.eveIntercepted ?? false;
  const isQubitStage = stage === "prep" || stage === "transmission" || stage === "eve_intercept" || stage === "bob_measure";

  return (
    <div className="relative w-full h-[520px] sm:h-[600px] md:h-[660px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#040308] shadow-[0_0_60px_rgba(147,51,234,0.12)]">
      <div
        ref={containerRef}
        className={`w-full h-full transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Atmospheric Vignette */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_90px_rgba(4,3,8,0.95)]" />

      {/* Top Center Live Quantum Action Status Banner */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border border-violet-500/30 bg-[#070614]/90 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.25)] flex items-center space-x-3 pointer-events-none z-10 max-w-[90%] text-center">
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 animate-ping ${
            stage === "eve_intercept" && isCurrentIntercepted
              ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]"
              : stage === "error_detection"
              ? "bg-amber-400 shadow-[0_0_8px_#fbbf24]"
              : stage === "reconcile"
              ? "bg-indigo-400 shadow-[0_0_8px_#818cf8]"
              : "bg-violet-400 shadow-[0_0_8px_#c084fc]"
          }`}
        />
        <span className="text-xs font-mono font-medium tracking-wide text-zinc-200 truncate">
          {getStageDescription()}
        </span>
      </div>

      {/* Active Route Indicator Pill */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-none z-10 transition-all duration-300">
        {currentQubit && isQubitStage ? (
          isCurrentIntercepted ? (
            <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono font-medium px-3.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
              <span>Route: Alice ──► Eve Intercept (Measured &amp; Resent) ──► Bob</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono font-medium px-3.5 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.25)] backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span>Route: Alice ────────────────────────► Bob (Direct — Eve Skipped)</span>
            </div>
          )
        ) : stage === "reconcile" ? (
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono font-medium px-3.5 py-1 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shrink-0" />
            <span>Stage 05: Public Basis Reconciliation</span>
          </div>
        ) : stage === "error_detection" ? (
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono font-medium px-3.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span>Stage 06: Public Test Bit Verification &amp; QBER Calculation</span>
          </div>
        ) : null}
      </div>

      {/* Character Legend Labels */}
      <div className="pointer-events-none absolute bottom-5 left-8 flex items-center space-x-2 text-xs tracking-[0.2em] uppercase text-cyan-400 font-semibold bg-black/40 px-3 py-1.5 rounded-md border border-cyan-500/20 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        <span>Alice</span>
      </div>

      <div className="pointer-events-none absolute top-5 right-8 flex items-center space-x-2 text-xs tracking-[0.2em] uppercase font-semibold text-rose-400 bg-black/40 px-3 py-1.5 rounded-md border border-rose-500/20 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
        <span>Eve (Eavesdropper)</span>
      </div>

      <div className="pointer-events-none absolute bottom-5 right-8 flex items-center space-x-2 text-xs tracking-[0.2em] uppercase text-violet-400 font-semibold bg-black/40 px-3 py-1.5 rounded-md border border-violet-500/20 backdrop-blur-sm">
        <span>Bob</span>
        <span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_8px_#a855f7]" />
      </div>

      {/* Central Qubi Carrier Indicator */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center space-x-2 text-xs tracking-[0.2em] uppercase text-amber-300 font-semibold bg-black/40 px-3 py-1.5 rounded-md border border-amber-500/20 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fde047]" />
        <span>Qubi (Qubit Carrier)</span>
      </div>
    </div>
  );
}
