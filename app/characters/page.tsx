import React from "react";
import Navbar from "@/components/Navbar";
import CharacterShowcase from "@/components/CharacterShowcase";

export const metadata = {
  title: "Characters | QubiShield",
  description: "Meet the quantum cryptographic characters of QubiShield: Alice, Eve, Bob, and Qubi.",
};

export default function CharactersPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#040308] text-white selection:bg-violet-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* 3D Character Showcase Section with 9:16 Cards */}
      <CharacterShowcase />
    </main>
  );
}
