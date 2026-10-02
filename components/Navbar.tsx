"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "simulation", label: "Simulation", href: "/simulation" },
  { id: "characters", label: "Characters", href: "/characters" },
  { id: "about", label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#040308]/90 backdrop-blur-md border-b border-white/[0.04] py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between">
        {/* Left: Minimal Geometric Shield & Qubit Logo Mark (STRICTLY NO TEXT) */}
        <Link
          href="/"
          className="group flex items-center justify-center p-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400 rounded-lg transition-transform duration-300 hover:scale-105"
          aria-label="Home"
        >
          <svg
            className="w-8 h-8 text-white transition-colors duration-300 group-hover:text-violet-400 drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Geometric Shield */}
            <path
              d="M16 3L26 7.5V15C26 21.5 21.5 26.5 16 29C10.5 26.5 6 21.5 6 15V7.5L16 3Z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Inner Qubit Core */}
            <circle cx="16" cy="15.5" r="3.2" fill="currentColor" />
            {/* Quantum Entanglement Orbital Ellipse */}
            <ellipse
              cx="16"
              cy="15.5"
              rx="6.5"
              ry="2.4"
              transform="rotate(-30 16 15.5)"
              stroke="#c084fc"
              strokeWidth="1.2"
              strokeDasharray="2 2"
              className="animate-pulse"
            />
          </svg>
        </Link>

        {/* Center / Desktop Navigation Links: ONLY Home, Simulation, Characters, About */}
        <nav className="hidden md:flex items-center space-x-10 lg:space-x-14" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.id === "home"
                ? pathname === "/"
                : item.id === "simulation"
                ? pathname === "/simulation"
                : item.id === "characters"
                ? pathname === "/characters"
                : item.id === "about"
                ? pathname === "/about"
                : false;

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`relative py-1 text-[13px] tracking-[0.22em] uppercase font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400 rounded-sm ${
                  isActive ? "text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {item.label}

                {/* Restrained Violet Active Indicator */}
                {isActive && (
                  <span
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#c084fc] transition-all duration-300"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Mobile Menu Toggle Button (Icon-only, NO visible text) */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-violet-400 rounded-md transition-colors"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop Balance Spacer */}
        <div className="hidden md:block w-8 h-8 opacity-0 pointer-events-none" aria-hidden="true" />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#05040a]/95 backdrop-blur-xl border-b border-white/[0.06] px-8 py-8 transition-all">
          <nav className="flex flex-col space-y-6 items-center" aria-label="Mobile Navigation">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.id === "home"
                  ? pathname === "/"
                  : item.id === "simulation"
                  ? pathname === "/simulation"
                  : item.id === "characters"
                  ? pathname === "/characters"
                  : item.id === "about"
                  ? pathname === "/about"
                  : false;

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm tracking-[0.25em] uppercase font-medium transition-colors ${
                    isActive ? "text-violet-400" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
