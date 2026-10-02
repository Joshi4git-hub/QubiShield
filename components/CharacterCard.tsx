"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CharacterData } from "@/lib/characters";
import CharacterModelViewer from "./CharacterModelViewer";

interface CharacterCardProps {
  character: CharacterData;
  index: number;
}

export default function CharacterCard({ character, index }: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            observer.unobserve(cardEl);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(cardEl);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transitionDelay: `${index * 140}ms`,
      }}
      className={`group relative aspect-[9/16] w-full transition-all duration-700 ease-out ${
        isRevealed
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-[0.96]"
      } hover:-translate-y-2.5`}
    >
      {/* 1. Crisp Outline Halo Glow along the exact rounded outline of the card */}
      <div
        className="pointer-events-none absolute -inset-[2.5px] rounded-[18px] opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 blur-[8px] -z-10"
        style={{
          background: `linear-gradient(135deg, ${character.accentColor}, #a855f7 50%, ${character.accentColor})`,
        }}
        aria-hidden="true"
      />

      {/* 2. Soft Ambient Backlight spreading behind the card outline */}
      <div
        className="pointer-events-none absolute -inset-[6px] rounded-[22px] opacity-0 transition-all duration-700 ease-out group-hover:opacity-75 blur-[16px] -z-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${character.glowColor}, transparent 75%)`,
        }}
        aria-hidden="true"
      />

      {/* 3. Main 9:16 Card Container */}
      <article className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#09071a]/95 via-[#060511]/95 to-[#030208]/98 backdrop-blur-xl w-full h-full transition-colors duration-500 group-hover:border-violet-400/50 shadow-[0_12px_36px_rgba(0,0,0,0.6)]">
        {/* Subtle Inner Rim Highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 20px ${character.glowColor}`,
          }}
          aria-hidden="true"
        />

        {/* Top Character Role Badge */}
        <div className="relative z-10 p-5 flex items-center justify-between">
          <span
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] uppercase font-mono font-medium tracking-wider border backdrop-blur-sm ${character.badgeBorder} ${character.badgeBg} ${character.badgeText}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: character.accentColor }}
            />
            <span>{character.role}</span>
          </span>

          <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </span>
        </div>

        {/* Center 3D Model Showcase */}
        <div className="relative flex-1 w-full overflow-hidden">
          <CharacterModelViewer character={character} isHovered={isHovered} />
        </div>

        {/* Bottom Content: Name, Description, and Link */}
        <div className="relative z-10 p-5 pt-2 flex flex-col justify-end bg-gradient-to-t from-[#040308] via-[#040308]/90 to-transparent">
          <h3 className="text-xl sm:text-2xl font-bold tracking-wide text-white group-hover:text-violet-200 transition-colors">
            {character.name}
          </h3>

          <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 line-clamp-3">
            {character.description}
          </p>

          <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
            <Link
              href={character.simulationLink}
              className="inline-flex items-center space-x-1.5 text-xs font-mono tracking-wider uppercase text-zinc-300 hover:text-white group-hover:text-violet-300 transition-colors"
            >
              <span>View in Simulation</span>
              <svg
                className="w-3.5 h-3.5 transform transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
