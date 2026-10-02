"use client";

import React from "react";

/**
 * Polished static / CSS fallback if WebGL is unavailable or disabled.
 * Faithfully mirrors the midnight-violet atmosphere, quantum channel,
 * shield motif, and cute central hamster holding the glowing qubit.
 * Strictly displays NO visible text.
 */
export default function FallbackScene() {
  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#040308]"
      aria-hidden="true"
    >
      {/* Background Cosmic Radial Haze */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(147,51,234,0.18)_0%,rgba(67,56,202,0.12)_35%,rgba(4,3,8,0.95)_75%)] pointer-events-none" />

      {/* Subtle Starfield Dots */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#ddd6fe_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

      {/* Subtle Quantum Grid Floor Horizon */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-violet-950/20 via-transparent to-transparent pointer-events-none" />

      <svg
        className="w-full max-w-4xl max-h-[80vh] z-10 transition-transform duration-700"
        viewBox="0 0 900 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Holographic Shield Glow Filter */}
          <filter id="violetGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="shieldGrad" x1="450" y1="120" x2="450" y2="460" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="channelBeam" x1="120" y1="310" x2="780" y2="310" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>

          <radialGradient id="qubitGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e9d5ff" />
            <stop offset="70%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#581c87" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Eve (Shadowed silhouette in upper center) */}
        <g opacity="0.6">
          <ellipse cx="450" cy="130" rx="30" ry="42" fill="#0b0816" stroke="#f43f5e" strokeWidth="1" strokeOpacity="0.5" />
          <path d="M438 126 Q450 134 462 126" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          {/* Faint siphon line */}
          <line x1="450" y1="172" x2="450" y2="240" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
        </g>

        {/* Quantum Channel Path */}
        <path
          d="M 120 310 C 260 270, 340 370, 450 370 C 560 370, 640 270, 780 310"
          stroke="url(#channelBeam)"
          strokeWidth="3"
          fill="none"
          filter="url(#violetGlow)"
          opacity="0.85"
        />

        {/* Alice (Transmitter node on left) */}
        <g transform="translate(90, 220)">
          {/* Base */}
          <ellipse cx="30" cy="140" rx="42" ry="12" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.7" />
          {/* Body */}
          <path d="M 15 60 L 45 60 L 40 130 L 20 130 Z" fill="#0f0c1d" stroke="#38bdf8" strokeWidth="1.2" />
          {/* Head & Visor */}
          <circle cx="30" cy="38" r="22" fill="#090714" stroke="#818cf8" strokeWidth="1.5" />
          <path d="M 20 38 Q 30 46 40 38" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          {/* Laser Beacon */}
          <circle cx="48" cy="20" r="6" fill="#38bdf8" filter="url(#violetGlow)" />
        </g>

        {/* Bob (Receiver node on right) */}
        <g transform="translate(730, 220)">
          {/* Base */}
          <ellipse cx="30" cy="140" rx="42" ry="12" fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.7" />
          {/* Body */}
          <path d="M 15 60 L 45 60 L 40 130 L 20 130 Z" fill="#0f0c1d" stroke="#c084fc" strokeWidth="1.2" />
          {/* Head & Detector */}
          <circle cx="30" cy="38" r="22" fill="#090714" stroke="#a855f7" strokeWidth="1.5" />
          <rect x="18" y="32" width="24" height="6" rx="2" fill="#c084fc" filter="url(#violetGlow)" />
          {/* Detection Rings */}
          <ellipse cx="12" cy="70" rx="14" ry="24" fill="none" stroke="#a855f7" strokeWidth="1.2" opacity="0.8" />
        </g>

        {/* Holographic Security Shield (QubiShield Motif) */}
        <polygon
          points="450,160 550,200 540,360 450,470 360,360 350,200"
          fill="url(#shieldGrad)"
          stroke="#c084fc"
          strokeWidth="1.5"
          filter="url(#violetGlow)"
          opacity="0.8"
        />
        <circle cx="450" cy="315" r="130" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 8" opacity="0.4" />

        {/* Central Hamster Character (Foreground Hero) */}
        <g id="hamster" transform="translate(450, 360)">
          {/* Body Fur */}
          <ellipse cx="0" cy="15" rx="85" ry="95" fill="#fcf6ed" stroke="#e2d4c0" strokeWidth="1" />
          {/* Belly */}
          <ellipse cx="0" cy="25" rx="55" ry="65" fill="#ffffff" />
          {/* Back Paws */}
          <ellipse cx="-55" cy="98" rx="20" ry="12" fill="#ffa4be" />
          <ellipse cx="55" cy="98" rx="20" ry="12" fill="#ffa4be" />

          {/* Head */}
          <ellipse cx="0" cy="-60" rx="72" ry="65" fill="#fcf6ed" />
          {/* Chubby Cheeks */}
          <circle cx="-46" cy="-45" r="32" fill="#fcf6ed" />
          <circle cx="46" cy="-45" r="32" fill="#fcf6ed" />

          {/* Ears */}
          <ellipse cx="-55" cy="-115" rx="22" ry="26" fill="#fcf6ed" transform="rotate(-15 -55 -115)" />
          <ellipse cx="-55" cy="-115" rx="14" ry="18" fill="#ffa4be" transform="rotate(-15 -55 -115)" />
          <ellipse cx="55" cy="-115" rx="22" ry="26" fill="#fcf6ed" transform="rotate(15 55 -115)" />
          <ellipse cx="55" cy="-115" rx="14" ry="18" fill="#ffa4be" transform="rotate(15 55 -115)" />

          {/* Eyes */}
          <circle cx="-32" cy="-65" r="13" fill="#090714" />
          <circle cx="-36" cy="-70" r="4" fill="#ffffff" />
          <circle cx="-28" cy="-62" r="2" fill="#ffffff" />

          <circle cx="32" cy="-65" r="13" fill="#090714" />
          <circle cx="28" cy="-70" r="4" fill="#ffffff" />
          <circle cx="36" cy="-62" r="2" fill="#ffffff" />

          {/* Cute Pink Nose */}
          <ellipse cx="0" cy="-48" rx="8" ry="6" fill="#ffa4be" />

          {/* Snout lines */}
          <path d="M 0 -42 L 0 -36 M -8 -34 Q 0 -30 8 -34" stroke="#e2d4c0" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Whiskers */}
          <path d="M -22 -45 L -75 -48 M -22 -42 L -80 -38 M -22 -39 L -72 -28" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
          <path d="M 22 -45 L 75 -48 M 22 -42 L 80 -38 M 22 -39 L 72 -28" stroke="#cbd5e1" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

          {/* Front Paws Cradling Qubit */}
          <ellipse cx="-38" cy="8" rx="15" ry="12" fill="#ffa4be" transform="rotate(20 -38 8)" />
          <ellipse cx="38" cy="8" rx="15" ry="12" fill="#ffa4be" transform="rotate(-20 38 8)" />

          {/* Central Glowing Qubit */}
          <circle cx="0" cy="8" r="28" fill="url(#qubitGlow)" filter="url(#intenseGlow)" />
          {/* Orbital Ring 1 */}
          <ellipse cx="0" cy="8" rx="42" ry="16" fill="none" stroke="#c084fc" strokeWidth="2" transform="rotate(-30 0 8)" opacity="0.9" />
          {/* Orbital Ring 2 */}
          <ellipse cx="0" cy="8" rx="40" ry="14" fill="none" stroke="#38bdf8" strokeWidth="1.8" transform="rotate(40 0 8)" opacity="0.8" />
          {/* Superposition core */}
          <circle cx="0" cy="8" r="10" fill="#ffffff" filter="url(#violetGlow)" />
        </g>
      </svg>
    </div>
  );
}
