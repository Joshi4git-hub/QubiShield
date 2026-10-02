import * as THREE from "three";

/**
 * Creates a sophisticated, adorable 3D procedural Hamster model
 * representing the Qubit in QubiShield.
 *
 * Characteristics:
 * - Cream-colored body with soft velvety fur shading
 * - Chubby cheeks, sweet expressive eyes with specular catchlights
 * - Pink nose, inner ears, and paws
 * - Gently cradles a glowing quantum qubit sphere with orbital rings
 * - Electric violet rim lighting compatibility
 */
export interface HamsterComponents {
  root: THREE.Group;
  qubitCore: THREE.Mesh;
  qubitShell: THREE.Mesh;
  orbitRing1: THREE.Mesh;
  orbitRing2: THREE.Mesh;
  qubitLight: THREE.PointLight;
  leftEye: THREE.Mesh;
  rightEye: THREE.Mesh;
  leftEar: THREE.Group;
  rightEar: THREE.Group;
  headGroup: THREE.Group;
  bodyGroup: THREE.Group;
  update: (time: number) => void;
}

export function createHamster(): HamsterComponents {
  const root = new THREE.Group();
  root.name = "QubitHamster";

  // --- Materials ---
  // Cream velvety fur
  const furMaterial = new THREE.MeshStandardMaterial({
    color: 0xfcf6ed,
    roughness: 0.62,
    metalness: 0.04,
  });

  // Soft lighter belly patch
  const bellyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.72,
    metalness: 0.02,
  });

  // Cute pink accents (inner ears, nose, paws)
  const pinkMaterial = new THREE.MeshStandardMaterial({
    color: 0xffa4be,
    roughness: 0.5,
    metalness: 0.05,
  });

  // Glossy expressive obsidian eyes
  const eyeMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x07050d,
    roughness: 0.08,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  // Catchlight for eyes
  const catchlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });

  // Qubit glowing core material
  const qubitCoreMaterial = new THREE.MeshBasicMaterial({
    color: 0xd8b4fe, // Electric light violet
  });

  // Qubit translucent crystal shell
  const qubitShellMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xa855f7,
    roughness: 0.05,
    transmission: 0.82,
    thickness: 0.6,
    ior: 1.52,
    transparent: true,
    opacity: 0.85,
  });

  // Orbital rings material
  const ringMaterial1 = new THREE.MeshBasicMaterial({
    color: 0xc084fc,
    wireframe: true,
    transparent: true,
    opacity: 0.8,
  });

  const ringMaterial2 = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, // Subtle cyan-violet entanglement
    wireframe: true,
    transparent: true,
    opacity: 0.7,
  });

  // Whisker material
  const whiskerMaterial = new THREE.LineBasicMaterial({
    color: 0xe2e8f0,
    transparent: true,
    opacity: 0.65,
  });

  // --- Anatomy Hierarchy ---
  const bodyGroup = new THREE.Group();
  const headGroup = new THREE.Group();

  // 1. Torso
  const torsoGeo = new THREE.SphereGeometry(1.2, 36, 36);
  torsoGeo.scale(1.15, 1.25, 1.08);
  const torso = new THREE.Mesh(torsoGeo, furMaterial);
  torso.position.set(0, -0.2, 0);
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  // 2. Belly (soft white rounded oval patch)
  const bellyGeo = new THREE.SphereGeometry(0.9, 28, 28);
  bellyGeo.scale(1.0, 1.15, 0.45);
  const belly = new THREE.Mesh(bellyGeo, bellyMaterial);
  belly.position.set(0, -0.22, 0.75);
  bodyGroup.add(belly);

  // 3. Back Feet
  const footGeo = new THREE.SphereGeometry(0.32, 20, 20);
  footGeo.scale(1.2, 0.65, 1.5);
  const leftFoot = new THREE.Mesh(footGeo, pinkMaterial);
  leftFoot.position.set(-0.85, -1.25, 0.35);
  leftFoot.rotation.set(0.1, -0.2, 0.1);
  bodyGroup.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, pinkMaterial);
  rightFoot.position.set(0.85, -1.25, 0.35);
  rightFoot.rotation.set(0.1, 0.2, -0.1);
  bodyGroup.add(rightFoot);

  // 4. Tail
  const tailGeo = new THREE.SphereGeometry(0.28, 16, 16);
  tailGeo.scale(1.0, 1.0, 1.2);
  const tail = new THREE.Mesh(tailGeo, furMaterial);
  tail.position.set(0, -1.0, -1.15);
  bodyGroup.add(tail);

  // 5. Head
  const headGeo = new THREE.SphereGeometry(1.05, 36, 36);
  headGeo.scale(1.12, 1.0, 1.05);
  const head = new THREE.Mesh(headGeo, furMaterial);
  head.castShadow = true;
  head.receiveShadow = true;
  headGroup.add(head);

  // Chubby cheeks
  const cheekGeo = new THREE.SphereGeometry(0.55, 24, 24);
  cheekGeo.scale(1.2, 0.9, 1.0);
  const leftCheek = new THREE.Mesh(cheekGeo, furMaterial);
  leftCheek.position.set(-0.68, -0.22, 0.45);
  headGroup.add(leftCheek);

  const rightCheek = new THREE.Mesh(cheekGeo, furMaterial);
  rightCheek.position.set(0.68, -0.22, 0.45);
  headGroup.add(rightCheek);

  // Snout Mound
  const snoutGeo = new THREE.SphereGeometry(0.42, 24, 24);
  snoutGeo.scale(1.05, 0.8, 1.0);
  const snout = new THREE.Mesh(snoutGeo, furMaterial);
  snout.position.set(0, -0.12, 0.85);
  headGroup.add(snout);

  // Cute Rounded Pink Nose
  const noseGeo = new THREE.SphereGeometry(0.12, 18, 18);
  noseGeo.scale(1.25, 0.95, 0.9);
  const nose = new THREE.Mesh(noseGeo, pinkMaterial);
  nose.position.set(0, -0.05, 1.22);
  headGroup.add(nose);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.22, 24, 24);
  const catchlightGeo = new THREE.SphereGeometry(0.065, 12, 12);
  const catchlightSmallGeo = new THREE.SphereGeometry(0.035, 12, 12);

  // Left Eye
  const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
  leftEye.position.set(-0.48, 0.18, 0.86);
  const leftCatchlight = new THREE.Mesh(catchlightGeo, catchlightMaterial);
  leftCatchlight.position.set(-0.06, 0.08, 0.16);
  leftEye.add(leftCatchlight);
  const leftCatchlight2 = new THREE.Mesh(catchlightSmallGeo, catchlightMaterial);
  leftCatchlight2.position.set(0.06, -0.06, 0.16);
  leftEye.add(leftCatchlight2);
  headGroup.add(leftEye);

  // Right Eye
  const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
  rightEye.position.set(0.48, 0.18, 0.86);
  const rightCatchlight = new THREE.Mesh(catchlightGeo, catchlightMaterial);
  rightCatchlight.position.set(0.06, 0.08, 0.16);
  rightEye.add(rightCatchlight);
  const rightCatchlight2 = new THREE.Mesh(catchlightSmallGeo, catchlightMaterial);
  rightCatchlight2.position.set(-0.06, -0.06, 0.16);
  rightEye.add(rightCatchlight2);
  headGroup.add(rightEye);

  // Ears
  const leftEar = new THREE.Group();
  const rightEar = new THREE.Group();

  const outerEarGeo = new THREE.SphereGeometry(0.42, 24, 24);
  outerEarGeo.scale(1.0, 1.15, 0.28);
  const leftOuterEar = new THREE.Mesh(outerEarGeo, furMaterial);
  leftEar.add(leftOuterEar);

  const innerEarGeo = new THREE.SphereGeometry(0.3, 20, 20);
  innerEarGeo.scale(0.9, 1.05, 0.2);
  const leftInnerEar = new THREE.Mesh(innerEarGeo, pinkMaterial);
  leftInnerEar.position.set(0, 0, 0.08);
  leftEar.add(leftInnerEar);

  leftEar.position.set(-0.8, 0.88, 0.1);
  leftEar.rotation.set(-0.15, 0.2, -0.35);
  headGroup.add(leftEar);

  const rightOuterEar = new THREE.Mesh(outerEarGeo, furMaterial);
  rightEar.add(rightOuterEar);

  const rightInnerEar = new THREE.Mesh(innerEarGeo, pinkMaterial);
  rightInnerEar.position.set(0, 0, 0.08);
  rightEar.add(rightInnerEar);

  rightEar.position.set(0.8, 0.88, 0.1);
  rightEar.rotation.set(-0.15, -0.2, 0.35);
  headGroup.add(rightEar);

  // Whiskers
  function makeWhisker(p1: [number, number, number], p2: [number, number, number]) {
    const points = [new THREE.Vector3(...p1), new THREE.Vector3(...p2)];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geo, whiskerMaterial);
  }

  // Left whiskers
  headGroup.add(makeWhisker([-0.3, -0.12, 1.05], [-1.05, -0.08, 0.95]));
  headGroup.add(makeWhisker([-0.3, -0.16, 1.05], [-1.15, -0.18, 0.88]));
  headGroup.add(makeWhisker([-0.3, -0.2, 1.05], [-1.02, -0.3, 0.85]));

  // Right whiskers
  headGroup.add(makeWhisker([0.3, -0.12, 1.05], [1.05, -0.08, 0.95]));
  headGroup.add(makeWhisker([0.3, -0.16, 1.05], [1.15, -0.18, 0.88]));
  headGroup.add(makeWhisker([0.3, -0.2, 1.05], [1.02, -0.3, 0.85]));

  headGroup.position.set(0, 0.85, 0.15);
  root.add(bodyGroup);
  root.add(headGroup);

  // 6. Front Arms & Paws cradling the Qubit
  const pawGeo = new THREE.SphereGeometry(0.2, 18, 18);
  pawGeo.scale(1.2, 0.8, 1.4);

  const armGeo = new THREE.CylinderGeometry(0.18, 0.24, 0.65, 18);

  // Left Arm & Paw
  const leftArmGroup = new THREE.Group();
  const leftArm = new THREE.Mesh(armGeo, furMaterial);
  leftArm.rotation.set(0.6, 0.2, -0.45);
  leftArmGroup.add(leftArm);
  const leftPaw = new THREE.Mesh(pawGeo, pinkMaterial);
  leftPaw.position.set(0.22, -0.32, 0.28);
  leftPaw.rotation.set(0.2, 0.4, -0.2);
  leftArmGroup.add(leftPaw);
  leftArmGroup.position.set(-0.62, 0.25, 0.55);
  root.add(leftArmGroup);

  // Right Arm & Paw
  const rightArmGroup = new THREE.Group();
  const rightArm = new THREE.Mesh(armGeo, furMaterial);
  rightArm.rotation.set(0.6, -0.2, 0.45);
  rightArmGroup.add(rightArm);
  const rightPaw = new THREE.Mesh(pawGeo, pinkMaterial);
  rightPaw.position.set(-0.22, -0.32, 0.28);
  rightPaw.rotation.set(0.2, -0.4, 0.2);
  rightArmGroup.add(rightPaw);
  rightArmGroup.position.set(0.62, 0.25, 0.55);
  root.add(rightArmGroup);

  // 7. The Central Glowing Qubit (Held gently between paws)
  const qubitGroup = new THREE.Group();
  qubitGroup.position.set(0, 0.0, 1.08);

  // Glowing inner energetic sphere
  const qubitCoreGeo = new THREE.SphereGeometry(0.24, 24, 24);
  const qubitCore = new THREE.Mesh(qubitCoreGeo, qubitCoreMaterial);
  qubitGroup.add(qubitCore);

  // Crystalline faceted outer shell
  const qubitShellGeo = new THREE.IcosahedronGeometry(0.38, 1);
  const qubitShell = new THREE.Mesh(qubitShellGeo, qubitShellMaterial);
  qubitGroup.add(qubitShell);

  // Orbital rings (superposition representation)
  const ringGeo1 = new THREE.TorusGeometry(0.55, 0.015, 12, 48);
  const orbitRing1 = new THREE.Mesh(ringGeo1, ringMaterial1);
  orbitRing1.rotation.x = Math.PI / 3;
  qubitGroup.add(orbitRing1);

  const ringGeo2 = new THREE.TorusGeometry(0.62, 0.012, 12, 48);
  const orbitRing2 = new THREE.Mesh(ringGeo2, ringMaterial2);
  orbitRing2.rotation.y = Math.PI / 4;
  orbitRing2.rotation.z = Math.PI / 6;
  qubitGroup.add(orbitRing2);

  // Local Qubit point light casting luminous violet light onto hamster
  const qubitLight = new THREE.PointLight(0xa855f7, 2.5, 4.5, 1.8);
  qubitLight.position.set(0, 0, 0);
  qubitGroup.add(qubitLight);

  root.add(qubitGroup);

  // Hamster scale for prominent hero placement
  root.scale.set(1.4, 1.4, 1.4);

  // Animation update loop
  const update = (time: number) => {
    // Gentle breathing (torso & head scale expansion)
    const breath = Math.sin(time * 2.2) * 0.02;
    bodyGroup.scale.set(1 + breath * 0.7, 1 + breath, 1 + breath * 0.7);

    // Subtle head tilt / curiosity
    headGroup.rotation.y = Math.sin(time * 0.8) * 0.04;
    headGroup.rotation.x = Math.sin(time * 1.4) * 0.025;

    // Ear twitch periodically
    const twitch = Math.sin(time * 3.5);
    if (twitch > 0.85) {
      leftEar.rotation.z = -0.35 + (twitch - 0.85) * 0.4;
    } else {
      leftEar.rotation.z = -0.35;
    }

    // Floating idle hovering
    root.position.y = Math.sin(time * 1.5) * 0.12;

    // Qubit rotation and pulsing
    orbitRing1.rotation.x += 0.015;
    orbitRing1.rotation.y += 0.02;
    orbitRing2.rotation.y -= 0.018;
    orbitRing2.rotation.z += 0.012;

    qubitShell.rotation.y += 0.01;
    qubitShell.rotation.x += 0.008;

    const pulse = 1.0 + Math.sin(time * 3.0) * 0.15;
    qubitCore.scale.set(pulse, pulse, pulse);
    qubitLight.intensity = 2.2 + Math.sin(time * 3.0) * 0.8;
  };

  return {
    root,
    qubitCore,
    qubitShell,
    orbitRing1,
    orbitRing2,
    qubitLight,
    leftEye,
    rightEye,
    leftEar,
    rightEar,
    headGroup,
    bodyGroup,
    update,
  };
}
