import Navbar from "@/components/Navbar";
import HeroScene from "@/components/HeroScene";

export default function Home() {
  return (
    <main className="relative w-full bg-[#040308] text-white selection:bg-violet-500 selection:text-white">
      {/* Semantic Top Navigation: STRICTLY ONLY Home | Simulation | Characters | About */}
      <Navbar />

      {/* Target Navigation Anchors */}
      <div id="home" className="sr-only" aria-hidden="true" />
      <div id="simulation" className="sr-only" aria-hidden="true" />
      <div id="characters" className="sr-only" aria-hidden="true" />
      <div id="about" className="sr-only" aria-hidden="true" />

      {/* Scroll-Driven Cinematic Hero Section */}
      <div className="relative h-[350vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <HeroScene />

          {/* "QubiShield" heading — centered above the hamster */}
          <div className="pointer-events-none absolute inset-x-0 top-[10%] flex flex-col items-center z-10">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white drop-shadow-[0_0_40px_rgba(168,85,247,0.35)] select-none">
              QubiShield
            </h1>
            <p className="mt-2 text-xs sm:text-sm tracking-[0.35em] uppercase text-violet-300/60 font-mono select-none">
              Quantum Key Distribution
            </p>
          </div>

          {/* Brief description — bottom-left corner */}
          <div className="pointer-events-none absolute bottom-8 left-6 sm:left-10 z-10 max-w-xs sm:max-w-sm">
            <p className="text-[11px] sm:text-xs leading-relaxed text-zinc-400/80 select-none">
              An interactive BB84 quantum cryptography simulator that visualises how Alice and Bob establish a secure key — and how Eve&apos;s eavesdropping can be detected.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
