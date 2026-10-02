import * as THREE from "three";

/**
 * Creates the secondary characters (Alice, Bob, Eve),
 * the glowing quantum communication channel, holographic shield motif,
 * and atmospheric cosmic nebula / particles.
 */

export interface SceneElements {
  aliceGroup: THREE.Group;
  bobGroup: THREE.Group;
  eveGroup: THREE.Group;
  channelGroup: THREE.Group;
  shieldGroup: THREE.Group;
  particles: THREE.Points;
  nebulaGroup: THREE.Group;
  update: (time: number) => void;
}

export function createQuantumSceneElements(): SceneElements {
  // --- Common Character Materials ---
  const darkChassisMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x090714,
    roughness: 0.15,
    metalness: 0.85,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  });

  const chromeAccentMaterial = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.25,
    metalness: 0.9,
  });

  // --- Alice (Sender / Quantum Transmitter) ---
  const aliceGroup = new THREE.Group();
  aliceGroup.name = "Alice";
  aliceGroup.position.set(-4.2, -0.1, -0.8);
  aliceGroup.rotation.y = 0.55; // Facing slightly toward the center

  // Alice Body / Torso
  const aliceTorsoGeo = new THREE.CylinderGeometry(0.35, 0.5, 1.6, 24);
  const aliceTorso = new THREE.Mesh(aliceTorsoGeo, darkChassisMaterial);
  aliceGroup.add(aliceTorso);

  // Alice Head / Helmet
  const aliceHeadGeo = new THREE.SphereGeometry(0.42, 24, 24);
  aliceHeadGeo.scale(0.9, 1.15, 1.0);
  const aliceHead = new THREE.Mesh(aliceHeadGeo, darkChassisMaterial);
  aliceHead.position.set(0, 1.1, 0);
  aliceGroup.add(aliceHead);

  // Alice Visor / Cyan-Violet Photon Emitter
  const aliceVisorGeo = new THREE.TorusGeometry(0.26, 0.05, 12, 32, Math.PI);
  const aliceVisorMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const aliceVisor = new THREE.Mesh(aliceVisorGeo, aliceVisorMat);
  aliceVisor.position.set(0, 1.1, 0.3);
  aliceVisor.rotation.x = Math.PI / 2;
  aliceGroup.add(aliceVisor);

  // Alice Transmitter Array / Wand
  const transmitterPoleGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.2, 12);
  const transmitterPole = new THREE.Mesh(transmitterPoleGeo, chromeAccentMaterial);
  transmitterPole.position.set(0.45, 0.5, 0.4);
  transmitterPole.rotation.z = -0.3;
  aliceGroup.add(transmitterPole);

  const emitterBeaconGeo = new THREE.IcosahedronGeometry(0.18, 1);
  const emitterBeaconMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
  const emitterBeacon = new THREE.Mesh(emitterBeaconGeo, emitterBeaconMat);
  emitterBeacon.position.set(0.65, 1.05, 0.4);
  aliceGroup.add(emitterBeacon);

  const aliceLight = new THREE.PointLight(0x38bdf8, 1.2, 3.5);
  aliceLight.position.set(0.65, 1.05, 0.4);
  aliceGroup.add(aliceLight);

  // Alice Hovering Base
  const baseRingGeo = new THREE.TorusGeometry(0.65, 0.03, 12, 36);
  const baseRingMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.6 });
  const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
  baseRing.position.set(0, -0.9, 0);
  baseRing.rotation.x = Math.PI / 2;
  aliceGroup.add(baseRing);

  // --- Bob (Receiver / Quantum Detector) ---
  const bobGroup = new THREE.Group();
  bobGroup.name = "Bob";
  bobGroup.position.set(4.2, -0.1, -0.8);
  bobGroup.rotation.y = -0.55; // Facing slightly toward the center

  // Bob Body / Torso
  const bobTorsoGeo = new THREE.CylinderGeometry(0.38, 0.52, 1.6, 24);
  const bobTorso = new THREE.Mesh(bobTorsoGeo, darkChassisMaterial);
  bobGroup.add(bobTorso);

  // Bob Head
  const bobHeadGeo = new THREE.SphereGeometry(0.44, 24, 24);
  bobHeadGeo.scale(0.95, 1.1, 1.0);
  const bobHead = new THREE.Mesh(bobHeadGeo, darkChassisMaterial);
  bobHead.position.set(0, 1.1, 0);
  bobGroup.add(bobHead);

  // Bob Detector Visor / Violet-Indigo Sensor
  const bobVisorMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
  const bobVisorGeo = new THREE.BoxGeometry(0.5, 0.12, 0.25);
  const bobVisor = new THREE.Mesh(bobVisorGeo, bobVisorMat);
  bobVisor.position.set(0, 1.12, 0.32);
  bobGroup.add(bobVisor);

  // Bob Quantum Polarization Detector Rings
  const detectorRingGeo = new THREE.TorusGeometry(0.35, 0.02, 12, 32);
  const detectorRingMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.85 });
  const detectorRing1 = new THREE.Mesh(detectorRingGeo, detectorRingMat);
  detectorRing1.position.set(-0.55, 0.5, 0.35);
  detectorRing1.rotation.y = Math.PI / 3;
  bobGroup.add(detectorRing1);

  const detectorRing2 = new THREE.Mesh(detectorRingGeo, detectorRingMat);
  detectorRing2.position.set(-0.55, 0.5, 0.35);
  detectorRing2.rotation.x = Math.PI / 4;
  bobGroup.add(detectorRing2);

  const bobLight = new THREE.PointLight(0xa855f7, 1.2, 3.5);
  bobLight.position.set(-0.55, 0.5, 0.35);
  bobGroup.add(bobLight);

  // Bob Hovering Base
  const bobBaseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
  bobBaseRing.position.set(0, -0.9, 0);
  bobBaseRing.rotation.x = Math.PI / 2;
  bobGroup.add(bobBaseRing);

  // --- Eve (Subtle Eavesdropper in Background) ---
  const eveGroup = new THREE.Group();
  eveGroup.name = "Eve";
  eveGroup.position.set(0, 2.6, -3.5);

  const eveStealthMat = new THREE.MeshPhysicalMaterial({
    color: 0x05040a,
    roughness: 0.2,
    metalness: 0.95,
    clearcoat: 0.9,
    transparent: true,
    opacity: 0.82,
  });

  // Eve Silhouetted Hood / Cowl
  const eveCowlGeo = new THREE.ConeGeometry(0.55, 1.4, 24);
  const eveCowl = new THREE.Mesh(eveCowlGeo, eveStealthMat);
  eveGroup.add(eveCowl);

  // Eve Mask / Visor with subtle mysterious amber-magenta tap
  const eveVisorMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
  const eveVisorGeo = new THREE.TorusGeometry(0.18, 0.025, 8, 24, Math.PI);
  const eveVisor = new THREE.Mesh(eveVisorGeo, eveVisorMat);
  eveVisor.position.set(0, 0.2, 0.28);
  eveVisor.rotation.x = Math.PI / 2;
  eveGroup.add(eveVisor);

  // Faint Interception Siphon Beam (descending towards channel)
  const siphonPoints = [
    new THREE.Vector3(0, 0, 0.2),
    new THREE.Vector3(0, -1.2, 1.2),
    new THREE.Vector3(0, -2.2, 2.5),
  ];
  const siphonCurve = new THREE.CatmullRomCurve3(siphonPoints);
  const siphonGeo = new THREE.TubeGeometry(siphonCurve, 20, 0.015, 8, false);
  const siphonMat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    transparent: true,
    opacity: 0.35,
    wireframe: true,
  });
  const siphonBeam = new THREE.Mesh(siphonGeo, siphonMat);
  eveGroup.add(siphonBeam);

  // --- Quantum Communication Channel Path ---
  const channelGroup = new THREE.Group();
  channelGroup.name = "QuantumChannel";

  // Spline connecting Alice -> Hamster (holding qubit) -> Bob
  const pathPoints = [
    new THREE.Vector3(-4.0, 0.3, -0.6),
    new THREE.Vector3(-2.2, 0.4, 0.4),
    new THREE.Vector3(0, 0.0, 1.5), // Passes through qubit core
    new THREE.Vector3(2.2, 0.4, 0.4),
    new THREE.Vector3(4.0, 0.3, -0.6),
  ];
  const channelCurve = new THREE.CatmullRomCurve3(pathPoints);

  // Luminous main channel tube
  const channelTubeGeo = new THREE.TubeGeometry(channelCurve, 64, 0.02, 12, false);
  const channelTubeMat = new THREE.MeshBasicMaterial({
    color: 0xa855f7,
    transparent: true,
    opacity: 0.65,
  });
  const channelTube = new THREE.Mesh(channelTubeGeo, channelTubeMat);
  channelGroup.add(channelTube);

  // Outer glowing beam sheath
  const channelSheathGeo = new THREE.TubeGeometry(channelCurve, 64, 0.05, 8, false);
  const channelSheathMat = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.18,
    wireframe: true,
  });
  const channelSheath = new THREE.Mesh(channelSheathGeo, channelSheathMat);
  channelGroup.add(channelSheath);

  // Flowing Photon Packets along channel
  const photonCount = 14;
  const photonGeos: THREE.Mesh[] = [];
  const photonSphereGeo = new THREE.SphereGeometry(0.065, 12, 12);
  const photonMat = new THREE.MeshBasicMaterial({ color: 0xe0e7ff });

  for (let i = 0; i < photonCount; i++) {
    const photon = new THREE.Mesh(photonSphereGeo, photonMat);
    channelGroup.add(photon);
    photonGeos.push(photon);
  }

  // --- Holographic Security Shield (QubiShield Motif) ---
  const shieldGroup = new THREE.Group();
  shieldGroup.name = "QubiShieldHologram";
  shieldGroup.position.set(0, 0.25, 0.6);

  // Faceted 3D Shield Outline Geometry
  const shieldShape = new THREE.Shape();
  // Drawing clean modern geometric shield silhouette
  shieldShape.moveTo(0, 1.4);
  shieldShape.lineTo(0.9, 1.1);
  shieldShape.lineTo(0.85, -0.3);
  shieldShape.lineTo(0, -1.35);
  shieldShape.lineTo(-0.85, -0.3);
  shieldShape.lineTo(-0.9, 1.1);
  shieldShape.closePath();

  const extrudeSettings = {
    steps: 1,
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 3,
  };

  const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
  shieldGeo.center();

  // Translucent holographic glass
  const shieldGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x7c3aed,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.4,
    transparent: true,
    opacity: 0.22,
    ior: 1.45,
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldGlassMat);
  shieldGroup.add(shieldMesh);

  // Wireframe facet edges
  const shieldWireMat = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    wireframe: true,
    transparent: true,
    opacity: 0.45,
  });
  const shieldWire = new THREE.Mesh(shieldGeo, shieldWireMat);
  shieldWire.scale.set(1.02, 1.02, 1.02);
  shieldGroup.add(shieldWire);

  // Floating concentric shield quantum ring
  const shieldRingGeo = new THREE.TorusGeometry(1.4, 0.015, 12, 48);
  const shieldRingMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.5,
  });
  const shieldRing = new THREE.Mesh(shieldRingGeo, shieldRingMat);
  shieldGroup.add(shieldRing);

  // Scale shield to elegantly frame the quantum channel
  shieldGroup.scale.set(1.7, 1.7, 1.7);

  // --- Atmospheric Nebula Planes & Particles ---
  const nebulaGroup = new THREE.Group();
  nebulaGroup.name = "CosmicAtmosphere";

  // Create subtle procedural canvas texture for nebula haze
  function createNebulaTexture(color: string, radius = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = radius * 2;
    canvas.height = radius * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.4, color.replace("1)", "0.25)"));
      gradient.addColorStop(0.8, color.replace("1)", "0.06)"));
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, radius * 2, radius * 2);
    }
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  // Nebula Cloud Billboards matching reference image's atmospheric glow
  const nebulaMat1 = new THREE.MeshBasicMaterial({
    map: createNebulaTexture("rgba(147, 51, 234, 1)"), // Electric violet
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nebulaPlane1 = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), nebulaMat1);
  nebulaPlane1.position.set(0, 1.2, -6.0);
  nebulaGroup.add(nebulaPlane1);

  const nebulaMat2 = new THREE.MeshBasicMaterial({
    map: createNebulaTexture("rgba(67, 56, 202, 1)"), // Deep Indigo
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nebulaPlane2 = new THREE.Mesh(new THREE.PlaneGeometry(18, 14), nebulaMat2);
  nebulaPlane2.position.set(-2, -0.5, -7.5);
  nebulaGroup.add(nebulaPlane2);

  const nebulaMat3 = new THREE.MeshBasicMaterial({
    map: createNebulaTexture("rgba(192, 132, 252, 1)"), // Soft Lavender Core
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nebulaPlane3 = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), nebulaMat3);
  nebulaPlane3.position.set(0, 0.4, -4.5);
  nebulaGroup.add(nebulaPlane3);

  // Cosmic Dust & Starfield Particles
  const particleCount = 1800;
  const particlePositions = new Float32Array(particleCount * 3);
  const particleScales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    // Disperse broadly across deep z and wide x/y
    particlePositions[i3] = (Math.random() - 0.5) * 26;
    particlePositions[i3 + 1] = (Math.random() - 0.5) * 16;
    particlePositions[i3 + 2] = -10 + Math.random() * 15;
    particleScales[i] = Math.random();
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));

  // Custom particle material
  const particleMat = new THREE.PointsMaterial({
    color: 0xddd6fe,
    size: 0.055,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  nebulaGroup.add(particles);

  // --- Animation Update Function ---
  const update = (time: number) => {
    // Alice subtle floating & transmitter pulse
    aliceGroup.position.y = -0.1 + Math.sin(time * 1.6 + 0.5) * 0.08;
    baseRing.rotation.z += 0.008;
    emitterBeacon.rotation.y += 0.03;
    emitterBeacon.rotation.x += 0.02;

    // Bob subtle floating & detector spin
    bobGroup.position.y = -0.1 + Math.sin(time * 1.6 + 2.0) * 0.08;
    bobBaseRing.rotation.z -= 0.008;
    detectorRing1.rotation.y += 0.015;
    detectorRing2.rotation.x += 0.02;

    // Eve subtle hovering in the shadowy background
    eveGroup.position.y = 2.6 + Math.sin(time * 1.2) * 0.09;
    eveVisor.scale.setScalar(1 + Math.sin(time * 2.8) * 0.08);

    // Photon packets travel from Alice -> Hamster -> Bob
    for (let i = 0; i < photonCount; i++) {
      const progress = ((time * 0.18 + i / photonCount) % 1);
      const point = channelCurve.getPointAt(progress);
      photonGeos[i].position.copy(point);

      // Subtle scale pulse
      const pScale = 0.8 + Math.sin(time * 4 + i) * 0.3;
      photonGeos[i].scale.setScalar(pScale);
    }

    // Shield subtle breathing and slow rotation
    shieldGroup.rotation.y = Math.sin(time * 0.4) * 0.06;
    shieldGroup.rotation.z = Math.cos(time * 0.5) * 0.03;
    shieldRing.rotation.z += 0.006;
    const shieldPulse = 1.68 + Math.sin(time * 1.8) * 0.04;
    shieldGroup.scale.set(shieldPulse, shieldPulse, shieldPulse);

    // Slow drift of cosmic dust
    particles.rotation.y = time * 0.012;
    particles.rotation.x = Math.sin(time * 0.008) * 0.04;
  };

  return {
    aliceGroup,
    bobGroup,
    eveGroup,
    channelGroup,
    shieldGroup,
    particles,
    nebulaGroup,
    update,
  };
}
