"use client";

import React from "react";
import { CHARACTERS } from "@/lib/characters";
import CharacterCard from "./CharacterCard";

export default function CharacterShowcase() {
  return (
    <section
      id="characters"
      className="relative w-full pt-20 sm:pt-24 pb-16 sm:pb-24 bg-[#040308] text-white overflow-hidden"
      aria-label="Meet the Characters"
    >
      {/* Background Radial Violet Glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(147,51,234,0.08)_0%,rgba(67,56,202,0.04)_40%,transparent_75%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Meet the Characters
          </h2>

          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed">
            The quantum cast navigating photon polarization, eavesdropping detection, and basis reconciliation in our BB84 simulation.
          </p>
        </div>

        {/* 4 Cards Grid (Strict 9:16 Aspect Ratio) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
          {CHARACTERS.map((char, index) => (
            <div key={char.id} className="w-full max-w-[320px] sm:max-w-none">
              <CharacterCard character={char} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
