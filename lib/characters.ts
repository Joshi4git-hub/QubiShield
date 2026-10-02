export interface CharacterData {
  id: string;
  name: string;
  role: string;
  description: string;
  modelUrl: string;
  fallbackModelUrls?: string[];
  accentColor: string;
  glowColor: string;
  simulationLink: string;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  cameraZ: number;
  modelScale: number;
  modelYOffset: number;
  frontAngle?: number;
}

export const CHARACTERS: CharacterData[] = [
  {
    id: "alice",
    name: "Alice",
    role: "Sender",
    description:
      "Generates random bits, chooses encoding bases, and prepares quantum states for transmission.",
    modelUrl: "/models/alice.glb",
    fallbackModelUrls: ["/models/Alice.glb", "/models/squirrel.glb"],
    accentColor: "#38bdf8", // Cyan
    glowColor: "rgba(56, 189, 248, 0.35)",
    simulationLink: "/simulation",
    badgeBorder: "border-cyan-500/30",
    badgeBg: "bg-cyan-950/40",
    badgeText: "text-cyan-400",
    cameraZ: 4.8,
    modelScale: 1.55,
    modelYOffset: -1.35,
    frontAngle: 0,
  },
  {
    id: "eve",
    name: "Eve",
    role: "Eavesdropper",
    description:
      "Attempts to intercept and measure transmitted qubits. Her measurements can introduce detectable errors.",
    modelUrl: "/models/eve.glb",
    fallbackModelUrls: ["/models/Eve.glb", "/models/lamb.glb"],
    accentColor: "#f43f5e", // Rose / Crimson
    glowColor: "rgba(244, 63, 94, 0.35)",
    simulationLink: "/simulation",
    badgeBorder: "border-rose-500/30",
    badgeBg: "bg-rose-950/40",
    badgeText: "text-rose-400",
    cameraZ: 4.8,
    modelScale: 1.45,
    modelYOffset: -1.25,
    frontAngle: 0,
  },
  {
    id: "bob",
    name: "Bob",
    role: "Receiver",
    description:
      "Measures received qubits, compares bases with Alice, and helps detect potential interference.",
    modelUrl: "/models/bob.glb",
    fallbackModelUrls: ["/models/Bob.glb", "/models/fox.glb"],
    accentColor: "#a855f7", // Purple
    glowColor: "rgba(168, 85, 247, 0.35)",
    simulationLink: "/simulation",
    badgeBorder: "border-violet-500/30",
    badgeBg: "bg-violet-950/40",
    badgeText: "text-violet-400",
    cameraZ: 4.8,
    modelScale: 1.55,
    modelYOffset: -1.35,
    frontAngle: 0,
  },
  {
    id: "qubi",
    name: "Qubi",
    role: "Qubit",
    description:
      "Represents the quantum information traveling through the channel. Its state is determined by the BB84 simulation.",
    modelUrl: "/models/hamster.glb",
    fallbackModelUrls: ["/models/Hamster.glb", "/models/qubi.glb", "/models/qubit.glb"],
    accentColor: "#fbbf24", // Amber
    glowColor: "rgba(251, 191, 36, 0.35)",
    simulationLink: "/simulation",
    badgeBorder: "border-amber-500/30",
    badgeBg: "bg-amber-950/40",
    badgeText: "text-amber-400",
    cameraZ: 4.2,
    modelScale: 1.25,
    modelYOffset: -0.75,
    frontAngle: 0,
  },
];
